import { describe, expect, it } from 'vitest';
import { toCsv } from '../../src/core/share/csv';
import { deckCsv, pageCsv } from '../../src/core/share/deck-csv';
import type { Indicator, UnitProfile } from '../../src/core/profile/profile';

const body = (cols: string[], rows: (string | number | null)[][]) => toCsv(cols, rows).replace('﻿', '');
const sections = [
  { title: 'Mapa: bezrobocie', csv: body(['TERYT', 'Wartość'], [['02', 3465.5]]) },
  { title: 'Ranking', csv: body(['TERYT', 'Wartość'], [['04', 2]]) },
  { title: 'Trend', csv: body(['Rok', 'Wartość'], [[2023, 1.5]]) },
];

describe('deckCsv', () => {
  it('3 strony -> 3 sekcje z nagłówkami Strona n/3', () => {
    const csv = deckCsv(sections);
    expect(csv).toContain('Strona 1/3;Mapa: bezrobocie');
    expect(csv).toContain('Strona 2/3;Ranking');
    expect(csv).toContain('Strona 3/3;Trend');
  });

  it('zachowuje separator ; i przecinek dziesiętny', () => {
    expect(deckCsv(sections)).toContain('02;3465,5');
  });

  it('dokładnie jeden BOM, na początku', () => {
    const csv = deckCsv(sections);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.split('﻿').length - 1).toBe(1);
  });

  it('escapuje tytuł ze średnikiem i cudzysłowem', () => {
    const csv = deckCsv([{ title: 'A; "B"', csv: 'x\r\n' }, sections[1]]);
    expect(csv).toContain('Strona 1/2;"A; ""B"""');
  });

  it('dla jednej strony pomija nagłówek strony', () => {
    const csv = deckCsv([sections[0]]);
    expect(csv).not.toContain('Strona 1/1');
    expect(csv).toContain('TERYT;Wartość');
  });

  it('kończy się stopką ze źródłem i licencją', () => {
    expect(deckCsv(sections).trimEnd().endsWith('Źródło: GUS, Bank Danych Lokalnych; licencja CC BY 4.0')).toBe(true);
  });

  it('sekcje oddziela pusta linia', () => {
    expect(deckCsv(sections)).toContain('\r\n\r\nStrona 2/3');
  });

  it('pageLabels zastępują pierwszą komórkę nagłówka', () => {
    expect(deckCsv(sections, { pageLabels: ['Mapa', 'Ranking', 'Trend'] })).toContain('Mapa;Mapa: bezrobocie');
  });
});

describe('pageCsv', () => {
  const indicator = { id: 'i1', name: 'Wskaźnik', unit: 'zł' } as unknown as Indicator;
  it('bignumber/trend -> seria lat bez BOM', () => {
    const csv = pageCsv({ kind: 'trend', indicator, unitName: 'Gmina', series: [{ year: 2022, value: 1.5 }] });
    expect(csv.startsWith('﻿')).toBe(false);
    expect(csv).toContain('2022;1,5');
  });
  it('table/profile -> profileCsv bez BOM', () => {
    const profile = { teryt: '0201', unit: null, indicators: [] } as unknown as UnitProfile;
    const csv = pageCsv({ kind: 'profile', profile });
    expect(csv.startsWith('TERYT;Nazwa;Wskaźnik')).toBe(true);
  });
  it('compare -> compareCsv bez BOM', () => {
    const csv = pageCsv({ kind: 'compare', rows: [], a: 'A', b: 'B' });
    expect(csv.startsWith('Wskaźnik;A;B')).toBe(true);
  });
});
