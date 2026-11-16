import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import { parseIntent } from '../../src/core/search/intent';
import { INDICATOR_PHRASES } from '../../src/core/search/intent-synonyms';
import type { Unit } from '../../src/core/units/types';

const mk = (teryt: string, name: string, level: Unit['level']): Unit => ({
  teryt, bdlId: null, name, level, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0],
});
const units: Unit[] = [
  mk('1261000', 'Kraków', 'pow'),
  mk('1465011', 'Wałcz', 'gmi'),
  mk('3217011', 'Wałcz', 'pow'),
  mk('1206011', 'Gdów', 'gmi'),
  mk('1206012', 'Gdów', 'gmi'),
];
const ctx = { units, indicators };

describe('parseIntent', () => {
  it('ignoruje wielkość liter i polskie znaki', () => {
    const a = parseIntent('Bezrobocie KRAKÓW 2020', ctx);
    const b = parseIntent('bezrobocie krakow 2020', ctx);
    expect(a).toEqual(b);
    expect(a).toMatchObject({ i: 'unemployment-rate', y: 2020, u: '1261000' });
  });

  it('pomija poziom poniżej minLevel i dodaje notkę', () => {
    const r = parseIntent('bezrobocie gminy', ctx);
    expect(r?.l).toBeUndefined();
    expect(r?.notes).toContain('GUS podaje te dane tylko do powiatów');
  });

  it('ustawia poziom gdy wskaźnik go obsługuje', () => {
    expect(parseIntent('gęstość gminy', ctx)).toMatchObject({ i: 'density', l: 'gmi' });
  });

  it('sama nazwa bez wskaźnika daje null', () => {
    expect(parseIntent('Wałcz', ctx)).toBeNull();
  });

  it('nazwa pasująca do dwóch jednostek: brak u i notka', () => {
    const r = parseIntent('lasy gdów', ctx);
    expect(r?.u).toBeUndefined();
    expect(r?.notes).toContain('kilka miejsc o tej nazwie');
  });

  it('rok spoza zakresu jest pomijany', () => {
    expect(parseIntent('lasy 1900', ctx)?.y).toBeUndefined();
  });
});

describe('słownik synonimów', () => {
  it('każde id istnieje w indicators.json, a każdy wskaźnik ma min. 2 frazy', () => {
    const ids = new Set(indicators.map((x) => x.id));
    const count = new Map<string, number>();
    for (const id of Object.values(INDICATOR_PHRASES)) {
      expect(ids.has(id)).toBe(true);
      count.set(id, (count.get(id) ?? 0) + 1);
    }
    for (const id of ids) expect(count.get(id) ?? 0).toBeGreaterThanOrEqual(2);
  });
});

describe('poziom a minLevel', () => {
  it('powiaty dla wskaźnika do powiatów są dozwolone', () => {
    expect(parseIntent('bezrobocie powiaty', ctx)?.l).toBe('pow');
  });
});
