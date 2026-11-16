import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { prepareLibraryIndex } from '../../src/core/library/index-contract';
import {
  countByCategory,
  emptyQuery,
  filterVars,
  type LibraryIndex,
} from '../../src/core/library/query';
import indexFixture from '../fixtures/library/index.json' with { type: 'json' };

function lineCount(rel: string): number {
  return readFileSync(path.resolve(process.cwd(), rel), 'utf8').split('\n').length;
}

describe('Podział src/core/library/query.ts (N-20)', () => {
  const index = prepareLibraryIndex(indexFixture) as LibraryIndex;

  it('query.ts i query-index.ts mają po najwyżej 220 linii', () => {
    expect(lineCount('src/core/library/query.ts')).toBeLessThanOrEqual(220);
    expect(lineCount('src/core/library/query-index.ts')).toBeLessThanOrEqual(220);
  });

  it('query.ts nadal eksportuje wszystkie dotychczasowe funkcje', async () => {
    const mod = await import('../../src/core/library/query');
    for (const name of ['emptyQuery', 'childCategories', 'categoryPath', 'filterVars', 'countByCategory']) {
      expect(Object.keys(mod)).toContain(name);
    }
  });

  it('wyszukiwanie bez polskich znaków znajduje „Ludność” w nazwie', () => {
    const res = filterVars(index, { ...emptyQuery(), text: 'ludnosc' });
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((v) => v.name.includes('Ludność'))).toBe(true);
  });

  it('filtr gmin pomija wskaźniki tylko powiatowe', () => {
    const all = filterVars(index, emptyQuery());
    const gminy = filterVars(index, { ...emptyQuery(), level: 6 });
    expect(gminy.length).toBeGreaterThan(0);
    expect(gminy.length).toBeLessThan(all.length);
    expect(gminy.map((v) => v.id)).not.toContain('101'); // 101 jest tylko powiatowy (l: 5)
    expect(gminy.map((v) => v.id)).toContain('102');
  });

  it('suma countByCategory dla kategorii najwyższego poziomu = liczba wyników pustego zapytania', () => {
    const counts = countByCategory(index, emptyQuery());
    // Kategorie główne to te bez rodzica; zmienne leżą w podkategoriach,
    // a licznik kategorii nadrzędnej obejmuje zmienne podkategorii.
    const roots = Object.values(index.categories as Record<string, { id: string; parent?: string | null }>)
      .filter((c) => !c.parent)
      .map((c) => c.id);
    const sum = roots.reduce((acc, id) => acc + (counts[id] ?? 0), 0);
    expect(sum).toBe(filterVars(index, emptyQuery()).length);
  });
});
