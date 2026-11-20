import { describe, expect, it } from 'vitest';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import {
  BASIC_GROUP,
  buildCatalogTree,
  searchCatalog,
  stem,
  titleCase,
  treeStats,
} from '../../src/core/catalog/prototype-tree';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const MAIN = indicatorsData as Indicator[];

// Mały spis w kształcie available.json (nagrany kształt: ścieżka „DZIAŁ > GRUPA > TEMAT”).
const v = (id: string, n: string, c: string, lv: ('pow' | 'gmi')[] = ['pow', 'gmi']) => ({
  id, n, u: 'osoba', c, lv, y: [2022, 2023],
});
const AVAILABLE: AvailableFile = {
  version: 1,
  variables: [
    v('1', 'ogółem', 'LUDNOŚĆ > STAN LUDNOŚCI > Ludność wg płci'),
    v('2', 'kobiety', 'LUDNOŚĆ > STAN LUDNOŚCI > Ludność wg płci'),
    v('3', 'ogółem', 'SZKOLNICTWO > DANE ARCHIWALNE > Uczniowie'),
    v('4', 'ogółem', 'SZKOLNICTWO > SZKOLNICTWO PODSTAWOWE > Szkoły podstawowe', ['gmi']),
    v('5', 'uczniowie', 'SZKOLNICTWO > SZKOLNICTWO PODSTAWOWE > Szkoły podstawowe'),
    v('6', 'ogółem', 'KULTURA  > BIBLIOTEKI > Biblioteki publiczne'),
    v('7', 'lekarze', 'OCHRONA ZDROWIA, OPIEKA SPOŁECZNA > AMBULATORYJNA OPIEKA ZDROWOTNA > Lekarze'),
    v('8', 'stopa', 'RYNEK PRACY > DANE ARCHIWALNE > Bezrobocie rejestrowane'),
    // Ten sam wskaźnik co wbudowany „Ludność ogółem” (bdlVarId 72305): nie może zdublować wpisu.
    v('72305', 'ogółem – ogółem', 'LUDNOŚĆ > STAN LUDNOŚCI > Ludność wg grup wieku i płci'),
  ],
};

function allEntries(tree: ReturnType<typeof buildCatalogTree>) {
  return tree.sections.flatMap((s) => s.groups.flatMap((g) => g.entries.map((e) => ({ e, s, g }))));
}

describe('U04 – drzewo Dział › Grupa › Wskaźnik', () => {
  const tree = buildCatalogTree(MAIN, AVAILABLE);

  it('każdy wskaźnik z katalogu trafia dokładnie do jednej grupy', () => {
    const placed = allEntries(tree).map(({ e }) => e.id);
    const expected = [...MAIN.map((i) => i.id), ...AVAILABLE.variables.filter((x) => x.id !== '72305').map((x) => `b${x.id}`)];
    expect(placed).toHaveLength(new Set(placed).size);
    expect([...placed].sort()).toEqual([...expected].sort());
    expect(tree.total).toBe(expected.length);
  });

  it('wskaźnik z biblioteki o tym samym bdlVarId co wbudowany nie dubluje wpisu', () => {
    expect(allEntries(tree).some(({ e }) => e.id === 'b72305')).toBe(false);
    expect(allEntries(tree).filter(({ e }) => e.name === 'Ludność ogółem')).toHaveLength(1);
  });

  it('powtórzone id w bibliotece trafia do drzewa raz', () => {
    const doubled = { ...AVAILABLE, variables: [...AVAILABLE.variables, AVAILABLE.variables[0]!] };
    expect(buildCatalogTree(MAIN, doubled).total).toBe(tree.total);
  });

  it('wbudowane lądują w grupie „Najważniejsze” swojego działu, na jej początku', () => {
    const people = tree.sections.find((s) => s.name === 'Ludność')!;
    expect(people.groups[0]!.name).toBe(BASIC_GROUP);
    expect(people.groups[0]!.entries.every((e) => e.builtin)).toBe(true);
    expect(people.groups[0]!.entries.map((e) => e.id)).toContain('population');
  });

  it('dział bez odpowiednika w bibliotece (Turystyka) powstaje z wbudowanego wskaźnika', () => {
    const tourism = tree.sections.find((s) => s.name === 'Turystyka');
    expect(tourism?.groups.map((g) => g.name)).toEqual([BASIC_GROUP]);
  });

  it('kolejność: podstawowe działy najpierw, grupa archiwalna na końcu działu', () => {
    const names = tree.sections.map((s) => s.name);
    expect(names.indexOf('Ludność')).toBe(0);
    expect(names.indexOf('Rynek pracy')).toBeLessThan(names.indexOf('Szkolnictwo'));
    expect(names.indexOf('Szkolnictwo')).toBeLessThan(names.indexOf('Kultura'));
    const school = tree.sections.find((s) => s.name === 'Szkolnictwo')!;
    expect(school.groups.map((g) => g.name)).toEqual(['Szkolnictwo podstawowe', 'Dane archiwalne']);
  });

  it('nazwy WIELKIMI LITERAMI dostają zwykłą pisownię, skróty zostają', () => {
    expect(titleCase('SZKOLNICTWO PODSTAWOWE')).toBe('Szkolnictwo podstawowe');
    expect(titleCase('PSR 1996 - ROLNICTWO')).toBe('PSR 1996 - rolnictwo');
    expect(tree.sections.map((s) => s.name)).toContain('Kultura');
  });

  it('liczby: działy, grupy, wskaźniki i poziomy danych', () => {
    const stats = treeStats(tree);
    expect(stats.entries).toBe(tree.total);
    expect(stats.sections).toBe(tree.sections.length);
    expect(stats.gmi).toBeLessThanOrEqual(stats.entries);
    expect(stats.woj).toBe(MAIN.length);
  });

  it('brak spisu biblioteki: drzewo ma tylko wbudowane', () => {
    expect(buildCatalogTree(MAIN, null).total).toBe(MAIN.length);
  });
});

describe('U04 – szukajka po drzewie', () => {
  const tree = buildCatalogTree(MAIN, AVAILABLE);

  it('„bezrobocie” – pierwszy jest wbudowany wskaźnik, wcześniej niż dane archiwalne', () => {
    const hits = searchCatalog(tree, 'bezrobocie');
    expect(hits[0]!.entry.id).toBe('unemployment-rate');
    expect(hits.map((h) => h.entry.id)).toContain('b8');
  });

  it('„szkoły” bez polskich liter i z odmianą znajduje szkoły podstawowe', () => {
    const ids = searchCatalog(tree, 'szkoly').map((h) => h.entry.id);
    expect(ids).toEqual(expect.arrayContaining(['b4', 'b5']));
    expect(searchCatalog(tree, 'Szkoły')[0]!.section).toBe('Szkolnictwo');
  });

  it('wynik niesie ścieżkę działu i grupy', () => {
    const hit = searchCatalog(tree, 'lekarze')[0]!;
    expect(hit.entry.id).toBe('b7');
    expect(hit.section).toBe('Ochrona zdrowia, opieka społeczna');
    expect(hit.group).toBe('Ambulatoryjna opieka zdrowotna');
  });

  it('wszystkie słowa muszą pasować; brak trafień daje pustą listę', () => {
    expect(searchCatalog(tree, 'ludność kobiety').map((h) => h.entry.id)).toEqual(['b2']);
    expect(searchCatalog(tree, 'zzzz')).toEqual([]);
  });

  it('zbyt krótka fraza nic nie szuka', () => {
    expect(searchCatalog(tree, 'l')).toEqual([]);
    expect(searchCatalog(tree, '  ')).toEqual([]);
  });

  it('stem ucina końcówki, ale krótkich słów nie rusza', () => {
    expect(stem('szkoły')).toBe('szko');
    expect(stem('dom')).toBe('dom');
    expect(stem('kino')).toBe(stem('kina'));
    expect(stem('Bezrobocie')).toBe('bezrobo');
  });
});
