import { describe, it, expect } from 'vitest';
import { buildDatasetJsonLd, buildWebSiteJsonLd } from '../../src/core/seo/jsonld';

const BASE = {
  name: 'Kraków',
  teryt: '1261000',
  url: 'https://atlas.example/krakow',
  year: 2023,
  indicator: 'Liczba ludności',
};

describe('buildDatasetJsonLd', () => {
  it('zwraca Dataset z kontekstem schema.org i źródłem GUS', () => {
    const d = buildDatasetJsonLd(BASE);
    expect(d['@context']).toBe('https://schema.org');
    expect(d['@type']).toBe('Dataset');
    expect(d.url).toBe(BASE.url);
    expect(d.creator.name).toBe('Główny Urząd Statystyczny');
    expect(d.isBasedOn).toContain('stat.gov.pl');
  });

  it('podaje rok w nazwie i w temporalCoverage', () => {
    const d = buildDatasetJsonLd(BASE);
    expect(d.name).toContain('2023');
    expect(d.temporalCoverage).toBe('2023');
  });

  it('bez roku pomija temporalCoverage i nie wstawia "undefined"', () => {
    const d = buildDatasetJsonLd({ ...BASE, year: undefined });
    expect('temporalCoverage' in d).toBe(false);
    expect(JSON.stringify(d)).not.toContain('undefined');
    expect(d.name).not.toMatch(/\d{4}/);
  });

  it('zachowuje polskie znaki bez zmian', () => {
    const d = buildDatasetJsonLd({ ...BASE, name: 'Łódź – Śródmieście', indicator: 'Żłobki' });
    expect(d.name).toContain('Łódź – Śródmieście');
    expect(JSON.parse(JSON.stringify(d)).name).toContain('Żłobki');
  });

  it('TERYT zaczynający się od 0 zostaje stringiem w identifier', () => {
    const d = buildDatasetJsonLd({ ...BASE, teryt: '0201011' });
    expect(d.identifier).toBe('TERYT:0201011');
    expect(typeof d.identifier).toBe('string');
  });

  it('odrzuca TERYT, który nie jest ciągiem cyfr', () => {
    expect(() => buildDatasetJsonLd({ ...BASE, teryt: '12 61' })).toThrow(/TERYT/);
    expect(() => buildDatasetJsonLd({ ...BASE, teryt: '' })).toThrow(/TERYT/);
  });

  it('pomija pusty wskaźnik i przycina spacje w nazwie', () => {
    const d = buildDatasetJsonLd({ ...BASE, name: '  Wałcz  ', indicator: undefined });
    expect(d.name.startsWith('Wałcz')).toBe(true);
    expect(d.variableMeasured).toBeUndefined();
  });
});

describe('buildWebSiteJsonLd', () => {
  it('buduje WebSite z SearchAction i placeholderem zapytania', () => {
    const w = buildWebSiteJsonLd({
      name: 'Faktografia Atlas',
      url: 'https://atlas.example/',
      searchUrlTemplate: 'https://atlas.example/?q={search_term_string}',
    });
    expect(w['@type']).toBe('WebSite');
    expect(w.potentialAction['@type']).toBe('SearchAction');
    expect(w.potentialAction.target.urlTemplate).toContain('{search_term_string}');
    expect(w.potentialAction['query-input']).toBe('required name=search_term_string');
  });

  it('rzuca błąd, gdy szablon nie ma placeholdera', () => {
    expect(() =>
      buildWebSiteJsonLd({ name: 'A', url: 'https://a.pl/', searchUrlTemplate: 'https://a.pl/?q=' }),
    ).toThrow(/search_term_string/);
  });
});
