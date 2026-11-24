import { describe, expect, it } from 'vitest';
import { buildAvailable, withRegionalVariables } from '../../scripts/data/library-available.mjs';
import { buildIndex } from '../../scripts/data/library-index.mjs';

// Wskaźniki podawane przez GUS tylko dla województw (poziom 2–4) nie są w index.json,
// ale robot je pobiera – spis wyboru na stronie musi je zawierać (poziom „woj”).
const catalog = {
  subjects: {
    P1: { name: 'Rynek pracy', parent: null },
    P2: { name: 'Przeciętne wynagrodzenie', parent: 'P1' },
  },
  variables: {
    10: { id: 10, subjectId: 'P2', n1: 'ogółem', level: 3, unit: 'zł' },
    11: { id: 11, subjectId: 'P2', n1: 'kobiety', level: 6, unit: 'osoba' },
    12: { id: 12, subjectId: 'P2', n1: 'Polska', level: 0, unit: 'zł' },
  },
};

describe('Spis wyboru: wskaźniki tylko wojewódzkie', () => {
  it('dokłada zmienne poziomu 2–4 z katalogu, pomija dane tylko dla Polski', () => {
    const index = withRegionalVariables(buildIndex(catalog, { done: {} }), catalog);
    expect(index.variables.map((v: { id: number }) => v.id)).toEqual([11, 10]);
    const regional = index.variables.find((v: { id: number }) => v.id === 10);
    expect(index.units[regional.u]).toBe('zł');
  });

  it('plik tylko z województwami trafia do available.json jako „woj”', () => {
    const index = withRegionalVariables(buildIndex(catalog, { done: {} }), catalog);
    const file = { v: '10', l3: { y: [2022, 2023], d: { '020000000000': [1, 2] } } };
    const [v] = buildAvailable(index, [file]).variables;
    expect(v).toMatchObject({ id: '10', n: 'ogółem', u: 'zł', lv: ['woj'], y: [2022, 2023] });
    expect(v.c).toBe('Rynek pracy > Przeciętne wynagrodzenie');
  });

  it('wskaźnik z lukami w gminach zostaje: pokazujemy poziomy, które mają dane', () => {
    const index = withRegionalVariables(buildIndex(catalog, { done: {} }), catalog);
    const file = {
      v: '11',
      l3: { y: [2023], d: { a: [1] } },
      l5: { y: [2023], d: { b: [1] } },
      l6: { y: [2023], d: {} },
    };
    expect(buildAvailable(index, [file]).variables[0].lv).toEqual(['woj', 'pow']);
  });

  it('nie zmienia spisu wejściowego', () => {
    const base = buildIndex(catalog, { done: {} });
    const before = JSON.stringify(base);
    withRegionalVariables(base, catalog);
    expect(JSON.stringify(base)).toBe(before);
  });
});
