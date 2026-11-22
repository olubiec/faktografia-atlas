import { formatValue } from '../format/number';
import { indicatorSlug, slugify, type SlugUnit, type UnitPaths } from './slug';
import { unitLinkLabel } from './unit-page-text';

export type RankingLevel = 'woj' | 'pow' | 'gmi';
export interface RankingIndicator {
  id: string;
  name: string;
  unit: string;
  higherIsBetter: boolean | null;
  minLevel: RankingLevel;
}
export interface RankingExplanation { short: string; howToRead: string; definitionUrl: string }
export interface RankingRow { rank: number; label: string; path: string; value: string }
export interface RankingPage {
  path: string;
  title: string;
  description: string;
  h1: string;
  indicatorId: string;
  level: RankingLevel;
  year: number;
  intro: string;
  explanation: RankingExplanation | null;
  rows: RankingRow[];
  /** Ile jednostek ma wartość (tabela krajowa gmin pokazuje tylko skrajne 100 + 100). */
  total: number;
  truncated: boolean;
  mapHref: string;
  lastmod: string;
}

const SCOPE: Record<RankingLevel, { genitive: string; segment: string }> = {
  woj: { genitive: 'województw', segment: 'wojewodztwa' },
  pow: { genitive: 'powiatów', segment: 'powiaty' },
  gmi: { genitive: 'gmin', segment: 'gminy' },
};
const EDGE = 100;
const LEVELS: RankingLevel[] = ['woj', 'pow', 'gmi'];
const ORDER: Record<RankingLevel, number> = { woj: 0, pow: 1, gmi: 2 };

/** Adres rankingu: /ranking/<wskaźnik>/<poziom> albo /ranking/<wskaźnik>/gminy/<województwo>. */
export function rankingPath(indicatorName: string, level: RankingLevel, wojName?: string): string {
  const base = `/ranking/${indicatorSlug(indicatorName)}/${SCOPE[level].segment}`;
  return wojName ? `${base}/${slugify(wojName)}` : base;
}

/** Poziomy, dla których wskaźnik ma wartości: od województwa do poziomu `minLevel` (najniższego z danymi). */
export function rankingLevels(indicator: RankingIndicator): RankingLevel[] {
  return LEVELS.filter((l) => ORDER[l] <= ORDER[indicator.minLevel]);
}

const median = (sorted: number[]) => {
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m]! : (sorted[m - 1]! + sorted[m]!) / 2;
};

export interface RankingInput {
  indicator: RankingIndicator;
  year: number;
  level: RankingLevel;
  /** Województwo, gdy ranking dotyczy gmin jednego województwa. */
  woj?: SlugUnit;
  units: readonly SlugUnit[];
  paths: UnitPaths;
  valueOf: (teryt: string) => number | null;
  explanation?: RankingExplanation | null;
  lastmod: string;
}

/** Model strony rankingu (czysta funkcja): tabela posortowana od najlepszego (zgodnie z kierunkiem wskaźnika), stałe zdanie wstępne. */
export function buildRankingPage(input: RankingInput): RankingPage | null {
  const { indicator, year, level, woj, paths } = input;
  const scope = SCOPE[level];
  const items = input.units
    .filter((u) => u.level === level && (!woj || u.teryt.startsWith(woj.teryt)))
    .map((u) => ({ u, v: input.valueOf(u.teryt) }))
    .filter((x): x is { u: SlugUnit; v: number } => typeof x.v === 'number' && Number.isFinite(x.v));
  if (items.length < 2) return null;
  const lowerBetter = indicator.higherIsBetter === false;
  items.sort((a, b) => (lowerBetter ? a.v - b.v : b.v - a.v) || a.u.name.localeCompare(b.u.name, 'pl'));

  let last = Number.NaN;
  let lastRank = 0;
  const ranked = items.map((x, i) => {
    if (x.v !== last) {
      last = x.v;
      lastRank = i + 1;
    }
    return { ...x, rank: lastRank };
  });
  const truncated = level === 'gmi' && !woj && ranked.length > EDGE * 2;
  const shown = truncated ? [...ranked.slice(0, EDGE), ...ranked.slice(-EDGE)] : ranked;
  const fmt = (v: number) => formatValue(v, indicator.unit);
  const label = (u: SlugUnit) => unitLinkLabel(u, paths);
  const hi = lowerBetter ? ranked[ranked.length - 1]! : ranked[0]!;
  const lo = lowerBetter ? ranked[0]! : ranked[ranked.length - 1]!;
  const sortedValues = ranked.map((x) => x.v).sort((a, b) => a - b);
  const where = woj ? `${scope.genitive} – województwo ${woj.name}` : `${scope.genitive} w Polsce`;
  const intro =
    `Najwyższą wartość wskaźnika „${indicator.name}” w ${year} roku ma ${label(hi.u)} (${fmt(hi.v)}), ` +
    `najniższą ${label(lo.u)} (${fmt(lo.v)}). Mediana dla ${ranked.length} ${scope.genitive}: ${fmt(median(sortedValues))}.`;
  const name = indicator.name.replace(/\s*\([^)]*\)\s*$/, '');
  const title = woj ? `${name} – gminy woj. ${woj.name} (${year})` : `${name} – ranking ${scope.genitive} w Polsce (${year})`;
  const first = ranked[0]!;
  const final = ranked[ranked.length - 1]!;
  const long = `Ranking ${where}: ${name.toLowerCase()}, ${year}. Najwyżej ${label(first.u)} (${fmt(first.v)}), najniżej ${label(final.u)} (${fmt(final.v)}). Dane GUS.`;
  const short = `Ranking ${where}: ${name.toLowerCase()}, ${year}. Najwyżej ${label(first.u)} (${fmt(first.v)}). Dane GUS.`;
  return {
    path: rankingPath(indicator.name, level, woj?.name),
    title,
    description: long.length <= 160 ? long : short,
    h1: `${name}: ranking ${where}, ${year}`,
    indicatorId: indicator.id,
    level,
    year,
    intro,
    explanation: input.explanation ?? null,
    rows: shown.map((x) => ({ rank: x.rank, label: label(x.u), path: paths.byTeryt.get(x.u.teryt)!, value: fmt(x.v) })),
    total: ranked.length,
    truncated,
    mapHref: `/mapa?i=${indicator.id}&l=${level}`,
    lastmod: input.lastmod,
  };
}
