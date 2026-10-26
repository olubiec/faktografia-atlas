import { describe, expect, it } from 'vitest';
import * as lib from '../../scripts/data/library-lib.mjs';

describe('Biblioteka GUS – robot pobierania', () => {
  it('budżet zatrzymuje start zmiennej, gdy zostaje mniej zapytań niż potrzeba', () => {
    const b = lib.createBudget(100, 45);
    expect(b.canStartVariable()).toBe(true);
    for (let i = 0; i < 60; i++) b.spend();
    expect(b.canStartVariable()).toBe(false);
    expect(b.left).toBe(40);
  });

  it('pomija zmienne bez danych powiatowych i stawia gminne na początku kolejki', () => {
    const q = lib.sortQueue([
      { id: 3, level: 5 },
      { id: 2, level: 2 },
      { id: 9, level: 6 },
      { id: 1, level: 5 },
    ]);
    expect(q.map((v: { id: number }) => v.id)).toEqual([9, 1, 3]);
    expect(lib.levelsForVariable({ level: 6 })).toEqual([5, 6]);
    expect(lib.levelsForVariable({ level: 5 })).toEqual([5]);
    expect(lib.levelsForVariable({ level: 3 })).toEqual([]);
  });

  it('zwija strony odpowiedzi do lat i wartości po jednostce (kody TERYT jako tekst)', () => {
    const out = lib.compactPages([
      { results: [{ id: '012465101000', values: [{ year: '2022', val: 5 }, { year: '2023', val: 6 }] }] },
      { results: [{ id: '012465102000', values: [{ year: '2023', val: 7 }, { year: '2022', val: null }] }] },
    ]);
    expect(out.y).toEqual(['2022', '2023']);
    expect(out.d['012465101000']).toEqual([5, 6]);
    expect(out.d['012465102000']).toEqual([null, 7]);
  });

  it('buduje ścieżki kategorii z drzewa działów', () => {
    const c = lib.emptyCatalog();
    lib.addSubject(c, { id: 'K3', name: 'Rynek pracy' }, null);
    lib.addSubject(c, { id: 'G9', name: 'Bezrobocie' }, 'K3');
    expect(c.subjects.G9.path).toEqual(['Rynek pracy', 'Bezrobocie']);
  });

  it('zapisuje n1–n5 dla zmiennej w katalogu z pominięciem pustych członów', () => {
    const rawVars = [
      { id: 60614, subjectId: 'P2137', n1: 'Ludność', n2: 'w wieku produkcyjnym', n3: 'wiek mobilny', n4: 'mężczyźni', n5: '', level: 6, measureUnitName: 'osoby' },
      { id: 60615, subjectId: 'P2137', n1: 'Ludność', n2: 'w wieku produkcyjnym', n3: 'wiek mobilny', n4: 'kobiety', n5: undefined, level: 6, measureUnitName: 'osoby' },
    ];

    const catalogVars = {};
    for (const v of rawVars) {
      const item: Record<string, unknown> = {
        id: v.id,
        subjectId: v.subjectId,
        level: v.level,
        unit: v.measureUnitName,
      };
      for (const k of ['n1', 'n2', 'n3', 'n4', 'n5'] as const) {
        if (typeof v[k] === 'string' && v[k]!.trim().length > 0) {
          item[k] = v[k];
        }
      }
      catalogVars[v.id] = item;
    }

    expect(catalogVars[60614]).toEqual({
      id: 60614,
      subjectId: 'P2137',
      level: 6,
      unit: 'osoby',
      n1: 'Ludność',
      n2: 'w wieku produkcyjnym',
      n3: 'wiek mobilny',
      n4: 'mężczyźni',
    });
    expect(catalogVars[60614]).not.toHaveProperty('n5');
  });
});
