import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// @ts-expect-error – skrypt robota to plik .mjs bez deklaracji typów
import { buildPartsShards } from '../../scripts/data/build-parts.mjs';
// @ts-expect-error – skrypt robota to plik .mjs bez deklaracji typów
import { buildIndex } from '../../scripts/data/library-index.mjs';

import { dataByVariableResponseSchema, unitResultSchema } from '../../src/core/bdl/schemas';
import { compare } from '../../src/core/compare/compare';
import { context } from '../../src/core/explain/context';
import { LibraryIndexSchema, parseLibraryIndex } from '../../src/core/library/index-contract';
import type { IndicatorValues, UnitProfile } from '../../src/core/profile/profile';
import { toCsv } from '../../src/core/share/csv';
import type { Unit, UnitIndex } from '../../src/core/units/types';
import { buildIndex as buildUnitIndex } from '../../src/core/units/units';
import { readUrlState } from '../../src/core/url/state';

// Schemat walidacji szardu części (miasto / obszar wiejski) odpowiadający typowi PartsShard
const PartsShardSchema = z.object({
  voivodeship: z.string().length(2),
  years: z.record(z.string(), z.array(z.number().int())),
  values: z.record(
    z.string().length(7),
    z.record(z.string(), z.array(z.number().nullable())),
  ),
});

describe('core-contracts-and-fuzz (T06)', () => {
  describe('1. Kontrakty Zod wyjścia skryptów danych', () => {
    describe('library-index.mjs i LibraryIndexSchema', () => {
      const validCatalog = {
        subjects: {
          K1: { name: 'Kategoria 1', parent: null },
          P1: { name: 'Podkategoria 1', parent: 'K1' },
        },
        variables: {
          101: { id: 101, subjectId: 'P1', n1: 'Wskaźnik A', level: 6, unit: 'osoba' },
          102: { id: 102, subjectId: 'P1', n1: 'Wskaźnik B', n2: 'kobiety', level: 5, unit: '%' },
          103: { id: 103, subjectId: 'K1', n1: 'Niski szczebel', level: 2, unit: 'zł' }, // ignorowany (level < 5)
        },
      };

      const validState = {
        done: { 101: '2026-10-30' },
      };

      it('wyjście buildIndex przechodzi walidację LibraryIndexSchema', () => {
        const rawOutput = buildIndex(validCatalog, validState);
        const parsed = LibraryIndexSchema.safeParse(rawOutput);

        expect(parsed.success).toBe(true);
        if (!parsed.success) return;

        expect(parsed.data.version).toBe(1);
        expect(parsed.data.categories.K1).toEqual({ n: 'Kategoria 1', p: null });
        expect(parsed.data.categories.P1).toEqual({ n: 'Podkategoria 1', p: 'K1' });
        // Zmienna o poziomie 2 powinna być pominięta
        expect(parsed.data.variables).toHaveLength(2);
        expect(parsed.data.variables.map((v) => v.id)).toEqual([101, 102]);
        expect(parsed.data.variables[0].has).toBe(1);
        expect(parsed.data.variables[1].has).toBe(0);
      });

      it('parseLibraryIndex z src/core poprawnie parsuje lub zwraca null dla uszkodzonych danych', () => {
        const validOutput = buildIndex(validCatalog, validState);
        expect(parseLibraryIndex(validOutput)).not.toBeNull();

        // Uszkodzone struktury
        expect(parseLibraryIndex(null)).toBeNull();
        expect(parseLibraryIndex(undefined)).toBeNull();
        expect(parseLibraryIndex({})).toBeNull();
        expect(parseLibraryIndex({ ...validOutput, version: 2 })).toBeNull();
        expect(parseLibraryIndex({ ...validOutput, variables: [{ id: 'bad' }] })).toBeNull();
        expect(parseLibraryIndex({ ...validOutput, categories: 'not-an-object' })).toBeNull();
      });
    });

    describe('build-parts.mjs i PartsShardSchema', () => {
      const unitsFixture: Unit[] = [
        { teryt: '02', name: 'Dolnośląskie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
        { teryt: '14', name: 'Mazowieckie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
      ];

      const partsFixture = {
        pop: {
          indicatorId: 'pop',
          years: [2021, 2022],
          values: {
            '0201014': [1200, 1250],
            '0201015': [800, null],
            '1402014': [3000, 3100],
          },
        },
      };

      it('wyjście buildPartsShards spełnia schemat Zod PartsShardSchema', () => {
        const shards = buildPartsShards(partsFixture, unitsFixture);
        expect(Object.keys(shards).sort()).toEqual(['02', '14']);

        for (const [woj, shard] of Object.entries(shards)) {
          const parsed = PartsShardSchema.parse(shard);
          expect(parsed.voivodeship).toBe(woj);
        }
      });

      it('odrzuca szard z niepoprawnym kodem województwa lub typem danych', () => {
        const invalidShard1 = {
          voivodeship: '020', // zła długość
          years: { pop: [2022] },
          values: { '0201014': { pop: [100] } },
        };
        expect(PartsShardSchema.safeParse(invalidShard1).success).toBe(false);

        const invalidShard2 = {
          voivodeship: '02',
          years: { pop: ['2022'] }, // string zamiast number
          values: { '0201014': { pop: [100] } },
        };
        expect(PartsShardSchema.safeParse(invalidShard2).success).toBe(false);
      });
    });

    describe('Schematy odpowiedzi BDL GUS (bdl/schemas.ts)', () => {
      it('waliduje poprawne odpowiedzi BDL i odrzuca zniekształcone dane', () => {
        const validBdlData = {
          totalRecords: 1,
          results: [
            {
              id: '010203040506',
              name: 'Jednostka testowa',
              values: [
                { year: '2022', val: 154.2 },
                { year: '2023', val: null },
              ],
            },
          ],
        };
        expect(dataByVariableResponseSchema.safeParse(validBdlData).success).toBe(true);

        const malformedBdlData = {
          totalRecords: 'one', // zły typ
          results: [{ id: 123 }],
        };
        expect(dataByVariableResponseSchema.safeParse(malformedBdlData).success).toBe(false);

        expect(unitResultSchema.safeParse({ id: '02', name: 'Woj', level: 2 }).success).toBe(true);
        expect(unitResultSchema.safeParse({ id: '02' }).success).toBe(false);
      });
    });
  });

  describe('2. Testy brzegowe i fuzzing parsera URL (readUrlState)', () => {
    const testUnits: Unit[] = [
      { teryt: '02', name: 'dolnośląskie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '0201', name: 'bolesławiecki', level: 'pow', parent: '02', bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
      { teryt: '14', name: 'mazowieckie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
    ];
    const unitIndex: UnitIndex = buildUnitIndex(testUnits);

    it('bezpiecznie ignoruje ataki path traversal i wstrzyknięcia w ?u=', () => {
      const maliciousCases = [
        '?u=../../../',
        '?u=../../etc/passwd',
        '?u=..%2F..%2F..%2Fetc%2Fpasswd',
        '?u=....//....//',
        '?u=<script>alert(1)</script>',
        '?u=\' OR 1=1--',
        '?u=C:\\Windows\\System32\\cmd.exe',
      ];

      for (const query of maliciousCases) {
        const state = readUrlState(query, unitIndex);
        expect(state.u).toBeUndefined();
      }
    });

    it('obsługuje nieznane i skrajne kody TERYT', () => {
      expect(readUrlState('?u=9999999', unitIndex).u).toBeUndefined();
      expect(readUrlState('?u=00', unitIndex).u).toBeUndefined();
      expect(readUrlState('?u=null', unitIndex).u).toBeUndefined();
      expect(readUrlState('?u=undefined', unitIndex).u).toBeUndefined();
      expect(readUrlState('?u=', unitIndex).u).toBeUndefined();
    });

    it('weryfikuje parametr porównania ?c= (identyczne, nieznane, uszkodzone)', () => {
      // Dwa poprawne kody TERYT z indeksu
      const validC = readUrlState('?c=02,14', unitIndex);
      expect(validC.c).toBe('02,14');

      // Identyczne poprawne kody
      const sameC = readUrlState('?c=02,02', unitIndex);
      expect(sameC.c).toBe('02,02');

      // Nieznany kod w jednej z pozycji z indeksem
      expect(readUrlState('?c=02,9999999', unitIndex).c).toBeUndefined();
      expect(readUrlState('?c=9999999,02', unitIndex).c).toBeUndefined();
      expect(readUrlState('?c=../../,02', unitIndex).c).toBeUndefined();

      // Zły format podziału przecinkami
      expect(readUrlState('?c=', unitIndex).c).toBeUndefined();
      expect(readUrlState('?c=02', unitIndex).c).toBeUndefined();
      expect(readUrlState('?c=02,14,0201', unitIndex).c).toBeUndefined();
      expect(readUrlState('?c=,,,', unitIndex).c).toBeUndefined();
    });

    it('filtruje parametry roku ?y= i poziomu ?l=', () => {
      // Nieprawidłowe lata
      const invalidYears = ['?y=abc', '?y=2024.5', '?y=2024abc', '?y=NaN', '?y=Infinity', '?y=0x10', '?y='];
      for (const q of invalidYears) {
        expect(readUrlState(q, unitIndex).y).toBeUndefined();
      }

      // Poprawny rok
      expect(readUrlState('?y=2024', unitIndex).y).toBe(2024);

      // Poziomy
      expect(readUrlState('?l=woj', unitIndex).l).toBe('woj');
      expect(readUrlState('?l=pow', unitIndex).l).toBe('pow');
      expect(readUrlState('?l=gmi', unitIndex).l).toBe('gmi');
      expect(readUrlState('?l=kraj', unitIndex).l).toBeUndefined();
      expect(readUrlState('?l=../../../', unitIndex).l).toBeUndefined();
    });

    it('odporność na ekstremalnie długie stringi i brak zatrucia prototypu (prototype pollution)', () => {
      const hugeString = 'a'.repeat(25000);
      const stateHuge = readUrlState(`?u=${hugeString}&i=${hugeString}&y=2024&c=${hugeString},${hugeString}`, unitIndex);

      expect(stateHuge.u).toBeUndefined();
      expect(stateHuge.i).toBeUndefined();
      expect(stateHuge.c).toBeUndefined();
      expect(stateHuge.y).toBe(2024);

      // Próba zatrucia prototypu
      readUrlState('?__proto__[polluted]=yes&constructor[prototype][polluted]=yes', unitIndex);
      expect((Object.prototype as unknown as { polluted?: unknown }).polluted).toBeUndefined();
    });

    it('fuzzing losowymi i nietypowymi ciągami znaków', () => {
      const fuzzInputs = [
        '?u=%00%01%02&i=%FF%FE',
        '?u=' + encodeURIComponent('💩🏳️‍🌈⚡'),
        '?u=\x00\x1f\x7f',
        '?i="\';><script>&y=999999999999999999999',
        '?&&&&&&===&&&',
        '?' + Array.from({ length: 60 }, (_, i) => `param${i}=value${i}`).join('&'),
      ];

      for (const input of fuzzInputs) {
        expect(() => readUrlState(input, unitIndex)).not.toThrow();
        const res = readUrlState(input, unitIndex);
        expect(typeof res).toBe('object');
      }
    });
  });

  describe('3. Testy brzegowe generatora CSV (toCsv)', () => {
    it('zawsze rozpoczyna się od BOM UTF-8 (\\uFEFF)', () => {
      const csvEmpty = toCsv([], []);
      expect(csvEmpty.startsWith('\uFEFF')).toBe(true);
      expect(csvEmpty.charCodeAt(0)).toBe(0xfeff);

      const csvWithData = toCsv(['Kolumna'], [['Wartość']]);
      expect(csvWithData.startsWith('\uFEFF')).toBe(true);
    });

    it('poprawnie cytuje i ucieka średniki oraz cudzysłowy', () => {
      const headers = ['Opis;Specjalny', 'Cudzysłów "Test"'];
      const rows = [
        ['tekst;z;srednikami', 'cytat "w środku" tekstu'],
        [';;;', '"""'],
      ];

      const csv = toCsv(headers, rows);

      expect(csv).toContain('"Opis;Specjalny"');
      expect(csv).toContain('"Cudzysłów ""Test"""');
      expect(csv).toContain('"tekst;z;srednikami"');
      expect(csv).toContain('"cytat ""w środku"" tekstu"');
      expect(csv).toContain('";;;"');
      expect(csv).toContain('""""""');
    });

    it('obsługuje znaki nowej linii wewnątrz komórek i końce linii \\r\\n', () => {
      const headers = ['Pole'];
      const rows = [
        ['Wiersz 1\nWiersz 2'],
        ['Wiersz A\r\nWiersz B'],
      ];

      const csv = toCsv(headers, rows);

      expect(csv).toContain('"Wiersz 1\nWiersz 2"');
      expect(csv).toContain('"Wiersz A\r\nWiersz B"');
      expect(csv.endsWith('\r\n')).toBe(true);
    });

    it('formatuje null, undefined, NaN oraz liczby zmiennoprzecinkowe', () => {
      const headers = ['A', 'B', 'C', 'Liczba', 'Zero'];
      const rows = [
        [null, undefined, Number.NaN, 1234.56, 0],
        ['', 'tekst', Number.POSITIVE_INFINITY, -42.1, 100],
      ];

      const csv = toCsv(headers, rows);

      // null, undefined, NaN, Infinity powinny być puste
      expect(csv).toContain(';;;1234,56;0');
      expect(csv).toContain(';tekst;;-42,1;100');
    });
  });

  describe('4. Testy brzegowe context() i compare()', () => {
    describe('context()', () => {
      const units: Unit[] = [
        { teryt: '02', name: 'dolnośląskie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
        { teryt: '14', name: 'mazowieckie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
        { teryt: '24', name: 'śląskie', level: 'woj', parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
      ];

      it('obsługuje przypadek identycznych wartości (unika zera w mianowniku position0to1)', () => {
        const valuesSame: IndicatorValues = {
          indicatorId: 'test',
          years: [2023],
          fetchedAt: '2023-01-01',
          values: {
            '02': [50],
            '14': [50],
            '24': [50],
          },
        };

        const res = context(valuesSame, units, '02', 2023, true);
        expect(res).not.toBeNull();
        if (!res) return;

        expect(res.min).toBe(50);
        expect(res.max).toBe(50);
        expect(res.medianPoland).toBe(50);
        expect(res.position0to1).toBe(0); // max === min -> 0 zamiast NaN
        expect(res.rank).toBe(1);
        expect(res.percentBelow).toBe(0);
      });

      it('zwraca null przy braku danych (same null lub brak jednostki/roku)', () => {
        const valuesNull: IndicatorValues = {
          indicatorId: 'test',
          years: [2023],
          fetchedAt: '2023-01-01',
          values: {
            '02': [null],
            '14': [null],
            '24': [null],
          },
        };

        expect(context(valuesNull, units, '02', 2023, true)).toBeNull();
        expect(context(valuesNull, units, '99999', 2023, true)).toBeNull();
        expect(context(valuesNull, units, '02', 1990, true)).toBeNull();
      });

      it('obsługuje pojedynczą jednostkę z danymi (max === min)', () => {
        const valuesSingle: IndicatorValues = {
          indicatorId: 'test',
          years: [2023],
          fetchedAt: '2023-01-01',
          values: {
            '02': [100],
            '14': [null],
          },
        };

        const res = context(valuesSingle, units, '02', 2023, true);
        expect(res).not.toBeNull();
        if (!res) return;

        expect(res.total).toBe(1);
        expect(res.position0to1).toBe(0);
        expect(res.percentBelow).toBe(0);
      });
    });

    describe('compare()', () => {
      const mockProfile = (teryt: string, level: 'woj' | 'pow' | 'gmi', indicators: UnitProfile['indicators']): UnitProfile => ({
        teryt,
        unit: { teryt, name: `J_${teryt}`, level, parent: null, bdlId: null, bbox: [0, 0, 0, 0], centroid: [0, 0] },
        indicators,
      });

      it('wartości identyczne zwracają "bez zmian"', () => {
        const profA = mockProfile('02', 'woj', [
          { indicatorId: 'ind-abs', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 100, year: 2023 },
          { indicatorId: 'ind-pct', indicator: { name: 'B', unit: '%', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 12.5, year: 2023 },
          { indicatorId: 'ind-zero', indicator: { name: 'C', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 0, year: 2023 },
        ]);
        const profB = mockProfile('14', 'woj', [
          { indicatorId: 'ind-abs', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 100, year: 2023 },
          { indicatorId: 'ind-pct', indicator: { name: 'B', unit: '%', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 12.5, year: 2023 },
          { indicatorId: 'ind-zero', indicator: { name: 'C', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 0, year: 2023 },
        ]);

        const res = compare(profA, profB);
        expect(res.rows[0].diffText).toBe('bez zmian');
        expect(res.rows[1].diffText).toBe('bez zmian');
        expect(res.rows[2].diffText).toBe('bez zmian');
      });

      it('obsługuje same braki danych null jako "brak danych"', () => {
        const profA = mockProfile('02', 'woj', [
          { indicatorId: 'i1', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: null, year: 2023 },
          { indicatorId: 'i2', indicator: { name: 'B', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 50, year: 2023 },
        ]);
        const profB = mockProfile('14', 'woj', [
          { indicatorId: 'i1', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: null, year: 2023 },
          { indicatorId: 'i2', indicator: { name: 'B', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: null, year: 2023 },
        ]);

        const res = compare(profA, profB);
        expect(res.rows[0].diffText).toBe('brak danych');
        expect(res.rows[1].diffText).toBe('brak danych');
      });

      it('zabezpieczenie przed zerem w mianowniku (bValue === 0)', () => {
        const profA = mockProfile('02', 'woj', [
          // bValue = 0 dla jednostki innej niż % -> podaje kierunek "wyżej" / "niżej" bez dzielenia przez zero
          { indicatorId: 'i1', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 15, year: 2023 },
          { indicatorId: 'i2', indicator: { name: 'B', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: -10, year: 2023 },
          // bValue = 0 dla jednostki % -> wylicza punkty procentowe
          { indicatorId: 'i3', indicator: { name: 'C', unit: '%', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 5.2, year: 2023 },
        ]);
        const profB = mockProfile('14', 'woj', [
          { indicatorId: 'i1', indicator: { name: 'A', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 0, year: 2023 },
          { indicatorId: 'i2', indicator: { name: 'B', unit: 'osoba', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 0, year: 2023 },
          { indicatorId: 'i3', indicator: { name: 'C', unit: '%', minLevel: 'woj', group: 'G', higherIsBetter: true }, value: 0, year: 2023 },
        ]);

        const res = compare(profA, profB);
        expect(res.rows[0].diffText).toBe('wyżej');
        expect(res.rows[1].diffText).toBe('niżej');
        expect(res.rows[2].diffText).toBe('wyżej o 5,2 p.p.');
      });

      it('ustawia flagę differentLevels dla jednostek z różnych poziomów', () => {
        const profWoj = mockProfile('02', 'woj', []);
        const profPow = mockProfile('0201', 'pow', []);

        expect(compare(profWoj, profPow).differentLevels).toBe(true);
        expect(compare(profWoj, profWoj).differentLevels).toBe(false);
      });
    });
  });
});
