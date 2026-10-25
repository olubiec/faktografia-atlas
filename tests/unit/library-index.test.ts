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
