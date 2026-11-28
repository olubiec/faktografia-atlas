import { describe, expect, it } from 'vitest';
import { listView } from '../../src/core/start/discoveries';
import { libraryList } from '../../src/core/start/library-list';
import type { IndicatorValues } from '../../src/core/profile/profile';

// Przełącznik poziomu w zestawieniach na starcie: ten sam wskaźnik policzony dla wskazanego poziomu.
const gminas = Array.from({ length: 12 }, (_, k) => ({ teryt: `20000${String(k).padStart(2, '0')}`, name: `Gmina ${k}`, level: 'gmi' as const }));
const powiats = Array.from({ length: 8 }, (_, k) => ({ teryt: `20${String(k).padStart(2, '0')}`, name: `Powiat ${k}`, level: 'pow' as const }));
const wojs = Array.from({ length: 6 }, (_, k) => ({ teryt: `0${k + 1}`.padStart(2, '0'), name: `Woj. ${k}`, level: 'woj' as const }));
const units = [...gminas, ...powiats, ...wojs];
const IND = { id: 'b9', name: 'Liczba kin', unit: 'szt.' };
const values: IndicatorValues = {
  indicatorId: 'b9',
  years: [2024],
  values: Object.fromEntries(units.map((u, k) => [u.teryt, [k]])),
  fetchedAt: '',
};

describe('libraryList z wybranym poziomem', () => {
  it.each(['gmi', 'pow', 'woj'] as const)('liczy zestawienie dla poziomu %s i oznacza go w widoku', (level) => {
    const list = libraryList({ indicator: IND, values, units, small: new Set(), level })!;
    expect(list.level).toBe(level);
    const names = new Set(units.filter((u) => u.level === level).map((u) => u.name));
    for (const row of list.top) expect(names.has(row[1])).toBe(true);
    const view = listView(list)!;
    expect(view.level).toBe(level);
    expect(view.indicatorId).toBe('b9');
    expect(view.href).toContain(`l=${level}`);
  });

  it('bez wskazanego poziomu wybiera domyślny, a z nim te same wiersze co jawnie podany', () => {
    const auto = libraryList({ indicator: IND, values, units, small: new Set() })!;
    const same = libraryList({ indicator: IND, values, units, small: new Set(), level: auto.level })!;
    expect(same.top).toEqual(auto.top);
  });
});
