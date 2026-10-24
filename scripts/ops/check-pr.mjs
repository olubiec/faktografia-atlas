// Kontrola PR-a zadania przed scaleniem – czysta funkcja, bez sieci (testy: tests/unit/ops-check-pr.test.ts).
// Werdykty: SCAL (można scalić) · CZEKAJ (CI trwa) · POPRAW (komentarz @jules) · ESKALUJ (decyzja właściciela).
import { createHash } from 'node:crypto';
import { matchesAny } from './glob.mjs';

const RANK = { SCAL: 0, CZEKAJ: 1, POPRAW: 2, ESKALUJ: 3 };
const FAILED = new Set(['failure', 'timed_out', 'cancelled', 'action_required', 'stale', 'startup_failure']);
const WEAKEN_TEST = /\.(skip|only|fixme)\s*\(|@ts-ignore|@ts-expect-error|oxlint-disable|eslint-disable/;
const BARE_RETURN = /^\s*return\s*;?\s*$/;
const UNSAFE_SRC = /dangerouslySetInnerHTML|@ts-ignore|oxlint-disable|eslint-disable/;
const STOP_SIGNAL = /zatrzymuj|przeszkadza istniej|stopping|i am blocked|nie mog[eę] wykona/i;
const DEP_LINE = /^([+-])\s+"(@?[^"]+)":\s*"[^"]*",?\s*$/;

/** Ścieżki dozwolone w zadaniu (wzorce). */
function allowedPaths(task) {
  return [
    ...task.files.map((f) => f.path),
    ...(task.testsAppend ?? []),
    ...(task.testsChange ?? []),
  ];
}

function patchLines(file, sign) {
  if (!file.patch) return [];
  return file.patch
    .split('\n')
    .filter((l) => l.startsWith(sign) && !l.startsWith(sign.repeat(3)))
    .map((l) => l.slice(1));
}

function checkPackages(file, task, add) {
  const plus = new Set();
  const minus = new Set();
  for (const raw of (file.patch ?? '').split('\n')) {
    const m = DEP_LINE.exec(raw);
    if (!m || m[2] === 'version' || m[2] === 'name') continue;
    (m[1] === '+' ? plus : minus).add(m[2]);
  }
  const pk = task.packages ?? { remove: [], add: [] };
  for (const n of plus) {
    if (minus.has(n)) add('POPRAW', 'R13', file.filename, `zmieniona wersja pakietu ${n} – zadanie na to nie pozwala`);
    else if (!pk.add.includes(n)) add('POPRAW', 'R13', file.filename, `nowy pakiet ${n} spoza zadania`);
  }
  for (const n of minus) {
    if (!plus.has(n) && !pk.remove.includes(n)) add('POPRAW', 'R13', file.filename, `usunięty pakiet ${n} spoza zadania`);
  }
  return [...plus].some((n) => !minus.has(n));
}

function checkRunsVerdict(data, settings, now, add) {
  const byName = new Map();
  for (const r of data.checkRuns) {
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name).push(r);
  }
  const lastCommit = Math.max(0, ...data.commits.map((c) => Date.parse(c.commit.author.date) || 0));
  const quiet = now - lastCommit >= settings.ciQuietMin * 60_000;
  for (const name of settings.requiredChecks) {
    const runs = byName.get(name) ?? [];
    if (runs.length === 0) add('CZEKAJ', 'R2', null, `brak sprawdzenia „${name}”`);
    else if (runs.some((r) => r.status !== 'completed')) add('CZEKAJ', 'R2', null, `„${name}” jeszcze trwa`);
    else if (runs.some((r) => FAILED.has(r.conclusion))) {
      if (quiet) add('POPRAW', 'R2b', null, `„${name}” czerwone – napraw kod (nie testy)`);
      else add('CZEKAJ', 'R2b', null, `„${name}” czerwone, czekam na poprawkę CI Fixera`);
    } else if (runs.some((r) => r.conclusion !== 'success')) add('POPRAW', 'R2', null, `„${name}” zakończone bez sukcesu`);
  }
}

export function evaluatePr(data, task, settings, now = Date.now()) {
  const reasons = [];
  const add = (verdict, code, file, text) => reasons.push({ verdict, code, file, text });
  const { pr, files } = data;

  if (pr.state !== 'open' || pr.draft || pr.base.ref !== 'main' || pr.head.repo?.full_name !== settings.repo) {
    add('ESKALUJ', 'R1', null, 'PR zamknięty, szkic, nie do main albo z obcego repo');
  }
  checkRunsVerdict(data, settings, now, add);
  if (pr.mergeable === null || pr.mergeable === undefined) add('CZEKAJ', 'R3', null, 'GitHub jeszcze liczy konflikty');
  else if (pr.mergeable === false) add('POPRAW', 'R3', null, 'konflikt z main – zrób `git merge origin/main` (bez rebase, bez --force)');

  const authors = settings.commitAuthors.concat(task.snapshots ? ['github-actions[bot]'] : []);
  for (const c of data.commits) {
    if (!authors.includes(c.author?.login ?? '')) add('ESKALUJ', 'R4', null, `commit ${c.sha.slice(0, 7)} od ${c.author?.login ?? 'nieznanego autora'}`);
  }

  const allowed = allowedPaths(task);
  const snapshotGlobs = task.snapshots ? ['**/*-snapshots/**'] : [];
  let total = 0;
  let addsPackage = false;
  for (const f of files) {
    const p = f.filename;
    total += f.additions + f.deletions;
    const listed = matchesAny(p, allowed) || matchesAny(p, snapshotGlobs);
    if (matchesAny(p, settings.neverTouch)) add('POPRAW', 'R7', p, 'tego pliku automat nigdy nie przepuszcza');
    else if (!listed && matchesAny(p, settings.forbidden)) add('POPRAW', 'R7', p, 'plik zakazany w AGENTS.md');
    else if (!listed && matchesAny(p, settings.scratchFiles)) add('POPRAW', 'R8', p, 'plik roboczy – usuń go z PR');
    else if (!listed && f.status !== 'removed') add('POPRAW', 'R5', p, 'plik spoza listy „Pliki:” zadania');

    const removedPaths = f.status === 'removed' ? [p] : f.status === 'renamed' ? [f.previous_filename] : [];
    for (const r of removedPaths) {
      if (!matchesAny(r, task.deletions ?? [])) add('POPRAW', 'R6', r, 'usunięty plik z main – przywróć go');
    }
    if (f.status !== 'removed' && f.additions + f.deletions > 0 && !f.patch && /^(src|tests)\//.test(p) && !matchesAny(p, snapshotGlobs)) {
      add('ESKALUJ', 'R11', p, 'GitHub nie pokazał zmian pliku – nie da się sprawdzić');
    }
    const isTest = p.startsWith('tests/') && !matchesAny(p, snapshotGlobs);
    const mayChange = matchesAny(p, task.testsChange ?? []);
    if (isTest && f.status === 'modified' && !mayChange) {
      if (!matchesAny(p, task.testsAppend ?? [])) add('POPRAW', 'R9', p, 'zmieniony istniejący test – przywróć go');
      else if (patchLines(f, '-').length > 0) add('POPRAW', 'R9', p, 'w tym teście wolno tylko dopisywać przypadki');
    }
    if (isTest) {
      const plus = patchLines(f, '+');
      const fixmeOk = matchesAny(p, task.allowFixme ?? []);
      for (const l of plus) {
        const weak = WEAKEN_TEST.exec(l);
        if (weak && !(fixmeOk && weak[1] === 'fixme')) add('POPRAW', 'R10', p, `osłabienie testu: „${l.trim().slice(0, 60)}”`);
        if (BARE_RETURN.test(l)) add('POPRAW', 'R10', p, 'goły `return` w teście – test nic nie sprawdza');
      }
      if (f.status === 'modified' && !mayChange && patchLines(f, '-').some((l) => l.includes('expect('))) {
        add('POPRAW', 'R10', p, 'usunięta asercja `expect(`');
      }
      if (f.status === 'added' && /^tests\/e2e\/.*\.spec\.ts$/.test(p) && !plus.some((l) => /@S\d+/.test(l))) {
        add('POPRAW', 'R16', p, 'test e2e bez `@S<n>` w nazwie');
      }
    }
    if (p.startsWith('src/') && patchLines(f, '+').some((l) => UNSAFE_SRC.test(l))) {
      add('POPRAW', 'R10b', p, 'zakazana konstrukcja (HTML z danych lub wyłączenie sprawdzeń)');
    }
    const part = task.files.find((t) => t.path === p && t.mode === 'partial');
    if (part && f.additions + f.deletions > part.maxLines) {
      add('POPRAW', 'R12', p, `za duża zmiana (${f.additions + f.deletions} linii, limit ${part.maxLines}) – zmień tylko to, co w zadaniu`);
    }
    if (p === 'package.json' && listed) addsPackage = checkPackages(f, task, add) || addsPackage;
  }
  if (addsPackage && !files.some((f) => f.filename === 'docs/ELEMENTY.md')) add('POPRAW', 'R13', 'docs/ELEMENTY.md', 'nowy pakiet bez wpisu w ELEMENTY.md');
  if (!/po ludzku/i.test(pr.body ?? '')) add('POPRAW', 'R14', null, 'brak sekcji „Po ludzku” w opisie PR');
  if (total > settings.maxPrLines) add('ESKALUJ', 'R15', null, `PR ma ${total} linii zmian (limit ${settings.maxPrLines})`);
  if (STOP_SIGNAL.test(pr.body ?? '')) add('ESKALUJ', 'R17', null, 'Jules pisze w PR, że się zatrzymał – potrzebna decyzja');

  const verdict = reasons.reduce((v, r) => (RANK[r.verdict] > RANK[v] ? r.verdict : v), 'SCAL');
  return { verdict, reasons, julesComment: verdict === 'POPRAW' ? julesComment(task, reasons) : null, fingerprint: fingerprintPr(data) };
}

function julesComment(task, reasons) {
  // Ten sam powód w jednym katalogu (np. 14 zrzutów w docs/shots) = jedna linia.
  const groups = new Map();
  for (const r of reasons.filter((x) => x.verdict === 'POPRAW')) {
    const dir = r.file?.includes('/') ? r.file.slice(0, r.file.lastIndexOf('/') + 1) : '';
    const key = `${r.code}|${r.text}|${dir}`;
    if (!groups.has(key)) groups.set(key, { ...r, files: [] });
    if (r.file) groups.get(key).files.push(r.file);
  }
  const items = [...groups.values()].map((g) => {
    const where = g.files.length > 3 ? `\`${g.files[0].slice(0, g.files[0].lastIndexOf('/') + 1)}\` (${g.files.length} plików): ` : g.files.map((f) => `\`${f}\``).join(', ') + (g.files.length ? ': ' : '');
    return `- ${where}${g.text} (${g.code})`;
  });
  return [
    `@jules Automat nie scali tego PR (zadanie ${task.id}). Popraw w tej samej gałęzi:`,
    ...[...new Set(items)],
    '',
    'Zasady: zmieniasz tylko pliki z issue; istniejących testów nie zmieniasz i nie osłabiasz; gałąź aktualizujesz tylko `git merge origin/main`.',
    'Jeśli poprawka wymaga czegoś spoza zadania – napisz to w PR i zatrzymaj się.',
  ].join('\n');
}

export function fingerprintPr(data) {
  const key = JSON.stringify([
    data.pr.head.sha,
    data.pr.mergeable,
    data.pr.body?.length ?? 0,
    data.checkRuns.map((r) => `${r.name}:${r.status}:${r.conclusion}`).sort(),
  ]);
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}
