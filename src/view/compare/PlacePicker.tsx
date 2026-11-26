import { useEffect, useMemo, useState } from 'react';
import { Xmark } from 'iconoir-react';
import { Icon } from '@/view/ui/Icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadSearchIndex, useSearch } from '@/view/search/useSearch';
import { loadLocalities } from '@/core/search/load-localities';
import { searchLocalities, type LocalitySearchResult } from '@/core/search/localities';
import { isCityCounty, unitLabel } from '@/core/units/label';
import { unitKindInfo } from '@/core/units/kinds';
import type { Locality, SearchResult } from '@/core/search';
import type { Unit } from '@/core/units/types';

const MAX_OPTIONS = 8;

export interface PickerOption {
  key: string;
  /** Zawsze TERYT jednostki (dla miejscowości – jej gminy). */
  teryt: string;
  name: string;
  detail: string;
  badge: string;
}

export interface PickerState {
  query: string;
  open: boolean;
  active: number;
}

/** Podpowiedzi: jednostki, potem miejscowości; bez wykluczonego miejsca; najwyżej 8. */
function buildOptions(
  units: SearchResult[],
  localities: LocalitySearchResult[],
  unitsMap: Map<string, Unit>,
  excludeTeryt?: string | null
): PickerOption[] {
  const fromUnits = units.map((u): PickerOption => {
    const full = unitsMap.get(u.teryt);
    return { key: `unit:${u.teryt}`, teryt: u.teryt, name: full ? unitLabel(full) : u.name, detail: [u.context, full ? unitKindInfo(full)?.tagline : undefined].filter(Boolean).join(' · '), badge: u.label };
  });
  const fromLocalities = localities.map((l): PickerOption => ({
    key: `loc:${l.id}`, teryt: l.gminaTeryt, name: l.name, detail: l.context, badge: l.type || 'miejscowość',
  }));
  return [...fromUnits, ...fromLocalities].filter((o) => o.teryt !== excludeTeryt).slice(0, MAX_OPTIONS);
}

/** Nazwa wybranego miejsca z rodzajem, np. „Kraków (powiat grodzki)”. */
function selectedLabel(unit: Unit | undefined, teryt: string): string {
  if (!unit) return teryt;
  if (unit.level === 'pow') return `${unit.name} (${isCityCounty(unit.teryt) ? 'powiat grodzki' : 'powiat'})`;
  return unitLabel(unit);
}

/** Obsługa klawiatury jako czysta funkcja: ↓/↑, Enter, Escape, Tab. */
function reduceKey(
  state: PickerState,
  key: string,
  options: PickerOption[]
): { state: PickerState; selected?: string } {
  const n = options.length;
  if (key === 'ArrowDown' && n) return { state: { ...state, open: true, active: state.open ? (state.active + 1) % n : 0 } };
  if (key === 'ArrowUp' && n) return { state: { ...state, open: true, active: (state.active - 1 + n) % n } };
  if (key === 'Enter' && state.open && options[state.active]) {
    return { state: { ...state, open: false }, selected: options[state.active].teryt };
  }
  if (key === 'Escape' || key === 'Tab') return { state: { ...state, open: false } };
  return { state };
}

export interface PlacePickerViewProps {
  label: string;
  id: string;
  placeholder?: string;
  state: PickerState;
  options: PickerOption[];
  ready: boolean;
  value: string | null;
  valueLabel: string;
  onQuery: (q: string) => void;
  onClear: () => void;
  onPick: (teryt: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function PlacePickerView(p: PlacePickerViewProps) {
  const listId = `${p.id}-list`;
  const showList = p.state.open && p.state.query.trim().length >= 2;
  const hasOptions = p.options.length > 0;
  return (
    <div className="relative flex flex-col gap-2 w-full">
      <Label htmlFor={p.id}>{p.label}</Label>
      {p.value ? (
        <div className="flex items-center min-h-[44px] border border-tusz bg-arkusz">
          <span id={p.id} title={p.valueLabel} className="flex-1 min-w-0 truncate px-3 text-tusz">{p.valueLabel}</span>
          <button
            type="button"
            aria-label={`Wyczyść ${p.label}`}
            onClick={p.onClear}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tusz hover:bg-linia/20 cursor-pointer border-0 rounded-none"
          >
            <Icon icon={Xmark} aria-hidden={true} size={20} />
          </button>
        </div>
      ) : (
        <>
          <Input
            id={p.id}
            role="combobox"
            aria-expanded={showList && hasOptions}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && hasOptions ? `${p.id}-opt-${p.state.active}` : undefined}
            autoComplete="off"
            className="transition-none"
            placeholder={p.placeholder ?? 'Gmina, powiat albo miejscowość'}
            value={p.state.query}
            onChange={(e) => p.onQuery(e.target.value)}
            onKeyDown={p.onKeyDown}
          />
          <ul
            id={listId}
            role="listbox"
            aria-label={p.label}
            hidden={!(showList && hasOptions)}
            className="absolute top-full left-0 right-0 z-10 m-0 p-0 list-none bg-arkusz border border-tusz"
          >
            {p.options.map((o, i) => (
              <li
                key={o.key}
                id={`${p.id}-opt-${i}`}
                role="option"
                aria-selected={i === p.state.active}
                title={`${o.name}, ${o.detail}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => p.onPick(o.teryt)}
                className={`flex items-center justify-between gap-2 px-3 min-h-[44px] cursor-pointer text-tusz ${i === p.state.active ? 'bg-linia/20' : ''}`}
              >
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-[600] leading-tight [overflow-wrap:normal] [word-break:normal] hyphens-none">{o.name}</span>
                  {o.detail && <span className="text-xs text-olowek [overflow-wrap:normal] [word-break:normal] hyphens-none">{o.detail}</span>}
                </span>
                <span className="shrink-0 whitespace-nowrap border border-linia bg-kalka px-2 text-xs text-olowek">{o.badge}</span>
              </li>
            ))}
          </ul>
          {showList && !hasOptions && p.ready && (
            <div role="status" className="px-3 py-2 text-sm text-olowek">Nie znaleźliśmy takiego miejsca</div>
          )}
        </>
      )}
    </div>
  );
}

export interface PlacePickerProps {
  label: string;
  value: string | null;
  onChange: (teryt: string | null) => void;
  excludeTeryt?: string | null;
  placeholder?: string;
  id?: string;
}

export function PlacePicker({ label, value, onChange, excludeTeryt, placeholder, id = 'place-picker' }: PlacePickerProps) {
  const [state, setState] = useState<PickerState>({ query: '', open: false, active: 0 });
  const [unitsMap, setUnitsMap] = useState<Map<string, Unit>>(new Map());
  const [localities, setLocalities] = useState<Locality[]>([]);
  const { results, ready } = useSearch(state.query, MAX_OPTIONS + 4);

  useEffect(() => {
    let cancelled = false;
    loadSearchIndex().then((idx) => !cancelled && setUnitsMap(idx.unitsMap)).catch(() => {});
    loadLocalities().then((l) => !cancelled && setLocalities(l));
    return () => { cancelled = true; };
  }, []);

  const options = useMemo(() => {
    const locs = state.query.trim().length >= 2 && localities.length
      ? searchLocalities(state.query, localities, unitsMap, { limit: MAX_OPTIONS + 4 })
      : [];
    return buildOptions(results, locs, unitsMap, excludeTeryt);
  }, [results, localities, unitsMap, state.query, excludeTeryt]);

  const pick = (teryt: string) => {
    setState({ query: '', open: false, active: 0 });
    onChange(teryt);
  };

  return (
    <PlacePickerView
      label={label}
      id={id}
      placeholder={placeholder}
      state={state}
      options={options}
      ready={ready}
      value={value}
      valueLabel={value ? selectedLabel(unitsMap.get(value), value) : ''}
      onQuery={(query) => setState({ query, open: true, active: 0 })}
      onClear={() => onChange(null)}
      onPick={pick}
      onKeyDown={(e) => {
        const r = reduceKey(state, e.key, options);
        if (e.key !== 'Tab' && r.state !== state) e.preventDefault();
        setState(r.state);
        if (r.selected) pick(r.selected);
      }}
    />
  );
}

// Czyste funkcje dostępne dla testów (środowisko testów bez DOM).
PlacePicker.logic = { buildOptions, reduceKey, selectedLabel };
