import { useMemo, useState } from 'react';
import {
  buildCardSet,
  cardSetPages,
  cardSetPositions,
  moveCard,
  removeCard,
  type CardSetEntry,
  type CardSetSource,
} from '../../core/share/card-set';

/**
 * Stan zestawu kart w oknie udostępniania: kolejność, usunięte karty, karta w podglądzie.
 * Cała logika w src/core/share/card-set.ts; tu tylko React. Zestaw wraca do domyślnego
 * po zmianie danych i po każdym otwarciu okna.
 */
export function useCardSet(source: CardSetSource, isOpen: boolean) {
  const [state, setState] = useState(() => ({ source, isOpen, set: buildCardSet(source), previewId: null as string | null }));

  // Wzorzec „stan zależny od propsów”: reset w trakcie renderu, bez efektu i podwójnego rysowania.
  let current = state;
  if (state.source !== source || state.isOpen !== isOpen) {
    current = { source, isOpen, set: buildCardSet(source), previewId: null };
    setState(current);
  }
  const { set, previewId } = current;

  const pages = useMemo(() => cardSetPages(set), [set]);
  const positions = useMemo(() => cardSetPositions(set), [set]);
  const previewEntry: CardSetEntry | undefined = set.find((e) => e.id === previewId);
  const previewPage = previewEntry ? pages.find((p) => p.entry.id === previewEntry.id) : undefined;

  return {
    set,
    pages,
    positions,
    previewPage,
    previewId: previewEntry ? previewEntry.id : null,
    setPreviewId: (id: string | null) => setState((s) => ({ ...s, previewId: id })),
    remove: (id: string) => setState((s) => ({ ...s, set: removeCard(s.set, id) })),
    move: (id: string, delta: -1 | 1) => setState((s) => ({ ...s, set: moveCard(s.set, id, delta) })),
    reset: () => setState((s) => ({ ...s, set: buildCardSet(s.source), previewId: null })),
  };
}
