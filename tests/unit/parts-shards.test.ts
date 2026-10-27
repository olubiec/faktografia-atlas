import { describe, expect, it } from 'vitest';
import { buildPartsShards } from '../../scripts/data/build-parts.mjs';

describe('buildPartsShards (W1.18)', () => {
  const unitsFixture = [
    { teryt: '02', name: 'Dolnośląskie', level: 'woj', parent: null },
    { teryt: '04', name: 'Kujawsko-Pomorskie', level: 'woj', parent: null },
    { teryt: '06', name: 'Lubelskie', level: 'woj', parent: null },
    { teryt: '0201013', name: 'Gmina M-W 1', level: 'gmi', parent: '0201' },
    { teryt: '0401013', name: 'Gmina M-W 2', level: 'gmi', parent: '0401' },
  ];

  const partsByIndicatorFixture = {
    population: {
      indicatorId: 'population',
      years: [2021, 2022],
      values: {
        '0201014': [1000, 1050],
        '0201015': [2000, 2100],
        '0401014': [1500, 1600],
        '0401015': [2500, 2600],
      },
    },
    density: {
      indicatorId: 'density',
      years: [2021, 2022],
      values: {
        '0201014': [100, 105],
        '0201015': [50, 52],
        '0401014': [150, 160],
        '0401015': [75, 78],
      },
    },
    'forest-cover': {
      indicatorId: 'forest-cover',
      years: [2022],
      values: {
        '0201014': [12.5],
        '0201015': [35.0],
      },
    },
  };

  it('grupuje części do właściwego pliku województwa', () => {
    const shards = buildPartsShards(partsByIndicatorFixture, unitsFixture);

    expect(Object.keys(shards)).toEqual(['02', '04']);
    expect(shards['06']).toBeUndefined();

    expect(shards['02'].voivodeship).toBe('02');
    expect(Object.keys(shards['02'].values)).toEqual(['0201014', '0201015']);

    expect(shards['04'].voivodeship).toBe('04');
    expect(Object.keys(shards['04'].values)).toEqual(['0401014', '0401015']);
  });

  it('przechowuje lata osobno per wskaźnik', () => {
    const shards = buildPartsShards(partsByIndicatorFixture, unitsFixture);

    expect(shards['02'].years).toEqual({
      density: [2021, 2022],
      'forest-cover': [2022],
      population: [2021, 2022],
    });

    expect(shards['04'].years).toEqual({
      density: [2021, 2022],
      population: [2021, 2022],
    });
  });

  it('nie tworzy szardu dla województwa bez części', () => {
    const shards = buildPartsShards(partsByIndicatorFixture, unitsFixture);
    expect(shards['06']).toBeUndefined();
  });

  it('zwraca wynik będący czystym obiektem JSON bez wcięć i znaczników czasu', () => {
    const shards = buildPartsShards(partsByIndicatorFixture, unitsFixture);
    const jsonStr = JSON.stringify(shards['02']);

    expect(jsonStr).not.toContain('\n');
    expect(jsonStr).not.toContain('fetchedAt');
    expect(jsonStr).not.toContain('generatedAt');

    const parsed = JSON.parse(jsonStr);
    expect(parsed.voivodeship).toBe('02');
    expect(parsed.values['0201014'].population).toEqual([1000, 1050]);
    expect(parsed.values['0201014'].density).toEqual([100, 105]);
    expect(parsed.values['0201014']['forest-cover']).toEqual([12.5]);
  });

  it('ponowne uruchomienie na tych samych danych daje identyczny wynik', () => {
    const run1 = buildPartsShards(partsByIndicatorFixture, unitsFixture);
    const run2 = buildPartsShards(partsByIndicatorFixture, unitsFixture);

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
  });
});
