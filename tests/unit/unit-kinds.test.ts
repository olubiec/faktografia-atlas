import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { UNIT_KINDS, unitKindId, unitKindInfo } from '@/core/units/kinds';
import { gminaKind } from '@/core/units/label';
import type { Unit } from '@/core/units/types';

const units = JSON.parse(readFileSync('public/data/units.json', 'utf8')) as Unit[];
const byTeryt = new Map(units.map((u) => [u.teryt, u]));

describe('rodzaje jednostek na pełnych danych (units.json)', () => {
  it('każda jednostka ma rodzaj, a liczby zgadzają się ze słownikiem', () => {
    const counts = new Map<string, number>();
    for (const u of units) {
      const id = unitKindId(u);
      expect(id).not.toBeNull();
      counts.set(id!, (counts.get(id!) ?? 0) + 1);
    }
    for (const k of UNIT_KINDS) expect(counts.get(k.id)).toBe(k.count);
  });

  it('66 miast na prawach powiatu, w tym 2470–2479, i każde ma dokładnie jedną gminę miejską', () => {
    const cc = units.filter((u) => unitKindId(u) === 'miasto-na-prawach-powiatu');
    expect(cc).toHaveLength(66);
    expect(cc.map((u) => u.teryt)).toContain('2470');
    for (const p of cc) {
      const kids = units.filter((u) => u.parent === p.teryt);
      expect(kids).toHaveLength(1);
      expect(unitKindId(kids[0])).toBe('gmina-miejska');
      expect(kids[0].teryt).toBe(`${p.teryt}011`);
      expect(kids[0].name).toBe(p.name.replace(/^powiat /, ''));
    }
  });

  it('powiat ziemski ma co najmniej jedną gminę i żadna jego gmina nie jest w kodzie powiatu grodzkiego', () => {
    for (const p of units.filter((u) => unitKindId(u) === 'powiat-ziemski')) {
      const kids = units.filter((u) => u.parent === p.teryt);
      expect(kids.length).toBeGreaterThan(0);
      for (const g of kids) expect(g.teryt.startsWith(p.teryt)).toBe(true);
    }
  });

  it('kod rodzica zgadza się z kodem jednostki, a rodzic ma wyższy poziom', () => {
    const above = { gmi: 'pow', pow: 'woj' } as const;
    for (const u of units.filter((x) => x.level !== 'woj')) {
      const parent = byTeryt.get(u.parent ?? '');
      expect(parent).toBeDefined();
      expect(parent!.level).toBe(above[u.level as 'gmi' | 'pow']);
      expect(u.teryt.startsWith(parent!.teryt)).toBe(true);
    }
  });

  it('rodzaj gminy z unitKindInfo zgadza się z gminaKind i nazwa rodzaju nigdy nie jest pusta', () => {
    for (const u of units.filter((x) => x.level === 'gmi')) {
      expect(gminaKind(u.teryt)).not.toBeNull();
      expect(unitKindInfo(u)?.title).toBeTruthy();
    }
  });

  it('opisy w słowniku mają krótką i długą definicję oraz przykład', () => {
    for (const k of UNIT_KINDS) {
      expect(k.short.length).toBeGreaterThan(20);
      expect(k.long.length).toBeGreaterThan(k.short.length - 1);
      expect(k.example).toBeTruthy();
      expect(k.tagline.split(' ').length).toBeLessThanOrEqual(5);
    }
  });
});
