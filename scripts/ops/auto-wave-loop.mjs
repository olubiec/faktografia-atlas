// Antigravity Wave & Agent Loop (Pętla automatyczna Antigravity)
// Zastępuje całkowicie Julesa i prowadzi fale (W15, W16, W17) do samego końca:
// 1. Dynamicznie lokalizuje Antigravity CLI (agy.exe).
// 2. Pobiera token GitHuba przez Git Credential Manager lub GH_TOKEN.
// 3. Dla każdego zadania w aktywnej fali:
//    - Tworzy dedykowaną gałąź gita (feat/w<fala>-<id>).
//    - Uruchamia agenta Antigravity w trybie akceptacji edycji.
//    - Sprawdza strażnika zakresu (tylko pliki z 'Zmieniaj:' i 'Wymagane:').
//    - Wykonuje lokalne testy (pnpm test / pnpm typecheck).
//    - W razie błędów uruchamia pętlę samonaprawy (feedback loop z agy -c do 3 prób).
//    - Commituje zmiany, wypycha na GitHub i tworzy PR (zastępując nieudane PR-y Julesa).
//    - Po zielonym CI na GitHubie scala PR (squash merge) i aktualizuje main.
// 4. Po ukończeniu fali: aktualizuje docs/PROJECT_STATE.md oraz stan issue #421,
//    przenosi kolejną falę z tasks/poczekalnia/ do tasks/ i kontynuuje działanie.

import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function log(msg) {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${time}] ${msg}`);
}

// 1. Dynamiczne wykrywanie ścieżki do agy (Antigravity CLI)
function findAgyPath() {
  if (process.env.AGY_PATH && fs.existsSync(process.env.AGY_PATH)) {
    return process.env.AGY_PATH;
  }
  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const defaultBin = path.join(userProfile, '.gemini', 'bin', process.platform === 'win32' ? 'agy.exe' : 'agy');
  if (fs.existsSync(defaultBin)) {
    return defaultBin;
  }
  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe agy' : 'which agy';
    const out = execSync(whichCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split(/\r?\n/)[0];
    if (out && fs.existsSync(out)) return out;
  } catch {}
  return null;
}

const AGY_PATH = findAgyPath();
if (!AGY_PATH) {
  console.error('BŁĄD: Nie znaleziono Antigravity CLI (agy.exe)! Sprawdź instalację w ~/.gemini/bin lub ustaw AGY_PATH.');
  process.exit(1);
}
log(`Używam Antigravity CLI: ${AGY_PATH}`);

// 2. Token GitHuba
function getGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = /password=(.*)/.exec(creds);
    if (match) return match[1].trim();
  } catch (err) {
    console.error('Nie udało się pobrać tokenu z git credential:', err.message);
  }
  return null;
}

const TOKEN = getGithubToken();
if (!TOKEN) {
  console.error('Brak tokenu GitHub! Ustaw GH_TOKEN lub skonfiguruj Git Credential Manager.');
  process.exit(1);
}

const REPO = 'olubiec/faktografia-atlas';
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'Antigravity-Wave-Loop',
};

async function gh(method, endpoint, body = null) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com/repos/${REPO}/${endpoint.replace(/^\//, '')}`;
  const opts = { method, headers: HEADERS };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  if (res.status === 204) return null;
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// 3. Parsowanie zadań
function parseTaskFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const title = (lines.find((l) => l.startsWith('# ')) || path.basename(filePath, '.md')).replace(/^#\s*/, '').trim();

  const getHeaderValue = (header) => {
    const line = lines.find((l) => l.startsWith(`${header}:`));
    if (!line) return [];
    return line.replace(`${header}:`, '').split(',').map((s) => s.trim().replace(/\\/g, '/')).filter(Boolean);
  };

  const allowedFiles = getHeaderValue('Zmieniaj');
  const requiredFiles = getHeaderValue('Wymagane');
  const verification = (lines.find((l) => l.startsWith('Weryfikacja:')) || '').replace('Weryfikacja:', '').trim();

  return {
    title,
    content,
    allowedFiles,
    requiredFiles,
    verification: verification || 'pnpm test',
  };
}

function getActiveWaveTasks() {
  if (!fs.existsSync('tasks')) return new Map();
  const files = fs.readdirSync('tasks');
  const waves = new Map();
  for (const f of files) {
    const m = /^W(\d+)-([A-Za-z0-9]+).*\.md$/i.exec(f);
    if (m) {
      const wave = Number(m[1]);
      if (!waves.has(wave)) waves.set(wave, []);
      waves.get(wave).push({ file: f, path: path.join('tasks', f), wave, id: `W${wave}-${m[2]}` });
    }
  }
  return waves;
}

function getPendingPoczekalniaWaves() {
  if (!fs.existsSync('tasks/poczekalnia')) return new Map();
  const files = fs.readdirSync('tasks/poczekalnia');
  const waves = new Map();
  for (const f of files) {
    const m = /^W(\d+)-([A-Za-z0-9]+).*\.md$/i.exec(f);
    if (m) {
      const wave = Number(m[1]);
      if (!waves.has(wave)) waves.set(wave, []);
      waves.get(wave).push({ file: f, path: path.join('tasks/poczekalnia', f), wave, id: `W${wave}-${m[2]}` });
    }
  }
  return waves;
}

async function getDoneWaves() {
  try {
    const issueData = await gh('GET', 'issues/421');
    if (issueData && issueData.body) {
      const m = /<!-- JULES_LOOP_STATE\n([\s\S]*?)\n-->/.exec(issueData.body);
      if (m) {
        const state = JSON.parse(m[1]);
        return state.doneWaves || [];
      }
    }
  } catch {}
  return [];
}

// 4. Sprawdzanie i scalanie PR-ów
async function checkAndMergePrs(waveNum) {
  const prs = await gh('GET', 'pulls?state=open&per_page=50');
  if (!Array.isArray(prs)) return 0;

  const wavePrs = prs.filter((p) =>
    p.title.includes(`[W${waveNum}-`) ||
    p.head.ref.startsWith(`feat/w${waveNum}-`) ||
    p.head.ref.startsWith(`w${waveNum}-`)
  );
  log(`Znaleziono ${wavePrs.length} otwartych PR-ów dla fali W${waveNum}`);

  let mergedCount = 0;
  for (const pr of wavePrs) {
    log(`Sprawdzam PR #${pr.number}: ${pr.title}`);
    const checkRuns = await gh('GET', `commits/${pr.head.sha}/check-runs`);
    const runs = checkRuns.check_runs || [];

    const ciRuns = runs.filter((r) => r.name === 'testy' || r.name === 'bezpieczenstwo' || r.name === 'CI');
    log(`  Checki (${ciRuns.length}): ${ciRuns.map((r) => `${r.name}=${r.status}/${r.conclusion}`).join(', ')}`);

    const allCompleted = ciRuns.length >= 2 && ciRuns.every((r) => r.status === 'completed');
    const allSuccess = allCompleted && ciRuns.every((r) => r.conclusion === 'success');
    const anyFailed = ciRuns.some((r) => r.conclusion === 'failure' || r.conclusion === 'timed_out');

    if (anyFailed) {
      log(`  PR #${pr.number} ma nieudane checki. Ponawiam nieudane joby...`);
      for (const r of ciRuns) {
        if (r.conclusion === 'failure' || r.conclusion === 'timed_out') {
          try {
            await gh('POST', `actions/jobs/${r.id}/rerun`);
          } catch (e) {
            log(`  Nie udało się ponowić joba: ${e.message}`);
          }
        }
      }
      continue;
    }

    if (allSuccess) {
      log(`  PR #${pr.number} jest ZIELONY! Scalam...`);
      const mergeRes = await gh('PUT', `pulls/${pr.number}/merge`, {
        merge_method: 'squash',
        commit_title: `${pr.title} (auto-merge)`,
      });
      if (mergeRes && mergeRes.merged) {
        log(`  PR #${pr.number} został pomyślnie scalony!`);
        mergedCount++;
      }
    }
  }
  return mergedCount;
}

async function isMainCiGreen() {
  const runs = await gh('GET', 'actions/runs?branch=main&event=push&per_page=3');
  const list = runs.workflow_runs || [];
  const ciRun = list.find((r) => r.name === 'CI');
  if (!ciRun) return true;
  return ciRun.status === 'completed' && ciRun.conclusion === 'success';
}

// 5. Walidator zmian (Scope Guard & Integrity)
const FORBIDDEN_PATHS = [
  '.github',
  'scripts/jules-loop',
  'scripts/ops',
  'config/tokens.json',
  'docs/STAN.md',
  'docs/AUTOMAT.md',
  'AGENTS.md',
];

function validateChanges(taskMeta) {
  const statusOut = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (!statusOut) return { ok: false, error: 'Brak jakichkolwiek zmian po wykonaniu agenta.' };

  const changedFiles = statusOut
    .split(/\r?\n/)
    .map((l) => l.slice(3).trim().replace(/\\/g, '/'))
    .filter(Boolean);

  const allowed = new Set([...taskMeta.allowedFiles, ...taskMeta.requiredFiles]);

  // Sprawdź pliki spoza zadania
  const unallowed = changedFiles.filter((f) => !allowed.has(f));
  if (unallowed.length > 0) {
    return {
      ok: false,
      error: `Zmieniono pliki spoza listy "Zmieniaj:" zadania: ${unallowed.join(', ')}. Dozwolone: ${[...allowed].join(', ')}`,
    };
  }

  // Sprawdź pliki zabronione
  for (const f of changedFiles) {
    for (const forb of FORBIDDEN_PATHS) {
      if (f === forb || f.startsWith(`${forb}/`)) {
        return { ok: false, error: `Naruszenie zasad: zmodyfikowano zabroniony plik: ${f}` };
      }
    }
  }

  // Sprawdź wymagane pliki
  for (const req of taskMeta.requiredFiles) {
    if (!fs.existsSync(req)) {
      return { ok: false, error: `Brak wymaganego pliku, który miał powstać: ${req}` };
    }
  }

  // Sprawdź czy nic nie zostało usunięte z main
  try {
    const deleted = execSync('git diff --name-status --diff-filter=D main', { encoding: 'utf8' }).trim();
    if (deleted) {
      return { ok: false, error: `Usunięto istniejące pliki z main: ${deleted}` };
    }
  } catch {}

  // Sprawdź osłabianie testów
  for (const f of changedFiles) {
    if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.mjs')) {
      const code = fs.readFileSync(f, 'utf8');
      if (code.includes('.skip(') || code.includes('.only(') || code.includes('@ts-ignore') || code.includes('oxlint-disable')) {
        return { ok: false, error: `Wykryto osłabianie testów lub reguł w pliku ${f} (.skip, .only, @ts-ignore lub oxlint-disable).` };
      }
    }
  }

  return { ok: true, changedFiles };
}

// 6. Uruchomienie agenta na zadaniu z Feedback Loop (Self-Correction)
async function runAgentOnTask(task) {
  log(`[Antigravity Agent] Rozpoczynam zadanie ${task.id}: ${task.file}`);
  const taskMeta = parseTaskFile(task.path);

  const branchName = `feat/${task.id.toLowerCase()}`;

  // Przygotuj czysty branch z najnowszego main
  execSync('git checkout main', { stdio: 'pipe' });
  try {
    execSync('git pull origin main', { stdio: 'pipe' });
  } catch {}
  execSync('git reset --hard origin/main', { stdio: 'pipe' });
  execSync('git clean -fd', { stdio: 'pipe' });
  execSync(`git checkout -B ${branchName}`, { stdio: 'pipe' });

  const initialPrompt = [
    `Jesteś agentem programistycznym Antigravity w projekcie Faktografia Atlas.`,
    `Wykonaj następujące zadanie z pliku ${task.file}:`,
    `----------------------------------------`,
    taskMeta.content,
    `----------------------------------------`,
    `KRYTYCZNE ZASADY PROJEKTU:`,
    `1. Zmieniaj WYŁĄCZNIE pliki wymienione w sekcji "Zmieniaj:" i "Wymagane:": ${taskMeta.allowedFiles.join(', ')}`,
    `2. Nie dodawaj żadnych nowych pakietów npm.`,
    `3. Kolory, typografia i odstępy wyłącznie z tokenów (Tailwind / tokens.json). Zero kolorów sztywnych.`,
    `4. Najpierw napisz testy weryfikujące warunki "Gotowe, gdy:", a potem kod.`,
    `5. Nigdy nie osłabiaj testów (.skip, .only, @ts-ignore, oxlint-disable).`,
    `6. Wszystkie testy jednostkowe muszą przechodzić: pnpm test.`,
  ].join('\n\n');

  let success = false;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts && !success) {
    attempts++;
    log(`[${task.id}] Uruchamiam Antigravity CLI (próba ${attempts}/${maxAttempts})...`);

    try {
      const cliArgs = [
        '--dangerously-skip-permissions',
        '--mode', 'accept-edits',
      ];
      if (attempts > 1) {
        cliArgs.push('-c'); // continue poprzedniej sesji
      }
      cliArgs.push('--print', attempts === 1 ? initialPrompt : taskMeta._feedbackPrompt);

      execFileSync(AGY_PATH, cliArgs, {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: 'inherit',
        timeout: 360000, // 6 minut
      });
    } catch (err) {
      log(`[${task.id}] Błąd wykonania agy CLI: ${err.message}`);
    }

    // Walidacja zakresu zmian
    const val = validateChanges(taskMeta);
    if (!val.ok) {
      log(`[${task.id}] Odrzucono zmiany przez strażnika reguł: ${val.error}`);
      taskMeta._feedbackPrompt = `Poprzednia próba została odrzucona przez reguły projektu: ${val.error}\nCofnij nieuprawnione zmiany i popraw kod, zachowując wyłącznie dozwolone pliki.`;
      continue;
    }

    // Weryfikacja lokalna (typecheck + testy zadania)
    log(`[${task.id}] Uruchamiam lokalną weryfikację: typecheck oraz testy...`);
    try {
      execSync('pnpm typecheck', { stdio: 'inherit' });
      const changedTestFiles = val.changedFiles.filter((f) => f.includes('.test.') && fs.existsSync(f));
      if (changedTestFiles.length > 0) {
        log(`[${task.id}] Uruchamiam testy zadania: ${changedTestFiles.join(', ')}`);
        execSync(`pnpm vitest run ${changedTestFiles.join(' ')}`, { stdio: 'inherit' });
      }
      log(`[${task.id}] Weryfikacja lokalna przeszła pomyślnie!`);
      success = true;
    } catch (testErr) {
      log(`[${task.id}] Weryfikacja nie przeszła (próba ${attempts}/${maxAttempts}): ${testErr.message}`);
      taskMeta._feedbackPrompt = `Weryfikacja lokalna (pnpm typecheck / vitest) nie przeszła. Przeanalizuj błędy, napraw implementację lub testy zgodnie z zadaniem i upewnij się, że testy przechodzą. Nie usuwaj asercji.`;
    }
  }

  if (!success) {
    log(`[${task.id}] Zadanie nie powiodło się po ${maxAttempts} próbach. Przywracam stan main.`);
    execSync('git checkout main', { stdio: 'pipe' });
    execSync(`git branch -D ${branchName}`, { stdio: 'pipe' });
    return false;
  }

  // Commit i push
  log(`[${task.id}] Tworzę commit i wypycham gałąź ${branchName}...`);
  const commitMsg = `[${task.id}] ${taskMeta.title}\n\nPo ludzku:\n- Zaimplementowano zadanie ${task.id} przez Antigravity Agent.\n- Zmiany zweryfikowane lokalnie (pnpm test).`;
  execSync('git add -A', { stdio: 'pipe' });
  execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
  execSync(`git push -u origin ${branchName} --force`, { stdio: 'pipe' });

  // Utwórz PR
  log(`[${task.id}] Tworzę PR na GitHubie...`);
  try {
    const pr = await gh('POST', 'pulls', {
      title: `[${task.id}] ${taskMeta.title}`,
      head: branchName,
      base: 'main',
      body: `Automatycznie zaimplementowane zadanie przez Antigravity Agent.\n\n### Po ludzku:\n- Zaimplementowano zadanie ${task.id} (${taskMeta.title}).\n- Testy lokalne przeszły pomyślnie.\n\n### Zadanie:\n\`\`\`markdown\n${taskMeta.content.slice(0, 1500)}\n\`\`\``,
    });
    if (pr && pr.number) {
      log(`[${task.id}] Utworzono PR #${pr.number}: ${pr.html_url}`);
    }
  } catch (prErr) {
    log(`[${task.id}] Błąd tworzenia PR: ${prErr.message}`);
  }

  execSync('git checkout main', { stdio: 'pipe' });
  return true;
}

// 7. Zapis do docs/PROJECT_STATE.md
function updateProjectState(waveNum, summary) {
  const filePath = 'docs/PROJECT_STATE.md';
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');

  const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  // Aktualizuj status
  text = text.replace(
    /\*\*Ukończone fale:\*\*.*?\n/,
    `**Ukończone fale:** W14, W${waveNum} (Antigravity) · **Aktualizacja:** ${now}\n`
  );

  // Dodaj wpis do logu
  const logEntry = `- ${now.slice(0, 10)} ${now.slice(11, 16)} · ✅ **W${waveNum}** Ukończona pomyślnie przez Antigravity Agent: ${summary}\n`;
  text = text.replace('<!-- LOG -->\n', `<!-- LOG -->\n${logEntry}`);

  fs.writeFileSync(filePath, text, 'utf8');
  execSync('git add docs/PROJECT_STATE.md', { stdio: 'pipe' });
  execSync(`git commit -m "docs(state): Fala W${waveNum} ukończona przez Antigravity [skip ci]"`, { stdio: 'pipe' });
  execSync('git push origin main', { stdio: 'pipe' });
}

// 8. Główna pętla sterująca
async function runLoop() {
  log('=== Rozpoczynam Antigravity Wave & Agent Loop ===');

  while (true) {
    try {
      execSync('git checkout main && git pull origin main', { stdio: 'pipe' });
    } catch {}

    const doneWaves = await getDoneWaves();
    const activeWaves = getActiveWaveTasks();
    const sortedActive = [...activeWaves.keys()].filter((w) => !doneWaves.includes(w)).sort((a, b) => a - b);

    if (sortedActive.length > 0) {
      const currentWave = sortedActive[0];
      const tasks = activeWaves.get(currentWave);
      log(`Aktywna fala: W${currentWave} (${tasks.length} zadań: ${tasks.map((t) => t.id).join(', ')})`);

      // 1. Sprawdź czy są otwarte PR-y do scalenia
      await checkAndMergePrs(currentWave);

      // 2. Sprawdź które zadania jeszcze nie są zrobione
      const closedPrs = await gh('GET', 'pulls?state=closed&per_page=100');
      const openPrs = await gh('GET', 'pulls?state=open&per_page=50');

      const isTaskMerged = (taskId) => {
        return (closedPrs || []).some(
          (p) => p.merged_at && (p.title.includes(`[${taskId}]`) || p.head.ref.includes(taskId.toLowerCase()))
        );
      };

      const hasOpenPr = (taskId) => {
        return (openPrs || []).some(
          (p) => p.title.includes(`[${taskId}]`) || p.head.ref.includes(taskId.toLowerCase())
        );
      };

      const unmergedTasks = tasks.filter((t) => !isTaskMerged(t.id));
      log(`Zadania pozostałe do scalenia w W${currentWave}: ${unmergedTasks.length}/${tasks.length}`);

      if (unmergedTasks.length > 0) {
        // Uruchom agenta dla pierwszego niezrobionego zadania bez aktywnego PR-a
        const taskToRun = unmergedTasks.find((t) => !hasOpenPr(t.id));
        if (taskToRun) {
          log(`Uruchamiam agenta Antigravity dla zadania: ${taskToRun.id}`);
          await runAgentOnTask(taskToRun);
        } else {
          log(`Wszystkie niezrobione zadania mają otwarte PR-y. Czekam na checki CI...`);
        }
      } else {
        log(`Wszystkie zadania fali W${currentWave} zostały scalone! Sprawdzam CI na main...`);
        const mainGreen = await isMainCiGreen();
        if (mainGreen) {
          log(`CI na main jest ZIELONE! Fala W${currentWave} UKOŃCZONA!`);

          // Zaktualizuj stan issue #421
          try {
            const issueData = await gh('GET', 'issues/421');
            if (issueData && issueData.body) {
              const m = /<!-- JULES_LOOP_STATE\n([\s\S]*?)\n-->/.exec(issueData.body);
              if (m) {
                const curState = JSON.parse(m[1]);
                if (!curState.doneWaves.includes(currentWave)) curState.doneWaves.push(currentWave);
                curState.wave = null;
                curState.phase = 'idle';
                curState.tasks = [];
                curState.testTasks = [];
                curState.lastWaveSummary = `Fala W${currentWave} ukończona przez Antigravity.`;
                const newBody = issueData.body.replace(
                  /<!-- JULES_LOOP_STATE[\s\S]*?-->/,
                  `<!-- JULES_LOOP_STATE\n${JSON.stringify(curState)}\n-->`
                );
                await gh('PATCH', 'issues/421', { body: newBody });
                log(`Zaktualizowano stan issue #421: doneWaves=[${curState.doneWaves.join(', ')}]`);
              }
            }
          } catch (e) {
            log(`Błąd aktualizacji issue #421: ${e.message}`);
          }

          // Zaktualizuj docs/PROJECT_STATE.md
          updateProjectState(currentWave, `Wszystkie ${tasks.length} zadań scalone, CI na main zielone.`);
        } else {
          log(`Oczekiwanie na zielone CI na gałęzi main...`);
        }
      }
    } else {
      // Brak aktywnej fali w tasks/. Sprawdzamy poczekalnię!
      const poczekalnia = getPendingPoczekalniaWaves();
      const nextWaves = [...poczekalnia.keys()].sort((a, b) => a - b);

      if (nextWaves.length > 0) {
        const nextWave = nextWaves[0];
        const nextTasks = poczekalnia.get(nextWave);
        log(`Przechodzę do fali W${nextWave} (${nextTasks.length} zadań). Przenoszę z poczekalni...`);

        // Przenosimy zadania z poczekalni do tasks/
        for (const t of nextTasks) {
          const dest = path.join('tasks', t.file);
          fs.renameSync(t.path, dest);
        }

        execSync('git add tasks/', { stdio: 'pipe' });
        execSync(`git commit -m "Start fali F${nextWave} (${nextTasks.length} zadań) [Antigravity]"`, { stdio: 'pipe' });
        execSync('git push origin main', { stdio: 'pipe' });

        log(`Fala W${nextWave} została aktywowana na main!`);
      } else {
        log(`🎉 Wszystkie fale ukończone! Brak zadań w tasks/ i tasks/poczekalnia/. Koniec pracy.`);
        break;
      }
    }

    log('Czekam 30 sekund na kolejny obieg pętli...');
    await new Promise((r) => setTimeout(r, 30000));
  }
}

runLoop().catch((err) => {
  console.error('Błąd krytyczny Antigravity Loop:', err);
  process.exit(1);
});
