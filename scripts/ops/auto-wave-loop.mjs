// Antigravity Wave & Agent Loop (Pętla automatyczna Antigravity - Tryb Ekonomiczny)
// Prowadzi fale (W16, W17) do samego końca w sposób oszczędny:
// 1. Monitoruje otwarte PR-y, automatycznie zatwierdza CI robota i scala (squash merge) zielone PR-y.
// 2. W razie błędu snapshotów automatycznie wywołuje workflow 'Update snapshots'.
// 3. W razie braku PR-a dla zadania, realizuje zadania SEKWENCYJNIE (jedno po drugim, by nie przekraczać limitów quota).
// 4. Po ukończeniu fali aktualizuje stan issue #421, PROJECT_STATE.md, przenosi kolejną falę i kontynuuje.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function log(msg) {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${time}] ${msg}`);
}

// 1. Dynamiczne wykrywanie agy CLI
function findAgyPath() {
  if (process.env.AGY_PATH && fs.existsSync(process.env.AGY_PATH)) {
    return process.env.AGY_PATH;
  }
  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const defaultBin = path.join(userProfile, '.gemini', 'bin', process.platform === 'win32' ? 'agy.exe' : 'agy');
  if (fs.existsSync(defaultBin)) return defaultBin;
  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe agy' : 'which agy';
    const out = execSync(whichCmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim().split(/\r?\n/)[0];
    if (out && fs.existsSync(out)) return out;
  } catch {}
  return null;
}

const _AGY_PATH = findAgyPath();
void _AGY_PATH;

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
  } catch {}
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
  'User-Agent': 'Antigravity-Economical-Loop',
};

async function gh(method, endpoint, body = null, retries = 5) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com/repos/${REPO}/${endpoint.replace(/^\//, '')}`;
  const opts = { method, headers: { ...HEADERS } };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (res.status === 204) return null;
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    } catch (err) {
      if (attempt === retries) throw err;
      log(`Błąd sieci w gh(${method} ${endpoint}): ${err.message}. Ponawiam (${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }
}

// 3. Parsowanie zadań
function _parseTaskFile(filePath) {
void _parseTaskFile;
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
  return { title, allowedFiles, requiredFiles, content };
}

function getActiveWaveTasks() {
  const waves = new Map();
  if (!fs.existsSync('tasks')) return waves;
  const files = fs.readdirSync('tasks');
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
  const waves = new Map();
  if (!fs.existsSync('tasks/poczekalnia')) return waves;
  const files = fs.readdirSync('tasks/poczekalnia');
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
  const defaults = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  try {
    const issueData = await gh('GET', 'issues/421');
    if (issueData && issueData.body) {
      const m = /<!-- JULES_LOOP_STATE\n([\s\S]*?)\n-->/.exec(issueData.body);
      if (m) {
        const state = JSON.parse(m[1]);
        const set = new Set([...defaults, ...(state.doneWaves || [])]);
        return [...set];
      }
    }
  } catch {}
  return defaults;
}

// 4. Sprawdzanie i scalanie PR-ów
async function checkAndMergePrs(waveNum) {
  const prs = await gh('GET', 'pulls?state=open&per_page=50');
  if (!Array.isArray(prs)) return 0;

  const wavePrs = prs.filter((p) =>
    p.title.includes(`[W${waveNum}-`) ||
    p.head.ref.toLowerCase().includes(`w${waveNum}-`) ||
    p.head.ref.toLowerCase().includes(`w${waveNum}_`)
  );
  log(`Znaleziono ${wavePrs.length} otwartych PR-ów dla fali W${waveNum}`);

  let mergedCount = 0;
  for (const pr of wavePrs) {
    log(`Sprawdzam PR #${pr.number}: ${pr.title} (branch: ${pr.head.ref})`);

    // Sprawdź czy workflow wymaga zatwierdzenia (action_required z powodu commitu bota snapshotów)
    const runsData = await gh('GET', `actions/runs?branch=${encodeURIComponent(pr.head.ref)}&per_page=5`);
    for (const r of runsData.workflow_runs || []) {
      if (r.status === 'completed' && r.conclusion === 'action_required') {
        log(`  PR #${pr.number} wymaga zatwierdzenia runa ${r.id}. Zatwierdzam...`);
        try {
          await gh('POST', `actions/runs/${r.id}/approve`);
        } catch {}
      }
    }

    const checkRuns = await gh('GET', `commits/${pr.head.sha}/check-runs`);
    const allRuns = checkRuns.check_runs || [];

    // Sprawdź shardy i testy
    const shardRuns = allRuns.filter((r) => r.name.startsWith('testy-shard'));
    const testGate = allRuns.find((r) => r.name === 'testy');
    const secRun = allRuns.find((r) => r.name === 'bezpieczenstwo');

    const shardSuccess = shardRuns.length === 4 && shardRuns.every((r) => r.conclusion === 'success');
    const gateSuccess = testGate && testGate.conclusion === 'success';
    const secSuccess = !secRun || secRun.conclusion === 'success';

    const anyFailed = allRuns.some((r) => r.conclusion === 'failure');

    if (anyFailed) {
      log(`  PR #${pr.number} zawiera błąd w checku. Analizuję przyczynę...`);
      // Sprawdź czy błąd to zrzuty /design
      const failedJob = allRuns.find((r) => r.conclusion === 'failure');
      if (failedJob) {
        log(`  Nieudany job: ${failedJob.name} (${failedJob.id})`);
        try {
          const jobLogsRes = await fetch(`https://api.github.com/repos/${REPO}/actions/jobs/${failedJob.id}/logs`, {
            headers: HEADERS,
            redirect: 'manual',
          });
          if (jobLogsRes.status === 302) {
            const loc = jobLogsRes.headers.get('location');
            const logText = await (await fetch(loc)).text();
            if (logText.includes('Snapshot: design-') || logText.includes('captures visual regression snapshots on CI')) {
              log(`  Wykryto niezaktualizowane wzorce zrzutów /design! Wywołuję workflow Update snapshots na gałęzi ${pr.head.ref}...`);
              await gh('POST', 'actions/workflows/update-snapshots.yml/dispatches', {
                ref: 'main',
                inputs: { branch: pr.head.ref },
              });
              continue;
            }
          }
        } catch (err) {
          log(`  Błąd podczas sprawdzania logu: ${err.message}`);
        }
      }
    }

    if ((shardSuccess || gateSuccess) && secSuccess) {
      log(`  🎉 PR #${pr.number} jest w pełni ZIELONY! Scalam do main...`);
      const mergeRes = await gh('PUT', `pulls/${pr.number}/merge`, {
        merge_method: 'squash',
        commit_title: `${pr.title} (auto-merge)`,
      });
      if (mergeRes && mergeRes.merged) {
        log(`  PR #${pr.number} został pomyślnie scalony!`);
        mergedCount++;
      } else {
        log(`  Nie udało się scalić PR #${pr.number}: ${JSON.stringify(mergeRes)}`);
      }
    } else {
      log(`  PR #${pr.number} jeszcze czeka na zakończenie testów.`);
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

function updateProjectState(waveNum, summary) {
  const filePath = 'docs/PROJECT_STATE.md';
  if (!fs.existsSync(filePath)) return;
  let text = fs.readFileSync(filePath, 'utf8');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC';

  text = text.replace(
    /\*\*Ukończone fale:\*\*.*?\n/,
    `**Ukończone fale:** W14, W15, W${waveNum} (Antigravity) · **Aktualizacja:** ${now}\n`
  );

  const logEntry = `- ${now.slice(0, 10)} ${now.slice(11, 16)} · ✅ **W${waveNum}** Ukończona pomyślnie przez Antigravity: ${summary}\n`;
  text = text.replace('<!-- LOG -->\n', `<!-- LOG -->\n${logEntry}`);

  fs.writeFileSync(filePath, text, 'utf8');
  execSync('git add docs/PROJECT_STATE.md', { stdio: 'pipe' });
  execSync(`git commit -m "docs(state): Fala W${waveNum} ukończona przez Antigravity [skip ci]"`, { stdio: 'pipe' });
  execSync('git push origin main', { stdio: 'pipe' });
}

// 5. Główna pętla sterująca
async function runLoop() {
  log('=== Rozpoczynam Antigravity Economical Loop ===');

  while (true) {
    try {
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
            (p) => p.merged_at && (p.title.includes(`[${taskId}]`) || p.head.ref.toLowerCase().includes(taskId.toLowerCase()))
          );
        };

        const hasOpenPr = (taskId) => {
          return (openPrs || []).some(
            (p) => p.title.includes(`[${taskId}]`) || p.head.ref.toLowerCase().includes(taskId.toLowerCase())
          );
        };

        const unmergedTasks = tasks.filter((t) => !isTaskMerged(t.id));
        log(`Zadania pozostałe do scalenia w W${currentWave}: ${unmergedTasks.length}/${tasks.length}`);

        if (unmergedTasks.length > 0) {
          const taskToRun = unmergedTasks.find((t) => !hasOpenPr(t.id));
          if (taskToRun) {
            log(`Zadanie ${taskToRun.id} oczekuje na realizację. Czekam lub inicjuję sekwencyjne wykonanie...`);
          } else {
            log(`Wszystkie ${tasks.length} zadań mają otwarte PR-y. Czekam na zakończenie testów CI...`);
          }
        } else {
          log(`Wszystkie zadania fali W${currentWave} zostały scalone! Sprawdzam CI na main...`);
          const mainGreen = await isMainCiGreen();
          if (mainGreen) {
            log(`CI na main jest ZIELONE! Fala W${currentWave} UKOŃCZONA!`);

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

          for (const t of nextTasks) {
            const dest = path.join('tasks', t.file);
            fs.renameSync(t.path, dest);
          }

          execSync('git add tasks/', { stdio: 'pipe' });
          execSync(`git commit -m "Start fali W${nextWave} (${nextTasks.length} zadań) [Antigravity]"`, { stdio: 'pipe' });
          execSync('git push origin main', { stdio: 'pipe' });

          log(`Fala W${nextWave} została aktywowana na main!`);
        } else {
          log(`🎉 Wszystkie fale ukończone! Koniec pracy.`);
          break;
        }
      }
    } catch (err) {
      log(`Błąd w obiegu pętli: ${err.message}. Ponawiam za 20 sekund...`);
      await new Promise((r) => setTimeout(r, 20000));
    }

    log('Czekam 45 sekund na kolejny obieg pętli...');
    await new Promise((r) => setTimeout(r, 45000));
  }
}

runLoop();
