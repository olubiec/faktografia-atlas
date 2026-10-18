import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertNoSecret, dataUrl, exists, fixtureName, hasNext, levelsFor, trimYears } from '../../scripts/data/record-bdl.mjs';

describe('scripts/data/record-bdl.mjs (CC6.3c-2)', () => {
  it('buduje adres strony danych z poziomem i stroną', () => {
    const url = new URL(dataUrl(79214, 6, 3));
    expect(url.pathname).toBe('/api/v1/data/by-variable/79214');
    expect(url.searchParams.get('unit-level')).toBe('6');
    expect(url.searchParams.get('page')).toBe('3');
    expect(url.searchParams.get('page-size')).toBe('100');
  });

  it('gminy nagrywa tylko dla wskaźników z minLevel gmi', () => {
    expect(levelsFor({ minLevel: 'gmi' })).toEqual([5, 6]);
    expect(levelsFor({ minLevel: 'pow' })).toEqual([5]);
  });

  it('nazwy plików są stałe i sortowalne', () => {
    expect(fixtureName(79214, 6, 7)).toBe('79214-l6-p007.json');
  });

  it('zostawia 2 ostatnie lata z wartością, nie gubi rekordów ani null w tych latach', () => {
    const page = {
      totalRecords: 2,
      links: { next: 'x' },
      results: [
        { id: 'a', name: 'A', values: [{ year: '2022', val: 1 }, { year: '2023', val: 2 }, { year: '2024', val: 3 }, { year: '2025', val: null }] },
        { id: 'b', name: 'B', values: [] },
      ],
    };
    const out = trimYears(page);
    expect(out.results).toHaveLength(2);
    expect(out.results[0].values.map((v: { year: string }) => v.year)).toEqual(['2023', '2024']);
    expect(out.results[1].values).toEqual([]);
    expect(out.links).toEqual({ next: 'x' });
    expect(out.totalRecords).toBe(2);
  });

  it('rozpoznaje ostatnią stronę', () => {
    expect(hasNext({ links: { next: 'https://…' } })).toBe(true);
    expect(hasNext({ links: {} })).toBe(false);
    expect(hasNext({})).toBe(false);
  });

  it('przerywa, gdy w nagraniu jest klucz', () => {
    expect(() => assertNoSecret('{"a":"SECRET-123"}', 'SECRET-123')).toThrow('klucz API');
    expect(() => assertNoSecret('{"a":1}', 'SECRET-123')).not.toThrow();
  });

  it('exists rozpoznaje nagrane wcześniej pliki (wznowienie po przerwaniu)', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdl-rec-'));
    const file = path.join(dir, fixtureName(1, 6, 0));
    expect(await exists(file)).toBe(false);
    fs.writeFileSync(file, '{}');
    expect(await exists(file)).toBe(true);
  });
});
