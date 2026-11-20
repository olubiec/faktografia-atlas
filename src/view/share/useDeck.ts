// Cienka warstwa Reacta nad deckReducer i valueLoader – bez własnej logiki.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { IndicatorValues } from '@/core/profile/profile';
import type { PageKind } from '@/core/share/deck';
import type { DeckContext, ShareEntry } from '@/core/share/deck-defaults';
import type { ShareFormatKey } from '@/core/share/formats';
import { loadAnyValues } from '@/core/indicators/load-any-values';
import type { Unit } from '@/core/units/types';
import { deckReducer, initDeckState, type DeckTheme } from './deckReducer';
import { createValueLoader, type LoadFn, type LoadStatus, type ValueLoader } from './valueLoader';

export type UseDeckOptions = {
  entry: ShareEntry;
  ctx: DeckContext;
  initialValues: Map<string, IndicatorValues>;
  units?: Unit[];
  loadValues?: LoadFn;
};

export function useDeck({ entry, ctx, initialValues, units = [], loadValues }: UseDeckOptions) {
  // Zestaw to kopia z chwili otwarcia – późniejsze zmiany ctx go nie ruszają.
  const [state, dispatch] = useReducer(deckReducer, undefined, () => initDeckState(entry, ctx));
  const [, bump] = useState(0);
  const [loader, setLoader] = useState<ValueLoader | null>(null);
  const loadRef = useRef<LoadFn | undefined>(loadValues);
  const unitsRef = useRef(units);
  const initialRef = useRef(initialValues);

  useEffect(() => {
    loadRef.current = loadValues;
    unitsRef.current = units;
  });

  // Loader powstaje w efekcie (odporne na podwójny efekt w StrictMode); sprzątanie ignoruje spóźnione odpowiedzi.
  useEffect(() => {
    const created = createValueLoader({
      load: (id) => (loadRef.current ?? ((x) => loadAnyValues(x, { units: unitsRef.current })))(id),
      initialValues: initialRef.current,
      onChange: () => bump((n) => n + 1),
    });
    setLoader(created);
    return () => created.dispose();
  }, []);

  const used = useMemo(() => state.deck.pages.flatMap((p) => p.indicatorIds), [state.deck]);
  useEffect(() => {
    loader?.request(used);
  }, [loader, used]);

  const current = state.deck.pages.find((p) => p.id === state.currentId) ?? state.deck.pages[0];
  const values: Map<string, IndicatorValues> = loader ? loader.values() : new Map(initialValues);
  const status: Map<string, LoadStatus> = loader
    ? loader.statuses()
    : new Map([...initialValues.keys()].map((id): [string, LoadStatus] => [id, 'ready']));

  return {
    deck: state.deck,
    current,
    setCurrent: useCallback((id: string) => dispatch({ type: 'setCurrent', id }), []),
    format: state.format,
    setFormat: useCallback((format: ShareFormatKey) => dispatch({ type: 'setFormat', format }), []),
    theme: state.theme,
    setTheme: useCallback((theme: DeckTheme) => dispatch({ type: 'setTheme', theme }), []),
    numbering: state.numbering,
    addPage: useCallback((kind: PageKind, afterId?: string | null) => dispatch({ type: 'addPage', kind, afterId }), []),
    removePage: useCallback((id: string) => dispatch({ type: 'removePage', id }), []),
    movePage: useCallback((id: string, dir: -1 | 1) => dispatch({ type: 'movePage', id, dir }), []),
    splitPage: useCallback((id: string) => dispatch({ type: 'splitPage', id }), []),
    addIndicator: useCallback((pageId: string, id: string) => dispatch({ type: 'addIndicator', pageId, id }), []),
    removeIndicator: useCallback((pageId: string, id: string) => dispatch({ type: 'removeIndicator', pageId, id }), []),
    replaceIndicator: useCallback((pageId: string, id: string) => dispatch({ type: 'replaceIndicator', pageId, id }), []),
    values,
    status,
  };
}
