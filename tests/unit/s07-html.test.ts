import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import { escapeAttr, escapeHtml } from '../../src/core/seo/html';
import { mapLink, renderUnitPage, type RenderModel } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type PageProfile } from '../../src/core/seo/unit-page';

// Wycinek prawdziwego public/data/profiles/12.json (opis w polu $opis pliku) – ten sam co w S06.
const profile = profileData as unknown as PageProfile;
const units = unitsData as SlugUnit[];
const ctx = { units, paths: buildUnitPaths(units), indicators };
const unit = (teryt: string) => units.find((u) => u.teryt === teryt)!;
const ASSETS = { css: ['/assets/index-abc.css'] };

function model(teryt: string, extra: Partial<RenderModel> = {}): RenderModel {
  const u = unit(teryt);
  return { ...buildUnitPage(u, profile, ctx), level: u.level, centroid: [19.94, 50.06], ...extra };
}

const ldBlocks = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

const EVIL = '<img src=x onerror=alert(1)>';

describe('S07 html.ts', () => {
  it('escapeHtml zamienia & < > " \'', () => {
    expect(escapeHtml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f');
    expect(escapeHtml(12)).toBe('12');
  });

  it('escapeAttr nie pozwala wyjść z atrybutu', () => {
    expect(escapeAttr('x" onclick="y')).toBe('x&quot; onclick=&quot;y');
    expect(escapeAttr('a`b\nc')).toBe('a&#96;b&#10;c');
  });
});

describe('S07 bezpieczeństwo szablonu', () => {
  it('nazwa z HTML nie pojawia się jako znacznik', () => {
    const base = model('1219053', { localities: [EVIL, 'Grabówki'] });
    const evil: RenderModel = {
      ...base,
      title: EVIL,
      description: EVIL,
      h1: EVIL,
      lead: [EVIL],
      rows: base.rows.map((r) => ({ ...r, name: EVIL, value: EVIL })),
      links: {
        parents: base.links.parents.map((l) => ({ ...l, name: EVIL })),
        children: [{ teryt: '1', name: EVIL, path: `/gmina/"><script>alert(1)</script>` }],
        neighbours: base.links.neighbours.map((l) => ({ ...l, name: EVIL })),
      },
    };
    const html = renderUnitPage(evil, ASSETS);
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    // JSON-LD nadal się parsuje i ma nazwę w postaci tekstu.
    const place = ldBlocks(html).find((b) => b['@type'] === 'Place');
    expect(place.name).toBe(EVIL);
  });
});

describe('S07 strona powiatu z fixture', () => {
  const page = model('1206');
  const html = renderUnitPage(page, ASSETS);

  it('jest pełnym dokumentem po polsku z 1 nagłówkiem H1', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="pl">');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(`>${page.h1}</h1>`);
    expect(html).toContain(`<title>${escapeHtml(page.title)}</title>`);
  });

  it('adres kanoniczny = adres strony, og:* z obrazkiem S03', () => {
    expect(page.path).toBe('/powiat/krakowski');
    expect(html).toContain('<link rel="canonical" href="https://faktografia.eu/powiat/krakowski">');
    expect(html).toContain('<meta property="og:url" content="https://faktografia.eu/powiat/krakowski">');
    expect(html).toContain('<meta property="og:image" content="https://faktografia.eu/og/faktografia.png">');
    expect(html).toContain(`<meta name="description" content="${escapeAttr(page.description)}">`);
  });

  it('JSON-LD Place i BreadcrumbList parsują się przez JSON.parse', () => {
    const blocks = ldBlocks(html);
    const place = blocks.find((b) => b['@type'] === 'Place');
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    expect(place.name).toBe(page.h1);
    expect(place.url).toBe('https://faktografia.eu/powiat/krakowski');
    expect(place.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 50.06, longitude: 19.94 });
    expect(place.containedInPlace.name).toBe('Województwo małopolskie');
    expect(crumbs.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement.at(-1).item).toBe('https://faktografia.eu/powiat/krakowski');
  });

  it('link „Otwórz na mapie” z TERYT i poziomem, pole min. 44 px', () => {
    expect(mapLink('1206', 'pow')).toBe('/mapa?u=1206&l=pow');
    const link = html.match(/<a [^>]*href="\/mapa\?u=1206&amp;l=pow"[^>]*>([^<]*)<\/a>/);
    expect(link?.[1]).toBe('Otwórz na mapie');
    expect(link?.[0]).toContain('min-h-[44px]');
  });

  it('bez skryptu aplikacji: tylko theme-init.js i JSON-LD', () => {
    expect(html).not.toContain('<script type="module"');
    const scripts = [...html.matchAll(/<script([^>]*)>/g)].map((m) => m[1].trim());
    for (const s of scripts) expect(['src="/theme-init.js"', 'type="application/ld+json"']).toContain(s);
    expect(html).toContain('<link rel="stylesheet" href="/assets/index-abc.css">');
  });

  it('tabela z podpisem i nagłówkami z zakresem', () => {
    expect(html).toContain('<caption');
    expect(html).toContain('<th scope="col"');
    expect((html.match(/<th scope="row"/g) ?? []).length).toBe(page.rows.length);
  });

  it('stopka ze źródłem i datą danych, okruszki i linki powiązane', () => {
    expect(html).toContain('Źródło: GUS, Bank Danych Lokalnych, CC BY 4.0 · dane z 17 listopada 2026');
    expect(html).toContain('href="/wojewodztwo/malopolskie"');
    for (const c of page.links.children) expect(html).toContain(`href="${c.path}"`);
  });

  it('indeksowana strona nie ma noindex', () => {
    expect(page.indexable).toBe(true);
    expect(html).toContain('<meta name="robots" content="index,follow">');
    expect(html).not.toContain('noindex');
  });
});

describe('S07 gmina i noindex', () => {
  it('indexable:false → meta robots noindex,follow', () => {
    const html = renderUnitPage(model('1219053', { indexable: false }), ASSETS);
    expect(html).toContain('<meta name="robots" content="noindex,follow">');
  });

  it('lista miejscowości: same nazwy, najwyżej 150, bez linków', () => {
    const names = Array.from({ length: 160 }, (_, i) => `Wieś ${String(i).padStart(3, '0')}`);
    const html = renderUnitPage(model('1219053', { localities: names }), ASSETS);
    const section = html.match(/<section aria-labelledby="miejscowosci"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
    expect((section.match(/<li>/g) ?? []).length).toBe(150);
    expect(section).not.toContain('<a ');
    expect(section).toContain('i 10 innych');
  });

  it('bez miejscowości nie ma tej sekcji; brak współrzędnych → Place bez geo', () => {
    const html = renderUnitPage(model('1219053', { centroid: null }), ASSETS);
    expect(html).not.toContain('id="miejscowosci"');
    const place = ldBlocks(html).find((b) => b['@type'] === 'Place');
    expect(place.geo).toBeUndefined();
    expect(html).toContain('href="/mapa?u=1219053&amp;l=gmi"');
  });
});
