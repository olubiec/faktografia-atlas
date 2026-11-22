import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import profile from '../fixtures/seo/profile-12.json';
import indicators from '../../config/indicators.json';
import { auditPages, type AuditPage } from '../../src/core/seo/audit';
import { renderUnitPage } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type IndicatorMeta, type ProfileShard } from '../../src/core/seo/unit-page';

const ALL = units as SlugUnit[];
const ctx = { units: ALL, paths: buildUnitPaths(ALL), indicators: indicators as IndicatorMeta[] };
const shard = profile as unknown as ProfileShard;
const STATIC = ['/', '/mapa', '/zrodla', '/o-projekcie'];

const page = (path: string, extra = ''): AuditPage => ({
  path,
  html: `<title>Tytuł ${path}</title><meta name="description" content="${'Opis strony '.repeat(8)}${path}"><link rel="canonical" href="https://faktografia.eu${path}"><h1>H</h1>${extra}`,
});
const ok = [page('/a', '<a href="/b">b</a>'), page('/b', '<a href="/a">a</a>')];

describe('W25-S08: strażnik jakości stron', () => {
  it('poprawny komplet przechodzi bez błędów', () => {
    const r = auditPages(ok, ['https://faktografia.eu/a'], STATIC);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
  });

  it('komplet stron z fixture S06 przechodzi bez błędów', () => {
    const pages = ['1201', '1201011', '1201022', '1209033', '1261011', '12']
      .map((t) => buildUnitPage(ALL.find((u) => u.teryt === t)!, shard, ctx)!)
      .map((m) => ({
        path: m.path,
        html: renderUnitPage(m, { cssHrefs: [], mapLevel: 'gmi', dataDate: m.lastmod }).replace(/<a ([^>]*)href="\/(gmina|powiat|miasto|wojewodztwo)\/[^"]*"/g, '<a $1href="/"'),
      }));
    expect(auditPages(pages, [], STATIC).errors).toEqual([]);
  });

  it('wykrywa powtórzony tytuł i opis', () => {
    const dup = [page('/a'), { ...page('/b'), html: page('/a').html.replace('canonical" href="https://faktografia.eu/a', 'canonical" href="https://faktografia.eu/b') }];
    const r = auditPages(dup, [], STATIC);
    expect(r.errors.some((e) => e.includes('Powtórzony tytuł'))).toBe(true);
    expect(r.errors.some((e) => e.includes('Powtórzony opis'))).toBe(true);
  });

  it('ostrzega o zbyt długim tytule i złej długości opisu', () => {
    const p = { path: '/a', html: `<title>${'x'.repeat(70)}</title><meta name="description" content="krótki"><link rel="canonical" href="https://faktografia.eu/a"><h1>H</h1>` };
    const r = auditPages([p], [], STATIC);
    expect(r.warnings.some((w) => w.includes('tytuł'))).toBe(true);
    expect(r.warnings.some((w) => w.includes('opis'))).toBe(true);
  });

  it('wykrywa brak H1 i dwa H1', () => {
    const none = { ...page('/a'), html: page('/a').html.replace('<h1>H</h1>', '') };
    const two = { ...page('/a'), html: page('/a').html + '<h1>2</h1>' };
    expect(auditPages([none], [], STATIC).errors.some((e) => e.includes('0 nagłówków'))).toBe(true);
    expect(auditPages([two], [], STATIC).errors.some((e) => e.includes('2 nagłówków'))).toBe(true);
  });

  it('wykrywa zły kanoniczny adres', () => {
    const bad = { ...page('/a'), html: page('/a').html.replace('eu/a"', 'eu/inna"') };
    expect(auditPages([bad], [], STATIC).errors.some((e) => e.includes('kanoniczny'))).toBe(true);
  });

  it('wykrywa martwy link wewnętrzny, ignoruje parametry i istniejące adresy', () => {
    const bad = page('/a', '<a href="/nie-ma">x</a><a href="/mapa?u=12&amp;l=woj">m</a>');
    const r = auditPages([bad], [], STATIC);
    expect(r.errors.filter((e) => e.includes('martwy link'))).toHaveLength(1);
  });

  it('wykrywa adres w mapie strony z noindex albo nieistniejący', () => {
    const noindex = { ...page('/a'), html: page('/a').html + '<meta name="robots" content="noindex,follow">' };
    expect(auditPages([noindex], ['https://faktografia.eu/a'], STATIC).errors.some((e) => e.includes('noindex'))).toBe(true);
    expect(auditPages(ok, ['https://faktografia.eu/zzz'], STATIC).errors.some((e) => e.includes('nieistniejący'))).toBe(true);
    expect(auditPages(ok, ['https://example.com/a'], STATIC).errors.some((e) => e.includes('spoza domeny'))).toBe(true);
  });

  it('ostrzega o stronie indeksowanej bez linku przychodzącego', () => {
    const r = auditPages([page('/a'), page('/b')], [], STATIC);
    expect(r.warnings.some((w) => w.includes('brak linku przychodzącego'))).toBe(true);
  });

  it('wykrywa undefined i NaN w tekście', () => {
    const r = auditPages([page('/a', '<p>wartość undefined</p>')], [], STATIC);
    expect(r.errors.some((e) => e.includes('undefined'))).toBe(true);
    expect(auditPages([page('/a', '<p>NaN</p>')], [], STATIC).errors.some((e) => e.includes('NaN'))).toBe(true);
  });
});
