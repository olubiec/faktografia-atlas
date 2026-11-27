import { DEFAULT_INDICATOR_ID, DEFAULT_LEVEL, isUnitLevel } from '../map/main-view';
import type { UnitLevel } from '../units/types';
import indicators from '../../../config/indicators.json';

// Stan strony Rankingi zapisany w adresie: ?i=&l=&y=&w=&q=&d=&p=
export type RankingsState = {
  i: string; // wskaźnik
  l: UnitLevel; // poziom
  y: number | null; // rok (null = najnowszy)
  w: string | null; // kod województwa TERYT (null = cała Polska)
  q: string; // szukany tekst
  d: 'high' | 'low'; // kolejność: najwyższe albo najniższe wartości na górze
  p: number; // strona listy (od 1)
};

export const RANKINGS_DEFAULTS: RankingsState = {
  i: DEFAULT_INDICATOR_ID,
  l: DEFAULT_LEVEL,
  y: null,
  w: null,
  q: '',
  d: 'high',
  p: 1,
};

const MAX_QUERY = 60;
const KNOWN_IDS = new Set(indicators.map((ind) => ind.id));
const defaultKnown = (id: string): boolean => KNOWN_IDS.has(id);

/** Odczyt adresu; wartości niepoprawne wracają do domyślnych, nieznane parametry są pomijane. */
export function readRankingsState(
  search: string,
  isKnownIndicator: (id: string) => boolean = defaultKnown,
): RankingsState {
  const p = new URLSearchParams(search);
  const i = p.get('i');
  const l = p.get('l');
  const y = p.get('y');
  const w = p.get('w');
  const year = y !== null && /^\d{4}$/.test(y) ? Number(y) : null;
  return {
    i: i && isKnownIndicator(i) ? i : RANKINGS_DEFAULTS.i,
    l: isUnitLevel(l) ? l : RANKINGS_DEFAULTS.l,
    y: year !== null && year >= 1900 && year <= 2100 ? year : null,
    w: w !== null && /^\d{2}$/.test(w) ? w : null,
    q: (p.get('q') ?? '').trim().slice(0, MAX_QUERY).trim(),
    d: p.get('d') === 'low' ? 'low' : 'high',
    p: /^\d{1,4}$/.test(p.get('p') ?? '') && Number(p.get('p')) >= 1 ? Number(p.get('p')) : 1,
  };
}

/** Zapis do adresu (z „?”): tylko wartości różne od domyślnych, w kolejności i, l, y, w, q. */
export function writeRankingsSearch(state: RankingsState): string {
  const d = RANKINGS_DEFAULTS;
  const p = new URLSearchParams();
  if (state.i !== d.i) p.set('i', state.i);
  if (state.l !== d.l) p.set('l', state.l);
  if (state.y !== d.y) p.set('y', String(state.y));
  if (state.w !== d.w && state.w !== null) p.set('w', state.w);
  if (state.q !== d.q) p.set('q', state.q);
  if (state.d !== d.d) p.set('d', state.d);
  if (state.p !== d.p) p.set('p', String(state.p));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Zmiana stanu: nowy wskaźnik lub poziom zeruje rok; poziom „woj” zeruje też województwo. */
export function applyRankingsChange(prev: RankingsState, patch: Partial<RankingsState>): RankingsState {
  const next = { ...prev, ...patch };
  const changed = (patch.i !== undefined && patch.i !== prev.i) || (patch.l !== undefined && patch.l !== prev.l);
  if (changed && patch.y === undefined) next.y = null;
  // Każda zmiana filtra (poza samym numerem strony) wraca na pierwszą stronę.
  if (patch.p === undefined) next.p = 1;
  if (patch.l !== undefined && patch.l !== prev.l && next.l === 'woj' && patch.w === undefined) next.w = null;
  return next;
}
