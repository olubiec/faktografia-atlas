import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { loadUnitPathTable, unitPagePath } from '../../src/core/seo/unit-link';
import { renderPlacesPage } from '../../src/core/seo/places-page';

const ALL = units as SlugUnit[];
const paths = buildUnitPaths(ALL);
const table = Object.fromEntries(paths.byTeryt);

describe('W25-S09: linki do stron miejsc', () => {
  it('unitPagePath: powiat i gmina miasta mają ten sam adres, nieznany TERYT = null', () => {
    expect(unitPagePath('1261', table)).toBe('/miasto/krakow');
    expect(unitPagePath('1261011', table)).toBe('/miasto/krakow');
    expect(unitPagePath('9999999', table)).toBeNull();
    expect(unitPagePath('toString', table)).toBeNull();
    expect(unitPagePath('12', null)).toBeNull();
  });

  it('loadUnitPathTable: błąd sieci lub 404 daje null (bez wyjątku)', async () => {
    const fail = (() => Promise.reject(new Error('x'))) as unknown as typeof fetch;
    expect(await loadUnitPathTable(fail)).toBeNull();
  });

  it('spis miejsc ma 16 województw i linki do powiatów', () => {
    const html = renderPlacesPage(ALL, paths, ['/assets/x.css']);
    expect(html.match(/<h2 /g)).toHaveLength(16);
    expect(html).toContain('href="/wojewodztwo/malopolskie"');
    expect(html).toContain('href="/powiat/krakowski"');
    expect(html).toContain('href="/miasto/krakow"');
    expect(html).toContain('<link rel="canonical" href="https://faktografia.eu/miejsca">');
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
  });
});
