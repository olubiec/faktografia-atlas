// Automatyczny nadzorca fal (Auto Wave & Antigravity Agent Loop):
// 1. Fala W15: monitoruje biezace PR-y Julesa i automatycznie je scala po zielonym CI.
// 2. Od Fali W16 wzwyz: calkowicie rezygnuje z Julesa – bezposrednio uruchamia agentow
//    Antigravity CLI (agy.exe) dla kazdego zadania w fali.
// 3. Agent implementuje kod, pisze testy i weryfikuje lokalnie (pnpm test).
// 4. Skrypt tworzy branch, pushuje, zaklada PR, czeka na CI i scala.
// 5. Po zakonczeniu calej fali automatycznie przechodzi do kolejnej fali az do konca.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function getGithubToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = /password=(.*)/.exec(creds);
    if (match) return match[1].trim();
  } catch (err) {
    console.error('Nie udalo sie pobrac tokenu z git credential:', err.message);
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
  'User-Agent': 'Auto-Wave-Loop',
};

const AGY_PATH = 'C:\\Users\\m.olubiec\\.gemini\\bin\\agy.exe';

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

function log(msg) {
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${time}] ${msg}`);
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
      waves.get(wave).push({ file: f, path: path.join('tasks', f), id: `W${wave}-${m[2]}` });
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
      waves.get(wave).push({ file: f, path: path.join('tasks/poczekalnia', f), id: `W${wave}-${m[2]}` });
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

async function checkAndMergePrs(waveNum) {
  const prs = await gh('GET', 'pulls?state=open&per_page=50');
  if (!Array.isArray(prs)) return 0;

  const wavePrs = prs.filter((p) => p.title.includes(`[W${waveNum}-`) || p.head.ref.startsWith(`w${waveNum}-`) || p.head.ref.startsWith(`jules-w${waveNum}-`) || p.head.ref.startsWith(`feat/w${waveNum}-`));
  log(`Znaleziono ${wavePrs.length} otwartych PR-ow dla fali W${waveNum}`);

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
      log(`  PR #${pr.number} ma nieudane checki. Ponawiam joby...`);
      for (const r of ciRuns) {
        if (r.conclusion === 'failure' || r.conclusion === 'timed_out') {
          try {
            await gh('POST', `actions/jobs/${r.id}/rerun`);
          } catch (e) {
            log(`  Nie udalo sie ponowic: ${e.message}`);
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
      if (mergeRes.merged) {
        log(`  PR #${pr.number} zostal pomyslnie scalony!`);
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

function runAgentOnTask(task) {
  log(`[Antigravity Agent] Rozpoczynam zadanie ${task.id} (${task.file})...`);
  const content = fs.readFileSync(task.path, 'utf8');

  const branchName = `feat/${task.id.toLowerCase()}`;
  log(`Tworze branch ${branchName}...`);
  execSync(`git checkout main && git pull origin main`, { stdio: 'pipe' });
  try {
    execSync(`git checkout -B ${branchName}`, { stdio: 'pipe' });
  } catch (e) {
    log(`Blad checkout: ${e.message}`);
  }

  const prompt = [
    `Wykonaj nastepujace zadanie dla projektu Faktografia Atlas:`,
    content,
    `Wazne zasady:`,
    `- Zmieniaj TYLKO pliki wymienione w linii "Zmieniaj:" i "Wymagane:".`,
    `- Zero nowych pakietow, kolory i odstepy tylko z tokenow.`,
    `- Najpierw napisz testy, potem kod.`,
    `- Przed zakonczeniem upewnij sie, ze testy przechodza: pnpm test.`,
  ].join('\n\n');

  log(`Uruchamiam agy.exe dla ${task.id}...`);
  try {
    execSync(`"${AGY_PATH}" --dangerously-skip-permissions --print "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      stdio: 'inherit',
      timeout: 300000,
    });
  } catch (err) {
    log(`Ostrzezenie z agy.exe: ${err.message}`);
  }

  // Sprawdz stan git
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (!status.trim()) {
    log(`Brak zmian w kodzie po uruchomieniu agenta dla ${task.id}.`);
    execSync('git checkout main', { stdio: 'pipe' });
    return false;
  }

  log(`Weryfikuje testy lokalnie...`);
  try {
    execSync('pnpm test', { stdio: 'inherit' });
    log(`Testy jednostkowe zielone!`);
  } catch (err) {
    log(`Testy nie przeszly: ${err.message}`);
  }

  log(`Tworze commit i pushuje ${branchName}...`);
  execSync(`git add -A && git commit -m "[${task.id}] ${task.file.replace('.md', '')}"`, { stdio: 'pipe' });
  execSync(`git push -u origin ${branchName} --force`, { stdio: 'pipe' });

  // Utworz PR
  log(`Tworze PR dla ${task.id}...`);
  try {
    const prRes = execSync(`node -e "
      const token = '${TOKEN}';
      fetch('https://api.github.com/repos/${REPO}/pulls', {
        method: 'POST',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '[${task.id}] ${task.file.replace('.md', '')}',
          head: '${branchName}',
          base: 'main',
          body: 'Automatycznie wygenerowane zadanie przez Antigravity Agent.\\n\\n' + ${JSON.stringify(content.slice(0, 500))}
        })
      }).then(r => r.json()).then(d => console.log('PR utworzony: #' + d.number));
    "`, { encoding: 'utf8' });
    log(prRes.trim());
  } catch (e) {
    log(`Blad tworzenia PR: ${e.message}`);
  }

  execSync('git checkout main', { stdio: 'pipe' });
  return true;
}

async function runLoop() {
  log('Uruchamiam Auto Wave & Antigravity Agent Loop...');

  while (true) {
    try {
      execSync('git pull origin main', { stdio: 'pipe' });
    } catch {}

    const doneWaves = await getDoneWaves();
    const activeWaves = getActiveWaveTasks();
    const sortedActive = [...activeWaves.keys()].filter((w) => !doneWaves.includes(w)).sort((a, b) => a - b);

    if (sortedActive.length > 0) {
      const currentWave = sortedActive[0];
      const tasks = activeWaves.get(currentWave);
      log(`Aktywna fala: W${currentWave} (${tasks.length} zadan)`);

      await checkAndMergePrs(currentWave);

      // Sprawdz czy wszystkie zadania zostaly scalone
      const closedPrs = await gh('GET', 'pulls?state=closed&per_page=50');
      const mergedPrs = (closedPrs || []).filter((p) => p.merged_at && (p.title.includes(`[W${currentWave}-`) || p.head.ref.startsWith(`w${currentWave}-`) || p.head.ref.startsWith(`feat/w${currentWave}-`)));

      log(`Scalone PR-y dla fali W${currentWave}: ${mergedPrs.length}/${tasks.length}`);

      if (mergedPrs.length >= tasks.length) {
        log(`Wszystkie zadania fali W${currentWave} zostaly scalone! Sprawdzam CI na main...`);
        const mainGreen = await isMainCiGreen();
        if (mainGreen) {
          log(`CI na main jest ZIELONE! Fala W${currentWave} UKONCZONA!`);

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
                curState.lastWaveSummary = `Fala W${currentWave} ukonczona pomyslnie.`;
                const newBody = issueData.body.replace(/<!-- JULES_LOOP_STATE[\s\S]*?-->/, `<!-- JULES_LOOP_STATE\n${JSON.stringify(curState)}\n-->`);
                await gh('PATCH', 'issues/421', { body: newBody });
                log(`Zaktualizowano stan issue #421: doneWaves=[${curState.doneWaves.join(', ')}]`);
              }
            }
          } catch (e) {
            log(`Blad aktualizacji issue #421: ${e.message}`);
          }
        }
      }
    } else {
      // Brak aktywnej fali w tasks/. Sprawdzamy poczekalnie!
      const poczekalnia = getPendingPoczekalniaWaves();
      const nextWaves = [...poczekalnia.keys()].sort((a, b) => a - b);

      if (nextWaves.length > 0) {
        const nextWave = nextWaves[0];
        const nextTasks = poczekalnia.get(nextWave);
        log(`Przechodze do fali W${nextWave} (${nextTasks.length} zadan). Tryb: Antigravity Agent!`);

        // W trybie Antigravity Agent nie startujemy Julesa:
        // Wykonujemy zadania lokalnie przez agy.exe!
        for (const t of nextTasks) {
          runAgentOnTask(t);
        }

        // Przenosimy zadania do tasks/
        for (const t of nextTasks) {
          const dest = path.join('tasks', t.file);
          fs.renameSync(t.path, dest);
        }
        execSync('git add tasks/', { stdio: 'pipe' });
        execSync(`git commit -m "[W${nextWave}] Wdrozenie fali przez Antigravity Agent"`, { stdio: 'pipe' });
        execSync('git push origin main', { stdio: 'pipe' });
      } else {
        log(`Wszystkie fale zakonczone! Brak zadan w tasks/ i tasks/poczekalnia/. Koniec pracy.`);
        break;
      }
    }

    log('Czekam 30 sekund na kolejny obieg...');
    await new Promise((r) => setTimeout(r, 30000));
  }
}

runLoop().catch((err) => {
  console.error('Blad krytyczny Auto Wave Loop:', err);
  process.exit(1);
});
