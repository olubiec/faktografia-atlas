// Siła faktu = rzadkość × waga ramy × waga wskaźnika × świeżość (KONCEPT-ODKRYCIA §4).
import { FRAME_BY_TYPE, type Fact, type FactsConfig } from './types';

export type FactDraft = Omit<Fact, 'frame' | 'strength'>;

/** Rzadkość: −ln(miejsce/N) dla rankingów, ln(liczba lat) dla rekordu, bliskość mediany dla typowości. */
export function rarity(f: FactDraft, seriesYears = 0): number {
  const c = f.compare;
  if (c.kind === 'rank' || c.kind === 'change') return -Math.log(c.rank / Math.max(c.total, 1));
  if (c.kind === 'record') return Math.log(Math.max(seriesYears, 2));
  return 1 - Math.abs(c.percentile - 50) / 50;
}

export function indicatorWeight(config: FactsConfig, indicatorId: string): number {
  return config.indicatorWeights[indicatorId] ?? config.defaultIndicatorWeight;
}

/** Uzupełnia ramę i siłę (zaokrągloną do 0,01 – stabilny plik). */
export function finishFact(f: FactDraft, config: FactsConfig, latestYear: number, seriesYears = 0): Fact {
  const frame = FRAME_BY_TYPE[f.type];
  const fresh = f.year >= latestYear ? config.freshness.latest : config.freshness.older;
  const trend = config.trendBoost[f.indicatorId] ?? 1;
  const raw = rarity(f, seriesYears) * config.frameWeights[frame] * indicatorWeight(config, f.indicatorId) * fresh * trend;
  return { ...f, frame, strength: Math.round(raw * 100) / 100 };
}

/** Mnożnik kalendarza tematów: grupa miesiąca × calendarBoost (dla Odkrycia dnia). */
export function calendarBoost(config: FactsConfig, group: string, month: number): number {
  return config.calendar[String(month)] === group ? config.calendarBoost : 1;
}
