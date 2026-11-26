import { describe, expect, it } from 'vitest';
import fixture from '../fixtures/start/facts-start-library.json';
import { decodeFact } from '../../src/core/facts/codec';
import type { FactsStart } from '../../src/core/facts/start';
import { dailyEntry, factView, listView } from '../../src/core/start/discoveries';

const start = fixture as unknown as FactsStart;
const libEntry = start.daily[0];
const libFact = decodeFact(libEntry.u, libEntry.f);

describe('W29-D09b: karty Odkryć dla wskaźników z biblioteki (b<varId>)', () => {
  it('widok wołany jak dotąd (factView(fact)) działa po odczycie wpisu przez dailyEntry', () => {
    // Discoveries.tsx: dailyEntry(start, now) → decode → factView(fact), bez przekazania `i`.
    expect(factView(libFact)).toBeNull();
    expect(dailyEntry(start, new Date(0))).not.toBeNull();
    const v = factView(libFact);
    expect(v).not.toBeNull();
    expect(v!.sentence).toMatch(/\d/);
    expect(v!.number).toMatch(/\d/);
    expect(v!.href).toMatch(/^\/mapa\?i=b9001&y=2025&u=\d+&l=\w+$/);
  });

  it('listView(list) bierze nazwę i jednostkę z pola `i` zestawienia', () => {
    const v = listView(start.lists[0]);
    expect(v).not.toBeNull();
    expect(v!.title).toContain('ycie wody');
    expect(v!.rows).toHaveLength(3);
    expect(v!.href).toBe('/mapa?i=b9001&y=2025&l=gmi');
  });

  it('bez `i` i bez wpisu w config/indicators.json nadal null (brak zgadywania)', () => {
    expect(factView({ ...libFact, indicatorId: 'b9999' })).toBeNull();
    const { i: _i, ...bare } = start.lists[0];
    expect(listView({ ...bare, indicatorId: 'b9999' })).toBeNull();
  });

  it('zwykły wskaźnik z configu działa jak dotąd, a rejestr `i` go nie dotyczy', () => {
    const e = start.daily[1];
    const f = decodeFact(e.u, e.f);
    const plain = factView(f);
    expect(plain).not.toBeNull();
    expect(factView(f)).toEqual(plain);
  });
});
