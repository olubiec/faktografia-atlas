import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { listView } from '../../src/core/start/discoveries';
import { endSubtitle, peersWord } from '../../src/core/start/list-ends';
import type { FactsStart, StartList } from '../../src/core/facts/start';

// Zestawienia na starcie: przełącznik „Najwyższe | Najniższe”, po 5 pozycji z obu końców skali (decyzja 26.11.2026).
const R = (n: number): [string, string, number][] => Array.from({ length: n }, (_, k) => [`22050${k}2`, `Gmina ${k}`, 40 + k]);
const median: StartList = { indicatorId: 'median-age', level: 'gmi', dir: -1, year: 2026, top: R(5), bottom: R(5).map(([t, n, v]) => [`1${t.slice(1)}`, `Stara ${n}`, v + 9]) };

describe('zestawienia startu: oba końce skali', () => {
  it('mediana wieku zaczyna od najniższych (kierunek redakcyjny), drugi koniec to najwyższe', () => {
    const v = listView(median)!;
    expect(v.ends?.initial).toBe('low');
    expect(v.ends?.low.rows.map((r) => r.name)).toEqual(R(5).map((r) => r[1]));
    expect(v.ends?.high.rows[0].name).toBe('Stara Gmina 0');
    expect(v.ends?.high.rows[0].href).toMatch(/[?&]u=1205002/);
  });

  it('„Pełne zestawienie” idzie za wybranym kierunkiem: najmłodsze ↔ najstarsze gminy', () => {
    const v = listView(median)!;
    expect(v.ends?.low.full?.href).toBe('/zestawienie/najmlodsze-gminy');
    expect(v.ends?.high.full?.href).toBe('/zestawienie/najstarsze-gminy');
    const income = listView({ ...median, indicatorId: 'income-per-capita', dir: 1 })!;
    expect(income.ends?.initial).toBe('high');
    expect(income.ends?.high.full?.href).toBe('/zestawienie/najbogatsze-gminy');
    expect(income.ends?.low.full?.href).toBe('/zestawienie/gminy-z-najnizszymi-dochodami');
  });

  it('podpis zmienia się z kierunkiem i ma poprawną liczbę mnogą', () => {
    const v = listView(median)!;
    expect(v.ends?.low.subtitle).toBe('5 gmin z najniższą wartością, 2026');
    expect(v.ends?.high.subtitle).toBe('5 gmin z najwyższą wartością, 2026');
    expect(endSubtitle(3, 'pow', 'high', 2025)).toBe('3 powiaty z najwyższą wartością, 2025');
    expect(endSubtitle(1, 'woj', 'low', 2025)).toBe('1 województwo z najniższą wartością, 2025');
    expect([2, 5, 12, 22, 25].map((n) => peersWord(n, 'gmi'))).toEqual(['gminy', 'gmin', 'gmin', 'gminy', 'gmin']);
  });

  it('starszy plik bez drugiego końca: bez przełącznika, karta jak dotąd', () => {
    const { bottom: _b, ...old } = median;
    const v = listView({ ...old, top: R(3) })!;
    expect(v.ends).toBeNull();
    expect(v.rows).toHaveLength(3);
    expect(v.subtitle).toBe('3 gminy z najniższą wartością, 2026');
  });

  it('public/data/facts-start.json: każde zestawienie ma 5 + 5 pozycji, oba końce rozłączne i uporządkowane', () => {
    const start = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/data/facts-start.json'), 'utf8')) as FactsStart;
    for (const l of start.lists) {
      const v = listView(l)!;
      expect(v.ends?.high.rows).toHaveLength(5);
      expect(v.ends?.low.rows).toHaveLength(5);
      const hi = (l.dir === 1 ? l.top : l.bottom!).map((r) => r[2]);
      const lo = (l.dir === 1 ? l.bottom! : l.top).map((r) => r[2]);
      expect([...hi].sort((a, b) => b - a)).toEqual(hi);
      expect([...lo].sort((a, b) => a - b)).toEqual(lo);
      expect(Math.min(...hi)).toBeGreaterThanOrEqual(Math.max(...lo));
    }
  });
});
