import { formatValue } from '../format/number';
import { isCityCounty, slugify, type SlugUnit, type UnitPaths } from './slug';
import { change, titleAndDescription, unitLinkLabel } from './unit-page-text';
import {
  extremeSentence,
  populationChangeSentence,
  populationRankSentence,
  populationSentence,
} from './sentences';

export interface ProfileEntry {
  indicatorId: string;
  year: number | null;
  value: number | null;
  rankNational: number | null;
  rankVoivodeship: number | null;
  totalNational: number | null;
  totalVoivodeship: number | null;
  series: (number | null)[];
}
export interface ProfileShard {
  woj: string;
  generatedAt: string;
  years: Record<string, number[]>;
  units: Record<string, ProfileEntry[]>;
}
export interface IndicatorMeta {
  id: string;
  name: string;
  unit: string;
  minLevel: 'gmi' | 'pow' | 'woj';
}
export interface PageContext {
  units: readonly SlugUnit[];
  paths: UnitPaths;
  indicators: readonly IndicatorMeta[];
}
export type PageKind = 'wojewodztwo' | 'powiat' | 'miasto' | 'gmina-miejska' | 'gmina-wiejska' | 'gmina-miejsko-wiejska';
export interface PageLink { label: string; path: string }
export interface PageRow {
  indicatorId: string;
  name: string;
  value: string;
  year: number;
  rankVoivodeship: string | null;
  rankNational: string | null;
  change5: string | null;
  change10: string | null;
  /** Wskaźnik liczony dla powiatu, pokazany przy gminie. */
  note: string | null;
}
export interface UnitPage {
  teryt: string;
  path: string;
  kind: PageKind;
  kindLabel: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  lead: string[];
  rows: PageRow[];
  links: { parents: PageLink[]; children: PageLink[]; neighbors: PageLink[] };
  indexable: boolean;
  lastmod: string;
}

const KIND_LABEL: Record<PageKind, string> = {
  wojewodztwo: 'Województwo',
  powiat: 'Powiat',
  miasto: 'Miasto na prawach powiatu',
  'gmina-miejska': 'Gmina miejska',
  'gmina-wiejska': 'Gmina wiejska',
  'gmina-miejsko-wiejska': 'Gmina miejsko-wiejska',
};
const MIN_INDICATORS = 10;

export function kindOf(unit: SlugUnit): PageKind {
  if (unit.level === 'woj') return 'wojewodztwo';
  if (unit.level === 'pow') return isCityCounty(unit.teryt) ? 'miasto' : 'powiat';
  if (unit.parent && isCityCounty(unit.parent)) return 'miasto';
  const r = unit.teryt.slice(6, 7);
  return r === '1' ? 'gmina-miejska' : r === '3' ? 'gmina-miejsko-wiejska' : 'gmina-wiejska';
}

const plainName = (u: SlugUnit) => u.name.replace(/^powiat\s+/i, '');

/** Model strony miejsca z profilu województwa (czysta funkcja, bez dostępu do plików). */
export function buildUnitPage(unit: SlugUnit, profile: ProfileShard, ctx: PageContext): UnitPage | null {
  const entries = profile.units[unit.teryt];
  const path = ctx.paths.byTeryt.get(unit.teryt);
  if (!entries || !path) return null;
  const metas = new Map(ctx.indicators.map((i) => [i.id, i]));
  const byId = new Map(entries.map((e) => [e.indicatorId, e]));
  const kind = kindOf(unit);
  const name = unit.level === 'pow' ? plainName(unit) : unit.name;
  const label = `${KIND_LABEL[kind] === 'Miasto na prawach powiatu' ? 'Miasto' : KIND_LABEL[kind]} ${name}`;
  const nameByTeryt = new Map(ctx.units.map((u) => [u.teryt, u]));
  const parent = unit.parent ? nameByTeryt.get(unit.parent) : undefined;
  const slugBase = path.replace(/^\/[a-z]+\//, '');
  const nameSlug = slugify(name);
  const needsQualifier = kind !== 'wojewodztwo' && slugBase !== nameSlug;
  const wojUnit = nameByTeryt.get(unit.teryt.slice(0, 2));
  const qualifier = !needsQualifier ? ''
    : unit.level === 'gmi' && parent ? `pow. ${plainName(parent)}`
    : kind === 'powiat' && wojUnit ? `woj. ${wojUnit.name}`
    : '';
  const year = byId.get('population')?.year ?? Math.max(...entries.map((e) => e.year ?? 0));
  const { title, description } = titleAndDescription(label, qualifier, year, byId, metas);

  const dataYear = Math.max(...Object.values(profile.years).map((y) => y[y.length - 1] ?? 0));
  const rows: PageRow[] = [];
  for (const meta of ctx.indicators) {
    const e = byId.get(meta.id);
    if (!e || e.value === null || e.year === null) continue;
    const countyData = unit.level === 'gmi' && meta.minLevel === 'pow';
    rows.push({
      indicatorId: meta.id,
      name: meta.name,
      value: formatValue(e.value, meta.unit),
      year: e.year,
      rankVoivodeship: e.totalVoivodeship && e.totalVoivodeship > 1 && e.rankVoivodeship ? `${e.rankVoivodeship}. z ${e.totalVoivodeship} w województwie` : null,
      rankNational: e.rankNational && e.totalNational ? `${e.rankNational}. z ${e.totalNational} w Polsce` : null,
      change5: change(e, 5, meta.unit),
      change10: change(e, 10, meta.unit),
      note: countyData ? 'wartość dla powiatu' : null,
    });
  }
  const recent = entries.filter((e) => e.value !== null && e.year !== null && e.year >= dataYear - 1).length;

  const pop = byId.get('population');
  const ten = pop ? pop.series[pop.series.length - 11] : null;
  const scope = unit.level === 'gmi' ? 'gmin' : unit.level === 'pow' ? 'powiatów' : 'województw';
  const ranked = entries
    .filter((e) => e.indicatorId !== 'population' && e.value !== null && e.year !== null && e.rankNational && e.totalNational && e.totalNational > 100)
    .map((e) => ({ e, share: e.rankNational! / e.totalNational! }))
    .sort((a, b) => a.share - b.share);
  const sentence = (kind2: 'highest' | 'lowest', x?: { e: ProfileEntry }) => {
    if (!x) return null;
    const m = metas.get(x.e.indicatorId);
    return m ? extremeSentence(kind2, m.name, x.e.value, m.unit, x.e.rankNational, x.e.totalNational, x.e.year) : null;
  };
  const lead = [
    populationSentence(label, pop?.value ?? null, pop?.year ?? null),
    pop && pop.year !== null && ten !== undefined ? populationChangeSentence(ten, pop.value, pop.year - 10, pop.year) : null,
    unit.level !== 'woj' ? populationRankSentence(pop?.rankVoivodeship ?? null, pop?.totalVoivodeship ?? null, `${scope} województwa`, pop?.year ?? null) : populationRankSentence(pop?.rankNational ?? null, pop?.totalNational ?? null, 'województw', pop?.year ?? null),
    sentence('highest', ranked[0]),
    ranked.length > 1 ? sentence('lowest', ranked[ranked.length - 1]) : null,
  ].filter((s): s is string => s !== null);

  const link = (u: SlugUnit): PageLink => ({ label: unitLinkLabel(u, ctx.paths), path: ctx.paths.byTeryt.get(u.teryt)! });
  const woj = nameByTeryt.get(unit.teryt.slice(0, 2));
  const county = unit.level === 'gmi' && parent && !isCityCounty(parent.teryt) ? parent : undefined;
  const parents = [county, unit.level !== 'woj' ? woj : undefined].filter((u): u is SlugUnit => !!u).map(link);
  const kids =
    unit.level === 'woj' ? ctx.units.filter((u) => u.level === 'pow' && u.parent === unit.teryt && !isCityCounty(u.teryt))
    : kind === 'powiat' ? ctx.units.filter((u) => u.level === 'gmi' && u.parent === unit.teryt)
    : [];
  const cityKids = unit.level === 'woj' ? ctx.units.filter((u) => u.level === 'gmi' && u.parent && isCityCounty(u.parent) && u.teryt.startsWith(unit.teryt)) : [];
  const myRank = pop?.rankVoivodeship ?? null;
  const level = unit.level === 'gmi' && kind === 'miasto' ? 'pow' : unit.level;
  const neighbors = myRank === null ? [] : ctx.units
    .filter((u) => u.level === level && u.teryt !== unit.teryt && u.teryt !== unit.parent && u.teryt.startsWith(unit.teryt.slice(0, 2)) && profile.units[u.teryt])
    .map((u) => ({ u, d: Math.abs((profile.units[u.teryt]!.find((e) => e.indicatorId === 'population')?.rankVoivodeship ?? 1e9) - myRank) }))
    .filter((x) => x.d < 1e9)
    .sort((a, b) => a.d - b.d || a.u.teryt.localeCompare(b.u.teryt))
    .slice(0, 6)
    .map((x) => link(x.u));

  return {
    teryt: unit.teryt, path, kind, kindLabel: KIND_LABEL[kind], name, title, description,
    h1: qualifier ? `${label}, ${qualifier}` : label,
    lead, rows,
    links: { parents, children: [...kids, ...cityKids].map(link), neighbors },
    indexable: recent >= MIN_INDICATORS,
    lastmod: profile.generatedAt,
  };
}
