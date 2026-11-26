// public/data/facts-start.json (≤ 4 KB): Odkrycie dnia na 30 dni i 4 zestawienia (KONCEPT-ODKRYCIA §9).
import type { FactsBuild } from './build';
import { encodeFact, type EncodedFact } from './codec';
import { markNew } from './fresh-label';
import { compareFacts } from './select';
import { calendarBoost } from './strength';
import type { Direction, Fact, Level } from './types';

export interface DailyEntry {
  /** TERYT jednostki. */
  u: string;
  /** Nazwa jednostki (bez wczytywania units.json na starcie). */
  n: string;
  f: EncodedFact;
  /** Tylko wskaźnik z biblioteki (`b<varId>`, W29-D09): [nazwa, jednostka] – rejestr strony go nie zna bez pobrania katalogu. */
  i?: [string, string];
}

export interface StartList {
  indicatorId: string;
  level: Level;
  dir: Direction;
  year: number;
  /** 3 pierwsze pozycje: [TERYT, nazwa, wartość]. */
  top: [string, string, number][];
  /** Tylko wskaźnik z biblioteki (W29-D09): [nazwa, jednostka]. */
  i?: [string, string];
}

export interface FactsStart {
  generatedAt: string;
  daily: DailyEntry[];
  lists: StartList[];
}

/** Indeks Odkrycia dnia: kolejny dzień (UTC) = kolejna pozycja, po 30 dniach od nowa. */
export function dailyIndex(date: Date, length: number): number {
  if (length <= 0) return 0;
  const day = Math.floor(date.getTime() / 86_400_000);
  return ((day % length) + length) % length;
}

/** 30 najsilniejszych faktów krajowych (F1/F4, 1. miejsce, bez remisów): różne jednostki, ≤ 2 na wskaźnik. */
export function pickDaily(build: FactsBuild, month: number): Fact[] {
  const { config } = build.ctx.input;
  const pool: Fact[] = [];
  for (const { selected } of build.byUnit.values()) {
    for (const f of selected) {
      if ((f.type === 'F1' || f.type === 'F4') && (f.compare.kind === 'rank' || f.compare.kind === 'change') && f.compare.rank === 1) {
        if (f.compare.kind === 'rank' && f.compare.tie) continue;
        const group = build.ctx.indicators.get(f.indicatorId)?.group ?? '';
        pool.push({ ...f, strength: Math.round(f.strength * calendarBoost(config, group, month) * 100) / 100 });
      }
    }
  }
  const out: Fact[] = [];
  const units = new Set<string>();
  const perIndicator = new Map<string, number>();
  for (const f of pool.sort(compareFacts)) {
    if (out.length >= config.start.dailyCount) break;
    if (units.has(f.teryt) || (perIndicator.get(f.indicatorId) ?? 0) >= 2) continue;
    out.push(f);
    units.add(f.teryt);
    perIndicator.set(f.indicatorId, (perIndicator.get(f.indicatorId) ?? 0) + 1);
  }
  return out;
}

/** Krajowy fakt 1. miejsca bez remisu (F1/F4) – materiał na Odkrycie dnia. */
const isNationalFirst = (f: Fact): boolean =>
  (f.type === 'F1' || f.type === 'F4') &&
  (f.compare.kind === 'rank' || f.compare.kind === 'change') &&
  f.compare.rank === 1 &&
  !(f.compare.kind === 'rank' && f.compare.tie);

/**
 * Najsilniejsze krajowe fakty ze świeżych wskaźników (najnowszy rok): różne jednostki, bez limitu na wskaźnik.
 * `library` (W29-D09): osobny build świeżych zmiennych biblioteki – ich fakty traktujemy tak samo jak wskaźniki główne.
 */
export function pickFreshDaily(build: FactsBuild, slots: number, library?: FactsBuild | null): Fact[] {
  const pool: Fact[] = [];
  for (const b of library ? [build, library] : [build]) {
    const fresh = b.ctx.input.fresh ?? {};
    for (const { selected } of b.byUnit.values()) {
      for (const f of selected) if (fresh[f.indicatorId] !== undefined && f.year >= fresh[f.indicatorId] && isNationalFirst(f)) pool.push(f);
    }
  }
  const units = new Set<string>();
  const out: Fact[] = [];
  for (const f of pool.sort(compareFacts)) {
    if (out.length >= slots) break;
    if (units.has(f.teryt)) continue;
    units.add(f.teryt);
    out.push(f);
  }
  return out;
}

/**
 * Odkrycie dnia ze świeżymi faktami: k-ty świeży fakt ląduje na indeksie dailyIndex(generatedAt + k dni),
 * więc przez pierwsze dni po generatedAt strona pokazuje świeże dane; resztę wypełnia pickDaily (bez powtórzeń jednostek).
 * Bez świeżych faktów wynik = pickDaily.
 */
export function pickDailyWithFresh(build: FactsBuild, generatedAt: string, library?: FactsBuild | null): Fact[] {
  const { config } = build.ctx.input;
  const month = new Date(generatedAt).getUTCMonth() + 1;
  const base = pickDaily(build, month);
  const slots = Math.min(config.fresh?.dailySlots ?? 0, config.start.dailyCount);
  const fresh = slots > 0 ? pickFreshDaily(build, slots, library) : [];
  if (fresh.length === 0) return base;
  const taken = new Set(fresh.map((f) => f.teryt));
  const rest = base.filter((f) => !taken.has(f.teryt)).slice(0, config.start.dailyCount - fresh.length);
  const length = fresh.length + rest.length;
  const out: (Fact | null)[] = Array.from({ length }, () => null);
  const t0 = Date.parse(generatedAt);
  fresh.forEach((f, k) => {
    out[dailyIndex(new Date(t0 + k * 86_400_000), length)] = f;
  });
  let next = 0;
  return out.map((f) => f ?? rest[next++]);
}

/** Zestawienie: 3 jednostki poziomu z najwyższą (dir 1) lub najniższą (dir −1) wartością w roku odniesienia. */
export function buildList(build: FactsBuild, indicatorId: string, level: Level, dir: Direction, minPopulation = 0): StartList | null {
  const { ctx } = build;
  const data = ctx.input.values[indicatorId];
  const idx = ctx.refYearIdx(indicatorId, level);
  if (!data || idx < 0) return null;
  const rows = ctx.byLevel[level]
    .filter((u) => minPopulation === 0 || latestPopulation(build, u.teryt) >= minPopulation)
    .map((u) => [u.teryt, u.name, data.values[u.teryt]?.[idx]] as const)
    .filter((r): r is readonly [string, string, number] => r[2] != null)
    .sort((a, b) => dir * (b[2] - a[2]) || a[0].localeCompare(b[0]));
  return { indicatorId, level, dir, year: data.years[idx], top: rows.slice(0, 3).map((r) => [r[0], r[1], r[2]]) };
}

/** Ostatnia znana ludność jednostki (0, gdy brak – taka gmina nie wchodzi do zestawienia z progiem). */
function latestPopulation(build: FactsBuild, teryt: string): number {
  const s = build.ctx.input.values.population?.values[teryt] ?? [];
  for (let i = s.length - 1; i >= 0; i--) if (s[i] != null) return s[i] as number;
  return 0;
}

/**
 * Zestawienie najsilniejszego świeżego wskaźnika (suma siły jego faktów krajowych); null, gdy brak świeżych.
 * `library` (W29-D09): świeże zmienne biblioteki konkurują z głównymi na tych samych zasadach; link karty ma wtedy id `b<varId>`.
 */
export function buildFreshList(build: FactsBuild, library?: FactsBuild | null): StartList | null {
  const sums = new Map<string, number>();
  const owner = new Map<string, FactsBuild>();
  for (const b of library ? [build, library] : [build]) {
    const fresh = b.ctx.input.fresh ?? {};
    for (const id of Object.keys(fresh)) owner.set(id, b);
    for (const { selected } of b.byUnit.values()) {
      for (const f of selected) if (f.frame === 'kraj' && fresh[f.indicatorId] !== undefined && f.year >= fresh[f.indicatorId]) sums.set(f.indicatorId, (sums.get(f.indicatorId) ?? 0) + f.strength);
    }
  }
  const ids = [...owner.keys()].sort((a, b) => (sums.get(b) ?? 0) - (sums.get(a) ?? 0) || a.localeCompare(b));
  const { smallPopulation } = build.ctx.input.config.thresholds;
  for (const id of ids) {
    const list = buildList(owner.get(id)!, id, 'gmi', 1, smallPopulation);
    if (list && list.top.length > 0) return list;
  }
  return null;
}

/**
 * `newYears` (id wskaźnika → najnowszy rok, tylko wskaźniki nowe ≤ fresh.labelDays dni; newMainYears) dopisuje
 * kartom Odkrycia dnia flagę „Nowość” (opcjonalny ostatni element zapisu). Bez niego plik jest taki sam jak dotąd.
 * `library` (W29-D09): build świeżych zmiennych biblioteki (library-fresh.ts); bez niego (null) wynik jest taki sam jak dotąd.
 */
export function buildStart(build: FactsBuild, generatedAt: string, newYears?: Readonly<Record<string, number>>, library?: FactsBuild | null): FactsStart {
  const { ctx } = build;
  const meta = (id: string): { i: [string, string] } | undefined => {
    const ind = library?.ctx.indicators.get(id);
    return ind ? { i: [ind.name, ind.unit] } : undefined;
  };
  const daily = markNew(pickDailyWithFresh(build, generatedAt, library), newYears).map((f) => ({ u: f.teryt, n: ctx.units.get(f.teryt)?.name ?? f.teryt, f: encodeFact(f), ...meta(f.indicatorId) }));
  const configured = ctx.input.config.start.lists;
  const freshList = buildFreshList(build, library);
  const lists = (freshList ? configured.slice(1) : configured)
    .map((l) => buildList(build, l.indicatorId, l.level, l.dir))
    .filter((l): l is StartList => l !== null);
  if (freshList) lists.unshift({ ...freshList, ...meta(freshList.indicatorId) });
  return { generatedAt, daily, lists };
}
