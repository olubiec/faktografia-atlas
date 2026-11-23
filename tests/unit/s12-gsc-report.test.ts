import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import current from '../fixtures/seo/gsc-searchanalytics-current.json';
import previous from '../fixtures/seo/gsc-searchanalytics-previous.json';
import sitemaps from '../fixtures/seo/gsc-sitemaps.json';
import inspections from '../fixtures/seo/gsc-inspect.json';
import {
  buildReport,
  pageDrops,
  parseState,
  renderMarkdown,
  reportWindow,
  sample,
  type ReportInput,
} from '../../src/core/seo/gsc-report';

const WEEK = reportWindow(new Date('2026-11-23T06:00:00Z'));
const input = (over: Partial<ReportInput> = {}): ReportInput => ({
  window: WEEK,
  current,
  previous,
  sitemaps,
  inspections,
  previousState: null,
  ...over,
});
const EMPTY = { totals: {}, query: {}, page: {} };

describe('S12 okno raportu', () => {
  it('kończy się 3 dni temu, 7 dni porównane z poprzednimi 7', () => {
    expect(WEEK).toEqual({
      current: { start: '2026-11-14', end: '2026-11-20' },
      previous: { start: '2026-11-07', end: '2026-11-13' },
    });
  });
});

describe('S12 spadki kliknięć', () => {
  it('spadek o 60 % na stronie → flaga', () => {
    const drops = pageDrops(current.page, previous.page);
    expect(drops.map((d) => d.page)).toEqual(['https://faktografia.eu/wojewodztwo/malopolskie']);
    expect(drops[0]?.change).toBeCloseTo(-0.6);
    const report = buildReport(input());
    expect(report.flags.some((f) => f.includes('/wojewodztwo/malopolskie') && f.includes('60'))).toBe(true);
  });

  it('spadek o 40 % → bez flagi', () => {
    const prev = { rows: [{ keys: ['https://faktografia.eu/a'], clicks: 10, impressions: 100, position: 5 }] };
    const cur = { rows: [{ keys: ['https://faktografia.eu/a'], clicks: 6, impressions: 100, position: 5 }] };
    expect(pageDrops(cur, prev)).toEqual([]);
  });
});

describe('S12 brak danych z poprzedniego tygodnia', () => {
  it('→ „za mało danych”, nie błąd', () => {
    const report = buildReport(input({ previous: EMPTY }));
    expect(report.previousTotals).toBeNull();
    expect(report.drops).toEqual([]);
    const md = renderMarkdown(report);
    expect(md).toContain('za mało danych');
    expect(md).not.toContain('NaN');
  });

  it('pusty bieżący tydzień też nie rzuca wyjątku', () => {
    expect(() => renderMarkdown(buildReport(input({ current: EMPTY, previous: EMPTY, inspections: [] })))).not.toThrow();
  });
});

describe('S12 Markdown', () => {
  it('zaczyna się od sekcji „Co wymaga działania”', () => {
    const md = renderMarkdown(buildReport(input()));
    expect(md.split('\n')[0]).toBe('## Co wymaga działania');
  });

  it('ma liczby tygodnia, nowe zapytania, mapy strony i próbkę indeksowania', () => {
    const md = renderMarkdown(buildReport(input()));
    expect(md).toContain('| Kliknięcia | 120 | 100 | +20 % |');
    expect(md).toContain('mapa gmin polski');
    expect(md).toContain('401');
    expect(md).toContain('Discovered - currently not indexed');
  });

  it('znak „|” w zapytaniu nie psuje tabeli', () => {
    const cur = { ...current, query: { rows: [{ keys: ['a|b'], clicks: 1, impressions: 2, position: 3 }] } };
    expect(renderMarkdown(buildReport(input({ current: cur })))).toContain('a\\|b');
  });

  it('bez czerwonych flag: wprost „nic”', () => {
    const md = renderMarkdown(buildReport(input({ previous: current, inspections: [] })));
    expect(md).toMatch(/^## Co wymaga działania\n\nNic/);
  });
});

describe('S12 czerwone flagi wg SEO.md §8', () => {
  it('spadek zaindeksowanych > 20 % w tydzień (stan z poprzedniego raportu)', () => {
    const report = buildReport(input({ previousState: { indexedShare: 1, sampleSize: 40 } }));
    expect(report.state.indexedShare).toBeCloseTo(2 / 3);
    expect(report.flags.some((f) => f.includes('zaindeksowanych'))).toBe(true);
    expect(parseState(renderMarkdown(report))).toEqual(report.state);
  });

  it('błąd 5xx przy pobieraniu strony przez Google', () => {
    const bad = [{ url: 'https://faktografia.eu/x', result: { inspectionResult: { indexStatusResult: { verdict: 'FAIL', pageFetchState: 'SERVER_ERROR' } } } }];
    expect(buildReport(input({ inspections: bad })).flags.some((f) => f.includes('5xx'))).toBe(true);
  });

  it('„Wykryto – obecnie nie zindeksowano” > 50 % stron gmin', () => {
    const gm = (i: number, state: string) => ({
      url: `https://faktografia.eu/gmina/g${i}`,
      result: { inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: state } } },
    });
    const list = [0, 1, 2, 3].map((i) => gm(i, 'Discovered - currently not indexed')).concat([gm(4, 'Submitted and indexed')]);
    expect(buildReport(input({ inspections: list })).flags.some((f) => f.includes('gmin'))).toBe(true);
  });
});

describe('S12 próbka adresów', () => {
  it('najwyżej n różnych adresów z listy', () => {
    const urls = Array.from({ length: 100 }, (_, i) => `u${i}`);
    const s = sample(urls, 40, () => 0.5);
    expect(s).toHaveLength(40);
    expect(new Set(s).size).toBe(40);
    expect(sample(['a'], 40)).toEqual(['a']);
  });
});

describe('S12 skrypt bez sekretu', () => {
  it('czytelny komunikat i kod 0 (bez czerwonego CI), bez sieci', () => {
    const script = path.resolve(import.meta.dirname, '../../scripts/seo/gsc-report.mjs');
    const env = { ...process.env };
    delete env.GSC_SERVICE_ACCOUNT;
    const res = spawnSync(process.execPath, [script], { env, encoding: 'utf8', timeout: 20_000 });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Brak sekretu GSC_SERVICE_ACCOUNT');
  });
});
