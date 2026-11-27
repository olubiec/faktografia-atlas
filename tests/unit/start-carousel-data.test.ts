import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import listsConfig from '../../config/lists.json';
import type { FactsLists } from '../../src/core/facts/carousel';
import type { FactsStart, StartList } from '../../src/core/facts/start';

// Dane karuzeli zestawień na starcie (KONCEPT-ZESTAWIENIA-KARUZELA §3.4): facts-lists.json i gmina-small.json.
const data = path.resolve(__dirname, '../../public/data');
const read = (file: string): string => fs.readFileSync(path.join(data, file), 'utf8');
const json = <T>(file: string): T => JSON.parse(read(file)) as T;
const lists = json<FactsLists>('facts-lists.json').lists;
const start = json<FactsStart>('facts-start.json');
const small = json<{ min: number; t: string }>('gmina-small.json');
const keyOf = (l: StartList) => `${l.indicatorId}-${l.level}-${l.dir}`;
const lastPopulation = (teryt: string): number => {
  const row = json<{ values: Record<string, (number | null)[]> }>('values/population.json').values[teryt] ?? [];
  return [...row].reverse().find((v) => v != null) ?? 0;
};
const hasGminaData = (id: string): boolean => Object.keys(json<{ values: Record<string, unknown> }>(`values/${id}.json`).values).some((t) => t.length === 7);

describe('facts-lists.json', () => {
  it('ma zestawienia z config/facts.json → start.carousel, w tej samej kolejności', () => {
    const wanted = factsConfig.start.carousel.map((c) => c.indicatorId);
    expect(lists.map((l) => l.indicatorId)).toEqual(wanted);
    expect(lists.length).toBeGreaterThanOrEqual(10);
  });

  it('każdy wpis ma 5 + 5 pozycji, rozłączne i uporządkowane od najwyższej do najniższej wartości', () => {
    for (const l of lists) {
      expect(l.top).toHaveLength(5);
      expect(l.bottom).toHaveLength(5);
      const hi = (l.dir === 1 ? l.top : l.bottom!).map((r) => r[2]);
      const lo = (l.dir === 1 ? l.bottom! : l.top).map((r) => r[2]);
      expect([...hi].sort((a, b) => b - a)).toEqual(hi);
      expect([...lo].sort((a, b) => a - b)).toEqual(lo);
      expect(Math.min(...hi)).toBeGreaterThanOrEqual(Math.max(...lo));
      const codes = [...l.top, ...l.bottom!].map((r) => r[0]);
      expect(new Set(codes).size).toBe(10);
    }
  });

  it('poziom = gminy tylko dla wskaźników z danymi gmin, a gminy poniżej progu ludności są pominięte', () => {
    for (const l of lists) {
      expect(l.level).toBe(hasGminaData(l.indicatorId) ? 'gmi' : 'pow');
      if (l.level !== 'gmi') continue;
      for (const [teryt] of [...l.top, ...l.bottom!]) expect(lastPopulation(teryt)).toBeGreaterThanOrEqual(listsConfig.gminaMinPopulation);
    }
    expect(lists.some((l) => l.level === 'pow')).toBe(true);
  });

  it('nie powtarza zestawień redakcyjnych z config/facts.json → start.lists', () => {
    const editorial = new Set(factsConfig.start.lists.map((l) => `${l.indicatorId}-${l.level}-${l.dir}`));
    for (const l of lists) expect(editorial.has(keyOf(l))).toBe(false);
    expect(start.lists.length).toBe(4);
  });

  it('plik jest mały i bez wcięć: ≤ 12 KB', () => {
    expect(Buffer.byteLength(read('facts-lists.json'))).toBeLessThanOrEqual(12 * 1024);
    expect(read('facts-lists.json')).not.toContain('\n');
  });
});

describe('gmina-small.json', () => {
  const codes = small.t.split(',');

  it('to dokładnie gminy poniżej progu ludności z config/lists.json', () => {
    expect(small.min).toBe(listsConfig.gminaMinPopulation);
    expect(codes.length).toBeGreaterThan(100);
    expect(new Set(codes).size).toBe(codes.length);
    for (const t of codes) {
      expect(t).toMatch(/^\d{7}$/);
      expect(lastPopulation(t)).toBeLessThan(small.min);
    }
    const units = json<{ teryt: string; level: string }[]>('units.json');
    const bigGminas = units.filter((u) => u.level === 'gmi' && !codes.includes(u.teryt));
    for (const u of bigGminas.slice(0, 300)) expect(lastPopulation(u.teryt)).toBeGreaterThanOrEqual(small.min);
  });

  it('plik ma ≤ 8 KB i nie ma wcięć', () => {
    expect(Buffer.byteLength(read('gmina-small.json'))).toBeLessThanOrEqual(8 * 1024);
    expect(read('gmina-small.json')).not.toContain('\n');
  });
});
