import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import { buildUnitPaths, isCityCounty, slugify, type SlugUnit } from '../../src/core/seo/slug';

const ALL = units as SlugUnit[];
const { byTeryt, byPath } = buildUnitPaths(ALL);

describe('W25-S05: adresy miejsc', () => {
  it('slugify: polskie znaki i separatory', () => {
    expect(slugify('Łódź')).toBe('lodz');
    expect(slugify('Kędzierzyn-Koźle')).toBe('kedzierzyn-kozle');
    expect(slugify('  Żółć / gęślą ')).toBe('zolc-gesla');
  });

  it('wszystkie 2875 jednostek ma adres, adresy są poprawne i odwzorowanie odwrotne zgodne', () => {
    expect(ALL).toHaveLength(2875);
    expect(byTeryt.size).toBe(2875);
    for (const path of byTeryt.values()) expect(path).toMatch(/^\/[a-z0-9/-]+$/);
    // 66 miast ma dwa TERYT (powiat i gmina) i jeden adres.
    expect(new Set(byTeryt.values()).size).toBe(2875 - 66);
    expect(byPath.size).toBe(2875 - 66);
    for (const [path, teryt] of byPath) expect(byTeryt.get(teryt)).toBe(path);
  });

  it('66 miast na prawach powiatu ma /miasto/, powiat i gmina wskazują ten sam adres', () => {
    const cityPaths = [...byPath.keys()].filter((p) => p.startsWith('/miasto/'));
    expect(cityPaths).toHaveLength(66);
    expect(byTeryt.get('1261')).toBe('/miasto/krakow');
    expect(byTeryt.get('1261011')).toBe('/miasto/krakow');
    expect(byPath.get('/miasto/krakow')).toBe('1261011');
    expect(isCityCounty('1261')).toBe(true);
    expect(isCityCounty('1209')).toBe(false);
  });

  it('przykłady z zadania', () => {
    expect(byTeryt.get('12')).toBe('/wojewodztwo/malopolskie');
    expect(byTeryt.get('0201011')).not.toBe(byTeryt.get('0201022'));
    expect(byTeryt.get('0201011')).toBe('/gmina/boleslawiec-miasto');
    expect(byTeryt.get('0201022')).toBe('/gmina/boleslawiec-gmina-wiejska');
  });

  it('stabilność: 30 adresów zapisanych dosłownie (zmiana = zmiana adresów w Google, tylko za zgodą właściciela)', () => {
    const expected: Record<string, string> = {
      '02': '/wojewodztwo/dolnoslaskie',
      '12': '/wojewodztwo/malopolskie',
      '0201': '/powiat/boleslawiecki',
      '1201': '/powiat/bochenski',
      '1202': '/powiat/brzeski-malopolskie',
      '1204': '/powiat/dabrowski',
      '1209': '/powiat/myslenicki',
      '1405': '/powiat/grodziski-mazowieckie',
      '3005': '/powiat/grodziski-wielkopolskie',
      '2402': '/powiat/bielski-slaskie',
      '2002': '/powiat/bialostocki',
      '1261': '/miasto/krakow',
      '1261011': '/miasto/krakow',
      '1465': '/miasto/warszawa',
      '1465011': '/miasto/warszawa',
      '3064': '/miasto/poznan',
      '0201011': '/gmina/boleslawiec-miasto',
      '0201022': '/gmina/boleslawiec-gmina-wiejska',
      '1211011': '/gmina/nowy-targ-miasto',
      '0802011': '/gmina/gubin-miasto',
      '0608011': '/gmina/lubartow-miasto',
      '1201011': '/gmina/bochnia-miasto',
      '1816011': '/gmina/dynow-miasto',
      '2611011': '/gmina/starachowice',
      '2416011': '/gmina/poreba',
      '2403011': '/gmina/cieszyn',
      '0402011': '/gmina/brodnica-miasto',
      '2807011': '/gmina/ilawa-miasto',
      '1006022': '/gmina/andrespol',
      '1415022': '/gmina/czarnia',
    };
    expect(Object.keys(expected)).toHaveLength(30);
    for (const [teryt, path] of Object.entries(expected)) expect(byTeryt.get(teryt)).toBe(path);
  });
});
