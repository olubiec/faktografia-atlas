import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import { auditPages, internalPath, readPage, summarize, type AuditCode, type AuditPage } from '../../src/core/seo/audit';
import { renderUnitPage } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { pageTitle, unitHeading } from '../../src/core/seo/sentences';
import { buildSitemaps, isIndexed } from '../../src/core/seo/sitemap';
import { buildUnitPage, type PageProfile } from '../../src/core/seo/unit-page';

// Wycinek prawdziwego public/data/profiles/12.json – ten sam co w S06 i S07.
const profile = profileData as unknown as PageProfile;
const units = unitsData as SlugUnit[];
const paths = buildUnitPaths(units);
const ctx = { units, paths, indicators };
const STATIC = ['/', '/mapa', '/o-projekcie', '/zrodla', '/prywatnosc'];
const CONFIG = { indexGminy: false };

/** Komplet stron z fixture S06 – tak jak w scripts/seo/build-pages.mjs. */
function fixtureSite() {
  const pages: AuditPage[] = [];
  const sitemapPages = [];
  for (const [urlPath, teryt] of paths.terytByPath) {
    if (!profile.units[teryt]) continue;
    const unit = units.find((u) => u.teryt === teryt)!;
    const page = buildUnitPage(unit, profile, ctx);
    const indexable = isIndexed({ level: unit.level, indexable: page.indexable }, CONFIG);
    const html = renderUnitPage({ ...page, indexable, level: unit.level, centroid: unit.centroid ?? null }, { css: ['/a.css'] });
    pages.push(readPage(urlPath, html));
    sitemapPages.push({ path: urlPath, level: unit.level, indexable, lastmod: page.lastmod });
  }
  const files = buildSitemaps(sitemapPages, STATIC, CONFIG);
  const urls = Object.entries(files)
    .filter(([name]) => name !== 'sitemap.xml')
    .flatMap(([, xml]) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!));
  // Strony spoza wycinka profilu też powstają w pełnej budowie – linki do nich nie są martwe.
  return { pages, urls, known: [...STATIC, ...paths.terytByPath.keys()] };
}

const DESC = 'Opis strony testowej z liczbami: ludność 1 000, bezrobocie 5,0%, dochody 9 000 zł na mieszkańca.';

/** Poprawna strona testowa; `over` psuje jedno pole. */
const page = (path: string, over: Partial<AuditPage> = {}): AuditPage => ({
  path,
  title: `Tytuł ${path}`,
  description: `${DESC} ${path}`,
  h1Count: 1,
  canonical: `https://faktografia.eu${path}`,
  noindex: false,
  links: [],
  badText: null,
  ...over,
});

/** Dwie strony linkujące do siebie nawzajem – bez żadnych uwag. */
const pair = (a: Partial<AuditPage> = {}, b: Partial<AuditPage> = {}) => [
  page('/a', { links: ['/b'], ...a }),
  page('/b', { links: ['/a'], ...b }),
];
const codes = (pages: AuditPage[], urls: string[] = [], known: string[] = []) =>
  auditPages(pages, urls, { knownPaths: known }).map((i) => `${i.level}:${i.code}`);
const has = (list: string[], level: 'error' | 'warning', code: AuditCode) => list.includes(`${level}:${code}`);

describe('S08 komplet stron z fixture', () => {
  it('przechodzi bez błędów', () => {
    const { pages, urls, known } = fixtureSite();
    expect(pages.length).toBeGreaterThanOrEqual(8);
    const issues = auditPages(pages, urls, { knownPaths: known });
    expect(issues.filter((i) => i.level === 'error')).toEqual([]);
  });

  it('readPage czyta tytuł, opis, H1, adres kanoniczny i linki z wygenerowanego HTML', () => {
    const { pages } = fixtureSite();
    const p = pages.find((x) => x.title.startsWith('Gmina Wieliczka'))!;
    expect(p.title).toBe('Gmina Wieliczka – ludność, bezrobocie, dochody (2025)');
    expect(p.description).toMatch(/^Gmina Wieliczka – dane GUS/);
    expect(p.h1Count).toBe(1);
    expect(p.canonical).toBe(`https://faktografia.eu${p.path}`);
    expect(p.noindex).toBe(true); // gminy noindex do decyzji D7
    expect(p.links).toContain('/');
    expect(p.links).toContain('/mapa');
    expect(p.badText).toBeNull();
  });
});

describe('S08 rodzaje błędów i ostrzeżeń', () => {
  it('poprawna para stron nie ma uwag', () => {
    expect(codes(pair(), ['https://faktografia.eu/a'])).toEqual([]);
  });

  it('duplikat tytułu = błąd', () => {
    expect(has(codes(pair({ title: 'X' }, { title: 'X' })), 'error', 'duplicate-title')).toBe(true);
    expect(has(codes(pair()), 'error', 'duplicate-title')).toBe(false);
  });

  it('duplikat opisu = błąd', () => {
    expect(has(codes(pair({ description: DESC }, { description: DESC })), 'error', 'duplicate-description')).toBe(true);
    expect(has(codes(pair()), 'error', 'duplicate-description')).toBe(false);
  });

  it('tytuł > 65 znaków = ostrzeżenie', () => {
    expect(has(codes(pair({ title: 'T'.repeat(66) })), 'warning', 'title-length')).toBe(true);
    expect(has(codes(pair({ title: 'T'.repeat(65) })), 'warning', 'title-length')).toBe(false);
  });

  it('opis poza 70–160 znaków = ostrzeżenie', () => {
    expect(has(codes(pair({ description: 'D'.repeat(69) })), 'warning', 'description-length')).toBe(true);
    expect(has(codes(pair({ description: 'D'.repeat(161) })), 'warning', 'description-length')).toBe(true);
    expect(has(codes(pair({ description: 'D'.repeat(70) }, { description: 'E'.repeat(160) })), 'warning', 'description-length')).toBe(false);
  });

  it('liczba H1 różna od 1 = błąd', () => {
    expect(has(codes(pair({ h1Count: 0 })), 'error', 'h1-count')).toBe(true);
    expect(has(codes(pair({ h1Count: 2 })), 'error', 'h1-count')).toBe(true);
    expect(has(codes(pair()), 'error', 'h1-count')).toBe(false);
  });

  it('adres kanoniczny inny niż własny = błąd', () => {
    expect(has(codes(pair({ canonical: 'https://faktografia.eu/b' })), 'error', 'canonical')).toBe(true);
    expect(has(codes(pair({ canonical: null })), 'error', 'canonical')).toBe(true);
    expect(has(codes(pair()), 'error', 'canonical')).toBe(false);
  });

  it('link wewnętrzny do nieistniejącego adresu = błąd; znany adres stały jest w porządku', () => {
    expect(has(codes(pair({ links: ['/b', '/nie-ma'] })), 'error', 'dead-link')).toBe(true);
    expect(has(codes(pair({ links: ['/b', '/mapa'] }), [], ['/mapa']), 'error', 'dead-link')).toBe(false);
  });

  it('adres w mapie strony z noindex albo nieistniejący = błąd', () => {
    const list = codes(pair({}, { noindex: true }), ['https://faktografia.eu/b']);
    expect(has(list, 'error', 'sitemap-noindex')).toBe(true);
    expect(has(codes(pair(), ['https://faktografia.eu/zniknela']), 'error', 'sitemap-missing')).toBe(true);
    const ok = codes(pair(), ['https://faktografia.eu/a', 'https://faktografia.eu/mapa'], ['/mapa']);
    expect(has(ok, 'error', 'sitemap-noindex') || has(ok, 'error', 'sitemap-missing')).toBe(false);
  });

  it('strona indeksowana bez linku z innej strony = ostrzeżenie (link do siebie się nie liczy)', () => {
    const lonely = [page('/a', { links: ['/a', '/b'] }), page('/b', { links: ['/b'] })];
    const issues = auditPages(lonely, []);
    expect(issues.filter((i) => i.code === 'no-incoming-link').map((i) => `${i.level}:${i.path}`)).toEqual(['warning:/a']);
    // Strona noindex bez linków nie jest ostrzeżeniem.
    const quiet = [page('/a', { links: ['/b'], noindex: true }), page('/b', { links: ['/b'] })];
    expect(has(codes(quiet), 'warning', 'no-incoming-link')).toBe(false);
  });

  it('„undefined” lub „NaN” w treści = błąd', () => {
    const bad = readPage('/a', '<title>T</title><p>Ludność: NaN osób</p>');
    expect(bad.badText).toContain('NaN');
    expect(has(codes(pair({ badText: bad.badText })), 'error', 'bad-text')).toBe(true);
    expect(readPage('/a', '<title>T</title><p>Nanowo, Kundefinedowo</p>').badText).toBeNull();
    expect(has(codes(pair()), 'error', 'bad-text')).toBe(false);
  });

  it('ten sam szablon zdania na > 30% stron indeksowanych = ostrzeżenie', () => {
    const site = (withTemplate: number) =>
      Array.from({ length: 10 }, (_, i) =>
        page(`/p${i}`, { links: [`/p${(i + 1) % 10}`], templates: i < withTemplate ? ['F3-ranking'] : [`unikalny-${i}`] }),
      );
    expect(has(codes(site(4)), 'warning', 'template-share')).toBe(true);
    expect(has(codes(site(3)), 'warning', 'template-share')).toBe(false);
  });
});

describe('S08 poprawka znaleziona przez audyt', () => {
  it('powiaty o tej samej nazwie w dwóch województwach mają różne nagłówki i tytuły', () => {
    const heading = (t: string) => unitHeading(units.find((u) => u.teryt === t)!, units);
    expect(heading('2402')).toBe('Powiat bielski (woj. śląskie)');
    expect(heading('2003')).toBe('Powiat bielski (woj. podlaskie)');
    expect(pageTitle(heading('2402'), 2025)).not.toBe(pageTitle(heading('2003'), 2025));
    expect(heading('1219')).toBe('Powiat wielicki');
  });
});

describe('S08 pomocnicze', () => {
  it('internalPath normalizuje adresy wewnętrzne i pomija zewnętrzne', () => {
    expect(internalPath('/mapa?u=12&l=woj')).toBe('/mapa');
    expect(internalPath('https://faktografia.eu/x/#a')).toBe('/x');
    expect(internalPath('https://faktografia.eu')).toBe('/');
    expect(internalPath('https://stat.gov.pl/')).toBeNull();
    expect(internalPath('//cdn.example/x')).toBeNull();
  });

  it('readPage dekoduje encje i rozpoznaje noindex', () => {
    const html =
      '<title>A &amp; B</title><meta name="description" content="X &quot;Y&quot;"><meta name="robots" content="noindex,follow">' +
      '<link rel="canonical" href="https://faktografia.eu/a"><h1>A</h1><a href="/b?x=1&amp;y=2">b</a>';
    expect(readPage('/a', html)).toMatchObject({ title: 'A & B', description: 'X "Y"', noindex: true, h1Count: 1, links: ['/b'] });
  });

  it('summarize dzieli na błędy i ostrzeżenia i liczy ostrzeżenia według rodzaju', () => {
    const s = summarize(auditPages(pair({ h1Count: 0, title: 'T'.repeat(70) }), []));
    expect(s.errors.map((e) => e.code)).toEqual(['h1-count']);
    expect(s.counts).toBe('title-length: 1');
  });
});
