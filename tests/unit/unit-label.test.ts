import { describe, expect, it } from 'vitest';
import { gminaKind, unitLabel, unitTitle } from '@/core/units/label';
import type { Unit } from '@/core/units/types';
import unitsJson from '../../public/data/units.json';

const units = unitsJson as Unit[];

describe('gminaKind', () => {
  it('identyfikuje rodzaj gminy na podstawie ostatniej cyfry TERYT', () => {
    expect(gminaKind('3217011')).toBe('miasto');
    expect(gminaKind('3217052')).toBe('gmina wiejska');
    expect(gminaKind('1210073')).toBe('gmina miejsko-wiejska');
  });

  it('zwraca null dla TERYT niebędącego gminą lub z inną końcówką', () => {
    expect(gminaKind('32')).toBeNull(); // województwo
    expect(gminaKind('3217')).toBeNull(); // powiat
    expect(gminaKind('3217018')).toBeNull(); // inna cyfra
  });
});

describe('unitLabel', () => {
  it('formatuje etykietę dla gminy z rodzajem w nawiasie', () => {
    const walczMiejska = units.find((u) => u.teryt === '3217011')!;
    const walczWiejska = units.find((u) => u.teryt === '3217052')!;
    const krynica = units.find((u) => u.teryt === '1210073')!;

    expect(unitLabel(walczMiejska)).toBe('Wałcz (miasto)');
    expect(unitLabel(walczWiejska)).toBe('Wałcz (gmina wiejska)');
    expect(unitLabel(krynica)).toBe('Krynica-Zdrój (gmina miejsko-wiejska)');
  });

  it('nie zmienia nazw powiatów i województw', () => {
    const powiat = units.find((u) => u.teryt === '3217')!;
    const woj = units.find((u) => u.teryt === '32')!;

    expect(unitLabel(powiat)).toBe('powiat wałecki');
    expect(unitLabel(woj)).toBe('zachodniopomorskie');
  });

  it('obsługuje opcję short: true dla gmin unikalnych i nieunikalnych w powiecie', () => {
    const walczMiejska = units.find((u) => u.teryt === '3217011')!;
    const zakopane = units.find((u) => u.teryt === '1217011')!; // Zakopane miejska (w powiecie tatrzańskim nie ma gminy wiejskiej Zakopane)

    // Dla unikalnej gminy z short: true
    expect(unitLabel(zakopane, { short: true, sameParentUnits: units.filter((u) => u.parent === zakopane.parent) })).toBe('Zakopane');

    // Dla nieunikalnej gminy z short: true nadal zwraca z nawiasem
    expect(unitLabel(walczMiejska, { short: true, sameParentUnits: units.filter((u) => u.parent === walczMiejska.parent) })).toBe('Wałcz (miasto)');
  });

  it('sprawdza, że żadne dwie gminy w tym samym powiecie nie mają tej samej etykiety unitLabel na pełnych danych', () => {
    const gminas = units.filter((u) => u.level === 'gmi');
    expect(gminas.length).toBe(2479);

    const gmiByParent = new Map<string, Unit[]>();
    for (const gmi of gminas) {
      if (!gmi.parent) continue;
      const list = gmiByParent.get(gmi.parent) ?? [];
      list.push(gmi);
      gmiByParent.set(gmi.parent, list);
    }

    for (const [parentTeryt, parentGminas] of gmiByParent.entries()) {
      const labels = parentGminas.map((gmi) => unitLabel(gmi, { sameParentUnits: parentGminas }));
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size, `Duplikaty w powiecie ${parentTeryt}`).toBe(labels.length);
    }
  });
});

describe('unitTitle', () => {
  it('formatuje nagłówek profilu jednostki', () => {
    const walczMiejska = units.find((u) => u.teryt === '3217011')!;
    const walczWiejska = units.find((u) => u.teryt === '3217052')!;
    const krynica = units.find((u) => u.teryt === '1210073')!;
    const powiat = units.find((u) => u.teryt === '3217')!;
    const woj = units.find((u) => u.teryt === '32')!;

    expect(unitTitle(walczMiejska)).toBe('Gmina miejska Wałcz');
    expect(unitTitle(walczWiejska)).toBe('Gmina wiejska Wałcz');
    expect(unitTitle(krynica)).toBe('Gmina miejsko-wiejska Krynica-Zdrój');
    expect(unitTitle(powiat)).toBe('Powiat wałecki');
    expect(unitTitle(woj)).toBe('Województwo zachodniopomorskie');
  });
});
