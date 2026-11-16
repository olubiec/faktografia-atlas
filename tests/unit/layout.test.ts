import { describe, expect, it } from 'vitest';
import {
  BLOCK_IDS,
  defaultLayout,
  moveBlock,
  parseLayout,
  presetLayout,
  resetLayout,
  serializeLayout,
  toggleBlock,
  visibleIds,
} from '../../src/core/layout/layout';
import { LAYOUT_KEY, loadLayout, saveLayout } from '../../src/core/layout/storage';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = { ...initial };
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => void (data[k] = v),
  } as unknown as Storage;
}

describe('układ: presety', () => {
  it('podstawowy pokazuje kilka bloków, pełny wszystkie', () => {
    expect(visibleIds(presetLayout('podstawowy')).length).toBeGreaterThan(0);
    expect(visibleIds(presetLayout('podstawowy')).length).toBeLessThan(BLOCK_IDS.length);
    expect(visibleIds(presetLayout('pełny'))).toEqual([...BLOCK_IDS]);
  });
  it('domyślny to podstawowy', () => {
    expect(defaultLayout()).toEqual(presetLayout('podstawowy'));
  });
});

describe('układ: move / toggle / reset', () => {
  it('przesuwa blok w dół i w górę', () => {
    const down = moveBlock(defaultLayout(), BLOCK_IDS[0], 1);
    expect(down[1].id).toBe(BLOCK_IDS[0]);
    expect(moveBlock(down, BLOCK_IDS[0], -1)).toEqual(defaultLayout());
  });
  it('na brzegach nie zmienia kolejności i nie mutuje', () => {
    const base = defaultLayout();
    expect(moveBlock(base, BLOCK_IDS[0], -1)).toEqual(base);
    expect(moveBlock(base, BLOCK_IDS[BLOCK_IDS.length - 1], 1)).toEqual(base);
  });
  it('przełącza widoczność bez mutacji', () => {
    const base = defaultLayout();
    const next = toggleBlock(base, 'age');
    expect(next.find((b) => b.id === 'age')?.visible).toBe(true);
    expect(base.find((b) => b.id === 'age')?.visible).toBe(false);
  });
  it('reset wraca do presetu', () => {
    const changed = toggleBlock(moveBlock(defaultLayout(), 'income', -2), 'age');
    expect(resetLayout()).toEqual(defaultLayout());
    expect(resetLayout('pełny')).toEqual(presetLayout('pełny'));
    expect(changed).not.toEqual(defaultLayout());
  });
});

describe('układ: serializacja', () => {
  it('round-trip zachowuje kolejność i widoczność', () => {
    const l = toggleBlock(moveBlock(presetLayout('pełny'), 'ranking', -5), 'housing');
    expect(parseLayout(serializeLayout(l))).toEqual(l);
  });
  it('zapis jest URL-safe', () => {
    expect(serializeLayout(presetLayout('pełny'))).toMatch(/^[a-z.-]+$/);
  });
  it('dopisuje brakujące bloki jako ukryte', () => {
    const l = parseLayout('income.population');
    expect(l).toHaveLength(BLOCK_IDS.length);
    expect(visibleIds(l!)).toEqual(['income', 'population']);
  });
  it.each([null, undefined, '', 'nieznany', 'income.income', 'income..age', 'In come', '<script>'])(
    'odrzuca błędne wejście %s',
    (bad) => {
      expect(parseLayout(bad as string)).toBeNull();
    },
  );
});

describe('układ: localStorage', () => {
  it('zapisuje i odczytuje', () => {
    const s = memoryStorage();
    const l = toggleBlock(defaultLayout(), 'age');
    expect(saveLayout(l, s)).toBe(true);
    expect(loadLayout(s)).toEqual(l);
  });
  it('przy braku lub uszkodzeniu zwraca domyślny', () => {
    expect(loadLayout(memoryStorage())).toEqual(defaultLayout());
    expect(loadLayout(memoryStorage({ [LAYOUT_KEY]: 'śmieci' }))).toEqual(defaultLayout());
    expect(loadLayout(null)).toEqual(defaultLayout());
    expect(saveLayout(defaultLayout(), null)).toBe(false);
  });
});
