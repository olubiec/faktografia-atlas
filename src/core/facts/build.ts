// Składanie faktów dla wszystkich jednostek: kandydaci (detektory) → dobór 3 → pliki na województwa.
import { markNew } from './fresh-label';
import { encodeFact, encodeTwin, type EncodedFact, type EncodedTwin } from './codec';
import { createContext, type FactsContext } from './context';
import { detectAll } from './detectors';
import { boostFresh } from './fresh';
import { selectFacts } from './select';
import { findTwins } from './twins';
import type { Fact, FactsInput, FactType, TwinFact } from './types';

export interface UnitFacts {
  /** Wybrane fakty (≥ 3, chyba że jednostka nie ma żadnych danych). */
  selected: Fact[];
  /** Ile kandydatów każdego typu wykryto (do raportu liczności). */
  counts: Partial<Record<FactType, number>>;
}

export interface FactsBuild {
  ctx: FactsContext;
  byUnit: Map<string, UnitFacts>;
  /** F8 – bliźniak w innym województwie (W26-F03). */
  twins: Map<string, TwinFact>;
}

export function buildFacts(input: FactsInput): FactsBuild {
  const ctx = createContext(input);
  const { config } = ctx.input;
  const byUnit = new Map<string, UnitFacts>();
  for (const unit of input.units) {
    const candidates = detectAll(ctx, unit);
    const counts: Partial<Record<FactType, number>> = {};
    for (const f of candidates) counts[f.type] = (counts[f.type] ?? 0) + 1;
    byUnit.set(unit.teryt, { selected: selectFacts(boostFresh(candidates, config.fresh, input.fresh), ctx.indicators, input.config.selection), counts });
  }
  return { ctx, byUnit, twins: findTwins(ctx) };
}

/**
 * Plik public/data/facts/<WW>.json: { woj, generatedAt, units: { teryt: [fakt, …] }, near, twins }.
 * `near` – pierścień sąsiadów (TERYT, ten sam poziom; do F3 i linków), `twins` – bliźniak F8 (W26-F03).
 */
export interface FactsShard {
  woj: string;
  generatedAt: string;
  units: Record<string, EncodedFact[]>;
  near?: Record<string, string[]>;
  twins?: Record<string, EncodedTwin>;
}

/** `newYears` (newMainYears): fakty z najnowszego roku nowego wskaźnika dostają flagę „Nowość” (W28-D06). */
export function buildShards(build: FactsBuild, generatedAt: string, newYears?: Readonly<Record<string, number>>): Record<string, FactsShard> {
  const shards: Record<string, FactsShard> = {};
  for (const unit of build.ctx.input.units) {
    const woj = unit.teryt.slice(0, 2);
    shards[woj] ??= { woj, generatedAt, units: {} };
    const shard = shards[woj];
    shard.units[unit.teryt] = markNew(build.byUnit.get(unit.teryt)?.selected ?? [], newYears).map(encodeFact);
    const ring = build.ctx.input.neighbours?.[unit.teryt];
    if (ring?.ids.length) (shard.near ??= {})[unit.teryt] = ring.ids;
    const twin = build.twins.get(unit.teryt);
    if (twin) (shard.twins ??= {})[unit.teryt] = encodeTwin(twin);
  }
  return shards;
}
