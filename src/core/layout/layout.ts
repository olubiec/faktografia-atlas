// Czysty model układu strony i grafiki do pobrania: lista bloków z widocznością.

export const BLOCK_IDS = [
  'population',
  'density',
  'age',
  'income',
  'unemployment',
  'housing',
  'budget',
  'ranking',
  'comparison',
] as const;

export type BlockId = (typeof BLOCK_IDS)[number];

export interface LayoutBlock {
  id: BlockId;
  visible: boolean;
}

export type Layout = LayoutBlock[];

export type PresetName = 'podstawowy' | 'pełny';

const BASIC_VISIBLE: readonly BlockId[] = ['population', 'density', 'income'];

/** Domyślne układy: podstawowy pokazuje kilka bloków, pełny wszystkie. */
export function presetLayout(name: PresetName): Layout {
  return BLOCK_IDS.map((id) => ({
    id,
    visible: name === 'pełny' || BASIC_VISIBLE.includes(id),
  }));
}

export const DEFAULT_LAYOUT_NAME: PresetName = 'podstawowy';

export function defaultLayout(): Layout {
  return presetLayout(DEFAULT_LAYOUT_NAME);
}

/** Przesuwa blok o `delta` miejsc (−1 w górę, +1 w dół); poza zakresem zwraca kopię bez zmian. */
export function moveBlock(layout: Layout, id: BlockId, delta: number): Layout {
  const from = layout.findIndex((b) => b.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= layout.length) return layout.map((b) => ({ ...b }));
  const next = layout.map((b) => ({ ...b }));
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function toggleBlock(layout: Layout, id: BlockId): Layout {
  return layout.map((b) => (b.id === id ? { ...b, visible: !b.visible } : { ...b }));
}

export function resetLayout(name: PresetName = DEFAULT_LAYOUT_NAME): Layout {
  return presetLayout(name);
}

/** Tylko widoczne bloki, w kolejności układu (to czyta też grafika do pobrania). */
export function visibleIds(layout: Layout): BlockId[] {
  return layout.filter((b) => b.visible).map((b) => b.id);
}

/**
 * Zapis URL-safe: bloki oddzielone kropką w kolejności układu, ukryty ma prefiks `-`.
 * Np. `population.-density.income`.
 */
export function serializeLayout(layout: Layout): string {
  return layout.map((b) => (b.visible ? b.id : `-${b.id}`)).join('.');
}

function isBlockId(value: string): value is BlockId {
  return (BLOCK_IDS as readonly string[]).includes(value);
}

/**
 * Parsuje zapis; zwraca null przy błędzie (nieznany blok, duplikat, zły znak).
 * Brakujące bloki są dopisywane na końcu jako ukryte, więc nowe bloki nie psują starych linków.
 */
export function parseLayout(input: string | null | undefined): Layout | null {
  if (typeof input !== 'string' || input.length === 0 || input.length > 500) return null;
  if (!/^[a-z.-]+$/.test(input)) return null;
  const seen = new Set<BlockId>();
  const result: Layout = [];
  for (const part of input.split('.')) {
    const visible = !part.startsWith('-');
    const id = visible ? part : part.slice(1);
    if (!isBlockId(id) || seen.has(id)) return null;
    seen.add(id);
    result.push({ id, visible });
  }
  for (const id of BLOCK_IDS) {
    if (!seen.has(id)) result.push({ id, visible: false });
  }
  return result;
}
