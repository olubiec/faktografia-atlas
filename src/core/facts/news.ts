// „Nowe dane GUS” (W26-F05, KONCEPT-ODKRYCIA §7): strona `/nowe-dane/<wskaźnik>-<rok>` po nowym roku wskaźnika.
// Robot (scripts/data/build-news.mjs) dopisuje pozycję do public/data/news.json w osobnym PR – strona powstaje
// dopiero, gdy właściciel go scali. Liczby wyłącznie z public/data/values; zdania ze stałych szablonów, bez AI.
// Pułapki (§2): małe gminy pomijamy progiem ludności, jednostki ze zmianą granic – detektorem z boundaries.ts.
import { boundaryChangeYears, impliedArea } from './boundaries';
import { medianOf } from './lists';
import type { FactUnit, IndicatorValues } from './types';
import { LEVELS, rankingPath } from '../seo/ranking-page';
import { plNumber, shortIndicatorName, showValue } from '../seo/sentences';
import type { UnitPaths } from '../seo/slug';
import { fitText, plural, showChange, topicPath, type TopicIndicator } from '../seo/topics';
import type { PageLink } from '../seo/unit-page';

export const NEWS_ROOT = '/nowe-dane';
export const NEWS_INDEX_NAME = 'Nowe dane GUS';
/** Pozycja public/data/news.json: wskaźnik i nowy rok (TERYT-y i liczby bierze generator z values). */
export interface NewsEntry {
  id: string;
  year: number;
}
export const newsSlug = (e: NewsEntry) => `${e.id}-${e.year}`;
export const newsPath = (e: NewsEntry) => `${NEWS_ROOT}/${newsSlug(e)}`;

export interface NewsContext {
  units: readonly FactUnit[];
  paths: UnitPaths;
  /** TERYT → nagłówek jednostki (rankingHeadings). */
  headings: ReadonlyMap<string, string>;
  indicators: readonly TopicIndicator[];
  values: Readonly<Record<string, IndicatorValues>>;
  /** config/lists.json: próg ludności gmin. */
  gminaMinPopulation: number;
  /** config/facts.json: relativeChangeUnits, news.boundaryJump (rok do roku), thresholds.recordMinYears. */
  relativeChangeUnits: readonly string[];
  boundaryJump: number;
  recordMinYears: number;
  /** Ile pozycji w każdej tabeli. */
  rows?: number;
}

export interface NewsRow {
  teryt: string;
  name: string;
  path: string;
  value: string;
  /** Wzrost/spadek rok do roku albo „najwyżej od 2013 r.” przy rekordzie. */
  change: string;
}

export interface NewsPage {
  entry: NewsEntry;
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string[];
  level: 'gmi' | 'pow';
  column: string;
  rises: NewsRow[];
  falls: NewsRow[];
  records: NewsRow[];
  compared: number;
  skippedBoundary: number;
  mapHref: string;
  crumbs: PageLink[];
  related: PageLink[];
  indexable: boolean;
  lastmod: string;
}

type Measured = { teryt: string; value: number; change: number; series: (number | null)[]; idx: number };

const lastNumber = (s: readonly (number | null)[] | undefined) => s?.filter((v): v is number => v != null).at(-1) ?? null;

/** Poziom strony: gminy, jeśli w nowym roku dane ma co najmniej połowa gmin; inaczej powiaty. */
function levelFor(data: IndicatorValues, units: readonly FactUnit[], idx: number): 'gmi' | 'pow' {
  const gmi = units.filter((u) => u.level === 'gmi');
  return gmi.length > 0 && gmi.filter((u) => data.values[u.teryt]?.[idx] != null).length >= gmi.length / 2 ? 'gmi' : 'pow';
}

/** Zmiany rok do roku w poziomie; pomija małe gminy i jednostki ze zmianą granic między latami. */
function measure(ctx: NewsContext, ind: TopicIndicator, data: IndicatorValues, idx: number, level: 'gmi' | 'pow') {
  const relative = ctx.relativeChangeUnits.includes(ind.unit);
  const pop = ctx.values.population;
  const den = ctx.values.density;
  const year = data.years[idx]!;
  let skippedBoundary = 0;
  const out: Measured[] = [];
  for (const u of ctx.units) {
    if (u.level !== level) continue;
    const series = data.values[u.teryt];
    const value = series?.[idx];
    const before = series?.[idx - 1];
    if (!series || value == null || before == null) continue;
    if (level === 'gmi' && (lastNumber(pop?.values[u.teryt]) ?? 0) < ctx.gminaMinPopulation) continue;
    const changes = pop && den ? boundaryChangeYears(impliedArea(pop.years, pop.values[u.teryt], den.years, den.values[u.teryt]), ctx.boundaryJump) : [];
    // Zmiana granic w nowym roku: porównanie z rokiem wcześniej nie ma sensu (np. Opole 2017).
    if (changes.includes(year)) {
      skippedBoundary++;
      continue;
    }
    if (relative && before <= 0) continue;
    out.push({ teryt: u.teryt, value, change: relative ? (value - before) / before : value - before, series, idx });
  }
  return { out, skippedBoundary, relative };
}

/** Rekord serii: nowa wartość wyższa (dir 1) albo niższa (dir −1) niż w każdym wcześniejszym roku (≥ recordMinYears lat). */
function recordOf(m: Measured, minYears: number): { dir: 1 | -1; since: number } | null {
  const prev = m.series.slice(0, m.idx).map((v, i) => [v, i] as const).filter((p): p is readonly [number, number] => p[0] != null);
  if (prev.length + 1 < minYears) return null;
  if (prev.every(([v]) => m.value > v)) return { dir: 1, since: prev[0]![1] };
  if (prev.every(([v]) => m.value < v)) return { dir: -1, since: prev[0]![1] };
  return null;
}

/** Model strony „Nowe dane GUS” dla wskaźnika i roku; null, gdy w values nie ma tego roku albo roku wcześniej. */
export function buildNewsPage(entry: NewsEntry, ctx: NewsContext): NewsPage | null {
  const ind = ctx.indicators.find((i) => i.id === entry.id);
  const data = ctx.values[entry.id];
  if (!ind || !data) return null;
  const idx = data.years.indexOf(entry.year);
  if (idx < 1 || data.years[idx - 1] !== entry.year - 1) return null;
  const level = levelFor(data, ctx.units, idx);
  const { out, skippedBoundary, relative } = measure(ctx, ind, data, idx, level);
  if (out.length === 0) return null;
  const rows = ctx.rows ?? 10;
  const row = (m: Measured, change: string): NewsRow => ({
    teryt: m.teryt,
    name: ctx.headings.get(m.teryt) ?? m.teryt,
    path: ctx.paths.pathByTeryt.get(m.teryt) ?? '',
    value: showValue(m.value, ind.unit),
    change,
  });
  const byChange = (dir: 1 | -1) =>
    out
      .filter((m) => dir * m.change > 0)
      .sort((a, b) => dir * (b.change - a.change) || a.teryt.localeCompare(b.teryt))
      .slice(0, rows)
      .map((m) => row(m, showChange(m.change, ind.unit, relative)));
  const rises = byChange(1);
  const falls = byChange(-1);
  const records = out
    .map((m) => ({ m, r: recordOf(m, ctx.recordMinYears) }))
    .filter((x): x is { m: Measured; r: NonNullable<ReturnType<typeof recordOf>> } => x.r !== null)
    .sort((a, b) => b.r.dir - a.r.dir || Math.abs(b.m.change) - Math.abs(a.m.change) || a.m.teryt.localeCompare(b.m.teryt))
    .slice(0, rows)
    .map(({ m, r }) => row(m, `${r.dir === 1 ? 'najwyżej' : 'najniżej'} od ${data.years[r.since]} r.`));

  const short = shortIndicatorName(ind.name, ind.unit);
  const { gen, column } = LEVELS[level];
  const prev = entry.year - 1;
  const median = medianOf(out.map((m) => m.change).sort((a, b) => a - b));
  const path = newsPath(entry);
  const h1 = `Nowe dane GUS: ${short} za ${entry.year} r.`;
  const lead = [
    `GUS opublikował dane „${short}” za ${entry.year} r. Porównujemy je z ${prev} r. dla ${plNumber(out.length)} ${gen}.`,
    ...(rises[0] ? [`Największy wzrost: ${rises[0].name} (${rises[0].change}).`] : [`W żadnej z porównanych ${gen} wartość nie wzrosła.`]),
    ...(falls[0] ? [`Największy spadek: ${falls[0].name} (${falls[0].change}).`] : [`W żadnej z porównanych ${gen} wartość nie spadła.`]),
    ...(median !== null ? [`Mediana zmiany: ${showChange(median, ind.unit, relative).replace(/\.$/, '')}.`] : []),
    ...(skippedBoundary > 0 ? [`Pominięte z powodu zmiany granic w ${entry.year} r.: ${plural(skippedBoundary, 'jednostka', 'jednostki', 'jednostek')} – dane przed i po zmianie nie są porównywalne.`] : []),
  ];
  const first = rises[0] ?? falls[0]!;
  let description = fitText(
    [
      `GUS opublikował dane „${short}” za ${entry.year} r.: największe wzrosty i spadki ${gen}. Na czele ${first.name} (${first.change}).`,
      `Nowe dane GUS „${short}” za ${entry.year} r.: największe wzrosty i spadki ${gen} względem ${prev} r.`,
      `Nowe dane GUS za ${entry.year} r.: największe wzrosty i spadki ${gen}.`,
    ],
    160,
  );
  if (description.length < 70) description = `${description} Źródło: GUS, Bank Danych Lokalnych.`;
  return {
    entry,
    path,
    title: fitText([`${h1} Wzrosty i spadki`, h1, `Nowe dane GUS za ${entry.year} r.: ${ind.id}`], 65),
    description,
    h1,
    lead,
    level,
    column,
    rises,
    falls,
    records,
    compared: out.length,
    skippedBoundary,
    mapHref: `/mapa?i=${encodeURIComponent(ind.id)}&y=${entry.year}&l=${level}`,
    crumbs: [
      { teryt: '', name: 'Faktografia', path: '/' },
      { teryt: '', name: NEWS_INDEX_NAME, path: NEWS_ROOT },
      { teryt: '', name: `${short} ${entry.year}`, path },
    ],
    related: [
      { teryt: '', name: `Pełny ranking: ${short} – ${LEVELS[level].short}`, path: rankingPath(ind, level) },
      { teryt: '', name: `Temat: ${ind.group}`, path: topicPath(ind.group) },
    ],
    indexable: rises.length + falls.length > 0,
    lastmod: (data as IndicatorValues & { fetchedAt?: string }).fetchedAt ?? new Date(0).toISOString(),
  };
}

/** Nowe lata: wskaźniki, których ostatni rok w nowych danych jest późniejszy niż w poprzednich (main). */
export function newYears(before: Readonly<Record<string, readonly number[] | undefined>>, after: Readonly<Record<string, readonly number[]>>): NewsEntry[] {
  const out: NewsEntry[] = [];
  for (const [id, years] of Object.entries(after)) {
    const last = years.at(-1);
    const old = before[id]?.at(-1);
    if (last != null && old != null && last > old) out.push({ id, year: last });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}
