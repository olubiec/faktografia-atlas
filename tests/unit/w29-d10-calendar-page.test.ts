import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import indicatorsData from '../../config/indicators.json';
import listsData from '../../config/lists.json';
import fixture from '../fixtures/f04/opolskie.json';
import { buildPublicCalendar, parsePublicCalendar, plDate, renderCalendarSections, serializeCalendar, shortTitle } from '../../src/core/facts/calendar-public';
import type { NewsContext } from '../../src/core/facts/news';
import { buildNewsSite } from '../../src/core/facts/news-page';
import type { FactIndicator, FactsConfig, FactUnit } from '../../src/core/facts/types';
import type { IndicatorValues } from '../../src/core/profile/profile';
import { rankingHeadings } from '../../src/core/seo/ranking-template';
import { buildUnitPaths } from '../../src/core/seo/slug';

const fx = (f: string) => JSON.parse(readFileSync(`tests/fixtures/calendar-public/${f}.json`, 'utf8'));
const TODAY = '2026-11-26';
const indicators = indicatorsData as (FactIndicator & { higherIsBetter: boolean | null })[];
const config = factsConfig as unknown as FactsConfig;
const units = fixture.units as FactUnit[];
const ctx: NewsContext = {
  units,
  paths: buildUnitPaths(units),
  headings: rankingHeadings(units),
  indicators,
  values: fixture.values as unknown as Record<string, IndicatorValues>,
  gminaMinPopulation: listsData.gminaMinPopulation,
  relativeChangeUnits: config.relativeChangeUnits,
  boundaryJump: config.news!.boundaryJump,
  rows: config.news!.rows,
  recordMinYears: config.thresholds.recordMinYears,
};
const ASSETS = { css: ['/assets/index-abc.css'] };
const calendar = () => buildPublicCalendar({ today: TODAY, ledger: fx('ledger'), available: fx('available'), fresh: fx('fresh'), indicators });
const indexHtml = (cal: ReturnType<typeof calendar> | null) =>
  buildNewsSite([{ id: 'population', year: 2025 }], ctx, ASSETS, cal).pages.find((p) => p.path === '/nowe-dane')!.html;
const section = (html: string, id: string) => html.split(`<section aria-labelledby="${id}"`)[1]!.split('</section>')[0]!;

describe('@W30-D10 kalendarium: dane robota', () => {
  it('bierze zaplanowane z 14 dni naprzód i pobrane z 14 dni wstecz, bez odrzuconych i oczekujących', () => {
    const cal = calendar();
    expect(cal.planned.map((p) => p.date)).toEqual(['2026-11-28', '2026-12-02']);
    expect(cal.done.map((d) => d.id)).toEqual(['unemployment', 'b101', 'population']);
    const json = JSON.stringify(cal);
    expect(json).not.toContain('Odrzucona zmienna');
    expect(json).not.toContain('Stara zmienna');
    expect(json).not.toContain('javascript:');
    expect(json).not.toContain('Za daleko');
  });

  it('zmienna biblioteki ma id z „b” i najnowszy rok; wskaźnik główny rok ze świeżości', () => {
    const done = calendar().done;
    expect(done.find((d) => d.id === 'b101')).toMatchObject({ year: 2025, date: '2026-11-25' });
    expect(done.find((d) => d.id === 'population')).toMatchObject({ year: 2025, date: '2026-11-20' });
  });

  it('plik ma najwyżej 5 KB i nie ma wcięć, także przy dużej księdze', () => {
    const json = serializeCalendar(calendar());
    expect(new TextEncoder().encode(json).length).toBeLessThanOrEqual(5000);
    expect(json).not.toMatch(/\n|\s{2}/);
    const big = { planned: Array.from({ length: 80 }, (_, i) => ({ date: '2026-12-01', title: `Publikacja numer ${i} ${'słowo '.repeat(15)}`, href: `https://stat.gov.pl/${i}.html` })), done: [] };
    const trimmed = serializeCalendar(big);
    expect(new TextEncoder().encode(trimmed).length).toBeLessThanOrEqual(5000);
    expect(JSON.parse(trimmed).planned.length).toBeGreaterThan(0);
  });

  it('strona startowa nie pobiera calendar.json (nic w src/view go nie wskazuje)', () => {
    const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(path.join(dir, n)).isDirectory() ? walk(path.join(dir, n)) : [path.join(dir, n)]));
    const hits = walk('src/view').filter((f) => /\.(ts|tsx)$/.test(f) && readFileSync(f, 'utf8').includes('calendar.json'));
    expect(hits).toEqual([]);
  });

  it('plik robota z repozytorium (jeśli już jest) mieści się w 5 KB i nie ma wcięć', () => {
    const file = 'public/data/calendar.json';
    if (!existsSync(file)) return; // pliku jeszcze nie ma na tej gałęzi – robot dopisze go w swoim PR
    const raw = readFileSync(file, 'utf8').trimEnd();
    expect(Buffer.byteLength(raw, 'utf8')).toBeLessThanOrEqual(5000);
    expect(raw).not.toMatch(/\n|\s{2}/);
  });
});

describe('@W30-D10 kalendarium: strona /nowe-dane', () => {
  it('ma obie sekcje, pozycje w kolejności dat, a wdrożona ma poprawny link do mapy i do strony', () => {
    const html = indexHtml(calendar());
    const wkrotce = section(html, 'wkrotce');
    expect(wkrotce).toContain('Wkrótce od GUS');
    expect(wkrotce.indexOf('28 listopada 2026')).toBeGreaterThan(-1);
    expect(wkrotce.indexOf('28 listopada 2026')).toBeLessThan(wkrotce.indexOf('2 grudnia 2026'));
    const nowosci = section(html, 'nowosci');
    expect(nowosci).toContain('Nowości na mapie (14 dni)');
    expect(nowosci).toContain('href="/mapa?i=population&amp;y=2025"');
    expect(nowosci).toContain('href="/mapa?i=b101&amp;y=2025"');
    expect(nowosci).toContain('Zobacz na mapie');
    const order = ['26 listopada 2026', '25 listopada 2026', '20 listopada 2026'].map((d) => nowosci.indexOf(d));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // Link do strony istnieje tylko tam, gdzie strona jest (population-2025), nie dla zmiennej biblioteki.
    expect(nowosci).toContain('href="/nowe-dane/population-2025"');
    expect(nowosci).not.toContain('/nowe-dane/b101-2025');
    expect(html.indexOf('id="wkrotce"')).toBeLessThan(html.indexOf('/nowe-dane/population-2025"'));
  });

  it('bez calendar.json: strona jak dziś plus dwie sekcje z pustym zdaniem', () => {
    const without = indexHtml(null);
    const EMPTY = 'Na razie nic nowego – zajrzyj po najbliższej publikacji GUS.';
    expect(without.split(EMPTY).length - 1).toBe(2);
    expect(without).toContain('id="wkrotce"');
    expect(without).toContain('id="nowosci"');
    expect(without).toContain('href="/nowe-dane/population-2025"');
    const old = buildNewsSite([{ id: 'population', year: 2025 }], ctx, ASSETS).pages.find((p) => p.path === '/nowe-dane')!.html;
    expect(old).toBe(without);
    expect(parsePublicCalendar(null)).toBeNull();
    expect(parsePublicCalendar({ planned: 'x', done: [{ date: 'zły' }] })).toEqual({ planned: [], done: [] });
  });

  it('tytuł ze znakami < i & jest zakodowany, nie wstawiony jako HTML', () => {
    const html = indexHtml(calendar());
    expect(html).toContain('Wynagrodzenia &lt;b&gt;2025&lt;/b&gt; &amp; dodatki');
    expect(html).not.toContain('<b>2025</b>');
    const evil = renderCalendarSections({ planned: [], done: [{ date: '2026-11-25', name: '<img src=x onerror=alert(1)>', id: 'x"y', year: 2025 }] });
    expect(evil).not.toContain('<img');
    expect(evil).not.toContain('"y');
  });
});

describe('@W30-D10 daty i tytuły', () => {
  it('daty po polsku', () => {
    expect(plDate('2026-12-02')).toBe('2 grudnia 2026');
    expect(plDate('2027-03-15')).toBe('15 marca 2027');
  });

  it('długi tytuł GUS jest skracany do 120 znaków bez ucinania słów', () => {
    const long = fx('ledger').entries[1].title as string;
    const short = shortTitle(long);
    expect(short.length).toBeLessThanOrEqual(120);
    expect(short.endsWith('…')).toBe(true);
    expect(long.startsWith(short.slice(0, -1))).toBe(true);
    expect(long.charAt(short.length - 1)).toBe(' ');
    expect(shortTitle('Krótki tytuł')).toBe('Krótki tytuł');
  });
});
