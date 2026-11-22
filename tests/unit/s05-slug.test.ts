import { describe, expect, it } from 'vitest';
import unitsData from '../fixtures/seo/units.json';
import { buildUnitPaths, slugify, type SlugUnit } from '../../src/core/seo/slug';

// Pełna lista 2875 jednostek nagrana z public/data/units.json (tylko teryt, nazwa, poziom, rodzic).
const units = unitsData as SlugUnit[];
const { pathByTeryt, terytByPath } = buildUnitPaths(units);

describe('S05 slugify', () => {
  it('zamienia polskie litery i znaki na ASCII z myślnikami', () => {
    expect(slugify('Łódź')).toBe('lodz');
    expect(slugify('Kędzierzyn-Koźle')).toBe('kedzierzyn-kozle');
    expect(slugify('Ząbkowice Śląskie')).toBe('zabkowice-slaskie');
    expect(slugify('ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż')).toBe('acelnoszz-acelnoszz');
  });
  it('bez podwójnych i skrajnych myślników', () => {
    expect(slugify('Słupia (Jędrzejowska)')).toBe('slupia-jedrzejowska');
    expect(slugify('  --A  ..  b--  ')).toBe('a-b');
  });
});

describe('S05 adresy wszystkich jednostek', () => {
  it('lista ma 2875 jednostek i każda ma adres', () => {
    expect(units).toHaveLength(2875);
    expect(units.filter((u) => !pathByTeryt.has(u.teryt))).toEqual([]);
  });

  it('adresy są unikalne (poza parą powiat–gmina miasta na prawach powiatu) i tylko z [a-z0-9/-]', () => {
    // 66 miast ma jeden adres dla dwóch TERYT, więc unikalnych adresów jest 2875 − 66.
    const paths = [...pathByTeryt.values()];
    expect(new Set(paths).size).toBe(2875 - 66);
    expect(terytByPath.size).toBe(2875 - 66);
    for (const p of paths) expect(p).toMatch(/^\/(wojewodztwo|powiat|miasto|gmina)\/[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('odwzorowanie odwrotne jest zgodne', () => {
    for (const [path, teryt] of terytByPath) {
      expect(pathByTeryt.get(teryt)).toBe(path);
      expect(typeof teryt).toBe('string');
    }
    for (const [teryt, path] of pathByTeryt) {
      const back = terytByPath.get(path);
      // Gmina miasta na prawach powiatu wskazuje na stronę powiatu (ten sam adres).
      expect(back === teryt || back === teryt.slice(0, 4)).toBe(true);
    }
  });

  it('66 miast na prawach powiatu ma adres /miasto/, a TERYT powiatu i gminy wskazują ten sam adres', () => {
    const cities = [...terytByPath.keys()].filter((p) => p.startsWith('/miasto/'));
    expect(cities).toHaveLength(66);
    expect(pathByTeryt.get('1261')).toBe('/miasto/krakow');
    expect(pathByTeryt.get('1261011')).toBe('/miasto/krakow');
    expect(terytByPath.get('/miasto/krakow')).toBe('1261');
  });
});

describe('S05 przykłady', () => {
  it('województwo, Bolesławiec i Łódź', () => {
    expect(pathByTeryt.get('12')).toBe('/wojewodztwo/malopolskie');
    expect(pathByTeryt.get('0201011')).not.toBe(pathByTeryt.get('0201022'));
    expect(pathByTeryt.get('0201011')).toBe('/gmina/boleslawiec-miasto');
    expect(pathByTeryt.get('0201022')).toBe('/gmina/boleslawiec-gmina-wiejska');
    expect(pathByTeryt.get('1061')).toBe('/miasto/lodz');
  });

  it('powtórzona nazwa powiatu dostaje województwo, powtórzona nazwa gminy – rodzaj, potem powiat', () => {
    expect(pathByTeryt.get('1609')).toBe('/powiat/opolski-opolskie');
    expect(pathByTeryt.get('0219011')).toBe('/gmina/swidnica-miasto');
    expect(pathByTeryt.get('0219072')).toBe('/gmina/swidnica-gmina-wiejska-powiat-swidnicki');
  });

  it('w małej liście bez powtórzeń nie ma dopisków; całkiem powtórzona gmina dostaje TERYT', () => {
    const small = buildUnitPaths([
      { teryt: '99', name: 'testowe', level: 'woj', parent: null },
      { teryt: '9901', name: 'powiat testowy', level: 'pow', parent: '99' },
      { teryt: '9901012', name: 'Kąty', level: 'gmi', parent: '9901' },
      { teryt: '9901022', name: 'Kąty', level: 'gmi', parent: '9901' },
      { teryt: '9901032', name: 'Ług', level: 'gmi', parent: '9901' },
    ]);
    expect(small.pathByTeryt.get('9901')).toBe('/powiat/testowy');
    expect(small.pathByTeryt.get('9901032')).toBe('/gmina/lug');
    expect(small.pathByTeryt.get('9901012')).toBe('/gmina/katy-gmina-wiejska-powiat-testowy-9901012');
    expect(small.pathByTeryt.get('9901022')).toBe('/gmina/katy-gmina-wiejska-powiat-testowy-9901022');
  });
});

describe('S05 stabilność adresów (zmiana = zmiana adresów w Google, tylko za zgodą właściciela)', () => {
  const EXPECTED: Record<string, string> = {
    '02': '/wojewodztwo/dolnoslaskie',
    '12': '/wojewodztwo/malopolskie',
    '30': '/wojewodztwo/wielkopolskie',
    '0201': '/powiat/boleslawiecki',
    '0201011': '/gmina/boleslawiec-miasto',
    '0201022': '/gmina/boleslawiec-gmina-wiejska',
    '0208': '/powiat/klodzki',
    '0216022': '/gmina/gaworzyce',
    '0219011': '/gmina/swidnica-miasto',
    '0219072': '/gmina/swidnica-gmina-wiejska-powiat-swidnicki',
    '0805': '/powiat/slubicki',
    '1001': '/powiat/belchatowski',
    '1061': '/miasto/lodz',
    '1061011': '/miasto/lodz',
    '1206': '/powiat/krakowski',
    '1219': '/powiat/wielicki',
    '1219053': '/gmina/wieliczka',
    '1261': '/miasto/krakow',
    '1261011': '/miasto/krakow',
    '1418': '/powiat/piaseczynski',
    '1465': '/miasto/warszawa',
    '1465011': '/miasto/warszawa',
    '1609': '/powiat/opolski-opolskie',
    '1609112': '/gmina/tarnow-opolski',
    '2215': '/powiat/wejherowski',
    '2401': '/powiat/bedzinski',
    '2469': '/miasto/katowice',
    '2862': '/miasto/olsztyn',
    '3008': '/powiat/kepinski',
    '3262': '/miasto/szczecin',
  };

  it('30 wybranych jednostek ma dokładnie zapisane adresy', () => {
    expect(Object.keys(EXPECTED)).toHaveLength(30);
    const actual = Object.fromEntries(Object.keys(EXPECTED).map((t) => [t, pathByTeryt.get(t)]));
    expect(actual).toEqual(EXPECTED);
  });
});
