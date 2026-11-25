// Robot „Biblioteka GUS”: w każdym uruchomieniu (co 12 h) pobiera tyle, ile mieści się w budżecie zapytań,
// i zapisuje postęp w library/state.json. Uruchomienie wznawia pracę od miejsca zatrzymania.
// Kolejność: config/library-priority.json (podstawowe i popularne wskaźniki najpierw).
// Zakres: config/library-scope.json + reguły strony (library-scope.mjs) – reszty katalogu robot nie pobiera.
// Użycie: BDL_CLIENT_ID=… LIBRARY_DIR=library LIBRARY_BUDGET=3000 node scripts/data/library.mjs
// Podgląd bez sieci i bez klucza: LIBRARY_DRY=1 LIBRARY_DIR=… node scripts/data/library.mjs
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWithRetry } from './fetch-values.mjs';
import {
  addSubject, compactPages, createBudget, dataUrl, emptyCatalog, emptyState,
  subjectsUrl, variablesUrl,
} from './library-lib.mjs';
import { sectionOf, sortQueueByPriority, summarizeBySection, priorityScore } from './library-priority.mjs';
import { fetchHtml, loadCalendar, calendarHits } from './gus-calendar.mjs';
import { factsFromValues, findPremieres, premiereVariableIds, prependPremieres, updateLedger, waitingIds } from './premieres.mjs';
import {
  fetchLevels, filterInScope, isStale, levelKey, loadScope, missingLevels, probeUrlFor, scopeReason, variableName, yearsOf,
} from './library-scope.mjs';
import { budgetForRun, hasNewYear, pagesHaveValues, refreshCandidates } from './library-plan.mjs';

const dir = process.env.LIBRARY_DIR ?? 'library';
const clientId = process.env.BDL_CLIENT_ID;
let budget = createBudget(Number(process.env.LIBRARY_BUDGET ?? 3000));
const deadline = Date.now() + Number(process.env.LIBRARY_MINUTES ?? 130) * 60000;
const stats = { requests: 0 };
const bySection = {};
const configFile = fileURLToPath(new URL('../../config/library-priority.json', import.meta.url));
const indicatorsFile = fileURLToPath(new URL('../../config/indicators.json', import.meta.url));
// Tryb „tylko premiery” (uruchamiany ręcznie): sprawdza i pobiera wyłącznie zmienne z dzisiejszych publikacji GUS.
const premiereOnly = process.env.LIBRARY_PREMIERES_ONLY === '1'; // ręcznie: tylko premiery
const today = () => new Date().toISOString().slice(0, 10);
let premieres = [];

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
async function downloadValues(state, catalog, config = null, scope = null) {
  config ??= JSON.parse(await readFile(configFile, 'utf8'));
  scope ??= await loadScope();
  const wanted = filterInScope(Object.values(catalog.variables), catalog, scope);
  stats.inScope = wanted.length;
  let queue = prependPremieres(sortQueueByPriority(wanted, catalog, config, state, fetchLevels), config.premiereIds ?? []);
  if (premiereOnly) queue = queue.filter((v) => (config.premiereIds ?? []).includes(Number(v.id)));
  stats.queueLength = queue.length;
  for (const v of queue) {
    if (!budget.canStartVariable()) break;
    const spentBefore = budget.used;
    try {
      const out = { v: v.id };
      for (const level of fetchLevels(v)) {
        let pages;
        try {
          pages = await allPages((p) => dataUrl(v.id, level, p));
        } catch (err) {
          // Luka w gminach nie przekreśla wskaźnika: zapisujemy województwa i powiaty, gminy dociągnie dopełnienie.
          if (level !== 6 || isHardStop(err)) throw err;
          markGmiGap(state, v.id);
          break;
        }
        out[levelKey(level)] = compactPages(pages);
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
      if (isHardStop(err)) throw err;
      state.failed[v.id] = (state.failed[v.id] ?? 0) + 1;
      (state.failedAt ??= {})[v.id] = new Date().toISOString();
      console.error(`Zmienna ${v.id}: ${err.message.replace(clientId ?? '', '[KLUCZ]')}`);
    }
    await writeJson('state.json', state);
  }
}

// Dopełnienie: zmienne pobrane wcześniej, którym brakuje poziomu (najczęściej województw – 1 zapytanie)
// albo gmin, których pobranie się nie udało (luka). Lukę w gminach próbujemy GAP_TRIES razy, potem ją
// akceptujemy – strona pokaże wtedy województwa i powiaty, a dla gmin informację o braku danych.
const GAP_TRIES = 3;
const isHardStop = (err) => err instanceof LimitStop || /HTTP 429/.test(err.message);

function markGmiGap(state, id) {
  (state.gmiGap ??= {})[id] = (state.gmiGap[id] ?? 0) + 1;
  stats.gmiGaps = (stats.gmiGaps ?? 0) + 1;
}

async function backfillLevels(state, catalog, scope) {
  const pathOf = (v) => catalog.subjects?.[v.subjectId]?.path ?? [];
  state.woj ??= {};
  state.gmiGap ??= {};
  for (const id of Object.keys(state.done)) {
    const gapTries = state.gmiGap[id] ?? 0;
    const retryGap = gapTries > 0 && gapTries < GAP_TRIES;
    if ((state.woj[id] && !retryGap) || !budget.canStartVariable()) continue;
    const v = catalog.variables[id];
    if (!v || scopeReason(v, pathOf(v), scope) !== null) continue;
    const old = await readJson(`values/${id}.json`, null);
    let changed = false;
    for (const level of missingLevels(v, old)) {
      try {
        old[levelKey(level)] = compactPages(await allPages((p) => dataUrl(id, level, p)));
        changed = true;
        if (level === 6) delete state.gmiGap[id];
      } catch (err) {
        if (isHardStop(err)) throw err;
        if (level === 6) markGmiGap(state, id);
        else console.error(`Dopełnienie ${id}: ${err.message.replace(clientId ?? '', '[KLUCZ]')}`);
      }
    }
    if (changed) {
      await writeJson(`values/${id}.json`, old);
      stats.backfilled = (stats.backfilled ?? 0) + 1;
    }
    state.woj[id] = 1;
    await writeJson('state.json', state);
  }
}

// Odświeżanie: dla pobranych dawniej niż refreshAfterDays jedno tanie zapytanie sprawdza, czy GUS dopisał rok;
// dopiero wtedy zmienna jest pobierana od nowa. Część budżetu (refreshShare) jest zarezerwowana na tę fazę.
async function refreshValues(state, catalog, config, total, scope) {
  const cap = premiereOnly ? total : Math.floor(total * (config.refreshShare ?? 0.15));
  const start = budget.used;
  const scoreOf = (id) => {
    const v = catalog.variables[id];
    return v ? priorityScore(v, catalog.subjects?.[v.subjectId]?.path ?? [], config) : 0;
  };
  const pathOf = (v) => catalog.subjects?.[v.subjectId]?.path ?? [];
  const calendarHit = (id) => !!catalog.variables[id] && calendarHits(catalog.variables[id], pathOf(catalog.variables[id]), config.calendarStems) > 0;
  const premiereIds = config.premiereIds ?? [];
  let candidates = refreshCandidates({ done: state.done, config, scoreOf, calendarHit, calendarLatest: config.calendarLatest, premiereIds, premiereMax: config.premiereMax });
  if (premiereOnly) candidates = candidates.filter((id) => premiereIds.includes(id));
  for (const id of candidates) {
    if (budget.used - start >= cap || !budget.canStartVariable()) break;
    const v = catalog.variables[id];
    // Poza wytycznymi (strona tego nie pokaże) – nie wydajemy nawet zapytania-sondy.
    if (!v || scopeReason(v, pathOf(v), scope) !== null) continue;
    const old = await readJson(`values/${id}.json`, null);
    if (!old) continue;
    const years = yearsOf(old);
    if (years.length === 0 || isStale(years, scope)) continue;
    const spentBefore = budget.used;
    if (hasNewYear(await get(probeUrlFor(v, years)))) {
      const out = { v: id };
      for (const level of fetchLevels(v)) out[levelKey(level)] = compactPages(await allPages((p) => dataUrl(id, level, p)));
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
  const cal = await loadCalendar(fetchHtml, { ahead: Number(process.env.LIBRARY_CALENDAR_AHEAD ?? 0) }).catch(() => null);
  if (!cal) return null;
  config.calendarStems = cal.stems;
  config.calendarLatest = cal.latest;
  stats.calendarTitles = cal.titles.length;
  return cal;
}

// Premiery: publikacje z kalendarium dopasowane do wskaźników głównych i zmiennych biblioteki; ich zmienne idą na początek kolejki.
async function applyPremieres(cal, catalog, config, state) {
  const pathOf = (v) => catalog.subjects?.[v.subjectId]?.path ?? [];
  const indicators = JSON.parse(await readFile(indicatorsFile, 'utf8'));
  const variables = Object.values(catalog.variables).map((variable) => ({ variable, path: pathOf(variable) }));
  premieres = findPremieres(cal.items, { indicators, variables });
  const scoreOf = (id) => (catalog.variables[id] ? priorityScore(catalog.variables[id], pathOf(catalog.variables[id]), config) : 0);
  const max = config.premiereMax ?? 40;
  const fresh = premiereVariableIds(premieres, today(), { premiereMax: max, scoreOf });
  const waiting = waitingIds(await readJson('calendar.json', null));
  config.premiereIds = [...new Set([...fresh, ...waiting])].slice(0, max);
  stats.premieres = premieres.length;
  await writeLedger(catalog, state);
}

// Księga kalendarium (library/calendar.json): stan każdej zmiennej z publikacji, bez wcięć, deterministyczna.
async function writeLedger(catalog, state) {
  const prev = await readJson('calendar.json', { entries: [] });
  const scope = await loadScope();
  const ids = new Set([...premieres.flatMap((p) => p.library), ...prev.entries.flatMap((e) => e.library.map((v) => v.id))]);
  const facts = {};
  for (const id of ids) {
    const v = catalog.variables[id];
    const reason = !v || scopeReason(v, catalog.subjects?.[v.subjectId]?.path ?? [], scope) !== null ? 'poza-wytycznymi' : Number(v.level) < 6 ? 'brak-gmin' : null;
    const values = reason ? null : await readJson(`values/${id}.json`, null);
    facts[id] = { reason, doneOn: state.done[id] ?? null, ...(values ? factsFromValues(values, { unit: v.unit, name: variableName(v) }) : { lastYear: null, niche: false }) };
  }
  await writeJson('calendar.json', updateLedger(prev, { today: today(), premieres, factsOf: (id) => facts[id] }));
}

// Podgląd: ile i jakie zmienne weszłyby do tego przebiegu (bez zapytań do API).
async function dryRun() {
  const state = await readJson('state.json', emptyState());
  const catalog = await readJson('catalog.json', emptyCatalog());
  const config = JSON.parse(await readFile(configFile, 'utf8'));
  const wanted = filterInScope(Object.values(catalog.variables), catalog, await loadScope());
  console.log(`Wytyczne (config/library-scope.json): ${wanted.length} z ${Object.keys(catalog.variables).length} zmiennych katalogu.`);
  const queue = sortQueueByPriority(wanted, catalog, config, state, fetchLevels);
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
    const scope = await loadScope();
    const cal = await applyCalendar(config);
    if (cal && state.catalogDone) await applyPremieres(cal, catalog, config, state);
    await refreshValues(state, catalog, config, total, scope);
    if (!premiereOnly) await backfillLevels(state, catalog, scope);
    await downloadValues(state, catalog, config, scope);
  } catch (err) {
    if (!(err instanceof LimitStop)) {
      console.error(String(err.message).replace(clientId, '[KLUCZ]'));
      process.exitCode = /HTTP 429/.test(err.message) ? 0 : 1;
    }
  } finally {
    if (premieres.length || stats.premieres !== undefined) await writeLedger(catalog, state).catch((e) => console.error(`Księga kalendarium: ${e.message}`));
    state.runs++;
    state.lastRun = new Date().toISOString();
    state.runLog = [...(state.runLog ?? []), { at: state.lastRun, used: stats.requests }].slice(-20);
    await writeJson('state.json', state);
    const total = Object.keys(catalog.variables).length;
    const table = summarizeBySection(bySection, stats.queueLength ?? 0);
    console.log(table);
    if (process.env.LIBRARY_SUMMARY_FILE) await writeFile(process.env.LIBRARY_SUMMARY_FILE, `${table}\n`);
    console.log(`Zapytań: ${budget.used}/${budget.used + budget.left}. Katalog: ${state.catalogDone ? 'komplet' : `w toku (${state.pending.length} działów w kolejce)`}. Odświeżonych (nowy rok): ${stats.refreshed ?? 0}. Dopełnionych o brakujące poziomy: ${stats.backfilled ?? 0}. Kalendarium GUS: ${stats.calendarTitles ?? 0} publikacji, premier: ${stats.premieres ?? 0}. Pominięte puste (bez gmin): ${stats.skippedEmpty ?? 0}. Luki w gminach (zapisane bez gmin): ${stats.gmiGaps ?? 0}. Zmiennych: ${total}, w wytycznych: ${stats.inScope ?? '?'}, pobranych: ${Object.keys(state.done).length}, błędnych: ${Object.keys(state.failed).length}.`);
  }
}

export { crawlCatalog, downloadValues, main };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
