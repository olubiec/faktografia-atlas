import { describe, expect, it } from 'vitest';
import { compare } from '../../src/core/compare/compare';
import type { Indicator, IndicatorValues, UnitProfile } from '../../src/core/profile/profile';
import { compareCsv, indicatorTableCsv, profileCsv, shareFileName, toCsv } from '../../src/core/share/csv';
import type { Unit } from '../../src/core/units/types';

describe('share / CSV i nazwy plików', () => {
  describe('toCsv', () => {
    it('zaczyna się od BOM UTF-8 (\\uFEFF)', () => {
      const csv = toCsv(['TERYT', 'Nazwa'], [['02', 'Dolnośląskie']]);
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });

    it('używa kropki zamienionej na przecinek dziesiętny (1234.5 -> "1234,5")', () => {
      const csv = toCsv(['Wartość'], [[1234.5]]);
      expect(csv).toContain('1234,5');
      expect(csv).not.toContain('1234.5');
    });

    it('otacza cudzysłowem wartości ze średnikiem i podwaja cudzysłowy', () => {
      const csv = toCsv(
        ['Nazwa'],
        [['Powiat A; B'], ['Gmina "Miejska"']]
      );
      expect(csv).toContain('"Powiat A; B"');
      expect(csv).toContain('"Gmina ""Miejska"""');
    });

    it('zamienia null na puste pole', () => {
      const csv = toCsv(['A', 'B', 'C'], [['val1', null, 'val3']]);
      expect(csv).toContain('val1;;val3');
    });

    it('zachowuje kod TERYT jako tekst bez zmian ("02" zostaje "02")', () => {
      const csv = toCsv(['TERYT', 'Nazwa'], [['02', 'Dolnośląskie']]);
      expect(csv).toContain('02;Dolnośląskie');
    });

    it('używa separatora \\r\\n jako końca linii', () => {
      const csv = toCsv(['A', 'B'], [['1', '2'], ['3', '4']]);
      expect(csv).toContain('\r\n');
      const lines = csv.split('\r\n');
      expect(lines.length).toBe(4); // header, row1, row2, trailing empty line
    });
  });

  describe('shareFileName', () => {
    it('usuwa polskie znaki ąćęłńóśźż, spacje i konwertuje na ASCII z myślnikami', () => {
      const fileName = shareFileName(
        'faktografia',
        ['gęstość zaludnienia', 'zażółć gęślą jaźń', 2024],
        'csv'
      );
      expect(fileName).toBe('faktografia-gestosc-zaludnienia-zazolc-gesla-jazn-2024.csv');
    });

    it('generuje poprawną nazwę dla przykładowego wskaźnika i powiatów', () => {
      const fileName = shareFileName(
        'faktografia',
        ['gestosc-zaludnienia', 'powiaty', 2024],
        'csv'
      );
      expect(fileName).toBe('faktografia-gestosc-zaludnienia-powiaty-2024.csv');
    });
  });

  describe('gotowe tabele CSV', () => {
    const mockIndicator: Indicator = {
      id: 'density',
      bdlVarId: 1,
      name: 'Gęstość zaludnienia',
      unit: 'osoby/km²',
      description: 'Opis',
      group: 'Ludność',
      higherIsBetter: true,
      minLevel: 'woj',
    };

    const mockUnits: Unit[] = [
      {
        teryt: '02',
        bdlId: '1',
        name: 'Dolnośląskie',
        level: 'woj',
        parent: null,
        bbox: [0, 0, 0, 0],
        centroid: [0, 0],
      },
      {
        teryt: '04',
        bdlId: '2',
        name: 'Kujawsko-Pomorskie',
        level: 'woj',
        parent: null,
        bbox: [0, 0, 0, 0],
        centroid: [0, 0],
      },
    ];

    const mockValues: IndicatorValues = {
      indicatorId: 'density',
      years: [2024],
      values: {
        '02': [145.2],
        '04': [110.8],
      },
      fetchedAt: '2024-01-01',
    };

    it('indicatorTableCsv generuje poprawną tabelę z kolumnami i źródłem CC BY 4.0', () => {
      const csv = indicatorTableCsv(mockUnits, mockValues, mockIndicator, 2024);

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('TERYT;Nazwa;Poziom;Gęstość zaludnienia (osoby/km²);Rok;Miejsce;Źródło');
      expect(csv).toContain('02;Dolnośląskie;woj;145,2;2024;1;GUS, Bank Danych Lokalnych (CC BY 4.0)');
      expect(csv).toContain('04;Kujawsko-Pomorskie;woj;110,8;2024;2;GUS, Bank Danych Lokalnych (CC BY 4.0)');
    });

    it('profileCsv ma wiersz na każdy wskaźnik w profilu', () => {
      const mockProfile: UnitProfile = {
        teryt: '02',
        unit: mockUnits[0],
        indicators: [
          {
            indicatorId: 'density',
            indicator: mockIndicator,
            year: 2024,
            value: 145.2,
            rankNational: 2,
            rankVoivodeship: 1,
            totalNational: 16,
            totalVoivodeship: 1,
            neutral: false,
            series: [{ year: 2024, value: 145.2 }],
          },
          {
            indicatorId: 'population',
            indicator: {
              id: 'population',
              bdlVarId: 2,
              name: 'Liczba ludności',
              unit: 'osoba',
              description: 'Opis',
              group: 'Ludność',
              higherIsBetter: null,
              minLevel: 'woj',
            },
            year: 2024,
            value: 2900000,
            rankNational: 5,
            rankVoivodeship: 1,
            totalNational: 16,
            totalVoivodeship: 1,
            neutral: true,
            series: [{ year: 2024, value: 2900000 }],
          },
        ],
      };

      const csv = profileCsv(mockProfile);

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('TERYT;Nazwa;Wskaźnik;Grupa;Jednostka;Rok;Wartość;Miejsce w Polsce;Miejsce w województwie;Źródło');
      const dataLines = csv.trim().split('\r\n').slice(1);
      expect(dataLines.length).toBe(2); // 2 indicators = 2 rows
      expect(csv).toContain('Gęstość zaludnienia');
      expect(csv).toContain('Liczba ludności');
      expect(csv).toContain('GUS, Bank Danych Lokalnych (CC BY 4.0)');
    });

    it('compareCsv ma wiersz na każdy wskaźnik porównania z wyliczonym wynikiem compare()', () => {
      const mockProfileA: UnitProfile = {
        teryt: '02',
        unit: mockUnits[0],
        indicators: [
          {
            indicatorId: 'density',
            indicator: mockIndicator,
            year: 2024,
            value: 145.2,
            rankNational: 2,
            rankVoivodeship: 1,
            totalNational: 16,
            totalVoivodeship: 1,
            neutral: false,
            series: [{ year: 2024, value: 145.2 }],
          },
        ],
      };

      const mockProfileB: UnitProfile = {
        teryt: '04',
        unit: mockUnits[1],
        indicators: [
          {
            indicatorId: 'density',
            indicator: mockIndicator,
            year: 2024,
            value: 110.8,
            rankNational: 8,
            rankVoivodeship: 1,
            totalNational: 16,
            totalVoivodeship: 1,
            neutral: false,
            series: [{ year: 2024, value: 110.8 }],
          },
        ],
      };

      const compResult = compare(mockProfileA, mockProfileB);
      const csv = compareCsv(compResult.rows, mockProfileA, mockProfileB);

      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Wskaźnik;Województwo Dolnośląskie;Województwo Kujawsko-Pomorskie;Różnica;Źródło');
      const dataLines = csv.trim().split('\r\n').slice(1);
      expect(dataLines.length).toBe(1);
      expect(csv).toContain('Gęstość zaludnienia;145,2;110,8;wyżej o 31,0%;GUS, Bank Danych Lokalnych (CC BY 4.0)');
    });
  });
});
