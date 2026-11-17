import { describe, expect, it } from 'vitest';
import {
  RANKINGS_DEFAULTS,
  applyRankingsChange,
  readRankingsState,
  writeRankingsSearch,
  type RankingsState,
} from '../../src/core/ranking/rankings-url';

const base = RANKINGS_DEFAULTS;

describe('rankings-url', () => {
  it('okrągłość: zapis i odczyt dają ten sam stan', () => {
    const states: RankingsState[] = [
      { ...base, i: 'density' },
      { ...base, l: 'gmi', w: '12' },
      { ...base, l: 'pow', y: 2020 },
      { ...base, q: 'Łódź' },
      { ...base, l: 'gmi', y: 1999, w: '02', q: 'Gdańsk & okolice' },
      { ...base, y: 2100, q: 'a'.repeat(60) },
    ];
    for (const s of states) {
      expect(readRankingsState(writeRankingsSearch(s))).toEqual(s);
    }
  });

  it('pusty adres daje wartości domyślne, a domyślne dają pusty zapis', () => {
    expect(readRankingsState('')).toEqual(RANKINGS_DEFAULTS);
    expect(writeRankingsSearch(RANKINGS_DEFAULTS)).toBe('');
    expect(RANKINGS_DEFAULTS).toMatchObject({ y: null, w: null, q: '' });
  });

  it('niepoprawne wartości wracają do domyślnych', () => {
    expect(readRankingsState('?i=nie-ma-takiego').i).toBe(base.i);
    expect(readRankingsState('?l=xyz').l).toBe(base.l);
    expect(readRankingsState('?y=abc').y).toBeNull();
    expect(readRankingsState('?y=99999').y).toBeNull();
    expect(readRankingsState('?y=1899').y).toBeNull();
    expect(readRankingsState('?w=1').w).toBeNull();
    expect(readRankingsState('?w=ab').w).toBeNull();
    expect(readRankingsState('?w=123').w).toBeNull();
  });

  it('q: polskie znaki, przycięcie i limit 60 znaków', () => {
    const s = readRankingsState('?q=%C5%81%C3%B3d%C5%BA');
    expect(s.q).toBe('Łódź');
    expect(writeRankingsSearch(s)).toBe('?q=%C5%81%C3%B3d%C5%BA');
    expect(readRankingsState('?q=%20%20abc%20%20').q).toBe('abc');
    expect(readRankingsState(`?q=${'x'.repeat(80)}`).q).toHaveLength(60);
  });

  it('nieznane parametry są ignorowane', () => {
    const s = readRankingsState('?foo=1&i=density');
    expect(s).toEqual({ ...base, i: 'density' });
    expect(Object.keys(s)).not.toContain('foo');
    expect(writeRankingsSearch(s)).not.toContain('foo');
  });

  it('własna funkcja isKnownIndicator przepuszcza wskaźniki z biblioteki', () => {
    expect(readRankingsState('?i=b60614').i).toBe(base.i);
    expect(readRankingsState('?i=b60614', (id) => id === 'b60614').i).toBe('b60614');
  });

  it('applyRankingsChange: zmiana i zeruje y, zmiana q go zachowuje', () => {
    const prev: RankingsState = { ...base, l: 'gmi', y: 2020, w: '12' };
    expect(applyRankingsChange(prev, { i: 'inny' }).y).toBeNull();
    expect(applyRankingsChange(prev, { l: 'pow' })).toMatchObject({ y: null, w: '12' });
    expect(applyRankingsChange(prev, { l: 'woj' }).w).toBeNull();
    expect(applyRankingsChange(prev, { q: 'Kraków' })).toEqual({ ...prev, q: 'Kraków' });
  });

  it('kod TERYT w zachowuje wiodące zero jako string', () => {
    const s = readRankingsState('?w=02');
    expect(s.w).toBe('02');
    expect(typeof s.w).toBe('string');
    expect(writeRankingsSearch({ ...base, w: '02' })).toBe('?w=02');
  });
});
