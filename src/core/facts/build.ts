// Składanie faktów dla wszystkich jednostek: kandydaci (detektory) → dobór 3 → pliki na województwa.
import { encodeFact, type EncodedFact } from './codec';
import { createContext, type FactsContext } from './context';
import { detectAll } from './detectors';
import { selectFacts } from './select';
import type { Fact, FactsInput, FactType } from './types';

export interface UnitFacts {
  /** Wybrane fakty (≥ 3, chyba że jednostka nie ma żadnych danych). */
  selected: Fact[];
  /** Ile kandydatów każdego typu wykryto (do raportu liczności). */
  counts: Partial<Record<FactType, number>>;
}

export interface FactsBuild {
  ctx: FactsContext;
  byUnit: Map<string, UnitFacts>;
}

export function buildFacts(input: FactsInput): FactsBuild {
  const ctx = createContext(input);
  const byUnit = new Map<string, UnitFacts>();
  for (const unit of input.units) {
    const candidates = detectAll(ctx, unit);
    const counts: Partial<Record<FactType, number>> = {};
    for (const f of candidates) counts[f.type] = (counts[f.type] ?? 0) + 1;
    byUnit.set(unit.teryt, { selected: selectFacts(candidates, ctx.indicators, input.config.selection), counts });
  }
  return { ctx, byUnit };
}

/** Plik public/data/facts/<WW>.json: { woj, generatedAt, units: { teryt: [fakt, …] } }. */
export interface FactsShard {
  woj: string;
  generatedAt: string;
  units: Record<string, EncodedFact[]>;
}

export function buildShards(build: FactsBuild, generatedAt: string): Record<string, FactsShard> {
  const shards: Record<string, FactsShard> = {};
  for (const unit of build.ctx.input.units) {
    const woj = unit.teryt.slice(0, 2);
    shards[woj] ??= { woj, generatedAt, units: {} };
    shards[woj].units[unit.teryt] = (build.byUnit.get(unit.teryt)?.selected ?? []).map(encodeFact);
  }
  return shards;
}
