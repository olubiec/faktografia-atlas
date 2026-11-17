import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  INDICATOR_CATEGORIES,
  CATEGORY_NAMES,
  OTHER_CATEGORY,
  categoryOf,
  indicatorsInCategory,
  toggleSelection,
} from '../../src/core/indicators/categories';

const indicators: { id: string }[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'config/indicators.json'), 'utf8')
);

describe('kategorie wskaźników', () => {
  it('zawiera wymagane kategorie, a „Inne” jest ostatnia', () => {
    expect(CATEGORY_NAMES).toEqual(['Ludność', 'Rynek pracy', 'Demografia', 'Wiek', 'Migracje', 'Inne']);
  });

  it('każdy wskaźnik jest w dokładnie jednej kategorii', () => {
    for (const ind of indicators) {
      const hits = CATEGORY_NAMES.filter((n) => indicatorsInCategory(indicators, n).includes(ind));
      expect({ id: ind.id, hits }).toEqual({ id: ind.id, hits: [categoryOf(ind.id)] });
    }
  });

  it('żaden id nie występuje w konfiguracji dwa razy ani nie jest nieznany', () => {
    const all = INDICATOR_CATEGORIES.flatMap((c) => c.ids);
    expect(new Set(all).size).toBe(all.length);
    const known = new Set(indicators.map((i) => i.id));
    for (const id of all) expect({ id, known: known.has(id) }).toEqual({ id, known: true });
  });

  it('wskaźnik bez kategorii trafia do „Inne”', () => {
    expect(categoryOf('avg-wage')).toBe(OTHER_CATEGORY);
    expect(categoryOf('nieznany')).toBe(OTHER_CATEGORY);
    expect(categoryOf('median-age')).toBe('Wiek');
  });

  it('toggleSelection dodaje i usuwa bez mutowania', () => {
    const a: string[] = [];
    const b = toggleSelection(a, 'population');
    expect(b).toEqual(['population']);
    expect(a).toEqual([]);
    expect(toggleSelection(b, 'population')).toEqual([]);
  });
});
