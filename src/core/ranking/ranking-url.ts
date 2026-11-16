import {
  DEFAULT_SELECTION,
  normalizeSelection,
  type RankingIndicator,
  type RankingSelection,
} from './ranking-options';
import type { UnitLevel } from '../units/types';

// Stan /rankingi ↔ adres. Nazwy parametrów jak na mapie (i, l, y) plus q (szukaj).
// Dział wynika ze wskaźnika, więc nie ma własnego parametru.

const LEVELS: UnitLevel[] = ['woj', 'pow', 'gmi'];

/** Odczyt adresu (np. location.search) do wyboru i tekstu; błędne wartości → domyślne. */
export function parseRankingParams(
  search: string,
  indicators: RankingIndicator[],
): { selection: RankingSelection; query: string } {
  const p = new URLSearchParams(search);
  const i = p.get('i');
  const l = p.get('l');
  const y = p.get('y');
  const found = i ? indicators.find((x) => x.id === i) : undefined;
  const year = y !== null && /^\d{4}$/.test(y) ? Number(y) : null;
  const raw: RankingSelection = {
    group: found?.group ?? DEFAULT_SELECTION.group,
    indicatorId: found?.id ?? DEFAULT_SELECTION.indicatorId,
    level: LEVELS.find((x) => x === l) ?? DEFAULT_SELECTION.level,
    year,
  };
  return { selection: normalizeSelection(raw, indicators, null), query: p.get('q') ?? '' };
}

/** Zapis wyboru i tekstu do adresu; wartości domyślne pomijane, stan startowy = ''. */
export function rankingSearch(selection: RankingSelection, query: string): string {
  const p = new URLSearchParams();
  if (selection.indicatorId !== DEFAULT_SELECTION.indicatorId) p.set('i', selection.indicatorId);
  if (selection.level !== DEFAULT_SELECTION.level) p.set('l', selection.level);
  if (selection.year !== null) p.set('y', String(selection.year));
  if (query !== '') p.set('q', query);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/**
 * Czy adres zmienił się z zewnątrz (link, Wstecz/Dalej), a nie przez zapis strony?
 * Porównanie po postaci znormalizowanej (rankingSearch ∘ parseRankingParams),
 * więc kolejność parametrów i wartości domyślne nie dają fałszywych zmian.
 * lastWritten = null to pierwsze wejście: stan powstał z tego adresu, więc nie ma zmiany.
 */
export function isExternalRankingChange(
  search: string,
  lastWritten: string | null,
  indicators: RankingIndicator[],
): boolean {
  if (lastWritten === null) return false;
  const p = parseRankingParams(search, indicators);
  return rankingSearch(p.selection, p.query) !== lastWritten;
}
