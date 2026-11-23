// Dobór faktów z różnorodnością (KONCEPT-ODKRYCIA §4): najsilniejsze, ≤ 1 na wskaźnik, ≤ 2 na grupę.
import type { Fact, FactIndicator, FactsConfig } from './types';

const TYPE_ORDER = ['F1', 'F4', 'F2', 'F3', 'F5', 'F9'];

/** Porządek stały: siła malejąco, potem typ i wskaźnik (ten sam wynik przy tych samych danych). */
export function compareFacts(a: Fact, b: Fact): number {
  return (
    b.strength - a.strength ||
    TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) ||
    a.indicatorId.localeCompare(b.indicatorId) ||
    a.compare.kind.localeCompare(b.compare.kind)
  );
}

export function selectFacts(
  candidates: readonly Fact[],
  indicators: ReadonlyMap<string, FactIndicator>,
  selection: FactsConfig['selection'],
): Fact[] {
  const picked: Fact[] = [];
  const perIndicator = new Map<string, number>();
  const perGroup = new Map<string, number>();
  for (const f of [...candidates].sort(compareFacts)) {
    if (picked.length >= selection.count) break;
    const group = indicators.get(f.indicatorId)?.group ?? f.indicatorId;
    if ((perIndicator.get(f.indicatorId) ?? 0) >= selection.perIndicator) continue;
    if ((perGroup.get(group) ?? 0) >= selection.perGroup) continue;
    picked.push(f);
    perIndicator.set(f.indicatorId, (perIndicator.get(f.indicatorId) ?? 0) + 1);
    perGroup.set(group, (perGroup.get(group) ?? 0) + 1);
  }
  return picked;
}
