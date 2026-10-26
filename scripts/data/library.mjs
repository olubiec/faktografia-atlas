// Robot „Biblioteka GUS”: w każdym uruchomieniu (co 12 h) pobiera tyle, ile mieści się w budżecie zapytań,
// i zapisuje postęp w library/state.json. Uruchomienie wznawia pracę od miejsca zatrzymania.
// Użycie: BDL_CLIENT_ID=… LIBRARY_DIR=library LIBRARY_BUDGET=2500 node scripts/data/library.mjs
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWithRetry } from './fetch-values.mjs';
import {
  addSubject, compactPages, createBudget, dataUrl, emptyCatalog, emptyState,
  levelsForVariable, sortQueue, subjectsUrl, variablesUrl,
} from './library-lib.mjs';

const dir = process.env.LIBRARY_DIR ?? 'library';
const clientId = process.env.BDL_CLIENT_ID;
const budget = createBudget(Number(process.env.LIBRARY_BUDGET ?? 2500));
const deadline = Date.now() + Number(process.env.LIBRARY_MINUTES ?? 140) * 60000;
const stats = { requests: 0 };

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(path.join(dir, file), 'utf8'));
  } catch {
    return fallback;
  }
}
async function writeJson(file, data) {
  const target = path.join(dir, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(`${target}.tmp`, JSON.stringify(data));
  await rename(`${target}.tmp`, target);
}

class LimitStop extends Error {}

async function get(url) {
  if (!budget.canRequest() || Date.now() > deadline) throw new LimitStop('budżet lub czas');
  budget.spend();
  return fetchWithRetry(url, clientId, { stats });
}

async function allPages(urlFor) {
  const results = [];
  for (let page = 0; ; page++) {
    const json = await get(urlFor(page));
    if (!json) break;
    results.push(json);
    if (!json.links?.next) break;
  }
  return results;
}

// Faza 1: katalog (działy → zmienne). Kolejka działów do rozwinięcia jest w state.pending ('' = korzeń).
async function crawlCatalog(state, catalog) {
  if (!state.pendingInit) {
    state.pending = [''];
    state.pendingInit = true;
  }
  while (state.pending.length > 0) {
    const parentId = state.pending[0];
    const pages = await allPages((p) => subjectsUrl(parentId, p));
    const children = pages.flatMap((p) => p.results ?? []);
    if (children.length > 0) {
      for (const c of children) {
        addSubject(catalog, c, parentId || null);
        state.pending.push(c.id);
      }
    } else if (parentId) {
      const vpages = await allPages((p) => variablesUrl(parentId, p));
      for (const v of vpages.flatMap((p) => p.results ?? [])) {
        const item = {
          id: v.id,
          subjectId: v.subjectId ?? parentId,
          level: v.level,
          unit: v.measureUnitName,
        };
        for (const k of ['n1', 'n2', 'n3', 'n4', 'n5']) {
          if (typeof v[k] === 'string' && v[k].trim().length > 0) {
            item[k] = v[k];
          }
        }
        catalog.variables[v.id] = item;
      }
    }
    state.pending.shift();
    await writeJson('catalog.json', catalog);
    await writeJson('state.json', state);
  }
  state.catalogDone = true;
}

// Faza 2: wartości zmiennych wg kolejki priorytetów.
async function downloadValues(state, catalog) {
  const queue = sortQueue(Object.values(catalog.variables));
  for (const v of queue) {
    if (state.done[v.id] || (state.failed[v.id] ?? 0) >= 3) continue;
    if (!budget.canStartVariable()) break;
    try {
      const out = { v: v.id };
      for (const level of levelsForVariable(v)) {
        out[`l${level}`] = compactPages(await allPages((p) => dataUrl(v.id, level, p)));
      }
      await writeJson(`values/${v.id}.json`, out);
      state.done[v.id] = new Date().toISOString().slice(0, 10);
    } catch (err) {
      if (err instanceof LimitStop || /HTTP 429/.test(err.message)) throw err;
      state.failed[v.id] = (state.failed[v.id] ?? 0) + 1;
      console.error(`Zmienna ${v.id}: ${err.message.replace(clientId ?? '', '[KLUCZ]')}`);
    }
    await writeJson('state.json', state);
  }
}

async function main() {
  if (!clientId) {
    console.error('Brak BDL_CLIENT_ID.');
    process.exit(1);
  }
  const state = await readJson('state.json', emptyState());
  const catalog = await readJson('catalog.json', emptyCatalog());
  try {
    if (!state.catalogDone) await crawlCatalog(state, catalog);
    await downloadValues(state, catalog);
  } catch (err) {
    if (!(err instanceof LimitStop)) {
      console.error(String(err.message).replace(clientId, '[KLUCZ]'));
      process.exitCode = /HTTP 429/.test(err.message) ? 0 : 1;
    }
  } finally {
    state.runs++;
    state.lastRun = new Date().toISOString();
    await writeJson('state.json', state);
    const total = Object.keys(catalog.variables).length;
    console.log(`Zapytań: ${budget.used}/${budget.used + budget.left}. Katalog: ${state.catalogDone ? 'komplet' : `w toku (${state.pending.length} działów w kolejce)`}. Zmiennych: ${total}, pobranych: ${Object.keys(state.done).length}, błędnych: ${Object.keys(state.failed).length}.`);
  }
}

export { crawlCatalog, downloadValues, main };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
