import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildRegistry,
  isLibraryIndicatorId,
  libraryIndicatorId,
  libraryVarId,
  type AvailableFile,
} from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const main = JSON.parse(fs.readFileSync(path.resolve('config/indicators.json'), 'utf8')) as Indicator[];
const available = JSON.parse(
  fs.readFileSync(path.resolve('tests/fixtures/library/available.json'), 'utf8'),
) as AvailableFile;

describe('rejestr wskaźników (QC602)', () => {
  it('20 głównych + 5 z biblioteki = 25, b101 istnieje', () => {
    const r = buildRegistry(main, available);
    expect(main).toHaveLength(20);
    expect(r.all).toHaveLength(25);
    expect(r.library).toHaveLength(5);
    expect(r.byId.get('b101')).toBeDefined();
  });

  it('minLevel wynika z poziomów z danymi', () => {
    const r = buildRegistry(main, available);
    expect(r.byId.get('b101')?.minLevel).toBe('pow');
    expect(r.byId.get('b102')?.minLevel).toBe('gmi');
    expect(r.byId.get('b202')?.minLevel).toBe('gmi');
  });

  it('biblioteka: higherIsBetter null, bdlVarId liczbą, grupa i opis z działu', () => {
    const r = buildRegistry(main, available);
    for (const i of r.library) expect(i.higherIsBetter).toBeNull();
    const i = r.byId.get('b101')!;
    expect(i.bdlVarId).toBe(101);
    expect(i.group).toBe('Ludność');
    expect(i.description).toBe('Ludność > Struktura ludności');
    expect(i.unit).toBe('osoba');
  });

  it('brak duplikatów id, najpierw 20 głównych, biblioteka po nazwie', () => {
    const r = buildRegistry(main, available);
    expect(new Set(r.all.map((i) => i.id)).size).toBe(r.all.length);
    expect(r.all.slice(0, 20).map((i) => i.id)).toEqual(main.map((i) => i.id));
    const names = r.library.map((i) => i.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'pl')));
  });

  it('available == null → tylko główne', () => {
    expect(buildRegistry(main, null).all).toHaveLength(20);
  });

  it('uszkodzone wpisy pomijane, reszta zostaje', () => {
    const broken = {
      ...available,
      variables: [
        ...available.variables,
        { id: '999', u: 'x', lv: ['pow'], y: [2024] } as never,
        { id: '998', n: 'Bez poziomów', u: 'x', lv: [], y: [2024] } as never,
        { n: 'Bez id', u: 'x', lv: ['pow'], y: [2024] } as never,
      ],
    };
    const r = buildRegistry(main, broken);
    expect(r.all).toHaveLength(25);
    expect(r.byId.has('b999')).toBe(false);
    expect(r.byId.has('b998')).toBe(false);
  });

  it('duplikat id pomijany; ta sama nazwa co główny dostaje dopisek', () => {
    const dup: AvailableFile = {
      ...available,
      variables: [
        available.variables[0],
        available.variables[0],
        { id: '555', n: main[0].name, u: 'osoba', c: 'Ludność > X', lv: ['woj'], y: [2024] },
      ],
    };
    const r = buildRegistry(main, dup);
    expect(r.library).toHaveLength(2);
    expect(r.byId.get('b555')?.description).toContain('(z biblioteki GUS)');
    expect(r.byId.get('b101')?.description).not.toContain('(z biblioteki GUS)');
  });

  it('pomocnicy id biblioteki', () => {
    expect(libraryIndicatorId(101)).toBe('b101');
    expect(isLibraryIndicatorId('b101')).toBe(true);
    for (const id of ['population', 'b', 'b1x']) expect(isLibraryIndicatorId(id)).toBe(false);
    expect(libraryVarId('b101')).toBe('101');
    expect(libraryVarId('population')).toBeNull();
  });

  it('lata i poziomy', () => {
    const r = buildRegistry(main, available);
    expect(r.years.get('b101')).toEqual([2022, 2023, 2024]);
    expect(r.levels.get('b202')).toEqual(['pow', 'gmi']);
  });
});
