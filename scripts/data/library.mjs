// Robot „Biblioteka GUS”: w każdym uruchomieniu (co 12 h) pobiera tyle, ile mieści się w budżecie zapytań,
// i zapisuje postęp w library/state.json. Uruchomienie wznawia pracę od miejsca zatrzymania.
// Kolejność: config/library-priority.json (podstawowe i popularne wskaźniki najpierw).
// Użycie: BDL_CLIENT_ID=… LIBRARY_DIR=library LIBRARY_BUDGET=3000 node scripts/data/library.mjs
// Podgląd bez sieci i bez klucza: LIBRARY_DRY=1 LIBRARY_DIR=… node scripts/data/library.mjs
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWithRetry } from './fetch-values.mjs';
import {
  addSubject, compactPages, createBudget, dataUrl, emptyCatalog, emptyState,
  levelsForVariable, subjectsUrl, variablesUrl,
} from './library-lib.mjs';
import { sectionOf, sortQueueByPriority, summarizeBySection, priorityScore } from './library-priority.mjs';
import { fetchHtml, loadCalendar, calendarHits } from './gus-calendar.mjs';
import { budgetForRun, hasNewYear, pagesHaveValues, refreshCandidates, yearProbeUrl } from './library-plan.mjs';

const dir = process.env.LIBRARY_DIR ?? 'library';
const clientId = process.env.BDL_CLIENT_ID;
let budget = createBudget(Number(process.env.LIBRARY_BUDGET ?? 3000));
const deadline = Date.now() + Number(process.env.LIBRARY_MINUTES ?? 130) * 60000;
const stats = { requests: 0 };
const bySection = {};
const configFile = fileURLToPath(new URL('../../config/library-priority.json', import.meta.url));

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
  const before = stats.requests;
  try {
    return await fetchWithRetry(url, clientId, { stats });
  } finally {
    // Ponowienia (429, 5xx) też zużywają limit API – liczymy je do budżetu.
    for (let i = stats.requests - before; i > 1; i--) budget.spend();
  }
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
async function downloadValues(state, catalog, config = null) {
  config ??= JSON.parse(await readFile(configFile, 'utf8'));
  const queue = sortQueueByPriority(Object.values(catalog.variables), catalog, config, state);
  stats.queueLength = queue.length;
  for (const v of queue) {
    if (!budget.canStartVariable()) break;
    const spentBefore = budget.used;
    try {
      const out = { v: v.id };
      for (const level of levelsForVariable(v)) {
        const pages = await allPages((p) => dataUrl(v.id, level, p));
        out[`l${level}`] = compactPages(pages);
        // Powiaty są tanie (kilka zapytań), gminy drogie (~25): pusty poziom powiatów = gmin nie pobieramy.
        if (level === 5 && !pagesHaveValues(pages)) {
          stats.skippedEmpty = (stats.skippedEmpty ?? 0) + 1;
          break;
        }
      }
      await writeJson(`values/${v.id}.json`, out);
      state.done[v.id] = new Date().toISOString().slice(0, 10);
      (state.cost ??= {})[v.id] = budget.used - spentBefore;
      const section = sectionOf(v, catalog);
      bySection[section] = (bySection[section] ?? 0) + 1;
      stats.queueLength--;
    } catch (err) {
      if (err instanceof LimitStop || /HTTP 429/.test(err.message)) throw err;
      state.failed[v.id] = (state.failed[v.id] ?? 0) + 1;
      (state.failedAt ??= {})[v.id] = new Date().toISOString();
      console.error(`Zmienna ${v.id}: ${err.message.replace(clientId ?? '', '[KLUCZ]')}`);
    }
    await writeJson('state.json', state);
  }
}

// Odświeżanie: dla pobranych dawniej niż refreshAfterDays jedno tanie zapytanie sprawdza, czy GUS dopisał rok;
// dopiero wtedy zmienna jest pobierana od nowa. Część budżetu (refreshShare) jest zarezerwowana na tę fazę.
async function refreshValues(state, catalog, config, total) {
  const cap = Math.floor(total * (config.refreshShare ?? 0.15));
  const start = budget.used;
  const scoreOf = (id) => {
    const v = catalog.variables[id];
    return v ? priorityScore(v, catalog.subjects?.[v.subjectId]?.path ?? [], config) : 0;
  };
  const pathOf = (v) => catalog.subjects?.[v.subjectId]?.path ?? [];
  const calendarHit = (id) => !!catalog.variables[id] && calendarHits(catalog.variables[id], pathOf(catalog.variables[id]), config.calendarStems) > 0;
  for (const id of refreshCandidates({ done: state.done, config, scoreOf, calendarHit, calendarLatest: config.calendarLatest })) {
    if (budget.used - start >= cap || !budget.canStartVariable()) break;
    const v = catalog.variables[id];
    const old = await readJson(`values/${id}.json`, null);
    if (!v || !old?.l5 && !old?.l6) continue;
    const years = old.l6?.y ?? old.l5?.y ?? [];
    if (years.length === 0) continue;
    const spentBefore = budget.used;
    if (hasNewYear(await get(yearProbeUrl(id, years)))) {
      const out = { v: id };
      for (const level of levelsForVariable(v)) out[`l${level}`] = compactPages(await allPages((p) => dataUrl(id, level, p)));
      await writeJson(`values/${id}.json`, out);
      (state.cost ??= {})[id] = budget.used - spentBefore;
      stats.refreshed = (stats.refreshed ?? 0) + 1;
    }
    state.done[id] = new Date().toISOString().slice(0, 10);
    await writeJson('state.json', state);
  }
}

// Kalendarium GUS (3 ostatnie dni): rdzenie tematów do premii w kolejce. Błąd sieci nie przerywa pracy.
async function applyCalendar(config) {
  if (process.env.LIBRARY_CALENDAR === '0') return;
  const cal = await loadCalendar(fetchHtml).catch(() => null);
  if (!cal) return;
  config.calendarStems = cal.stems;
  config.calendarLatest = cal.latest;
  stats.calendarTitles = cal.titles.length;
}

// Podgląd: ile i jakie zmienne weszłyby do tego przebiegu (bez zapytań do API).
async function dryRun() {
  const state = await readJson('state.json', emptyState());
  const catalog = await readJson('catalog.json', emptyCatalog());
  const config = JSON.parse(await readFile(configFile, 'utf8'));
  const queue = sortQueueByPriority(Object.values(catalog.variables), catalog, config, state);
  const inRun = queue.slice(0, Math.floor(budget.left / 45));
  const counts = {};
  for (const v of inRun) counts[sectionOf(v, catalog)] = (counts[sectionOf(v, catalog)] ?? 0) + 1;
  console.log(`Podgląd (bez zapytań): w kolejce ${queue.length} zmiennych, do tego przebiegu ok. ${inRun.length} (budżet ${budget.left}, 45 zapytań na zmienną).`);
  console.log(summarizeBySection(counts, queue.length - inRun.length, 'Weszłoby do tego przebiegu wg działów (podgląd)'));
  console.log(`Pierwsze id: ${inRun.slice(0, 30).map((v) => v.id).join(', ')}`);
}

async function main() {
  if (process.env.LIBRARY_DRY === '1') return dryRun();
  if (!clientId) {
    console.error('Brak BDL_CLIENT_ID.');
    process.exit(1);
  }
  const state = await readJson('state.json', emptyState());
  const catalog = await readJson('catalog.json', emptyCatalog());
  try {
    // Okno 12 h: odejmij zapytania z poprzednich przebiegów, żeby dwa przebiegi blisko siebie nie przekroczyły limitu.
    const total = budgetForRun({ runLog: state.runLog ?? [], now: Date.now(), total: Number(process.env.LIBRARY_BUDGET ?? 3000) });
    budget = createBudget(total);
    if (!state.catalogDone) await crawlCatalog(state, catalog);
    const config = JSON.parse(await readFile(configFile, 'utf8'));
    await applyCalendar(config);
    await refreshValues(state, catalog, config, total);
    await downloadValues(state, catalog, config);
  } catch (err) {
    if (!(err instanceof LimitStop)) {
      console.error(String(err.message).replace(clientId, '[KLUCZ]'));
      process.exitCode = /HTTP 429/.test(err.message) ? 0 : 1;
    }
  } finally {
    state.runs++;
    state.lastRun = new Date().toISOString();
    state.runLog = [...(state.runLog ?? []), { at: state.lastRun, used: stats.requests }].slice(-20);
    await writeJson('state.json', state);
    const total = Object.keys(catalog.variables).length;
    const table = summarizeBySection(bySection, stats.queueLength ?? 0);
    console.log(table);
    if (process.env.LIBRARY_SUMMARY_FILE) await writeFile(process.env.LIBRARY_SUMMARY_FILE, `${table}\n`);
    console.log(`Zapytań: ${budget.used}/${budget.used + budget.left}. Katalog: ${state.catalogDone ? 'komplet' : `w toku (${state.pending.length} działów w kolejce)`}. Odświeżonych (nowy rok): ${stats.refreshed ?? 0}. Kalendarium GUS: ${stats.calendarTitles ?? 0} publikacji. Pominięte puste (bez gmin): ${stats.skippedEmpty ?? 0}. Zmiennych: ${total}, pobranych: ${Object.keys(state.done).length}, błędnych: ${Object.keys(state.failed).length}.`);
  }
}

export { crawlCatalog, downloadValues, main };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
