import { describe, expect, it } from 'vitest';
import unitsData from '../fixtures/seo/units.json';
import type { SlugUnit } from '../../src/core/seo/slug';
import { mapCanonicalPath, placesIndex, unitPagePath } from '../../src/core/seo/unit-link';

// Pełna lista 2875 jednostek nagrana z public/data/units.json – ta sama, którą mapa wczytuje w przeglądarce.
const units = unitsData as SlugUnit[];

describe('S09 unitPagePath', () => {
  it('miasto na prawach powiatu: TERYT powiatu i gminy prowadzą do /miasto/krakow', () => {
    expect(unitPagePath('1261', units)).toBe('/miasto/krakow');
    expect(unitPagePath('1261011', units)).toBe('/miasto/krakow');
  });

  it('województwo, powiat i gmina dostają swoje adresy', () => {
    expect(unitPagePath('12', units)).toBe('/wojewodztwo/malopolskie');
    expect(unitPagePath('1206', units)).toBe('/powiat/krakowski');
    expect(unitPagePath('1206', units)).toMatch(/^\/powiat\//);
  });

  it('nieznany TERYT albo brak listy jednostek → null (link się nie pokazuje)', () => {
    expect(unitPagePath('9999', units)).toBeNull();
    expect(unitPagePath('', units)).toBeNull();
    expect(unitPagePath('1261', null)).toBeNull();
  });
});

describe('S09 kanoniczny adres /mapa', () => {
  it('przy ?u=<teryt> wskazuje stronę miejsca', () => {
    expect(mapCanonicalPath('?u=12', units)).toBe('/wojewodztwo/malopolskie');
    expect(mapCanonicalPath('?e2e&u=1261011&l=gmi', units)).toBe('/miasto/krakow');
  });

  it('bez u, z nieznanym u albo przed wczytaniem jednostek → /mapa', () => {
    expect(mapCanonicalPath('', units)).toBe('/mapa');
    expect(mapCanonicalPath('?i=ludnosc', units)).toBe('/mapa');
    expect(mapCanonicalPath('?u=9999', units)).toBe('/mapa');
    expect(mapCanonicalPath('?u=12', null)).toBe('/mapa');
  });
});

describe('S09 spis miejsc (/miejsca)', () => {
  const index = placesIndex(units);

  it('ma 16 województw, każde z adresem strony', () => {
    expect(index).toHaveLength(16);
    for (const v of index) expect(v.path).toMatch(/^\/wojewodztwo\/[a-z0-9-]+$/);
    expect(index.find((v) => v.teryt === '12')?.path).toBe('/wojewodztwo/malopolskie');
  });

  it('każde województwo ma listę powiatów i miast z adresami (bez gmin)', () => {
    const malopolskie = index.find((v) => v.teryt === '12')!;
    const paths = malopolskie.children.map((c) => c.path);
    expect(paths).toContain('/powiat/krakowski');
    expect(paths).toContain('/miasto/krakow');
    expect(paths.every((p) => /^\/(powiat|miasto)\//.test(p))).toBe(true);
    const total = index.reduce((n, v) => n + v.children.length, 0);
    expect(total).toBe(units.filter((u) => u.level === 'pow').length);
  });

  it('kolejność alfabetyczna po polsku', () => {
    const names = index.map((v) => v.name);
    expect(names).toEqual([...names].sort(new Intl.Collator('pl').compare));
  });
});
