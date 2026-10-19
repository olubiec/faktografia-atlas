import { describe, expect, it } from 'vitest';
import { buildProfile } from '../../src/core/profile/profile';
import profileFixture from '../fixtures/synthetic/profile-sample.json';
import type { Unit } from '../../src/core/units/types';

describe('buildProfile - logika profilu jednostki', () => {
  const units = profileFixture.units as Unit[];
  const indicators = profileFixture.indicators as any[];
  const valuesById = profileFixture.valuesById as Record<string, any>;

  it('zwraca pusty profil dla nieznanego kodu TERYT bez zgłaszania wyjątku', () => {
    const profile = buildProfile('9999999', indicators, valuesById, units);
    expect(profile).toBeDefined();
    expect(profile.teryt).toBe('9999999');
    expect(profile.unit).toBeNull();
    expect(profile.indicators).toEqual([]);
  });

  it('oblicza poprawne wartości i pozycję w rankingu dla wskaźnika higherIsBetter: true (z remisami)', () => {
    // 0201011 ma dla ind-higher-better w 2023 r. wartość 150.0
    // 0201022 ma też 150.0 (remis!)
    // 0202011 ma 100.0
    // 0401011 ma null w 2023 r.
    const profile = buildProfile('0201011', indicators, valuesById, units);

    const item = profile.indicators.find((i) => i.indicatorId === 'ind-higher-better');
    expect(item).toBeDefined();
    expect(item?.year).toBe(2023);
    expect(item?.value).toBe(150.0);
    expect(item?.neutral).toBe(false);
    expect(item?.fromParent).toBeUndefined();

    // W kraju są 3 jednostki gmi z nie-null wartościami w 2023:
    // 0201011 (150.0) -> rank 1
    // 0201022 (150.0) -> rank 1
    // 0202011 (100.0) -> rank 3
    expect(item?.totalNational).toBe(3);
    expect(item?.rankNational).toBe(1);

    // W województwie 02 są 3 jednostki gmi (wszystkie 3 mają wartości):
    expect(item?.totalVoivodeship).toBe(3);
    expect(item?.rankVoivodeship).toBe(1);
  });

  it('oblicza remis i kolejność dla 3 miejsca w wyżej-lepiej', () => {
    const profile = buildProfile('0202011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-higher-better');

    expect(item?.value).toBe(100.0);
    expect(item?.rankNational).toBe(3); // Za dwoma remisującymi miejscami 1
    expect(item?.rankVoivodeship).toBe(3);
  });

  it('obsługuje wskaźnik higherIsBetter: false (niżej lepiej)', () => {
    // ind-lower-better w 2023:
    // 0201022: 2.5 (miejsce 1)
    // 0201011: 5.0 (miejsce 2)
    // 0202011: 10.0 (miejsce 3)
    // 0401011: 12.0 (miejsce 4)
    const profile = buildProfile('0201011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-lower-better');

    expect(item).toBeDefined();
    expect(item?.year).toBe(2023);
    expect(item?.value).toBe(5.0);
    expect(item?.neutral).toBe(false);

    // W kraju są 4 jednostki: 2.5 < 5.0 < 10.0 < 12.0
    // 5.0 ma 1 wartość mniejszą od siebie (2.5), więc miejsce 2
    expect(item?.totalNational).toBe(4);
    expect(item?.rankNational).toBe(2);

    // W woj. 02 są 3 jednostki (2.5, 5.0, 10.0)
    expect(item?.totalVoivodeship).toBe(3);
    expect(item?.rankVoivodeship).toBe(2);
  });

  it('obsługuje wskaźnik neutralny (higherIsBetter: null) z flagą neutral: true', () => {
    // ind-neutral w 2023:
    // 0201022: 1000.0 (miejsce 1)
    // 0201011: 500.0 (miejsce 2)
    // 0401011: 250.0 (miejsce 3)
    // 0202011: null (brak udziału w rankingu)
    const profile = buildProfile('0201011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-neutral');

    expect(item).toBeDefined();
    expect(item?.year).toBe(2023);
    expect(item?.value).toBe(500.0);
    expect(item?.neutral).toBe(true);

    // 0202011 ma null, więc w kraju 3 jednostki z wartościami
    expect(item?.totalNational).toBe(3);
    expect(item?.rankNational).toBe(2);

    // W woj 02 tylko 2 jednostki z wartościami (0201011 i 0201022)
    expect(item?.totalVoivodeship).toBe(2);
    expect(item?.rankVoivodeship).toBe(2);
  });

  it('jednostka z wartością null nie bierze udziału w rankingu i nie dostaje miejsca', () => {
    const profile = buildProfile('0202011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-neutral');

    expect(item).toBeDefined();
    expect(item?.value).toBeNull();
    expect(item?.rankNational).toBeNull();
    expect(item?.rankVoivodeship).toBeNull();
  });

  it('bierze wartość jednostki nadrzędnej i ustawia fromParent gdy minLevel wyższy niż poziom jednostki', () => {
    // Gmina 0201011 (level: gmi). Wskaźnik ind-parent-pow ma minLevel: pow.
    // Parent gminy to 0201 (powiat bolesławiecki).
    // Powiaty w 2023 r.:
    // 0401: 5000.0 (miejsce 1 w kraju)
    // 0201: 4500.0 (miejsce 2 w kraju, miejsce 1 w woj. 02)
    // 0202: 4000.0 (miejsce 3 w kraju, miejsce 2 w woj. 02)
    const profile = buildProfile('0201011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-parent-pow');

    expect(item).toBeDefined();
    expect(item?.year).toBe(2023);
    expect(item?.value).toBe(4500.0);
    expect(item?.fromParent).toBe('0201');

    // Rankuje na poziomie powiatu (pow)
    expect(item?.totalNational).toBe(3);
    expect(item?.rankNational).toBe(2);

    expect(item?.totalVoivodeship).toBe(2);
    expect(item?.rankVoivodeship).toBe(1);
  });

  it('znajduje ostatni rok z wartością gdy nowsze lata mają null', () => {
    // 0401011 ma w ind-higher-better: 2022: 90.0, 2023: null
    const profile = buildProfile('0401011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-higher-better');

    expect(item).toBeDefined();
    expect(item?.year).toBe(2022);
    expect(item?.value).toBe(90.0);
  });

  it('zwraca pełną serię lat (series) w kolejności rosnącej z zachowaniem null', () => {
    // 0401011 ind-higher-better: 2022: 90.0, 2023: null
    const profile = buildProfile('0401011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-higher-better');

    expect(item).toBeDefined();
    expect(item?.series).toEqual([
      { year: 2022, value: 90.0 },
      { year: 2023, value: null },
    ]);
  });

  it('pobiera serię z jednostki nadrzędnej gdy zdefiniowane jest minLevel', () => {
    // Gmina 0201011 (fromParent: 0201)
    const profile = buildProfile('0201011', indicators, valuesById, units);
    const item = profile.indicators.find((i) => i.indicatorId === 'ind-parent-pow');

    expect(item).toBeDefined();
    expect(item?.fromParent).toBe('0201');
    expect(item?.series).toEqual([{ year: 2023, value: 4500.0 }]);
  });
});
