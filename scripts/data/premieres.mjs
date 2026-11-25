// Premiery GUS: publikacja z kalendarium → wskaźniki główne i zmienne biblioteki, których dotyczy.
// Czyste funkcje (bez sieci): dopasowanie, priorytet, księga kalendarium (library/calendar.json).
// Wywołanie z wiersza poleceń (workflow „Fetch data”, przebieg ok. 10:40 UTC):
//   node scripts/data/premieres.mjs main   → id wskaźników głównych z dzisiejszych publikacji (po przecinku, puste = brak)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calendarHits, fetchHtml, loadCalendar, stemsFromTitles } from './gus-calendar.mjs';
import { probeAll } from './probe-new-year.mjs';
import { idsWithNewYear } from './library-plan.mjs';

/** Tyle różnych rdzeni musi pasować, żeby publikacja dotyczyła wskaźnika (jedno trafienie, np. „ludność”, łapie pół katalogu). */
export const MIN_HITS = 2;
/** Po tylu dniach bez nowego roku w BDL wpis kończy jako odrzucony. */
export const WAIT_DAYS = 14;
/** Wpisy księgi starsze niż tyle dni wypadają. */
export const KEEP_DAYS = 90;
/** Liczba gmin (≈2477): mianownik zasady „nie niszowe” (≥ 95% gmin). */
export const GMINA_COUNT = 2477;
/** Rdzenie zbyt ogólne, żeby cokolwiek znaczyły w opisie publikacji. */
const GENERIC = new Set(['infor', 'analit', 'przeb', 'proce', 'ostat', 'liczb', 'ogóln', 'wynik', 'polsk', 'wojew', 'regio', 'dane', 'podst', 'głów', 'struk', 'zakre', 'dotyc']);

const DAY = 86400_000;
const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

/** Rdzenie z tytułu i opisu publikacji, bez ogólników. */
export function publicationStems(pub) {
  return stemsFromTitles([pub.title, pub.desc ?? '']).filter((s) => !GENERIC.has(s));
}

/** Wskaźnik główny jako „zmienna” do liczenia trafień (nazwa + opis + grupa). */
const asVariable = (i) => ({ n1: i.name, n2: i.description, n3: i.group });

/**
 * Łączy publikację ze wskaźnikami głównymi i zmiennymi biblioteki (≥ MIN_HITS rdzeni).
 * variables: [{ variable, path }] (jak w katalogu biblioteki). Zwraca null, gdy nic nie pasuje.
 */
export function matchPublication(pub, { indicators = [], variables = [] }) {
  const stems = publicationStems(pub);
  const main = indicators.filter((i) => calendarHits(asVariable(i), [], stems) >= MIN_HITS).map((i) => i.id).sort();
  const library = variables.filter((x) => calendarHits(x.variable, x.path, stems) >= MIN_HITS).map((x) => Number(x.variable.id)).sort((a, b) => a - b);
  if (!main.length && !library.length) return null;
  return { date: pub.date, title: pub.title, href: pub.href, main, library };
}

/** Premiery z listy publikacji kalendarium (tylko te, które do czegoś pasują). */
export function findPremieres(items, ctx) {
  return items.map((p) => matchPublication(p, ctx)).filter(Boolean);
}

const isRecent = (date, today) => date === today || date === new Date(Date.parse(today) - DAY).toISOString().slice(0, 10);

/** Id zmiennych biblioteki z publikacji z dziś i wczoraj (najważniejsze pierwsze), najwyżej premiereMax. */
export function premiereVariableIds(premieres, today, { premiereMax = 40, scoreOf = () => 0 } = {}) {
  const ids = new Set(premieres.filter((p) => isRecent(p.date, today)).flatMap((p) => p.library));
  return [...ids].sort((a, b) => scoreOf(b) - scoreOf(a) || a - b).slice(0, premiereMax);
}

/** Wskaźniki główne z publikacji z dzisiaj (do sondy nowego roku w przebiegu premierowym). */
export function premiereMainIds(premieres, today) {
  return [...new Set(premieres.filter((p) => p.date === today).flatMap((p) => p.main))].sort();
}

/** Kolejka biblioteki: zmienne premier (w podanej kolejności) idą przed wszystkimi, w tym przed przypiętymi. */
export function prependPremieres(queue, ids) {
  const rank = new Map(ids.map((id, i) => [Number(id), i]));
  const first = queue.filter((v) => rank.has(Number(v.id))).sort((a, b) => rank.get(Number(a.id)) - rank.get(Number(b.id)));
  return [...first, ...queue.filter((v) => !rank.has(Number(v.id)))];
}

/** Sonda nowego roku tylko dla wskaźników głównych z premier; bez dopasowań zero zapytań (fetchJson nie jest wołany). */
export async function probePremieres({ indicators, ids, readYears, fetchJson }) {
  const wanted = indicators.filter((i) => ids.includes(i.id));
  if (!wanted.length) return [];
  return idsWithNewYear(await probeAll(wanted, readYears, fetchJson));
}

/** Zasada „nie niszowe” (W27-D01): ≥ 95% gmin w ostatnim roku, ostatni rok ≥ 2024, seria ≥ 4 lata, wskaźnik względny. */
export function nicheReason({ lastYear, seriesYears, gminaShare, relative }) {
  const ok = gminaShare >= 0.95 && lastYear >= 2024 && seriesYears >= 4 && relative;
  return ok ? null : 'niszowe';
}

const RELATIVE = /%|\bna\b|przeciętn|średni|odsetek|udział|wskaźnik|gęstość|osob|mieszkańc/iu;
export const isRelative = (unit, name) => RELATIVE.test(`${unit ?? ''} ${name ?? ''}`);

/** Z pliku wartości zmiennej: ostatni rok z danymi oraz to, czy zasada „nie niszowe” jest złamana. */
export function factsFromValues(values, { unit, name }) {
  const levels = ['l6', 'l5', 'l3'].map((k) => values?.[k]).filter((l) => l?.y?.length);
  const best = levels[0];
  if (!best) return { lastYear: null, niche: false };
  const lastYear = Math.max(...best.y.map(Number));
  const col = best.y.map(Number).indexOf(lastYear);
  const filled = Object.values(best.d ?? {}).filter((row) => row[col] !== null && row[col] !== undefined).length;
  const niche = nicheReason({ lastYear, seriesYears: best.y.length, gminaShare: values.l6 ? Math.min(1, filled / GMINA_COUNT) : 0, relative: isRelative(unit, name) }) !== null;
  return { lastYear, niche };
}

/**
 * Księga kalendarium: wpis na publikację z dopasowaniem; stan każdej zmiennej biblioteki:
 * planned → waiting → downloaded albo rejected (powód). Stan końcowy się nie zmienia.
 * factsOf(id) → { reason?: 'brak-gmin'|'poza-wytycznymi', lastYear, doneOn, niche }.
 * Wynik jest deterministyczny (wpisy i id posortowane), zapis bez wcięć.
 */
export function updateLedger(prev, { today, premieres, factsOf }) {
  const byKey = new Map((prev?.entries ?? []).map((e) => [`${e.date}|${e.href}`, e]));
  for (const p of premieres) {
    const e = byKey.get(`${p.date}|${p.href}`) ?? { date: p.date, title: p.title, href: p.href, main: [], library: [] };
    const known = new Map(e.library.map((v) => [v.id, v]));
    for (const id of p.library) if (!known.has(id)) known.set(id, { id, state: 'planned', base: factsOf(id).lastYear });
    byKey.set(`${p.date}|${p.href}`, { ...e, main: p.main, library: [...known.values()] });
  }
  const entries = [...byKey.values()]
    .filter((e) => dayDiff(e.date, today) <= KEEP_DAYS)
    .map((e) => ({ ...e, library: e.library.map((v) => step(v, e.date, today, factsOf(v.id))).sort((a, b) => a.id - b.id) }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.href.localeCompare(b.href));
  return { updated: today, entries };
}

function step(v, date, today, f) {
  if (v.state === 'downloaded' || v.state === 'rejected') return v;
  const { id, base } = v;
  if (f.reason) return { id, base, state: 'rejected', reason: f.reason };
  if (date > today) return { id, base, state: 'planned' };
  const fresh = f.lastYear != null && (base == null ? (f.doneOn ?? '') >= date : f.lastYear > base);
  if (fresh) return f.niche ? { id, base, state: 'rejected', reason: 'niszowe' } : { id, base, state: 'downloaded', on: f.doneOn ?? today };
  if (dayDiff(date, today) > WAIT_DAYS) return { id, base, state: 'rejected', reason: 'brak-nowego-roku-14-dni' };
  return { id, base, state: 'waiting' };
}

/** Id zmiennych, które księga każe dalej sprawdzać (stan waiting), z ostatnich 14 dni. */
export function waitingIds(ledger) {
  return [...new Set((ledger?.entries ?? []).flatMap((e) => e.library.filter((v) => v.state === 'waiting').map((v) => v.id)))].sort((a, b) => a - b);
}

async function mainCli() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const indicators = JSON.parse(await readFile(path.join(root, 'config/indicators.json'), 'utf8'));
  const cal = await loadCalendar(fetchHtml, { days: 1 }).catch(() => null);
  const today = new Date().toISOString().slice(0, 10);
  const ids = premiereMainIds(findPremieres(cal?.items ?? [], { indicators }), today);
  console.error(`Premiery dziś: ${cal?.items.length ?? 0} publikacji, wskaźniki główne: ${ids.join(',') || 'brak'}`);
  if (!ids.length) return console.log('');
  const clientId = process.env.BDL_CLIENT_ID;
  if (!clientId) return void (console.error('Brak BDL_CLIENT_ID.'), process.exit(1));
  const { fetchWithRetry } = await import('./fetch-values.mjs');
  const readYears = async (id) => {
    try {
      return JSON.parse(await readFile(path.join(root, `public/data/values/${id}.json`), 'utf8')).years;
    } catch {
      return null;
    }
  };
  console.log((await probePremieres({ indicators, ids, readYears, fetchJson: (url) => fetchWithRetry(url, clientId) })).join(','));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) && process.argv[2] === 'main') mainCli();
