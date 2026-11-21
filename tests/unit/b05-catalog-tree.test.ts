import { describe, expect, it } from 'vitest';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import priority from '../../config/library-priority.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { OTHER_GROUP, buildCatalogTree, flattenTree, sectionWeight, titleCase } from '../../src/core/catalog/tree';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const MAIN = indicatorsData as Indicator[];
const AVAILABLE = fixture.available as AvailableFile;

describe('B05 – drzewo Dział › Grupa › Wskaźnik', () => {
  const tree = buildCatalogTree(MAIN, AVAILABLE);

  it('nie ma grupy „Dane archiwalne” ani jej wskaźników', () => {
    const groups = tree.sections.flatMap((s) => s.groups.map((g) => g.name.toLowerCase()));
    expect(groups.some((g) => g.includes('archiwaln'))).toBe(false);
    const ids = flattenTree(tree).map((e) => e.id);
    expect(ids).not.toContain('b4004');
    expect(ids).not.toContain('b7001');
  });

  it('każdy wskaźnik ma dział, grupę i poziomy, a leży w jednej grupie', () => {
    const entries = flattenTree(tree);
    expect(entries.length).toBe(tree.total);
    for (const e of entries) {
      expect(e.section).not.toBe('');
      expect(e.group).not.toBe('');
      expect(e.levels.length).toBeGreaterThan(0);
    }
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const expected = MAIN.length + AVAILABLE.variables.filter((v) => !['4004', '7001', '72305'].includes(v.id)).length;
    expect(tree.total).toBe(expected);
  });

  it('nie ma grupy „Najważniejsze”: wbudowany wskaźnik leży w grupie swojego odpowiednika z biblioteki', () => {
    const groups = tree.sections.flatMap((s) => s.groups.map((g) => g.name));
    expect(groups).not.toContain('Najważniejsze');
    const people = tree.sections.find((s) => s.name === 'Ludność')!;
    const home = people.groups.find((g) => g.entries.some((e) => e.id === 'population'))!;
    expect(home.name).not.toBe(OTHER_GROUP);
  });

  it('„Pozostałe” (wbudowane bez odpowiednika) jest zawsze ostatnią grupą działu', () => {
    for (const s of tree.sections.filter((x) => x.groups.some((g) => g.name === OTHER_GROUP))) {
      expect(s.groups.at(-1)!.name).toBe(OTHER_GROUP);
    }
  });

  it('wbudowany wskaźnik z tym samym bdlVarId co pozycja z biblioteki nie dubluje wpisu', () => {
    expect(flattenTree(tree).some((e) => e.id === 'b72305')).toBe(false);
    expect(flattenTree(tree).filter((e) => e.name === 'Ludność ogółem')).toHaveLength(1);
  });

  it('kolejność działów zgodna z wagami z config/library-priority.json', () => {
    const weights = tree.sections.map((s) => s.weight);
    expect(weights).toEqual([...weights].sort((a, b) => b - a));
    const keys = Object.keys(priority.sectionWeights);
    const at = (name: string) => keys.findIndex((k) => k.toLowerCase().startsWith(name.toLowerCase()));
    const names = tree.sections.map((s) => s.name);
    expect(names.indexOf('Ludność')).toBeLessThan(names.indexOf('Rynek pracy'));
    expect(names.indexOf('Rynek pracy')).toBeLessThan(names.indexOf('Kultura'));
    expect(at('Ludność')).toBeLessThan(at('Kultura'));
    expect(sectionWeight('LUDNOŚĆ')).toBe(100);
    expect(sectionWeight('Kultura')).toBe(50);
    expect(sectionWeight('Zupełnie nowy dział')).toBe(priority.defaultSectionWeight);
  });

  it('działy z wbudowanych wskaźników bez odpowiednika w spisie też powstają', () => {
    const tourism = tree.sections.find((s) => s.name === 'Turystyka');
    expect(tourism?.groups.map((g) => g.name)).toEqual([OTHER_GROUP]);
  });

  it('nazwy WIELKIMI LITERAMI dostają zwykłą pisownię, skróty zostają', () => {
    expect(titleCase('SZKOLNICTWO PODSTAWOWE')).toBe('Szkolnictwo podstawowe');
    expect(titleCase('PSR 1996 - ROLNICTWO')).toBe('PSR 1996 - rolnictwo');
  });

  it('brak spisu: drzewo ma tylko wbudowane', () => {
    expect(buildCatalogTree(MAIN, null).total).toBe(MAIN.length);
  });
});
