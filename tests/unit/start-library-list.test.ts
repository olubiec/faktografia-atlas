import { describe, expect, it } from 'vitest';
import { listView } from '../../src/core/start/discoveries';
import { libraryLevel, libraryList } from '../../src/core/start/library-list';
import type { IndicatorValues } from '../../src/core/profile/profile';

// Zestawienie 5 + 5 dla wskaźnika wybranego z biblioteki (liczone w przeglądarce).
const gminas = Array.from({ length: 20 }, (_, k) => ({ teryt: `20000${String(k).padStart(2, '0')}`, name: `Gmina ${k}`, level: 'gmi' as const }));
const powiats = [{ teryt: '2001', name: 'Powiat A', level: 'pow' as const }, { teryt: '2002', name: 'Powiat B', level: 'pow' as const }];
const units = [...gminas, ...powiats];
const IND = { id: 'b123', name: 'Liczba przychodni', unit: 'szt.' };
const series = (rows: Record<string, (number | null)[]>, years = [2023, 2024, 2025]): IndicatorValues => ({ indicatorId: 'b123', years, values: rows, fetchedAt: '' });
const rowsFor = (f: (k: number) => (number | null)[]) => Object.fromEntries(gminas.map((g, k) => [g.teryt, f(k)]));

describe('libraryList', () => {
  it('zwraca 5 najwyższych i 5 najniższych z ostatniego roku, w kształcie zestawienia redakcyjnego', () => {
    const values = series(rowsFor((k) => [k, k, k * 10]));
    const list = libraryList({ indicator: IND, values, units, small: new Set() })!;
    expect(list).toMatchObject({ indicatorId: 'b123', level: 'gmi', dir: 1, year: 2025, i: ['Liczba przychodni', 'szt.'] });
    expect(list.top.map((r) => r[2])).toEqual([190, 180, 170, 160, 150]);
    expect(list.bottom!.map((r) => r[2])).toEqual([0, 10, 20, 30, 40]);
    // listView (widok startu) przyjmuje go bez zmian: oba końce skali i link do mapy z id biblioteki.
    const view = listView(list)!;
    expect(view.title).toBe('Liczba przychodni');
    expect(view.ends?.high.rows).toHaveLength(5);
    expect(view.ends?.low.rows).toHaveLength(5);
    expect(view.href).toContain('i=b123');
  });

  it('pomija gminy z listy małych gmin (gmina-small.json)', () => {
    const values = series(rowsFor((k) => [k, k, k]));
    const small = new Set([gminas[19]!.teryt, gminas[0]!.teryt]);
    const list = libraryList({ indicator: IND, values, units, small })!;
    expect(list.top.map((r) => r[0])).not.toContain(gminas[19]!.teryt);
    expect(list.top[0]![2]).toBe(18);
    expect(list.bottom![0]![2]).toBe(1);
  });

  it('wybiera ostatni rok, w którym dane ma co najmniej połowa jednostek poziomu', () => {
    // 2025: tylko 3 gminy z 20 (za mało), 2024: wszystkie.
    const values = series(rowsFor((k) => [k, k + 100, k < 3 ? 999 : null]));
    const list = libraryList({ indicator: IND, values, units, small: new Set() })!;
    expect(list.year).toBe(2024);
    expect(list.top[0]![2]).toBe(119);
    expect(libraryList({ indicator: IND, values: series(rowsFor((k) => [null, null, k < 3 ? 1 : null])), units, small: new Set() })).toBeNull();
  });

  it('remisy: kolejność po kodzie TERYT, tak jak w zestawieniach robota', () => {
    const values = series(rowsFor(() => [5, 5, 5]));
    const list = libraryList({ indicator: IND, values, units, small: new Set() })!;
    expect(list.top.map((r) => r[0])).toEqual(gminas.slice(0, 5).map((g) => g.teryt));
    expect(list.bottom!.map((r) => r[0])).toEqual(gminas.slice(0, 5).map((g) => g.teryt));
  });

  it('wskaźnik tylko z danymi powiatów dostaje poziom powiatów, a bez żadnych danych nie ma zestawienia', () => {
    const pow = series({ '2001': [1, 2, 3], '2002': [4, 5, 6] });
    expect(libraryLevel(pow, units)).toBe('pow');
    const list = libraryList({ indicator: IND, values: pow, units, small: new Set() })!;
    expect(list.level).toBe('pow');
    expect(list.top.map((r) => r[1])).toEqual(['Powiat B', 'Powiat A']);
    expect(libraryList({ indicator: IND, values: series({}), units: gminas, small: new Set() })).toBeNull();
  });
});
