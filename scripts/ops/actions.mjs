// Decyzje jednego przebiegu: scalenia, poprawki, starty, wycofania, punkty kontrolne.
import { readFileSync } from 'node:fs';
import { evaluatePr } from './check-pr.mjs';
import { prData, findTaskPr, julesComments, onlySnapshotFailure, checksState } from './facts.mjs';
import { taskStatuses, readyToStart, extractSection, issueBody, ownerCheck, checkpointReady } from './plan.mjs';
import { taskMemory, logEvent, startsLast24h, stanBlock, updateStanBlock } from './state.mjs';
import { branchWithFile, branchWithRevert } from './git.mjs';

const MIN = 60_000;

export function runActions(ctx) {
  const { gh, queue, facts, memory, now } = ctx;
  const s = queue.settings;
  const actions = [];
  const notices = [];
  const act = (text) => { actions.push(text); logEvent(memory, now, text); };
  const notify = (key, text) => {
    memory.alerts ??= {};
    if (memory.alerts[key]) return;
    memory.alerts[key] = new Date(now).toISOString();
    notices.push(text);
    logEvent(memory, now, `ZGŁOSZENIE: ${text}`);
  };
  const deadlines = [];
  const statuses = () => taskStatuses(queue, facts.issues, memory);
  const setLabels = (issue, add = [], remove = []) => {
    for (const l of remove) { try { gh.del(`issues/${issue}/labels/${encodeURIComponent(l)}`); } catch { /* etykiety nie było */ } }
    if (add.length) gh.post(`issues/${issue}/labels`, { labels: add });
    const local = facts.issues.find((i) => i.number === issue);
    if (local) local.labels = [...local.labels.filter((l) => !remove.includes(l)), ...add.filter((l) => !local.labels.includes(l))];
  };
  const escalate = (t, issue, why) => {
    setLabels(issue, ['wymaga-decyzji'], ['jules']);
    gh.post(`issues/${issue}/comments`, { body: `Automat: potrzebna decyzja właściciela.\n\n${why}\n\nPo decyzji zdejmij etykietę \`wymaga-decyzji\` (zadanie wróci do kolejki) albo zamknij issue.` });
    notify(`decyzja-${t.id}-${issue}`, `${t.id} (#${issue}) wymaga decyzji: ${why.split('\n')[0]}`);
  };

  // 1. main
  let mainOk = facts.mainState === 'green';
  if (memory.revertPr) {
    // Po wycofaniu czekamy na zielony main w kolejnym przebiegu – w tym nic nie scalamy.
    handleOwnPr(ctx, memory.revertPr, 'wycofanie', act, notify);
    mainOk = false;
  }
  if (facts.mainState === 'red') {
    const ours = memory.merges.find((m) => m.sha === facts.mainSha);
    if (ours && !memory.revertPr) {
      const branch = `automat/wycofanie-${facts.mainSha.slice(0, 7)}`;
      if (!ctx.dryRun) branchWithRevert(branch, facts.mainSha, `Wycofanie ${ours.task}: main czerwony po scaleniu (automat)`);
      const pr = gh.post('pulls', { title: `Wycofanie ${ours.task} – main czerwony po scaleniu`, head: branch, base: 'main', body: `## Po ludzku\nCo zrobiłem: wycofałem scalenie ${ours.task} (#${ours.pr}), bo testy na main są czerwone.\nCo sprawdzić: nic – automat scali to po zielonym CI.\nCzego nie zrobiłem: zadanie wraca do naprawy.` });
      memory.revertPr = pr.number ?? -1;
      const tm = taskMemory(memory, ours.task);
      tm.merged = null;
      if (ours.issue) { gh.patch(`issues/${ours.issue}`, { state: 'open' }); setLabels(ours.issue, ['wymaga-naprawy'], ['scalone']); }
      memory.reverts.push({ at: new Date(now).toISOString(), sha: facts.mainSha });
      act(`wycofuję ${ours.task} (main czerwony)`);
      if (memory.reverts.filter((r) => now - Date.parse(r.at) < 24 * 60 * MIN).length >= 2) {
        notify('dwa-wycofania', 'dwa wycofania w ciągu doby – automat zatrzymany');
        setLabels(facts.stateIssue.number, ['automat-stop']);
      }
    } else if (!ours) {
      notify(`main-${facts.mainSha}`, `main czerwony (${facts.mainSha.slice(0, 7)}) nie po scaleniu automatu – nic nie scalam ani nie startuję`);
    }
    return { actions, notices, finished: false };
  }

  // 2. zadania w toku
  let merges = 0;
  for (const st of statuses().values()) {
    if (st.status !== 'active') continue;
    const t = st.task;
    const tm = taskMemory(memory, t.id);
    tm.labeledAt ??= new Date(now).toISOString();
    const jc = julesComments(gh, st.issue);
    const prNo = findTaskPr(facts.openPrs, st.issue, t.id, jc);
    if (!prNo) {
      const since = now - Date.parse(tm.relabeledAt ?? tm.labeledAt);
      if (jc.length === 0 && !tm.relabeledAt && since >= s.julesRelabelMin * MIN) {
        setLabels(st.issue, [], ['jules']);
        setLabels(st.issue, ['jules']);
        tm.relabeledAt = new Date(now).toISOString();
        act(`${t.id}: Jules milczy – ponownie nakładam etykietę`);
      } else if (jc.length === 0 && tm.relabeledAt && since >= s.julesEscalateMin * MIN) {
        escalate(t, st.issue, 'Jules nie odpowiada na etykietę `jules`. Sprawdź aplikację Jules (limit, pytanie do Ciebie, dostęp do repo).');
      } else if (jc.length > 0 && now - Date.parse(tm.labeledAt) >= s.staleHours * 60 * MIN) {
        escalate(t, st.issue, `Jules pracuje ponad ${s.staleHours} h i nie ma PR-a. Sprawdź zadanie w aplikacji Jules.`);
      } else deadlines.push(Date.parse(tm.relabeledAt ?? tm.labeledAt) + (tm.relabeledAt ? s.julesEscalateMin : s.julesRelabelMin) * MIN);
      continue;
    }
    if (!tm.prs.includes(prNo)) tm.prs.push(prNo);
    if (tm.prs.length > s.maxPrsPerTask) { escalate(t, st.issue, `To już ${tm.prs.length}. PR dla tego zadania.`); continue; }
    const data = prData(gh, prNo);
    const res = evaluatePr(data, t, s, now);
    if (res.verdict === 'SCAL') {
      if (merges >= s.maxMergesPerRun || !mainOk) { deadlines.push(now + 30 * MIN); continue; }
      const m = gh.put(`pulls/${prNo}/merge`, { merge_method: 'squash', commit_title: `${data.pr.title} (#${prNo})`, sha: data.pr.head.sha });
      merges++;
      tm.merged = prNo;
      memory.merges.push({ sha: m.sha ?? null, task: t.id, pr: prNo, issue: st.issue, at: new Date(now).toISOString() });
      setLabels(st.issue, ['scalone'], ['jules']);
      gh.patch(`issues/${st.issue}`, { state: 'closed' });
      mainOk = false; // następne scalenie dopiero po zielonym main
      act(`scalono ${t.id} (#${prNo})`);
    } else if (res.verdict === 'ESKALUJ') {
      escalate(t, st.issue, `PR #${prNo}:\n${res.reasons.filter((r) => r.verdict === 'ESKALUJ').map((r) => `- ${r.file ? `${r.file}: ` : ''}${r.text} (${r.code})`).join('\n')}`);
    } else if (res.verdict === 'POPRAW') {
      handleFix(ctx, { t, tm, st, prNo, data, res, act, escalate, setLabels, deadlines });
    } else {
      deadlines.push(now + s.ciQuietMin * MIN);
      if (now - Date.parse(data.pr.created_at) >= s.staleHours * 60 * MIN) escalate(t, st.issue, `PR #${prNo} czeka ponad ${s.staleHours} h: ${res.reasons.map((r) => r.text).join('; ')}`);
    }
  }

  // 3. starty
  const st2 = statuses();
  let ready = readyToStart(queue, st2, { startsLast24h: startsLast24h(memory, now) });
  // Pilot: dopóki zadanie pilotażowe nie jest scalone, startuje tylko ono.
  const pilot = s.pilot && st2.get(s.pilot)?.status !== 'done' ? s.pilot : null;
  if (ctx.only || pilot) ready = ready.filter((t) => t.id === (ctx.only ?? pilot));
  if (s.pilot && !pilot) notify('pilot-ok', `pilot udany: ${s.pilot} scalone – automat rusza z pełną kolejką`);
  if (ready.length || ctx.only) {
    const arch = readFileSync(s.architecture, 'utf8');
    const footer = readFileSync(s.footer, 'utf8');
    const common = arch.split('\n').find((l) => l.startsWith('Wspólne „Gotowe, gdy”')) ?? '';
    for (const t of ready) {
      const section = extractSection(arch, t.id);
      if (!section) { notify(`brak-sekcji-${t.id}`, `brak sekcji ${t.id} w ARCHITEKTURA.md`); continue; }
      let issue = st2.get(t.id).issue;
      if (!issue) {
        const created = gh.post('issues', { title: `[${t.id}] ${t.title}`, body: issueBody(t, section, footer, common), labels: ['zadanie'] });
        issue = created.number ?? 0;
        facts.issues.push({ number: issue, title: `[${t.id}] ${t.title}`, state: 'open', labels: ['zadanie'] });
      }
      setLabels(issue, ['jules']);
      const tm = taskMemory(memory, t.id);
      Object.assign(tm, { labeledAt: new Date(now).toISOString(), relabeledAt: null });
      memory.starts.push(new Date(now).toISOString());
      act(`start ${t.id} (#${issue})`);
    }
  }

  // 4. punkty kontrolne
  const finished = handleCheckpoints(ctx, statuses(), act, notify, mainOk || facts.mainState === 'green');
  memory.nextCheckAt = deadlines.length ? new Date(Math.min(...deadlines)).toISOString() : null;
  return { actions, notices, finished };
}

function handleFix({ gh, queue, now }, { t, tm, st, prNo, data, res, act, escalate, setLabels, deadlines }) {
  const s = queue.settings;
  if (tm.lastFixSha === data.pr.head.sha) {
    if (now - Date.parse(tm.lastFixAt) >= 3 * 60 * MIN) escalate(t, st.issue, `Jules nie poprawił PR #${prNo} w 3 h po uwagach automatu.`);
    else deadlines.push(Date.parse(tm.lastFixAt) + 3 * 60 * MIN);
    return;
  }
  const onlyCi = res.reasons.filter((r) => r.verdict === 'POPRAW').every((r) => r.code === 'R2b');
  if (onlyCi && t.snapshots && !tm.snapshotsUsed && onlySnapshotFailure(gh, data.checkRuns)) {
    setLabels(prNo, ['aktualizuj-zrzuty']);
    tm.snapshotsUsed = true;
    act(`${t.id}: odświeżam wzorce zrzutów (#${prNo}) – obejrzysz na punkcie kontrolnym`);
    return;
  }
  if (tm.fixes >= s.maxFixAttempts) {
    gh.patch(`pulls/${prNo}`, { state: 'closed' });
    gh.post(`issues/${prNo}/comments`, { body: `Automat zamyka ten PR po ${tm.fixes} nieudanych poprawkach. Zadanie ${t.id} dostanie lepszy opis.` });
    setLabels(st.issue, ['wymaga-naprawy'], ['jules']);
    tm.fixes = 0;
    tm.lastFixSha = null;
    act(`${t.id}: PR #${prNo} zamknięty po ${s.maxFixAttempts} poprawkach – do naprawy`);
    return;
  }
  gh.post(`issues/${prNo}/comments`, { body: res.julesComment });
  tm.fixes += 1;
  tm.lastFixSha = data.pr.head.sha;
  tm.lastFixAt = new Date(now).toISOString();
  act(`${t.id}: uwagi do PR #${prNo} (próba ${tm.fixes})`);
}

/** PR automatu (wycofanie, STAN.md): scal po zielonym CI. Zwraca true, gdy już scalony. */
function handleOwnPr({ gh, queue, memory }, number, kind, act, notify) {
  const pr = gh.get(`pulls/${number}`);
  if (pr.merged) { if (kind === 'wycofanie') memory.revertPr = null; return true; }
  const runs = (gh.get(`commits/${pr.head.sha}/check-runs?per_page=100`).check_runs ?? []).map((r) => ({ name: r.name, status: r.status, conclusion: r.conclusion }));
  const state = checksState(runs, queue.settings.requiredChecks);
  if (state === 'green' && pr.mergeable) {
    gh.put(`pulls/${number}/merge`, { merge_method: 'squash', sha: pr.head.sha });
    act(`scalono PR automatu #${number} (${kind})`);
    if (kind === 'wycofanie') memory.revertPr = null;
    return true;
  }
  if (state === 'red') notify(`own-${number}-${pr.head.sha}`, `PR automatu #${number} (${kind}) ma czerwone CI`);
  return false;
}

function handleCheckpoints(ctx, statuses, act, notify, mainGreen) {
  const { gh, queue, memory, now, facts } = ctx;
  if (memory.stanPr) {
    if (!handleOwnPr(ctx, memory.stanPr.number, 'STAN.md', act, notify)) return false;
    const k = queue.checkpoints.find((c) => c.id === memory.stanPr.checkpoint);
    memory.checkpointsDone.push(k.id);
    memory.stanPr = null;
    const arch = readFileSync(queue.settings.architecture, 'utf8');
    const checks = queue.tasks.filter((t) => t.checkpoint === k.id).map((t) => `- **${t.id}** ${t.title}: ${ownerCheck(extractSection(arch, t.id))}`);
    gh.post(`issues/${facts.stateIssue.number}/comments`, { body: `## Punkt kontrolny ${k.id}: ${k.name}\nAutomat jedzie dalej. Obejrzyj produkcję i zgłoś uwagi (nowe issue albo czat).\n\n${checks.join('\n')}` });
    notify(`punkt-${k.id}`, `punkt kontrolny ${k.id} (${k.name}) – lista „Ty sprawdzasz” w issue #${facts.stateIssue.number}`);
  }
  const next = queue.checkpoints.find((c) => !memory.checkpointsDone.includes(c.id));
  if (!next) return memory.tasks && queue.tasks.every((t) => statuses.get(t.id)?.status === 'done');
  if (!mainGreen || !checkpointReady(queue, statuses, next.id)) return false;
  const branch = `automat/stan-${next.id.toLowerCase()}-${new Date(now).toISOString().slice(0, 10)}`;
  if (!ctx.dryRun) branchWithFile(branch, queue.settings.statePath, (txt) => updateStanBlock(txt, stanBlock(queue, statuses, { ...memory, checkpointsDone: [...memory.checkpointsDone, next.id] }, now)), `docs(STAN): punkt kontrolny ${next.id} (automat)`);
  const pr = gh.post('pulls', { title: `STAN.md – punkt kontrolny ${next.id} (automat)`, head: branch, base: 'main', body: `## Po ludzku\nCo zrobiłem: zapisałem w STAN.md postęp po punkcie kontrolnym ${next.id} (${next.name}).\nCo sprawdzić: lista „Ty sprawdzasz” przyjdzie w issue stanu.\nCzego nie zrobiłem: opisów „Co działa” – zostają do Twojej oceny.` });
  memory.stanPr = { number: pr.number ?? -1, checkpoint: next.id };
  act(`punkt kontrolny ${next.id}: PR STAN.md`);
  return false;
}
