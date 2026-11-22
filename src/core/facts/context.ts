// Kontekst obliczeń: serie efektywne jednostek (średnia 3-letnia dla małych gmin), lata zmian granic,
// posortowane wartości poziomu w danym roku (do miejsc w rankingu i median). Wszystko leniwie z pamięcią.
import { boundaryChangeYears, impliedArea } from './boundaries';
import type { FactIndicator, FactsInput, FactUnit, Level } from './types';

const LEVEL_RANK: Record<Level, number> = { gmi: 1, pow: 2, woj: 3 };

/** Seria wartości jednostki po uśrednieniu (span = ile lat uśredniono). */
export interface EffectiveSeries {
  years: number[];
  values: (number | null)[];
  span: number;
}

export interface FactsContext {
  input: FactsInput;
  indicators: Map<string, FactIndicator>;
  units: Map<string, FactUnit>;
  byLevel: Record<Level, FactUnit[]>;
  /** Najnowszy rok w danych (świeżość 1,0). */
  latestYear: number;
  /** Lata zmian granic jednostki. */
  boundaryYears(teryt: string): number[];
  /** Czy wskaźnik ma dane na poziomie jednostki (minLevel). */
  applies(indicator: FactIndicator, unit: FactUnit): boolean;
  series(teryt: string, indicatorId: string): EffectiveSeries | null;
  /** Posortowane rosnąco wartości efektywne wszystkich jednostek poziomu w roku (indeks lat wskaźnika). */
  sortedAt(indicatorId: string, level: Level, yearIdx: number): number[];
  /** Ostatni indeks roku, w którym dane ma co najmniej połowa jednostek poziomu (-1: brak). */
  refYearIdx(indicatorId: string, level: Level): number;
}

const memo = <K, V>(fn: (key: K) => V) => {
  const cache = new Map<K, V>();
  return (key: K) => {
    if (!cache.has(key)) cache.set(key, fn(key));
    return cache.get(key)!;
  };
};

/** Średnia krocząca z `span` ostatnich lat (wszystkie muszą mieć wartość). */
export function trailingMean(values: readonly (number | null)[], span: number): (number | null)[] {
  return values.map((_, i) => {
    if (i + 1 < span) return null;
    let sum = 0;
    for (let k = i - span + 1; k <= i; k++) {
      const v = values[k];
      if (v == null) return null;
      sum += v;
    }
    return Math.round((sum / span) * 100) / 100;
  });
}

export function createContext(input: FactsInput): FactsContext {
  const { config, values } = input;
  const indicators = new Map(input.indicators.map((i) => [i.id, i]));
  const units = new Map(input.units.map((u) => [u.teryt, u]));
  const byLevel: Record<Level, FactUnit[]> = { gmi: [], pow: [], woj: [] };
  for (const u of input.units) byLevel[u.level].push(u);

  // Najnowszy rok = najczęstszy ostatni rok z danymi wśród wskaźników (jeden wskaźnik z rokiem „do przodu”,
  // jak mediana wieku 2026, nie postarza pozostałych faktów).
  const lastYears = new Map<number, number>();
  for (const v of Object.values(values)) {
    for (let i = v.years.length - 1; i >= 0; i--) {
      if (Object.values(v.values).some((s) => s[i] != null)) {
        lastYears.set(v.years[i], (lastYears.get(v.years[i]) ?? 0) + 1);
        break;
      }
    }
  }
  const latestYear = [...lastYears.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;

  const population = values.population;
  const density = values.density;
  const latestPopulation = (teryt: string): number | null => {
    const s = population?.values[teryt];
    if (!s) return null;
    for (let i = s.length - 1; i >= 0; i--) if (s[i] != null) return s[i];
    return null;
  };

  const boundaryYears = memo((teryt: string) =>
    population && density
      ? boundaryChangeYears(
          impliedArea(population.years, population.values[teryt], density.years, density.values[teryt]),
          config.thresholds.boundaryJump,
        )
      : [],
  );

  const applies = (indicator: FactIndicator, unit: FactUnit) => LEVEL_RANK[unit.level] >= LEVEL_RANK[indicator.minLevel];

  const series = memo((key: string): EffectiveSeries | null => {
    const [teryt, indicatorId] = key.split('|');
    const ind = indicators.get(indicatorId);
    const unit = units.get(teryt);
    const data = values[indicatorId];
    const raw = data?.values[teryt];
    if (!ind || !unit || !raw || !applies(ind, unit)) return null;
    const pop = latestPopulation(teryt);
    const small = pop != null && pop < config.thresholds.smallPopulation && config.rateUnits.includes(ind.unit);
    if (!small) return { years: data.years, values: raw, span: 1 };
    const span = config.thresholds.smallAverageYears;
    return { years: data.years, values: trailingMean(raw, span), span };
  });

  const sortedAt = memo((key: string): number[] => {
    const [indicatorId, level, idx] = key.split('|');
    const out: number[] = [];
    for (const u of byLevel[level as Level]) {
      const v = series(`${u.teryt}|${indicatorId}`)?.values[Number(idx)];
      if (v != null) out.push(v);
    }
    return out.sort((a, b) => a - b);
  });

  const refYearIdx = memo((key: string): number => {
    const [indicatorId, level] = key.split('|');
    const data = values[indicatorId];
    if (!data) return -1;
    const need = byLevel[level as Level].length / 2;
    for (let i = data.years.length - 1; i >= 0; i--) {
      if (sortedAt(`${indicatorId}|${level}|${i}`).length >= need && need > 0) return i;
    }
    return -1;
  });

  return {
    input,
    indicators,
    units,
    byLevel,
    latestYear,
    boundaryYears,
    applies,
    series: (teryt, indicatorId) => series(`${teryt}|${indicatorId}`),
    sortedAt: (indicatorId, level, yearIdx) => sortedAt(`${indicatorId}|${level}|${yearIdx}`),
    refYearIdx: (indicatorId, level) => refYearIdx(`${indicatorId}|${level}`),
  };
}
