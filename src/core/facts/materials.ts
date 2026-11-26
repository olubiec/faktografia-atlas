// Pakiet „Do materiałów” (W29-D08, docs/KONCEPT-ODKRYCIA.md §16): do 8 pozycji tekstowych (zdanie, liczba, ranking, kontekst,
// źródło, ostrzeżenia). Kolejność: premiera GUS z 7 dni, świeże dane, skrajności, temat na czasie. Czyste funkcje; liczby tylko
// z public/data/values, zdania ze stałych szablonów (sentences.ts), bez AI i bez grafik. Zapis .md i latest.json: calendar-board.mjs.
import { boundaryChangeYears, impliedArea, windowHasBoundaryChange } from './boundaries';
import { decodeFact, type FlaggedFact } from './codec';
import { freshYears, isExtreme, lastDataYear, type FreshLedger } from './fresh';
import { referenceIndex } from './lists';
import { factSentence } from './sentences';
import { expandTrendBoost } from './trend-boost';
import type { Fact, FactIndicator, FactsConfig, FactUnit, IndicatorValues, Level } from './types';
import { changeSince, plNumber, showValue } from '../seo/sentences';

export type MaterialKind = 'premiere' | 'fresh' | 'extreme' | 'trend';
export const [MATERIALS_LIMIT, TITLE_MAX] = [8, 90];
const [PREMIERE_DAYS, MAX_EXTREMES, MAX_TRENDS, TOP] = [7, 3, 2, 5];
const PEERS: Record<Level, string> = { gmi: 'gmin', pow: 'powiatów', woj: 'województw' };

export type MaterialIndicator = FactIndicator & { bdlVarId?: number };
/** Wpis księgi library/calendar.json (podzbiór): publikacja GUS z wskaźnikami głównymi. */
export interface PremiereEntry { date: string; title: string; href: string; main?: string[] }
/** Wpis facts-start.json „daily”: TERYT, nazwa, zakodowany fakt (codec.ts). */
export interface DailyFact { u: string; n: string; f: (string | number)[] }
export interface MaterialsInput {
  /** Dzień przebiegu (RRRR-MM-DD): „teraz” bierzemy z danych, nie z zegara. */
  today: string;
  indicators: readonly MaterialIndicator[];
  values: Readonly<Record<string, IndicatorValues>>;
  units: readonly FactUnit[];
  config: FactsConfig;
  /** config/lists.json: próg ludności gmin w rankingach. */
  gminaMinPopulation: number;
  fresh: FreshLedger;
  premieres: readonly PremiereEntry[];
  daily: readonly DailyFact[];
}
export interface RankRow { rank: number; teryt: string; name: string; value: number; text: string }
export interface MaterialItem {
  kind: MaterialKind;
  topic?: string;
  premiere?: { title: string; href: string; date: string };
  indicatorId: string;
  indicatorName: string;
  teryt: string;
  unitName: string;
  year: number;
  title: string;
  sentence: string;
  value: { value: number; unit: string; text: string };
  ranking: { level: Level; compared: number; top: RankRow[]; bottom: RankRow[] };
  context: { average?: { value: number; text: string; basis: string }; change10?: string };
  source: { text: string; bdlVarId: number | null; map: string };
  warnings: string[];
}
export interface MaterialsPack { date: string; items: MaterialItem[] }
interface Candidate { kind: MaterialKind; indicator: MaterialIndicator; fact: FlaggedFact; topic?: string; premiere?: MaterialItem['premiere'] }

const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
const lastNumber = (s: readonly (number | null)[] | undefined) => s?.filter((v): v is number => v != null).at(-1) ?? null;
const byStrength = (a: Fact, b: Fact) => b.strength - a.strength || a.teryt.localeCompare(b.teryt) || a.indicatorId.localeCompare(b.indicatorId);
/** Tytuł roboczy: zdanie z szablonu; za długie – obcięte na granicy słowa z „…”. */
export const fitTitle = (sentence: string, max = TITLE_MAX): string => (sentence.length <= max ? sentence : `${sentence.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);
/** Adres widoku na mapie (ścieżka; domenę dopisuje wyjście). */
export const materialMapPath = (id: string, year: number, teryt: string) => `/mapa?i=${encodeURIComponent(id)}&y=${year}&u=${encodeURIComponent(teryt)}`;

function createChecks(input: MaterialsInput) {
  const area = new Map<string, number[]>();
  const { population: pop, density: den } = input.values;
  const years = (t: string) => {
    if (!area.has(t)) area.set(t, boundaryChangeYears(impliedArea(pop?.years ?? [], pop?.values[t], den?.years ?? [], den?.values[t]), input.config.thresholds.boundaryJump));
    return area.get(t)!;
  };
  return { population: (t: string) => lastNumber(pop?.values[t]), changed: (t: string, from: number, to: number) => windowHasBoundaryChange(years(t), from, to) };
}
type Checks = ReturnType<typeof createChecks>;
/** Przerwa w serii: brak wartości po pierwszej wartości w oknie ostatnich `span` lat. */
function hasGap(series: readonly (number | null)[] | undefined, idx: number, span: number): boolean {
  let seen = false;
  for (let i = Math.max(0, idx - span); i <= idx; i++) {
    if (series?.[i] != null) seen = true;
    else if (seen) return true;
  }
  return false;
}
/** Skrajność z wartości: jednostka z najwyższą wartością poziomu (bez progu – zdanie jest o „Polsce”, jak fakt F1). */
function leaderFact(input: MaterialsInput, ind: MaterialIndicator, year: number): FlaggedFact | null {
  const data = input.values[ind.id];
  const idx = data?.years.indexOf(year) ?? -1;
  if (!data || idx < 0) return null;
  const rows = input.units.filter((u) => u.level === ind.minLevel && data.values[u.teryt]?.[idx] != null).map((u) => ({ teryt: u.teryt, value: data.values[u.teryt][idx] as number }));
  rows.sort((a, b) => b.value - a.value || a.teryt.localeCompare(b.teryt));
  if (rows.length === 0) return null;
  const compare = { kind: 'rank', dir: 1, rank: 1, total: rows.length, tie: rows.length > 1 && rows[1].value === rows[0].value } as const;
  return { type: 'F1', teryt: rows[0].teryt, indicatorId: ind.id, year, value: rows[0].value, frame: 'kraj', strength: 0, compare };
}
/** Ranking: gminy poniżej progu ludności i ze zmianą granic w oknie pomijamy (jak zestawienia, lists.ts). */
function rankingOf(input: MaterialsInput, ind: MaterialIndicator, year: number, checks: Checks) {
  const data = input.values[ind.id];
  const idx = data.years.indexOf(year);
  const level = ind.minLevel;
  const rows = input.units
    .filter((u) => u.level === level && data.values[u.teryt]?.[idx] != null)
    .filter((u) => level !== 'gmi' || (checks.population(u.teryt) ?? 0) >= input.gminaMinPopulation)
    .filter((u) => !checks.changed(u.teryt, year - input.config.thresholds.changeYears, year))
    .map((u) => ({ teryt: u.teryt, name: u.name, value: data.values[u.teryt][idx] as number }))
    .sort((a, b) => b.value - a.value || a.teryt.localeCompare(b.teryt));
  const row = (r: (typeof rows)[number], rank: number): RankRow => ({ rank, ...r, text: showValue(r.value, ind.unit) });
  const mean = rows.length ? Math.round((rows.reduce((s, r) => s + r.value, 0) / rows.length) * 100) / 100 : null;
  return { level, compared: rows.length, top: rows.slice(0, TOP).map((r, i) => row(r, i + 1)), bottom: rows.slice(-TOP).reverse().map((r, i) => row(r, rows.length - i)), mean };
}

function buildItem(c: Candidate, input: MaterialsInput, checks: Checks): MaterialItem | null {
  const { indicator: ind, fact } = c;
  const data = input.values[ind.id];
  const unit = input.units.find((u) => u.teryt === fact.teryt);
  const idx = data?.years.indexOf(fact.year) ?? -1;
  if (!data || !unit || idx < 0) return null;
  const sentence = factSentence(fact, { indicator: { name: ind.name, unit: ind.unit }, level: unit.level, typicalBand: input.config.thresholds.typicalBand });
  if (!sentence) return null;
  const rk = rankingOf(input, ind, fact.year, checks);
  const span = input.config.thresholds.changeYears;
  const series = data.values[unit.teryt];
  const changed = checks.changed(unit.teryt, fact.year - span, fact.year);
  const from = series?.[data.years.indexOf(fact.year - span)];
  const change10 = !changed && from != null ? changeSince(fact.value, { value: from, year: fact.year - span }, ind.unit) : null;
  const pop = checks.population(unit.teryt);
  const warnings = [
    ...(unit.level === 'gmi' && pop != null && pop < input.config.thresholds.smallPopulation ? [`mała gmina (ok. ${plNumber(pop)} mieszkańców): liczby mogą silnie się wahać`] : []),
    ...(hasGap(series, idx, span) ? ['przerwa w serii: brakuje wartości z któregoś roku ostatnich 10 lat'] : []),
    ...(changed ? ['zmiana granic w ostatnich 10 latach: nie porównuj ze starszymi latami'] : []),
  ];
  const average = rk.mean != null ? { value: rk.mean, text: showValue(rk.mean, ind.unit), basis: `średnia ${plNumber(rk.compared)} ${PEERS[rk.level]} w rankingu` } : undefined;
  return {
    kind: c.kind,
    ...(c.topic ? { topic: c.topic } : {}),
    ...(c.premiere ? { premiere: c.premiere } : {}),
    indicatorId: ind.id,
    indicatorName: ind.name,
    teryt: unit.teryt,
    unitName: unit.name,
    year: fact.year,
    title: fitTitle(sentence),
    sentence,
    value: { value: fact.value, unit: ind.unit, text: showValue(fact.value, ind.unit) },
    ranking: { level: rk.level, compared: rk.compared, top: rk.top, bottom: rk.bottom },
    context: { ...(average ? { average } : {}), ...(change10 ? { change10 } : {}) },
    source: { text: `GUS, BDL, ${fact.year}`, bdlVarId: ind.bdlVarId ?? null, map: materialMapPath(ind.id, fact.year, unit.teryt) },
    warnings,
  };
}
/** Największy wzrost rok do roku wśród gmin (jednostki liczbowe): po jednym kandydacie na wskaźnik, od największego. */
function jumpCandidates(input: MaterialsInput, checks: Checks): Candidate[] {
  const gmi = input.units.filter((u) => u.level === 'gmi');
  const out: { ratio: number; cand: Candidate }[] = [];
  for (const ind of input.indicators) {
    const data = input.values[ind.id];
    if (!data || ind.minLevel !== 'gmi' || !input.config.relativeChangeUnits.includes(ind.unit)) continue;
    const idx = referenceIndex(data, gmi);
    if (idx < 1 || data.years[idx] - data.years[idx - 1] !== 1) continue;
    const year = data.years[idx];
    let best: { teryt: string; v: number; p: number; ratio: number } | null = null;
    let total = 0;
    for (const u of gmi) {
      const v = data.values[u.teryt]?.[idx];
      const p = data.values[u.teryt]?.[idx - 1];
      if (v == null || p == null || p <= 0 || (checks.population(u.teryt) ?? 0) < input.gminaMinPopulation || checks.changed(u.teryt, year - 1, year)) continue;
      total++;
      const ratio = (v - p) / p;
      if (!best || ratio > best.ratio || (ratio === best.ratio && u.teryt < best.teryt)) best = { teryt: u.teryt, v, p, ratio };
    }
    if (!best || best.ratio <= 0) continue;
    const compare = { kind: 'change', dir: 1, rank: 1, total, fromYear: year - 1, fromValue: best.p } as const;
    out.push({ ratio: best.ratio, cand: { kind: 'extreme', indicator: ind, fact: { type: 'F4', teryt: best.teryt, indicatorId: ind.id, year, value: best.v, frame: 'zmiana', strength: 0, compare } } });
  }
  return out.sort((a, b) => b.ratio - a.ratio || a.cand.indicator.id.localeCompare(b.cand.indicator.id)).map((x) => x.cand);
}

/** Pakiet tygodnia: pozycje w kolejności priorytetów, bez powtórzeń (wskaźnik + jednostka), do MATERIALS_LIMIT. */
export function buildMaterials(raw: MaterialsInput): MaterialsPack {
  const input: MaterialsInput = { ...raw, config: expandTrendBoost(raw.config, raw.indicators) };
  const ind = new Map(input.indicators.map((i) => [i.id, i]));
  const checks = createChecks(input);
  const daily = input.daily.flatMap((d) => (ind.has(String(d.f[1])) ? [decodeFact(d.u, d.f)] : [])).sort(byStrength);
  const best = (id: string, minYear: number) => daily.find((f) => f.indicatorId === id && f.year >= minYear);
  const toCand = (kind: MaterialKind, id: string, year: number, extra: Partial<Candidate> = {}): Candidate[] => {
    const fact = ind.has(id) && input.values[id] ? (best(id, year) ?? leaderFact(input, ind.get(id)!, year)) : null;
    return fact ? [{ kind, indicator: ind.get(id)!, fact, ...extra }] : [];
  };
  const [used, items] = [new Set<string>(), [] as MaterialItem[]];
  const take = (cands: Candidate[], max: number) => {
    const start = items.length;
    for (const c of cands) {
      if (items.length - start >= max || items.length >= MATERIALS_LIMIT) break;
      const key = `${c.indicator.id}|${c.fact.teryt}`;
      const item = used.has(key) ? null : buildItem(c, input, checks);
      if (item && used.add(key)) items.push(item);
    }
    return items.length - start;
  };
  const premieres = input.premieres
    .filter((e) => dayDiff(e.date, input.today) >= 0 && dayDiff(e.date, input.today) <= PREMIERE_DAYS)
    .sort((a, b) => b.date.localeCompare(a.date) || a.href.localeCompare(b.href))
    .flatMap((e) => (e.main ?? []).flatMap((id) => toCand('premiere', id, input.fresh[id]?.year ?? lastDataYear(input.values[id] ?? { years: [], values: {} }) ?? 0, { premiere: { title: e.title, href: e.href, date: e.date } })));
  take(premieres, MATERIALS_LIMIT);
  const freshIds = Object.entries(freshYears(input.fresh, `${input.today}T23:59:59.999Z`, input.config.fresh?.days ?? 28)).sort((a, b) => input.fresh[b[0]].since.localeCompare(input.fresh[a[0]].since) || a[0].localeCompare(b[0]));
  take(freshIds.flatMap(([id, year]) => toCand('fresh', id, year)), MATERIALS_LIMIT);
  const extremes = daily.filter(isExtreme).map((fact): Candidate => ({ kind: 'extreme', indicator: ind.get(fact.indicatorId)!, fact }));
  take([...extremes.slice(0, 2), ...jumpCandidates(input, checks).slice(0, 1), ...extremes.slice(2)], MAX_EXTREMES);
  const topics = Object.entries(raw.config.trendBoost ?? {}).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'));
  let trends = 0;
  for (const [topic] of topics) {
    if (trends >= MAX_TRENDS) break;
    const members = raw.indicators.filter((m) => (m.id === topic || m.group === topic) && input.values[m.id]);
    const ranked = members.flatMap((m) => { const f = best(m.id, 0) ?? leaderFact(input, m, lastDataYear(input.values[m.id]) ?? 0); return f ? [{ m, f }] : []; });
    ranked.sort((a, b) => b.f.strength - a.f.strength || a.m.id.localeCompare(b.m.id));
    trends += take(ranked.map((x): Candidate => ({ kind: 'trend', indicator: x.m, fact: x.f, topic })), 1);
  }
  return { date: input.today, items };
}
