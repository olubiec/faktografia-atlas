// Model stron rankingów wskaźników (S10, docs/SEO.md §2 pkt 3, D7, D8). Czyste funkcje, bez Reacta.
// Kolejność i miejsca liczy rankUnits (src/core/ranking) – ta sama logika co ranking na mapie.
// Zdania ze stałych szablonów; każda liczba pochodzi z public/data/values/<id>.json.
import type { IndicatorValues } from '../profile/profile';
import { rankUnits, type RankedUnit } from '../ranking/ranking';
import type { Unit } from '../units/types';
import { placeIn, plNumber, shortIndicatorName, showValue } from './sentences';
import { indicatorSlug, slugify, type SlugUnit, type UnitPaths } from './slug';
import { titleIndicatorName } from './title-names';
import type { PageIndicator, PageLink } from './unit-page';

export type RankingLevel = Unit['level'];
export const RANKING_ROOT = '/ranking';
/** Ranking gmin w Polsce: tyle pozycji z góry i z dołu tabeli (warunek S10). */
export const NATIONAL_GMINA_SHOWN = 100;
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;

export const LEVELS: Record<RankingLevel, { slug: string; gen: string; label: string; column: string; short: string }> = {
  woj: { slug: 'wojewodztwa', gen: 'województw', label: 'Ranking województw', column: 'Województwo', short: 'województwa' },
  pow: { slug: 'powiaty', gen: 'powiatów', label: 'Ranking powiatów', column: 'Powiat lub miasto', short: 'powiaty' },
  gmi: { slug: 'gminy', gen: 'gmin', label: 'Ranking gmin', column: 'Gmina', short: 'gminy' },
};

export interface RankingSpec {
  indicatorId: string;
  level: RankingLevel;
  /** TERYT województwa (ranking gmin w województwie) albo null (cała Polska). */
  voivodeship: string | null;
  path: string;
}

/** Wpis z public/data/explanations.json (tylko pola potrzebne stronie). */
export interface RankingExplanation {
  indicatorId: string;
  short?: string | null;
  howToRead?: string | null;
  definitionUrl?: string | null;
}

export interface RankingContext {
  units: readonly SlugUnit[];
  paths: UnitPaths;
  /** TERYT → nagłówek jednostki (unitHeading), liczony raz: `rankingHeadings`. */
  headings: ReadonlyMap<string, string>;
  indicators: readonly PageIndicator[];
  explanations: readonly RankingExplanation[];
  /** D7: rankingi gmin trafiają do Google razem ze stronami gmin. */
  indexGminy: boolean;
}

export interface RankingRow {
  rank: number;
  name: string;
  path: string;
  value: string;
}

export interface RankingPage {
  spec: RankingSpec;
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string[];
  /** Krótko (short) i „jak czytać” z explanations.json oraz link do definicji GUS. */
  explanation: { short: string | null; howToRead: string | null; definitionUrl: string | null };
  year: number | null;
  total: number;
  /** Górna część tabeli; dla rankingu gmin w Polsce 100 pierwszych, poza nim cała tabela. */
  top: RankingRow[];
  /** 100 ostatnich (tylko ranking gmin w Polsce z więcej niż 200 gminami), inaczej pusta. */
  bottom: RankingRow[];
  indicatorName: string;
  unit: string;
  scopeName: string;
  mapHref: string;
  crumbs: PageLink[];
  related: { id: string; title: string; links: PageLink[] }[];
  indexable: boolean;
  lastmod: string;
}

const voivSlug = (v: Pick<Unit, 'name'>) => slugify(v.name);

/** `/ranking/<wskaźnik>/<poziom>` albo `/ranking/<wskaźnik>/gminy/<województwo>`. */
export function rankingPath(indicator: Pick<PageIndicator, 'name'>, level: RankingLevel, voivodeship?: Pick<Unit, 'name'>) {
  const base = `${RANKING_ROOT}/${indicatorSlug(indicator.name)}/${LEVELS[level].slug}`;
  return voivodeship ? `${base}/${voivSlug(voivodeship)}` : base;
}

/** Najnowszy rok, w którym choć jedna jednostka z zakresu ma wartość. */
function latestYear(values: IndicatorValues, scope: readonly SlugUnit[]): number | null {
  for (let i = values.years.length - 1; i >= 0; i--) {
    if (scope.some((u) => typeof values.values[u.teryt]?.[i] === 'number')) return values.years[i] ?? null;
  }
  return null;
}

export function median(sorted: readonly number[]): number | null {
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const pick = (options: string[], max: number) => options.find((o) => o.length <= max) ?? options[options.length - 1]!;

/** Buduje model jednej strony rankingu. */
export function buildRankingPage(spec: RankingSpec, values: IndicatorValues, ctx: RankingContext): RankingPage {
  const ind = ctx.indicators.find((i) => i.id === spec.indicatorId);
  if (!ind) throw new Error(`Nieznany wskaźnik ${spec.indicatorId}`);
  const short = shortIndicatorName(ind.name, ind.unit);
  const { gen } = LEVELS[spec.level];
  const voiv = spec.voivodeship ? ctx.units.find((u) => u.teryt === spec.voivodeship) : undefined;
  const where = voiv ? placeIn('województwo', voiv.name) : 'w Polsce';
  const scope = ctx.units.filter((u) => u.level === spec.level && (!voiv || u.teryt.startsWith(voiv.teryt)));
  const year = latestYear(values, scope);
  const ranked: RankedUnit[] =
    year === null
      ? []
      : [...rankUnits({ values, units: scope as unknown as Unit[] /* rankUnits czyta tylko teryt, name, level, parent */, level: spec.level, year, parentTeryt: voiv?.teryt, higherIsBetter: ind.higherIsBetter })];
  const row = (r: RankedUnit): RankingRow => ({
    rank: r.rank,
    name: ctx.headings.get(r.teryt) ?? r.name,
    path: ctx.paths.pathByTeryt.get(r.teryt) ?? '',
    value: showValue(r.value, ind.unit),
  });
  const split = !voiv && spec.level === 'gmi' && ranked.length > 2 * NATIONAL_GMINA_SHOWN;
  const top = (split ? ranked.slice(0, NATIONAL_GMINA_SHOWN) : ranked).map(row);
  const bottom = split ? ranked.slice(-NATIONAL_GMINA_SHOWN).map(row) : [];
  const first = top[0];
  const last = bottom.at(-1) ?? top.at(-1);
  const asc = ind.higherIsBetter === false;
  const y = year === null ? '' : ` ${year}`;

  const lead: string[] = [];
  if (first && last && year !== null) {
    const med = median(ranked.map((r) => r.value).sort((a, b) => a - b));
    lead.push(
      `Liczba ${gen} ${where} z danymi GUS za ${year} r.: ${plNumber(ranked.length)}.`,
      `Listę otwiera ${first.name} z ${asc ? 'najniższą' : 'najwyższą'} wartością (${first.value}), a zamyka ${last.name} z ${asc ? 'najwyższą' : 'najniższą'} (${last.value}).`,
      ...(med === null ? [] : [`Mediana wynosi ${showValue(med, ind.unit)}.`]),
      asc
        ? 'Przy tym wskaźniku niższa wartość jest korzystniejsza, dlatego 1. miejsce zajmuje najniższa wartość.'
        : ind.higherIsBetter === null
          ? 'To wskaźnik opisowy: wyższe miejsce nie oznacza, że jest lepiej.'
          : 'Przy tym wskaźniku wyższa wartość jest korzystniejsza.',
    );
  } else {
    lead.push(`GUS nie podaje wskaźnika „${short}” dla ${gen} ${where}. Zobacz ranking powiatów.`);
  }

  const h1 = `${short} – ranking ${gen} ${where}${y}`;
  // Krótka nazwa wskaźnika tylko wtedy, gdy pełna nie mieści się w 65 znakach (H1 zostaje pełny).
  const compact = titleIndicatorName(ind);
  const title = pick(
    voiv
      ? [h1, `${short} – ranking gmin, woj. ${voiv.name}${y}`, `${short} – gminy, woj. ${voiv.name}`, `${compact} – ranking gmin, woj. ${voiv.name}${y}`, `${compact} – gminy, woj. ${voiv.name}`]
      : [h1, `${short} – ranking ${gen}${y}`, `${short} – ranking ${gen}`, `${compact} – ranking ${gen} w Polsce${y}`, `${compact} – ranking ${gen}${y}`],
    TITLE_MAX,
  );
  const descriptions =
    first && last
      ? [
          `Ranking ${plNumber(ranked.length)} ${gen} ${where} według wskaźnika „${short}” (GUS,${y}): 1. ${first.name} – ${first.value}, ostatnie ${last.name} – ${last.value}.`,
          `${short}: ranking ${plNumber(ranked.length)} ${gen} ${where} według danych GUS za${y} r. Miejsca, wartości i mediana.`,
        ]
      : [`${short}: ranking ${gen} ${where}. GUS nie podaje tego wskaźnika dla ${gen} – zobacz ranking powiatów.`];
  let description = pick(descriptions, DESC_MAX).slice(0, DESC_MAX);
  if (description.length < DESC_MIN) description = `${description} Źródło: GUS, Bank Danych Lokalnych.`;

  const ex = ctx.explanations.find((e) => e.indicatorId === ind.id);
  const national = (level: RankingLevel): PageLink => ({ teryt: '', name: LEVELS[level].label, path: rankingPath(ind, level) });
  const voivodeships = ctx.units.filter((u) => u.level === 'woj');
  const voivLinks = voivodeships
    .filter((v) => v.teryt !== voiv?.teryt)
    .map((v) => ({ teryt: v.teryt, name: `Województwo ${v.name}`, path: rankingPath(ind, 'gmi', v) }));
  const related = voiv
    ? [
        { id: 'ten-sam', title: 'Ten sam wskaźnik', links: [national('gmi'), national('pow'), national('woj')] },
        { id: 'inne', title: 'Ranking gmin w innych województwach', links: voivLinks },
      ]
    : [
        { id: 'ten-sam', title: 'Ten sam wskaźnik', links: (['woj', 'pow', 'gmi'] as const).filter((l) => l !== spec.level).map(national) },
        ...(spec.level === 'gmi' ? [{ id: 'wojewodztwa', title: 'Ranking gmin w województwach', links: voivLinks }] : []),
      ];

  return {
    spec,
    path: spec.path,
    title,
    description,
    h1,
    lead,
    explanation: { short: ex?.short ?? null, howToRead: ex?.howToRead ?? null, definitionUrl: ex?.definitionUrl ?? null },
    year,
    total: ranked.length,
    top,
    bottom,
    indicatorName: short,
    unit: ind.unit,
    scopeName: voiv ? `województwo ${voiv.name}` : 'Polska',
    mapHref: `/mapa?i=${encodeURIComponent(ind.id)}&l=${spec.level}`,
    crumbs: [
      { teryt: '', name: 'Faktografia', path: '/' },
      { teryt: '', name: 'Rankingi', path: RANKING_ROOT },
      ...(voiv ? [{ teryt: '', name: `${short} – ranking gmin w Polsce`, path: rankingPath(ind, 'gmi') }] : []),
      { teryt: '', name: h1, path: spec.path },
    ],
    related,
    indexable: ranked.length > 0 && (spec.level !== 'gmi' || ctx.indexGminy),
    lastmod: values.fetchedAt,
  };
}
