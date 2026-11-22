import { describe, expect, it } from 'vitest';
import units from '../fixtures/seo/units.json';
import profile from '../fixtures/seo/profile-12.json';
import indicators from '../../config/indicators.json';
import { escapeHtml } from '../../src/core/seo/html';
import { renderUnitPage } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type IndicatorMeta, type ProfileShard } from '../../src/core/seo/unit-page';

const ALL = units as SlugUnit[];
const ctx = { units: ALL, paths: buildUnitPaths(ALL), indicators: indicators as IndicatorMeta[] };
const shard = profile as unknown as ProfileShard;
const model = (teryt: string) => buildUnitPage(ALL.find((u) => u.teryt === teryt)!, shard, ctx)!;
const assets = { cssHrefs: ['/assets/x.css'], mapLevel: 'gmi' as const, centroid: [20.4, 49.9] as [number, number], localities: ['Wieś A', 'Wieś B'], dataDate: '2026-11-17' };

describe('W25-S07: strona miejsca (HTML)', () => {
  it('escapeHtml zamienia znaki specjalne', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&`)).toBe('&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;');
  });

  it('nazwa ze znacznikiem nie trafia do HTML jako znacznik', () => {
    const evil = { ...model('1201011'), name: '<img src=x onerror=alert(1)>', h1: '<img src=x onerror=alert(1)>', title: '<img src=x onerror=alert(1)>' };
    const html = renderUnitPage(evil, { ...assets, localities: ['<img src=x onerror=alert(1)>'] });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('strona z fixture: jeden h1, kanoniczny adres, JSON-LD, link do mapy, bez skryptu aplikacji', () => {
    const page = model('1201011');
    const html = renderUnitPage(page, assets);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain(`<link rel="canonical" href="https://faktografia.eu${page.path}">`);
    expect(html).toContain('href="/mapa?u=1201011&amp;l=gmi"');
    expect(html).not.toContain('<script type="module"');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map((m) => JSON.parse(m[1]!) as { '@type': string });
    expect(ld.map((x) => x['@type'])).toEqual(['Place', 'BreadcrumbList']);
    expect(html).toContain('<table');
    expect(html).toContain('<caption');
    expect(html).toContain('scope="row"');
    expect(html).toContain('Wieś A, Wieś B.');
    expect(html).toContain('CC BY 4.0');
  });

  it('strona nieindeksowana ma noindex, indeksowana nie ma', () => {
    expect(renderUnitPage(model('1201072'), assets)).toContain('<meta name="robots" content="noindex,follow">');
    expect(renderUnitPage(model('1201011'), assets)).not.toContain('name="robots"');
  });

  it('lista miejscowości jest przycięta do 150', () => {
    const many = Array.from({ length: 400 }, (_, i) => `M${i}`);
    const html = renderUnitPage(model('1201011'), { ...assets, localities: many });
    expect(html).toContain('M149');
    expect(html).not.toContain('M150');
  });
});
