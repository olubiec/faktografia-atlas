import type { ProfileIndicatorItem } from './profile';
import type { Unit } from '../units/types';

export interface Footnote {
  id: number;
  text: string;
}

/**
 * Buduje opis dla danych z jednostki wyższej (fromParent).
 */
export function formatParentFootnoteText(fromParentTeryt: string, units: Unit[]): string {
  const parentUnit = units.find((u) => u.teryt === fromParentTeryt);
  if (parentUnit) {
    const levelWord =
      parentUnit.level === 'pow'
        ? 'powiatu'
        : parentUnit.level === 'woj'
          ? 'województwa'
          : parentUnit.level === 'gmi'
            ? 'gminy'
            : 'jednostki';
    return `dane dla ${levelWord} ${parentUnit.name}`;
  }
  return `dane dla ${fromParentTeryt}`;
}

/**
 * Zbiera przypisy dla wskaźników profilu jednostki.
 * Przypisy obejmują powiadomienia o dziedziczeniu z parent (fromParent) oraz opcjonalne pole indicator.footnote.
 * Te same treści przypisów dostają ten sam numer. Numeracja następuje w kolejności wystąpienia.
 */
export function collectFootnotes(items: ProfileIndicatorItem[], units: Unit[]): Footnote[] {
  const footnotes: Footnote[] = [];
  const textToId = new Map<string, number>();

  const getOrCreateId = (text: string): number => {
    const existing = textToId.get(text);
    if (existing !== undefined) {
      return existing;
    }
    const nextId = footnotes.length + 1;
    textToId.set(text, nextId);
    footnotes.push({ id: nextId, text });
    return nextId;
  };

  for (const item of items) {
    if (item.fromParent) {
      const text = formatParentFootnoteText(item.fromParent, units);
      getOrCreateId(text);
    }
    if (item.indicator.footnote) {
      const text = item.indicator.footnote.trim();
      if (text) {
        getOrCreateId(text);
      }
    }
  }

  return footnotes;
}
