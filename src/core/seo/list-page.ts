// Model strony zestawienia `/zestawienie/<slug>` (W26-F04). Wstęp ze stałych zdań, liczby z public/data/values.
import type { RankingExplanation } from './ranking-page';
import { buildList, type ListDef, type ListInput, type ListResult, type ListsConfig } from '../facts/lists';
import type { IndicatorValues } from '../profile/profile';
import type { FactUnit } from '../facts/types';
import { LEVELS, rankingPath } from './ranking-page';
import { changeSince, plNumber, shortIndicatorName, showValue } from './sentences';
import type { UnitPaths } from './slug';
import { DISCOVER_INDEX, DISCOVER_INDEX_NAME, fitText, listPath, showChange, topicPath, type TopicIndicator } from './topics';
import type { PageLink } from './unit-page';

const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;

/** Dane wspólne dla wszystkich stron tematów i zestawień. */
export interface DiscoverContext {
  units: readonly FactUnit[];
  paths: UnitPaths;
  /** TERYT → nagłówek jednostki (rankingHeadings). */
  headings: ReadonlyMap<string, string>;
  indicators: readonly TopicIndicator[];
  explanations: readonly RankingExplanation[];
  values: Readonly<Record<string, IndicatorValues>>;
  lists: ListsConfig;
  /** config/facts.json: relativeChangeUnits i thresholds.boundaryJump. */
  relativeChangeUnits: readonly string[];
  boundaryJump: number;
}

export interface ListRow {
  rank: number;
  name: string;
  path: string;
  /** Wartość w roku zestawienia. */
  value: string;
  /** Zmiana w oknie (tylko zestawienie zmian). */
  change: string | null;
}

export interface ListPage {
  def: ListDef;
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string[];
  year: number | null;
  fromYear: number | null;
  /** Nagłówek kolumny nazw: „Gmina” albo „Powiat lub miasto”. */
  column: string;
  rows: ListRow[];
  mapHref: string;
  crumbs: PageLink[];
  related: PageLink[];
  indexable: boolean;
  lastmod: string;
  /** Pełny wynik (do testów i raportu). */
  result: ListResult;
}

export function listInput(ctx: DiscoverContext, ind: TopicIndicator): ListInput {
  return { values: ctx.values, units: ctx.units, unit: ind.unit, relativeChangeUnits: ctx.relativeChangeUnits, boundaryJump: ctx.boundaryJump };
}

/** Zdania wstępu: ile jednostek, kto na czele, mediana, co pominięto i dlaczego. */
function leadOf(r: ListResult, rows: ListRow[], ind: TopicIndicator, ctx: DiscoverContext, relative: boolean): string[] {
  const { gen } = LEVELS[r.def.level];
  const short = shortIndicatorName(ind.name, ind.unit);
  const first = rows[0];
  const e0 = r.entries[0];
  if (!first || !e0 || r.year === null) return [`GUS nie podaje wskaźnika „${short}” dla ${gen} w ostatnich latach.`];
  const min = r.def.level === 'gmi' ? ` mających co najmniej ${plNumber(ctx.lists.gminaMinPopulation)} mieszkańców` : '';
  const out: string[] = [];
  if (r.fromYear !== null && e0.fromValue !== null) {
    out.push(
      `Zestawienie porównuje wskaźnik „${short}” w ${r.fromYear} i ${r.year} r. dla ${plNumber(r.compared)} ${gen}${min}.`,
      `Na czele jest ${first.name}: ${changeSince(e0.value, { value: e0.fromValue, year: r.fromYear }, ind.unit) ?? first.change} (${first.value} w ${r.year} r.).`,
    );
    if (r.median !== null) out.push(`Mediana zmiany wszystkich porównanych ${gen}: ${showChange(r.median, ind.unit, relative)}.`);
    if (r.skippedBoundary > 0) {
      out.push(`Liczba ${gen} pominiętych z powodu zmiany granic w tym okresie: ${plNumber(r.skippedBoundary)} – ich dane nie są porównywalne.`);
    }
  } else {
    out.push(
      `Zestawienie obejmuje ${plNumber(r.compared)} ${gen}${min} z danymi GUS za ${r.year} r.`,
      `Pierwsze miejsce zajmuje ${first.name} (${first.value}).`,
    );
    if (r.median !== null) out.push(`Mediana wszystkich porównanych ${gen}: ${showValue(r.median, ind.unit)}.`);
  }
  if (r.skippedSmall > 0) {
    out.push(`Liczba gmin pominiętych, bo mają mniej niż ${plNumber(ctx.lists.gminaMinPopulation)} mieszkańców: ${plNumber(r.skippedSmall)} – przy małych liczbach jeden rok mocno zmienia wynik.`);
  }
  return out;
}

/** Buduje model strony jednego zestawienia. */
export function buildListPage(def: ListDef, ctx: DiscoverContext): ListPage {
  const ind = ctx.indicators.find((i) => i.id === def.indicatorId);
  if (!ind) throw new Error(`config/lists.json: nieznany wskaźnik ${def.indicatorId} (${def.slug})`);
  const data = ctx.values[def.indicatorId];
  const relative = ctx.relativeChangeUnits.includes(ind.unit);
  const result = buildList(def, ctx.lists, listInput(ctx, ind));
  const rows: ListRow[] = result.entries.map((e) => ({
    rank: e.rank,
    name: ctx.headings.get(e.teryt) ?? e.teryt,
    path: ctx.paths.pathByTeryt.get(e.teryt) ?? '',
    value: showValue(e.value, ind.unit),
    change: e.change === null ? null : showChange(e.change, ind.unit, relative),
  }));
  const path = listPath(def.slug);
  const y = result.year === null ? '' : ` ${result.year}`;
  const title = fitText([`${def.title}${y}`, def.title], TITLE_MAX);
  const [r1, r2] = rows;
  const shown = (r: ListRow) => `${r.name} – ${r.change ?? r.value}`;
  const period = result.fromYear !== null ? `${result.fromYear}–${result.year}` : `${result.year}`;
  let description = fitText(
    r1
      ? [
          ...(r2 ? [`${def.h1} (GUS, ${period}): 1. ${shown(r1)}, 2. ${shown(r2)}. Tabela ${rows.length} pozycji.`] : []),
          `${def.h1} (GUS, ${period}): 1. ${shown(r1)}. Tabela ${rows.length} pozycji.`,
          `${def.h1}: ${rows.length} pozycji według danych GUS (${period}).`,
        ]
      : [`${def.h1}: GUS nie podaje danych dla tego zestawienia.`],
    DESC_MAX,
  ).slice(0, DESC_MAX);
  if (description.length < DESC_MIN) description = `${description} Źródło: GUS, Bank Danych Lokalnych.`;

  const topic = { teryt: '', name: ind.group, path: topicPath(ind.group) };
  const siblings = ctx.lists.lists
    .filter((l) => l.slug !== def.slug && ctx.indicators.find((i) => i.id === l.indicatorId)?.group === ind.group)
    .map((l) => ({ teryt: '', name: l.h1, path: listPath(l.slug) }));
  return {
    def,
    path,
    title,
    description,
    h1: def.h1,
    lead: leadOf(result, rows, ind, ctx, relative),
    year: result.year,
    fromYear: result.fromYear,
    column: LEVELS[def.level].column,
    rows,
    mapHref: `/mapa?i=${encodeURIComponent(ind.id)}&l=${def.level}`,
    crumbs: [
      { teryt: '', name: 'Faktografia', path: '/' },
      { teryt: '', name: DISCOVER_INDEX_NAME, path: DISCOVER_INDEX },
      topic,
      { teryt: '', name: def.h1, path },
    ],
    related: [
      { teryt: '', name: `Pełny ranking: ${shortIndicatorName(ind.name, ind.unit)} – ${LEVELS[def.level].short}`, path: rankingPath(ind, def.level) },
      { teryt: '', name: `Temat: ${ind.group}`, path: topic.path },
      ...siblings,
    ],
    indexable: rows.length > 0,
    lastmod: data?.fetchedAt ?? new Date(0).toISOString(),
    result,
  };
}
