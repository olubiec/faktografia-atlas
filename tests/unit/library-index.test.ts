import { mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { buildIndex } from '../../scripts/data/library-index.mjs';

describe('Indeks biblioteki GUS: budowanie (buildIndex)', () => {
  const catalog = {
    subjects: {
      K1: { id: 'K1', name: 'Ludność', parent: null },
      K2: { id: 'K2', name: 'Rynek pracy', parent: null },
      G1: { id: 'G1', name: 'Struktura ludności', parent: 'K1' },
      G2: { id: 'G2', name: 'Bezrobocie', parent: 'K2' },
    },
    variables: {
      101: { id: 101, subjectId: 'G1', n1: 'Ludność ogółem', n2: 'mężczyźni', n3: '', level: 6, unit: 'osoby' },
      102: { id: 102, subjectId: 'G1', n1: 'Ludność ogółem', n2: '', n3: 'kobiety', level: 5, unit: 'osoby' },
      103: { id: 103, subjectId: 'G2', n1: 'Bezrobotni', n2: 'ogółem', n3: '', level: 3, unit: 'osoby' }, // level < 5 -> omitted
      104: { id: 104, subjectId: 'G2', n1: 'Stopa bezrobocia', n2: '', n3: '', level: 5, unit: '%' },
      105: { id: 105, subjectId: 'G2', n1: 'Bezrobotni z prawem do zasiłku', n2: 'długotrwale', n3: 'wieś', level: 6, unit: 'osoby' },
      106: { id: 106, subjectId: 'G1', n1: 'Gęstość zaludnienia', n2: '', n3: '', level: 6, unit: 'os/km2' },
    },
  };

  const state = {
    done: {
      101: '2026-10-25',
      104: '2026-10-25',
    },
  };

  it('pomija zmienne z poziomem < 5, łączy nazwy bez pustych części, mapuje poziomy i stan done', () => {
    const idx = buildIndex(catalog, state);

    expect(Object.keys(idx.categories)).toHaveLength(4);
    expect(idx.categories.G1).toEqual({ n: 'Struktura ludności', p: 'K1' });

    // 103 is omitted because level=3 < 5
    expect(idx.variables).toHaveLength(5);
    expect(idx.variables.map((v) => v.id)).toEqual([101, 102, 104, 105, 106]);

    // Check level mapping (>= 6 -> 6, else 5)
    expect(idx.variables.find((v) => v.id === 101)?.l).toBe(6);
    expect(idx.variables.find((v) => v.id === 102)?.l).toBe(5);
    expect(idx.variables.find((v) => v.id === 104)?.l).toBe(5);

    // Check name joining without empty parts (" – ")
    expect(idx.variables.find((v) => v.id === 101)?.n).toBe('Ludność ogółem – mężczyźni');
    expect(idx.variables.find((v) => v.id === 102)?.n).toBe('Ludność ogółem – kobiety');
    expect(idx.variables.find((v) => v.id === 104)?.n).toBe('Stopa bezrobocia');
    expect(idx.variables.find((v) => v.id === 105)?.n).toBe('Bezrobotni z prawem do zasiłku – długotrwale – wieś');

    // Check has status based on state.done
    expect(idx.variables.find((v) => v.id === 101)?.has).toBe(1);
    expect(idx.variables.find((v) => v.id === 102)?.has).toBe(0);
    expect(idx.variables.find((v) => v.id === 104)?.has).toBe(1);
    expect(idx.variables.find((v) => v.id === 105)?.has).toBe(0);

    // Check units array (no duplicates)
    expect(idx.units).toEqual(['osoby', '%', 'os/km2']);
    expect(idx.variables.find((v) => v.id === 101)?.u).toBe(0);
    expect(idx.variables.find((v) => v.id === 104)?.u).toBe(1);
  });

  it('zmienna z n4 z pliku fixture ma w spisie tytuł z czterema członami', async () => {
    const fixtureData = JSON.parse(
      await readFile(path.resolve('tests/fixtures/library/variable-60614.json'), 'utf8'),
    );
    const customCatalog = {
      subjects: { P2137: { id: 'P2137', name: 'Ludność wg wieku', parent: null } },
      variables: {
        [fixtureData.id]: {
          id: fixtureData.id,
          subjectId: fixtureData.subjectId,
          n1: fixtureData.n1,
          n2: fixtureData.n2,
          n3: fixtureData.n3,
          n4: fixtureData.n4,
          level: fixtureData.level,
          unit: fixtureData.measureUnitName,
        },
      },
    };
    const idx = buildIndex(customCatalog, { done: {} });
    const v = idx.variables.find((item) => Number(item.id) === 60614);
    expect(v).toBeDefined();
    expect(v?.n).toBe('Ludność – w wieku produkcyjnym – wiek mobilny – mężczyźni');
    expect(v?.n.split(' – ')).toHaveLength(4);
  });

  it('dwie zmienne różniące się tylko n4 mają różne tytuły', () => {
    const customCatalog = {
      subjects: { P2137: { id: 'P2137', name: 'Ludność wg wieku', parent: null } },
      variables: {
        60614: { id: 60614, subjectId: 'P2137', n1: 'Ludność', n2: 'w wieku produkcyjnym', n3: 'wiek mobilny', n4: 'mężczyźni', level: 6, unit: 'osoby' },
        60615: { id: 60615, subjectId: 'P2137', n1: 'Ludność', n2: 'w wieku produkcyjnym', n3: 'wiek mobilny', n4: 'kobiety', level: 6, unit: 'osoby' },
      },
    };
    const idx = buildIndex(customCatalog, { done: {} });
    const v1 = idx.variables.find((item) => Number(item.id) === 60614);
    const v2 = idx.variables.find((item) => Number(item.id) === 60615);
    expect(v1?.n).toBe('Ludność – w wieku produkcyjnym – wiek mobilny – mężczyźni');
    expect(v2?.n).toBe('Ludność – w wieku produkcyjnym – wiek mobilny – kobiety');
    expect(v1?.n).not.toBe(v2?.n);
  });

  it('stary katalog bez n4/n5 nadal się wczytuje (brak = pusty)', () => {
    const oldCatalog = {
      subjects: { K1: { id: 'K1', name: 'Ludność', parent: null } },
      variables: {
        201: { id: 201, subjectId: 'K1', n1: 'Ludność ogółem', n2: 'miasta', n3: 'ogółem', level: 6, unit: 'osoby' },
      },
    };
    const idx = buildIndex(oldCatalog, { done: {} });
    expect(idx.variables).toHaveLength(1);
    expect(idx.variables[0].n).toBe('Ludność ogółem – miasta – ogółem');
  });

  it('rozmiar spisu dla fixture nie rośnie więcej niż o 15%', () => {
    const oldIdxSize = JSON.stringify(buildIndex(catalog, state)).length;
    const catalogWithN4N5 = {
      ...catalog,
      variables: {
        ...catalog.variables,
        101: { ...catalog.variables[101], n4: 'dodatkowy parametr' },
        105: { ...catalog.variables[105], n4: 'parametr n4', n5: 'parametr n5' },
      },
    };
    const newIdxSize = JSON.stringify(buildIndex(catalogWithN4N5, state)).length;
    expect(newIdxSize).toBeLessThanOrEqual(oldIdxSize * 1.15);
  });

  it('daje ten sam deterministyczny wynik przy ponownym budowaniu', () => {
    const res1 = buildIndex(catalog, state);
    const res2 = buildIndex(catalog, state);
    expect(res1).toEqual(res2);
    expect(JSON.stringify(res1)).toBe(JSON.stringify(res2));
  });

  it('uruchomienie bezpośrednie node scripts/data/library-index.mjs czyta catalog/state i zapisuje index.json bez wcięć', async () => {
    const testDir = path.resolve('tmp-test-library');
    await mkdir(testDir, { recursive: true });

    try {
      const execEnv = { ...process.env, LIBRARY_DIR: testDir };
      execSync(`node scripts/data/library-index.mjs`, { env: execEnv });

      const content = await readFile(path.join(testDir, 'index.json'), 'utf8');
      expect(content).not.toContain('\n');
      expect(content).not.toContain('  ');

      const parsed = JSON.parse(content);
      expect(parsed.version).toBe(1);
      expect(parsed.categories).toEqual({});
      expect(parsed.units).toEqual([]);
      expect(parsed.variables).toEqual([]);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
