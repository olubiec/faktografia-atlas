import { useEffect, useMemo, useState } from 'react';
import { PlacePicker, PlacePickerView, type PickerState } from '@/view/compare/PlacePicker';
import { loadSearchIndex } from '@/view/search/useSearch';
import { loadLocalities } from '@/core/search/load-localities';
import { buildLocalitiesIndex, searchLocalities, type LocalitiesIndex } from '@/core/search/localities';
import { search, type SearchIndex } from '@/core/search';
import { PLACE_INPUT_ID, PLACE_LABEL, PLACE_PLACEHOLDER, type PlaceSearchProps } from './PlaceSearch';

const MAX = 8;
const { buildOptions, reduceKey } = PlacePicker.logic;

/**
 * Działająca szukajka „Wpisz miejscowość” (ta sama co w porównaniu: jednostki + miejscowości → gmina).
 * Kod i dane (lista jednostek, miejscowości) ładują się dopiero po fokusie na polu – patrz PlaceSearch.tsx.
 */
export default function PlaceSearchLive({ onPick, initialQuery = '' }: PlaceSearchProps & { initialQuery?: string }) {
  const [state, setState] = useState<PickerState>({ query: initialQuery, open: initialQuery.length > 0, active: 0 });
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [locIndex, setLocIndex] = useState<LocalitiesIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Pole zastąpiło zwykłe pole z PlaceSearch: fokus i kursor zostają w nim.
  useEffect(() => {
    const el = document.getElementById(PLACE_INPUT_ID) as HTMLInputElement | null;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const units = loadSearchIndex();
    units.then((idx) => !cancelled && setIndex(idx)).catch(() => !cancelled && setFailed(true));
    // Indeks miejscowości budujemy raz (a nie przy każdej literze).
    Promise.all([units, loadLocalities()])
      .then(([idx, locs]) => !cancelled && setLocIndex(buildLocalitiesIndex(locs, idx.unitsMap)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const options = useMemo(() => {
    const q = state.query.trim();
    if (q.length < 2 || !index) return [];
    const units = search(index, q, { limit: MAX + 4 });
    const locs = locIndex ? searchLocalities(q, locIndex, undefined, { limit: MAX + 4 }) : [];
    return buildOptions(units, locs, index.unitsMap);
  }, [index, locIndex, state.query]);

  const pick = (teryt: string) => {
    setState({ query: '', open: false, active: 0 });
    onPick(teryt, index?.unitsMap.get(teryt)?.name ?? '');
  };

  // Po błędzie sieci kolejny fokus na polu próbuje jeszcze raz.
  const retry = () => {
    if (!failed) return;
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  return (
    <div onFocus={retry} className="flex flex-col gap-2">
      <PlacePickerView
        label={PLACE_LABEL}
        id={PLACE_INPUT_ID}
        placeholder={PLACE_PLACEHOLDER}
        state={state}
        options={options}
        ready={index !== null}
        value={null}
        valueLabel=""
        onQuery={(query) => setState({ query, open: true, active: 0 })}
        onClear={() => undefined}
        onPick={pick}
        onKeyDown={(e) => {
          const r = reduceKey(state, e.key, options);
          if (e.key !== 'Tab' && r.state !== state) e.preventDefault();
          setState(r.state);
          if (r.selected) pick(r.selected);
        }}
      />
      {failed && <p role="status" className="m-0 text-sm text-olowek">Nie udało się wczytać listy miejsc. Sprawdź połączenie i spróbuj ponownie.</p>}
    </div>
  );
}
