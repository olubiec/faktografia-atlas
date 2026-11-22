// Stałe szablony zdań strony miejsca (docs/SEO.md, D8): zero tekstu z AI, liczby tylko z danych.
// Każda funkcja zwraca zdanie z liczbą i rokiem albo null, gdy danych brak (zdanie się pomija).
import { displayUnit, formatValue } from '../format/number';
import { isCityCounty } from '../units/label';
import type { SlugUnit } from './slug';

/** Rodzaj jednostki w postaci do zdań i tytułów. */
export type UnitKind =
  | 'województwo'
  | 'powiat'
  | 'miasto na prawach powiatu'
  | 'gmina miejska'
  | 'gmina wiejska'
  | 'gmina miejsko-wiejska';

/** Rodzaj z TERYT: 7. cyfra gminy (1 miejska, 2 wiejska, 3 miejsko-wiejska), powiat 61+ to miasto. */
export function unitKind(teryt: string, level: SlugUnit['level']): UnitKind {
  if (level === 'woj') return 'województwo';
  if (isCityCounty(teryt)) return 'miasto na prawach powiatu';
  if (level === 'pow') return 'powiat';
  return ({ '1': 'gmina miejska', '2': 'gmina wiejska' } as const)[teryt.charAt(6)] ?? 'gmina miejsko-wiejska';
}

const bareName = (name: string) => name.replace(/^powiat\s+/i, '');

/** Nagłówek: „Gmina Wieliczka”, „Powiat wielicki”, „Kraków”; powtórzone nazwy gmin z rodzajem, potem powiatem. */
export function unitHeading(unit: SlugUnit, units: readonly SlugUnit[]): string {
  const kind = unitKind(unit.teryt, unit.level);
  const bare = bareName(unit.name);
  if (kind === 'województwo') return `Województwo ${bare}`;
  if (kind === 'powiat') return `Powiat ${bare}`;
  if (kind === 'miasto na prawach powiatu') return bare;
  const twins = units.filter((u) => u.level === 'gmi' && u.name === unit.name && !isCityCounty(u.teryt));
  if (twins.length <= 1) return `Gmina ${bare}`;
  const head = `${kind.charAt(0).toUpperCase()}${kind.slice(1)} ${bare}`;
  if (twins.filter((u) => u.teryt.charAt(6) === unit.teryt.charAt(6)).length <= 1) return head;
  const pow = units.find((u) => u.teryt === unit.teryt.slice(0, 4));
  return pow ? `${head} (pow. ${bareName(pow.name)})` : head;
}

/** Liczba w formacie pl-PL (spacja niełamiąca tysięcy, przecinek). */
export const plNumber = (value: number, digits = 0) => formatValue(value, null, digits);

/** Nazwa wskaźnika bez dopisku jednostki w nawiasie, np. „Lesistość (%)” → „Lesistość”. */
export function shortIndicatorName(name: string, unit: string): string {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)$/);
  if (m && (m[2] === unit || m[2] === displayUnit(unit))) return m[1];
  return name;
}

// Miejscownik przymiotnika: „wielicki” → „wielickim”, „małopolskie” → „małopolskim”.
const locativeAdjective = (name: string) =>
  name
    .split(' ')
    .map((w) => (w.endsWith('ie') ? `${w.slice(0, -2)}im` : /[iy]$/.test(w) ? `${w}m` : w))
    .join(' ');

/** Gdzie: „w gminie Wieliczka”, „w powiecie wielickim”, „w województwie małopolskim”. */
export function placeIn(kind: UnitKind, name: string): string {
  if (kind === 'województwo') return `w województwie ${locativeAdjective(name)}`;
  if (kind === 'powiat') return `w powiecie ${locativeAdjective(name)}`;
  if (kind === 'miasto na prawach powiatu') return `w mieście ${name}`;
  return `w gminie ${name}`;
}

/** Odmiana „osoba” po liczbie: 1 osoba, 2–4 osoby, 5+ osób (bez nastek). */
function persons(n: number): { verb: string; noun: string } {
  const last = n % 10;
  const lastTwo = n % 100;
  if (n === 1) return { verb: 'mieszkała', noun: 'osoba' };
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return { verb: 'mieszkały', noun: 'osoby' };
  return { verb: 'mieszkało', noun: 'osób' };
}

/** Zmiana procentowa z jednym miejscem po przecinku, np. „o 4,2% więcej”. */
function percentChange(now: number, before: number): string | null {
  if (before === 0) return null;
  const pct = ((now - before) / before) * 100;
  const rounded = Math.round(Math.abs(pct) * 10) / 10;
  if (rounded === 0) return 'tyle samo co';
  return `o ${plNumber(rounded, 1)}% ${pct > 0 ? 'więcej' : 'mniej'} niż`;
}

export interface PopulationFacts {
  value: number;
  year: number;
  /** Wartość sprzed 10 lat (jeśli seria ją ma). */
  before?: { value: number; year: number } | null;
}

/** „W 2025 r. w gminie Wieliczka mieszkało 70 471 osób – o 19,3% więcej niż w 2015 r.” */
export function populationSentence(kind: UnitKind, name: string, f: PopulationFacts | null): string | null {
  if (!f || !Number.isFinite(f.value) || f.value <= 0) return null;
  const { verb, noun } = persons(f.value);
  const base = `W ${f.year} r. ${placeIn(kind, name)} ${verb} ${plNumber(f.value)} ${noun}`;
  const change = f.before ? percentChange(f.value, f.before.value) : null;
  return change ? `${base} – ${change} w ${f.before!.year} r.` : `${base}.`;
}

/** Jednostki tego rodzaju w dopełniaczu liczby mnogiej – do „wśród 183 gmin”. */
const PEERS: Record<UnitKind, string> = {
  województwo: 'województw',
  powiat: 'powiatów i miast na prawach powiatu',
  'miasto na prawach powiatu': 'powiatów i miast na prawach powiatu',
  'gmina miejska': 'gmin',
  'gmina wiejska': 'gmin',
  'gmina miejsko-wiejska': 'gmin',
};

/** „Pod względem liczby ludności to 4. miejsce na 183 gminy w województwie małopolskim (2025).” */
export function populationRankSentence(
  kind: UnitKind,
  voivodeship: string,
  rank: { rank: number | null; total: number; year: number | null; national: boolean },
): string | null {
  if (!rank.rank || !rank.total || !rank.year) return null;
  const where = rank.national ? 'w Polsce' : placeIn('województwo', voivodeship);
  return `Pod względem liczby ludności to ${rank.rank}. miejsce wśród ${plNumber(rank.total)} ${PEERS[kind]} ${where} (${rank.year} r.).`;
}

export interface IndicatorFact {
  name: string;
  value: string;
  year: number;
  rank: number;
  total: number;
}

/** „Najwyższe miejsce w kraju: „Lesistość” – 12,3 % (2025 r.), 15. miejsce na 2479.” */
export function extremeSentence(which: 'best' | 'worst', f: IndicatorFact | null): string | null {
  if (!f || !f.rank || !f.total) return null;
  const head = which === 'best' ? 'Najlepsze miejsce w kraju' : 'Najsłabsze miejsce w kraju';
  return `${head}: „${f.name}” – ${f.value} w ${f.year} r., ${f.rank}. miejsce na ${plNumber(f.total)}.`;
}

/** Wartość z jednostką; minus typograficzny zamiast łącznika. */
export const showValue = (value: number, unit: string) => formatValue(value, unit).replace(/^-/, '−');

// Liczby (osoby, zł, m²) – zmiana procentowa; wskaźniki (%, na 1000, lata) – różnica w tej samej jednostce.
const RELATIVE_UNITS = new Set(['osoba', 'osoby', 'zł', 'os./km²', 'm²']);

/** „+4,2% od 2015 r.”, „−0,6 pkt proc. od 2020 r.”, „+1,3 na 1000 od 2015 r.” */
export function changeSince(now: number, before: { value: number; year: number }, unit: string): string | null {
  const sign = (d: number) => (d > 0 ? '+' : d < 0 ? '−' : '');
  if (RELATIVE_UNITS.has(unit)) {
    if (before.value === 0) return null;
    const pct = Math.round(((now - before.value) / before.value) * 1000) / 10;
    return `${sign(pct)}${plNumber(Math.abs(pct), 1)}% od ${before.year} r.`;
  }
  const diff = now - before.value;
  const shown = unit === '%' ? `${plNumber(Math.abs(diff), 1)} pkt proc.` : formatValue(Math.abs(diff), unit);
  return `${sign(diff)}${shown} od ${before.year} r.`;
}

const TITLE_MAX = 65;
const DESC_MIN = 120;
const DESC_MAX = 160;

/** Tytuł ≤ 65 znaków: „Gmina Wieliczka – ludność, bezrobocie, dochody (2025)”. */
export function pageTitle(heading: string, year: number | null): string {
  const y = year ? ` (${year})` : '';
  const options = [`${heading} – ludność, bezrobocie, dochody${y}`, `${heading} – dane GUS${y}`, heading];
  return options.find((t) => t.length <= TITLE_MAX) ?? heading.slice(0, TITLE_MAX);
}

/** Opis 120–160 znaków: nagłówek, rok i 2–3 liczby z danych. */
export function pageDescription(heading: string, year: number | null, parts: string[]): string {
  const tails = ['Miejsce w województwie i w Polsce, zmiany w czasie.', 'Źródło: GUS, BDL.'];
  let used = [...parts];
  const head = `${heading} – dane GUS${year ? ` za ${year} r.` : ''}`;
  const make = (tailCount: number) =>
    [used.length ? `${head}: ${used.join(', ')}.` : `${head}.`, ...tails.slice(0, tailCount)].join(' ');
  for (;;) {
    for (let t = 0; t <= tails.length; t++) {
      const d = make(t);
      if (d.length >= DESC_MIN && d.length <= DESC_MAX) return d;
      if (d.length > DESC_MAX) break;
    }
    if (used.length <= 1) return make(tails.length).slice(0, DESC_MAX);
    used = used.slice(0, -1);
  }
}
