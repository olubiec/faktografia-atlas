// public/data/facts-start.json (≤ 4 KB): Odkrycie dnia na 30 dni i 4 zestawienia (KONCEPT-ODKRYCIA §9).
import type { FactsBuild } from './build';
import { encodeFact, type EncodedFact } from './codec';
import { compareFacts } from './select';
import { calendarBoost } from './strength';
import type { Direction, Fact, Level } from './types';

export interface DailyEntry {
  /** TERYT jednostki. */
  u: string;
  /** Nazwa jednostki (bez wczytywania units.json na starcie). */
  n: string;
  f: EncodedFact;
}

export interface StartList {
  indicatorId: string;
  level: Level;
  dir: Direction;
  year: number;
  /** 3 pierwsze pozycje: [TERYT, nazwa, wartość]. */
  top: [string, string, number][];
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
      if ((f.type === 'F1' || f.type === 'F4') && f.compare.kind !== 'typical' && f.compare.kind !== 'record' && f.compare.rank === 1) {
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

/** Zestawienie: 3 jednostki poziomu z najwyższą (dir 1) lub najniższą (dir −1) wartością w roku odniesienia. */
export function buildList(build: FactsBuild, indicatorId: string, level: Level, dir: Direction): StartList | null {
  const { ctx } = build;
  const data = ctx.input.values[indicatorId];
  const idx = ctx.refYearIdx(indicatorId, level);
  if (!data || idx < 0) return null;
  const rows = ctx.byLevel[level]
    .map((u) => [u.teryt, u.name, data.values[u.teryt]?.[idx]] as const)
    .filter((r): r is readonly [string, string, number] => r[2] != null)
    .sort((a, b) => dir * (b[2] - a[2]) || a[0].localeCompare(b[0]));
  return { indicatorId, level, dir, year: data.years[idx], top: rows.slice(0, 3).map((r) => [r[0], r[1], r[2]]) };
}

export function buildStart(build: FactsBuild, generatedAt: string): FactsStart {
  const { ctx } = build;
  const month = new Date(generatedAt).getUTCMonth() + 1;
  const daily = pickDaily(build, month).map((f) => ({ u: f.teryt, n: ctx.units.get(f.teryt)?.name ?? f.teryt, f: encodeFact(f) }));
  const lists = ctx.input.config.start.lists
    .map((l) => buildList(build, l.indicatorId, l.level, l.dir))
    .filter((l): l is StartList => l !== null);
  return { generatedAt, daily, lists };
}
