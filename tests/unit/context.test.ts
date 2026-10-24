import { describe, it, expect } from 'vitest';
import { context } from '../../src/core/explain/context';
import type { IndicatorValues } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('W1.6 Na tle kraju - Obliczenia context()', () => {
  const units: Unit[] = [
    { teryt: '12', bdlId: null, name: 'małopolskie', level: 'woj', parent: null, bbox: [0,0,0,0], centroid: [0,0] },
    { teryt: '14', bdlId: null, name: 'mazowieckie', level: 'woj', parent: null, bbox: [0,0,0,0], centroid: [0,0] },
    { teryt: '24', bdlId: null, name: 'śląskie', level: 'woj', parent: null, bbox: [0,0,0,0], centroid: [0,0] },

    // Powiaty w mazowieckim
    { teryt: '1401000', bdlId: null, name: 'białobrzeski', level: 'pow', parent: '14', bbox: [0,0,0,0], centroid: [0,0] },
    { teryt: '1402000', bdlId: null, name: 'ciechanowski', level: 'pow', parent: '14', bbox: [0,0,0,0], centroid: [0,0] },
    { teryt: '1403000', bdlId: null, name: 'garwoliński', level: 'pow', parent: '14', bbox: [0,0,0,0], centroid: [0,0] },

    // Powiaty w małopolskim
    { teryt: '1201000', bdlId: null, name: 'bocheński', level: 'pow', parent: '12', bbox: [0,0,0,0], centroid: [0,0] },
    { teryt: '1202000', bdlId: null, name: 'brzeski', level: 'pow', parent: '12', bbox: [0,0,0,0], centroid: [0,0] },

    // Jednostka bez danych dla testowania null
    { teryt: '1499000', bdlId: null, name: 'bez_danych', level: 'pow', parent: '14', bbox: [0,0,0,0], centroid: [0,0] },
  ];

  const values: IndicatorValues = {
    indicatorId: 'test-indicator',
    years: [2022, 2023],
    fetchedAt: '2023-01-01',
    values: {
      '12': [100, 110], // woj małopolskie
      '14': [200, 220], // woj mazowieckie
      '24': [150, 160], // woj śląskie

      '1401000': [10, 20],
      '1402000': [20, 30],
      '1403000': [40, 50],

      '1201000': [5, 15],
      '1202000': [35, 45],

      '1499000': [null, null],
    }
  };

  it('zwraca null gdy jednostka nie istnieje', () => {
    expect(context(values, units, '99', 2023, true)).toBeNull();
  });

  it('zwraca null gdy rok nie występuje w values', () => {
    expect(context(values, units, '1401000', 2021, true)).toBeNull();
  });

  it('zwraca null gdy jednostka nie ma wartości w danym roku', () => {
    expect(context(values, units, '1499000', 2023, true)).toBeNull();
  });

  it('oblicza poprawnie medianę i parametry dla województwa (nieparzysta liczba woj. = 3)', () => {
    // 2023: małopolskie=110, śląskie=160, mazowieckie=220
    const res = context(values, units, '24', 2023, true)!;
    expect(res).not.toBeNull();
    expect(res.total).toBe(3);
    expect(res.medianPoland).toBe(160); // Środek po posortowaniu [110, 160, 220]
    expect(res.min).toBe(110);
    expect(res.max).toBe(220);
    expect(res.sameInVoivodeship).toBeNull(); // Dla województwa zwracamy null
  });

  it('oblicza dla parzystej liczby elementów i poprawny percentBelow gdy wyżej = lepiej', () => {
    // 2022 powiaty: 1201000=5, 1401000=10, 1402000=20, 1202000=35, 1403000=40 (Razem: 5)
    // dodajmy do testu parzystości sztuczny przypadek, wywołując na 2023 roku
    // 2023 powiaty: 1201000=15, 1401000=20, 1402000=30, 1202000=45, 1403000=50
    const res = context(values, units, '1402000', 2023, true)!; // Wartość 30
    expect(res.total).toBe(5);
    // Mediana dla [15, 20, 30, 45, 50] to 30
    expect(res.medianPoland).toBe(30);
    expect(res.min).toBe(15);
    expect(res.max).toBe(50);
    // Gorsze są te mniejsze: 15, 20 (2 sztuki z 5) -> 40%
    expect(res.percentBelow).toBe(40);
  });

  it('odwraca kierunek dla wyżej = gorzej (higherIsBetter = false)', () => {
    const res = context(values, units, '1402000', 2023, false)!; // Wartość 30
    // Gorsze są teraz większe: 45, 50 (2 sztuki z 5) -> 40%
    expect(res.percentBelow).toBe(40);
  });

  it('zlicza context.sameInVoivodeship dla powiatu', () => {
    // 2023: powiat 1402000 (mazowieckie), wartosc = 30
    // Powiaty w mazowieckim: 1401000=20, 1402000=30, 1403000=50 -> median = 30
    const res = context(values, units, '1402000', 2023, true)!;
    expect(res.sameInVoivodeship).not.toBeNull();
    expect(res.sameInVoivodeship?.median).toBe(30);
    expect(res.sameInVoivodeship?.min).toBe(20);
    expect(res.sameInVoivodeship?.max).toBe(50);
    // Gorsze (wyżej to lepiej) < 30 -> 20 (1 szt. z 3) -> ~33%
    expect(res.sameInVoivodeship?.percentBelow).toBe(33);
  });

  it('position0to1 wynosi pomiędzy 0 a 1 poprawnie', () => {
    const res = context(values, units, '1202000', 2023, true)!; // Wartość 45
    // Min 15, Max 50 -> (45-15)/(50-15) = 30 / 35 ≈ 0.857
    expect(res.position0to1).toBeCloseTo(0.857, 3);
  });

  it('obsługuje wyliczenia dla parzystej liczby elementów', () => {
    // Odfiltrujmy z testu garwoliński by mieć 4 powiaty (15, 20, 30, 45) -> med: 25
    const evenValues: IndicatorValues = {
      ...values,
      values: { ...values.values, '1403000': [null, null] } // brak
    };
    const res = context(evenValues, units, '1402000', 2023, true)!;
    expect(res.total).toBe(4);
    // [15, 20, 30, 45] -> (20+30)/2 = 25
    expect(res.medianPoland).toBe(25);
  });
});
