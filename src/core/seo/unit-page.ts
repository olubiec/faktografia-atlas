// Model strony miejsca (docs/SEO.md §2, D3, D8): tytuł, opis, H1, zdania, tabela, linki, decyzja o indeksie.
// Czysta funkcja na danych z public/data/profiles/<WW>.json; zero tekstu z AI i liczb spoza danych.
import type { ProfileShard, ProfileShardItem } from '../data/load-profile';
import { formatValue } from '../format/number';
import type { Indicator } from '../profile/profile';
import { isCityCounty } from '../units/label';
import type { UnitPaths, SlugUnit } from './slug';
import {
  changeSince,
  extremeSentence,
  pageDescription,
  pageTitle,
  showValue,
  plNumber,
  populationRankSentence,
  populationSentence,
  shortIndicatorName,
  unitHeading,
  unitKind,
  type IndicatorFact,
  type UnitKind,
} from './sentences';

export interface PageLink {
  teryt: string;
  name: string;
  path: string;
}

/** Wskaźnik z config/indicators.json (tylko pola potrzebne stronie). */
export type PageIndicator = Pick<Indicator, 'id' | 'name' | 'unit' | 'higherIsBetter'>;
/** Plik profilu województwa (kształt z scripts/data/build-profiles.mjs). */
export type PageProfile = Pick<ProfileShard, 'generatedAt' | 'years' | 'units'>;
type PageProfileItem = ProfileShardItem;

export interface UnitPageContext {
  units: readonly SlugUnit[];
  paths: UnitPaths;
  indicators: readonly PageIndicator[];
}

export interface PageRow {
  indicatorId: string;
  name: string;
  value: string;
  year: number;
  rankVoivodeship: string | null;
  rankNational: string | null;
  change5: string | null;
  change10: string | null;
  /** TERYT jednostki nadrzędnej, gdy GUS podaje wskaźnik tylko dla niej (np. powiatu). */
  fromParent?: string;
}

export interface UnitPage {
  teryt: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  kind: UnitKind;
  lead: string[];
  rows: PageRow[];
  links: { parents: PageLink[]; children: PageLink[]; neighbours: PageLink[] };
  indexable: boolean;
  lastmod: string;
}

const MIN_FRESH_INDICATORS = 10;

const latestYear = (profile: PageProfile, item: PageProfileItem) => {
  const years = profile.years?.[item.indicatorId];
  return years?.length ? years[years.length - 1] : item.year;
};

/** Wartość z serii sprzed `back` lat (gdy jest). */
function valueBefore(profile: PageProfile, item: PageProfileItem, back: number) {
  const years = profile.years?.[item.indicatorId];
  if (!years || item.year === null) return null;
  const idx = years.indexOf(item.year - back);
  const value = idx >= 0 ? item.series[idx] : null;
  return value === null || value === undefined ? null : { value, year: item.year - back };
}

function changeText(profile: PageProfile, item: PageProfileItem, unit: string, back: number): string | null {
  const before = valueBefore(profile, item, back);
  return before && item.value !== null ? changeSince(item.value, before, unit) : null;
}

function buildRows(profile: PageProfile, items: PageProfileItem[], ctx: UnitPageContext): PageRow[] {
  const byId = new Map(items.map((i) => [i.indicatorId, i]));
  const rows: PageRow[] = [];
  for (const ind of ctx.indicators) {
    const item = byId.get(ind.id);
    if (!item || item.value === null || item.year === null) continue;
    rows.push({
      indicatorId: ind.id,
      name: shortIndicatorName(ind.name, ind.unit),
      value: showValue(item.value, ind.unit),
      year: item.year,
      rankVoivodeship: item.rankVoivodeship && item.totalVoivodeship ? `${item.rankVoivodeship}. z ${plNumber(item.totalVoivodeship)} w województwie` : null,
      rankNational: item.rankNational && item.totalNational ? `${item.rankNational}. z ${plNumber(item.totalNational)} w Polsce` : null,
      change5: changeText(profile, item, ind.unit, 5),
      change10: changeText(profile, item, ind.unit, 10),
      ...(item.fromParent ? { fromParent: item.fromParent } : {}),
    });
  }
  return rows;
}

/** Wskaźnik z najwyższym / najniższym miejscem w kraju (bez neutralnych i danych jednostki nadrzędnej). */
function extremes(items: PageProfileItem[], ctx: UnitPageContext) {
  const facts: (IndicatorFact & { score: number })[] = [];
  for (const ind of ctx.indicators) {
    const it = items.find((i) => i.indicatorId === ind.id);
    if (!it || ind.higherIsBetter === null || it.fromParent || it.value === null || it.year === null) continue;
    if (!it.rankNational || !it.totalNational) continue;
    const [name, value] = [shortIndicatorName(ind.name, ind.unit), showValue(it.value, ind.unit)];
    facts.push({ name, value, year: it.year, rank: it.rankNational, total: it.totalNational, score: it.rankNational / it.totalNational });
  }
  const sorted = [...facts].sort((a, b) => a.score - b.score);
  return { best: sorted[0] ?? null, worst: sorted.length > 1 ? sorted[sorted.length - 1] : null };
}

const LINKS_NEIGHBOURS = 6;

/** Linki: nadrzędne, podrzędne i 6 sąsiadów w rankingu ludności w województwie. */
function pageLinks(unit: SlugUnit, profile: PageProfile, ctx: UnitPageContext): UnitPage['links'] {
  const link = (u: SlugUnit): PageLink => ({ teryt: u.teryt, name: unitHeading(u, ctx.units), path: ctx.paths.pathByTeryt.get(u.teryt) ?? '' });
  const byTeryt = new Map(ctx.units.map((u) => [u.teryt, u]));
  const parentTeryts = unit.level === 'gmi' ? [unit.teryt.slice(0, 4), unit.teryt.slice(0, 2)] : unit.level === 'pow' ? [unit.teryt.slice(0, 2)] : [];
  const parents = parentTeryts.flatMap((t) => (byTeryt.has(t) ? [link(byTeryt.get(t)!)] : []));

  const city = isCityCounty(unit.teryt);
  const children =
    unit.level === 'woj'
      ? ctx.units.filter((u) => u.level === 'pow' && u.parent === unit.teryt)
      : unit.level === 'pow' && !city
        ? ctx.units.filter((u) => u.level === 'gmi' && u.parent === unit.teryt)
        : [];

  // Sąsiedzi: ten sam rodzaj (gminy bez miast na prawach powiatu; powiaty razem z miastami) w tym samym pliku profilu.
  const sameClass = (u: SlugUnit) =>
    u.level === unit.level && u.teryt !== unit.teryt && (u.level !== 'gmi' || !isCityCounty(u.teryt));
  const population = (t: string) =>
    profile.units[t]?.find((i) => i.indicatorId === 'population')?.value ?? null;
  const ranked = Object.keys(profile.units)
    .filter((t) => t === unit.teryt || (byTeryt.has(t) && sameClass(byTeryt.get(t)!)))
    .filter((t) => population(t) !== null)
    .sort((a, b) => population(b)! - population(a)! || a.localeCompare(b));
  const at = ranked.indexOf(unit.teryt);
  let neighbours: string[] = [];
  if (unit.level !== 'woj' && at >= 0) {
    const others = ranked.filter((t) => t !== unit.teryt);
    const start = Math.max(0, Math.min(at - LINKS_NEIGHBOURS / 2, others.length - LINKS_NEIGHBOURS));
    neighbours = others.slice(start, start + LINKS_NEIGHBOURS);
  }

  return {
    parents,
    children: children.map(link),
    neighbours: neighbours.flatMap((t) => (byTeryt.has(t) ? [link(byTeryt.get(t)!)] : [])),
  };
}

/** Buduje model strony jednostki. Gmina miasta na prawach powiatu daje ten sam model co powiat. */
export function buildUnitPage(unitIn: SlugUnit, profile: PageProfile, ctx: UnitPageContext): UnitPage {
  const byTeryt = new Map(ctx.units.map((u) => [u.teryt, u]));
  const unit = unitIn.level === 'gmi' && isCityCounty(unitIn.teryt) ? (byTeryt.get(unitIn.teryt.slice(0, 4)) ?? unitIn) : unitIn;
  const kind = unitKind(unit.teryt, unit.level);
  const heading = unitHeading(unit, ctx.units);
  const items = profile.units[unit.teryt] ?? [];
  const get = (id: string) => items.find((i) => i.indicatorId === id && i.value !== null && i.year !== null);
  const voiv = byTeryt.get(unit.teryt.slice(0, 2));
  const bareName = unit.name.replace(/^powiat\s+/i, '');

  const pop = get('population');
  const popBefore = pop ? valueBefore(profile, pop, 10) : null;
  const { best, worst } = extremes(items, ctx);
  const lead = [
    populationSentence(kind, bareName, pop ? { value: pop.value!, year: pop.year!, before: popBefore } : null),
    populationRankSentence(kind, voiv?.name ?? '', {
      rank: kind === 'województwo' ? (pop?.rankNational ?? null) : (pop?.rankVoivodeship ?? null),
      total: kind === 'województwo' ? (pop?.totalNational ?? 0) : (pop?.totalVoivodeship ?? 0),
      year: pop?.year ?? null,
      national: kind === 'województwo',
    }),
    extremeSentence('best', best),
    extremeSentence('worst', worst),
  ].filter((s): s is string => s !== null);

  const year = pop?.year ?? null;
  const ind = (id: string) => ctx.indicators.find((i) => i.id === id);
  const parts: string[] = [];
  if (pop) parts.push(`ludność ${plNumber(pop.value!)}`);
  const unemp = get('unemployment-rate');
  if (unemp) parts.push(`bezrobocie${unemp.fromParent ? ' w powiecie' : ''} ${formatValue(unemp.value, ind('unemployment-rate')?.unit ?? '%')}`);
  const income = get('income-per-capita');
  if (income) parts.push(`dochody budżetu ${formatValue(income.value, 'zł')} na mieszkańca`);

  const fresh = items.filter((i) => {
    const latest = latestYear(profile, i);
    return i.value !== null && i.year !== null && latest !== null && i.year >= latest - 1;
  }).length;

  return {
    teryt: unit.teryt,
    path: ctx.paths.pathByTeryt.get(unit.teryt) ?? '',
    title: pageTitle(heading, year),
    description: pageDescription(heading, year, parts),
    h1: heading,
    kind,
    lead,
    rows: buildRows(profile, items, ctx),
    links: pageLinks(unit, profile, ctx),
    indexable: fresh >= MIN_FRESH_INDICATORS,
    lastmod: profile.generatedAt,
  };
}
