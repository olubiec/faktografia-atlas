import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { fallbackLevel, levelsWithData } from '../../src/core/map/level-data';
import { LevelSwitch } from '../../src/view/main/LevelSwitch';
import fixture from '../fixtures/synthetic/values-sample.json' with { type: 'json' };

const disabled = (html: string) => [...html.matchAll(/<button[^>]*disabled[^>]*>([^<]*)</g)].map((m) => m[1]);

// Wskaźnik z wartościami tylko dla województw i powiatów; w 2023 gminy mają same braki.
const values = {
  years: [2023, 2024],
  values: {
    '02': [1, 2],
    '0201': [3, 4],
    '0201011': [null, null],
    '0201021': [null, 5],
  },
};

describe('UI-FIX 3: poziomy bez danych', () => {
  it('levelsWithData: poziom bez żadnej wartości w roku odpada', () => {
    expect(levelsWithData(values, 2023)).toEqual(['woj', 'pow']);
    expect(levelsWithData(values, 2024)).toEqual(['woj', 'pow', 'gmi']);
    expect(levelsWithData(null, 2024)).toEqual([]);
  });

  it('działa na danych z tests/fixtures', () => {
    const v = fixture as unknown as Parameters<typeof levelsWithData>[0];
    expect(levelsWithData(v, null).length).toBeGreaterThan(0);
  });

  it('fallbackLevel: pusty poziom wraca do najbliższego z danymi', () => {
    expect(fallbackLevel('gmi', ['woj', 'pow'])).toBe('pow');
    expect(fallbackLevel('woj', ['pow'])).toBe('pow');
    expect(fallbackLevel('pow', ['woj', 'pow'])).toBe('pow');
    expect(fallbackLevel('gmi', [])).toBe('gmi');
  });

  it('LevelSwitch wyłącza przycisk poziomu bez danych, nawet gdy minLevel go dopuszcza', () => {
    const html = renderToStaticMarkup(
      <LevelSwitch value="pow" minLevel="gmi" withData={levelsWithData(values, 2023)} onChange={vi.fn<() => void>()} />
    );
    expect(disabled(html)).toEqual(['Gminy']);
  });
});
