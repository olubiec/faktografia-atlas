import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildReport, droppedPages, newQueries, type GscPeriod } from '../../src/core/seo/gsc-report';

// Dane tymczasowe (kształt odpowiedzi searchanalytics.query z dokumentacji Google); do podmiany nagraniem z pierwszego uruchomienia.
const current = JSON.parse(readFileSync('tests/fixtures/seo/gsc-current.json', 'utf8')) as GscPeriod;
const previous = JSON.parse(readFileSync('tests/fixtures/seo/gsc-previous.json', 'utf8')) as GscPeriod;
const base = { window: { start: '2026-11-09', end: '2026-11-15' }, sitemaps: [], inspections: [] };

describe('W25-S12: raport Search Console', () => {
  it('spadek kliknięć o 60% na stronie daje czerwoną flagę', () => {
    expect(droppedPages(current.pages, previous.pages).map((d) => d.page)).toEqual(['https://faktografia.eu/powiat/krakowski']);
    const r = buildReport({ ...base, current, previous });
    expect(r.flags.some((f) => f.includes('/powiat/krakowski') && f.includes('50%'))).toBe(true);
  });

  it('brak danych z poprzedniego tygodnia: „za mało danych”, nie błąd', () => {
    const r = buildReport({ ...base, current, previous: null });
    expect(r.markdown).toContain('Za mało danych');
    expect(r.flags).toEqual([]);
  });

  it('Markdown zaczyna się od sekcji „Co wymaga działania”', () => {
    expect(buildReport({ ...base, current, previous }).markdown.startsWith('## Co wymaga działania')).toBe(true);
    expect(buildReport({ ...base, current, previous: null }).markdown).toContain('Nic nie wymaga działania.');
  });

  it('nowe zapytania to te, których nie było tydzień wcześniej', () => {
    expect(newQueries(current.queries, previous.queries).map((r) => r.keys[0])).toEqual(['nowe zapytanie']);
  });

  it('flagi: błędy mapy strony, niski odsetek zaindeksowanych, większość próbki niezaindeksowana', () => {
    const r = buildReport({
      ...base,
      current,
      previous,
      sitemaps: [{ path: 'https://faktografia.eu/sitemap-rankingi.xml', submitted: 100, indexed: 40, errors: 2, warnings: 0 }],
      inspections: [
        { url: 'a', verdict: 'NEUTRAL', coverageState: 'Wykryto, nie zindeksowano' },
        { url: 'b', verdict: 'NEUTRAL', coverageState: 'Wykryto, nie zindeksowano' },
        { url: 'c', verdict: 'PASS', coverageState: 'Przesłano i zindeksowano' },
      ],
    });
    expect(r.flags.some((f) => f.includes('błędy'))).toBe(true);
    expect(r.flags.some((f) => f.includes('zaindeksowano 40 z 100'))).toBe(true);
    expect(r.flags.some((f) => f.includes('nie jest zaindeksowanych'))).toBe(true);
  });
});
