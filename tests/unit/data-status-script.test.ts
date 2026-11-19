import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildStatus, writeStatus } from '../../scripts/data/status.mjs';

const now = new Date('2026-11-19T10:00:00Z');
const values = [
  { fetchedAt: '2026-10-19T03:00:00Z', years: [2020, 2021] },
  { fetchedAt: '2026-11-02T03:00:00Z', years: [2022, 2024] },
  { fetchedAt: '2026-10-25T03:00:00Z', years: [2019] },
];
const available = JSON.parse(
  await readFile(path.resolve(__dirname, '../fixtures/library/available.json'), 'utf8'),
);

describe('status danych (PD01)', () => {
  it('najnowsza i najstarsza data pobrania oraz największy rok', () => {
    const s = buildStatus({ valuesFiles: values, now });
    expect(s.values).toEqual({
      count: 3,
      latestFetchedAt: '2026-11-02T03:00:00Z',
      oldestFetchedAt: '2026-10-19T03:00:00Z',
      latestYear: 2024,
    });
  });
  it('liczy wskaźniki biblioteki i zrobione z pliku stanu', () => {
    const s = buildStatus({ valuesFiles: values, available, state: { done: { a: 1, b: 1, c: 1 }, pending: ['x'] }, now });
    expect(s.library.availableCount).toBe(available.variables.length);
    expect(s.library.availableCount).toBe(5);
    expect(s.library.doneCount).toBe(3);
    expect(s.library.pendingCount).toBe(1);
  });
  it('brak spisu i stanu daje null w polach biblioteki, bez wyjątku', () => {
    const s = buildStatus({ valuesFiles: values, available: null, state: null, now });
    expect(s.library).toEqual({ availableCount: null, availableGeneratedAt: null, doneCount: null, pendingCount: null });
    expect(s.checkedAt).toBe(now.toISOString());
  });
  it('checkedAt to wstrzyknięte „teraz”', () => {
    expect(buildStatus({ valuesFiles: [], now }).checkedAt).toBe('2026-11-19T10:00:00.000Z');
  });

  describe('zapis na dysk', () => {
    let dir: string;
    beforeEach(async () => {
      dir = await mkdtemp(path.join(os.tmpdir(), 'status-'));
    });
    afterEach(() => rm(dir, { recursive: true, force: true }));

    it('zapis atomowy: jest plik, nie ma .tmp, wynik to jedna krótka linia JSON', async () => {
      const valuesDir = path.join(dir, 'values');
      const libraryDir = path.join(dir, 'lib');
      await import('node:fs/promises').then((fs) => Promise.all([fs.mkdir(valuesDir), fs.mkdir(libraryDir)]));
      await writeFile(path.join(valuesDir, 'a.json'), JSON.stringify(values[0]));
      const bigAvailable = { generatedAt: 'x', variables: Array.from({ length: 2000 }, (_, i) => ({ id: String(i) })) };
      await writeFile(path.join(libraryDir, 'available.json'), JSON.stringify(bigAvailable));
      const out = path.join(dir, 'out', 'status.json');
      await writeStatus({ valuesDir, libraryDir, out, now });
      expect((await readdir(path.dirname(out))).sort()).toEqual(['status.json']);
      const raw = await readFile(out, 'utf8');
      expect(raw).not.toMatch(/\n|\s{2}/);
      expect(raw.length).toBeLessThan(8 * 1024);
      expect(JSON.parse(raw).library.availableCount).toBe(2000);
    });
  });
});
