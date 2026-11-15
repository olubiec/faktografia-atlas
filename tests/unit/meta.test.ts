import { describe, test, expect, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PageMeta } from '../../src/view/layout/PageMeta';

// Pilnuje tagów meta (SEO, udostępnianie linków), robots.txt, sitemapy i manifestu.
const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const DOMAIN = 'https://faktografia.eu';

const html = read('index.html');
const manifest = JSON.parse(read('public/site.webmanifest')) as {
  name: string;
  lang: string;
  display: string;
  icons: { src: string }[];
};

/** Wartość atrybutu content tagu meta o danym atrybucie (name/property). */
function metaContent(attr: 'name' | 'property', key: string): string | undefined {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  for (const tag of tags) {
    if (tag.includes(`${attr}="${key}"`)) return tag.match(/content="([^"]*)"/)?.[1];
  }
  return undefined;
}

function linkHref(rel: string): string[] {
  const tags = html.match(/<link\b[^>]*>/g) ?? [];
  return tags
    .filter((t) => t.includes(`rel="${rel}"`))
    .map((t) => t.match(/href="([^"]*)"/)?.[1] ?? '');
}

/** Publiczne trasy statyczne z src/App.tsx (bez parametrów, /__test/, /design i gwiazdki). */
function publicRoutes(): string[] {
  const app = read('src/App.tsx');
  return [...app.matchAll(/<Route path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => !p.includes(':') && !p.includes('*') && !p.startsWith('/__test') && p !== '/design');
}

describe('index.html', () => {
  test('ma opis po polsku', () => {
    const d = metaContent('name', 'description');
    expect(d && d.length > 40).toBe(true);
    expect(d).toMatch(/GUS/);
  });
  test('ma canonical na domenie', () => {
    expect(linkHref('canonical')).toEqual([`${DOMAIN}/`]);
  });
  test('ma komplet tagów Open Graph', () => {
    expect(metaContent('property', 'og:title')).toBeTruthy();
    expect(metaContent('property', 'og:description')).toBeTruthy();
    expect(metaContent('property', 'og:type')).toBe('website');
    expect(metaContent('property', 'og:url')).toBe(`${DOMAIN}/`);
    expect(metaContent('property', 'og:locale')).toBe('pl_PL');
    expect(metaContent('property', 'og:image')).toMatch(new RegExp(`^${DOMAIN}/brand/`));
  });
  test('ma kartę Twittera', () => {
    expect(metaContent('name', 'twitter:card')).toBe('summary_large_image');
  });
  test('theme-color jest kolorem z tokenów', () => {
    const color = metaContent('name', 'theme-color');
    expect(color).toBeTruthy();
    expect(read('src/styles/tokens.css').toLowerCase()).toContain(color!.toLowerCase());
  });
  test('linkuje manifest', () => {
    expect(linkHref('manifest')).toEqual(['/site.webmanifest']);
  });
});

describe('robots.txt i sitemap.xml', () => {
  test('robots.txt ma reguły i adres sitemapy', () => {
    const r = read('public/robots.txt');
    expect(r).toMatch(/^Allow: \/$/m);
    expect(r).toMatch(/^Disallow: \/__test\/$/m);
    expect(r).toContain(`Sitemap: ${DOMAIN}/sitemap.xml`);
  });
  test('sitemap zawiera każdą publiczną trasę i żadnej z __test ani /design', () => {
    const sm = read('public/sitemap.xml');
    const routes = publicRoutes();
    expect(routes).toContain('/');
    for (const r of routes) expect(sm).toContain(`<loc>${DOMAIN}${r === '/' ? '/' : r}</loc>`);
    expect(sm).not.toContain('__test');
    expect(sm).not.toContain('/design');
    expect((sm.match(/<loc>/g) ?? []).length).toBe(routes.length);
  });
});

describe('manifest', () => {
  test('ma nazwę, język i tryb', () => {
    expect(manifest.name).toBe('Faktografia Atlas');
    expect(manifest.lang).toBe('pl');
    expect(manifest.display).toBe('standalone');
  });
  test('każdy plik ikony lub obrazu istnieje na dysku', () => {
    const refs = [
      ...manifest.icons.map((i) => i.src),
      ...linkHref('icon'),
      metaContent('property', 'og:image') ?? '',
    ]
      .filter(Boolean)
      .map((s) => s.replace(DOMAIN, ''));
    expect(refs.length).toBeGreaterThan(1);
    for (const ref of refs) {
      expect(fs.existsSync(path.join(root, "public", ref)) ? ref : `brak: ${ref}`).toBe(ref);
    }
  });
});

describe('PageMeta', () => {
  afterEach(() => vi.unstubAllGlobals());
  test('domyślny opis i canonical = domena + ścieżka', () => {
    vi.stubGlobal('location', { pathname: '/zrodla' });
    const out = renderToStaticMarkup(createElement(PageMeta, { title: 'Źródła' }));
    expect(out).toContain('href="https://faktografia.eu/zrodla"');
    expect(out).toMatch(/name="description" content="[^"]*GUS/);
  });
  test('jawny opis i canonical mają pierwszeństwo', () => {
    const out = renderToStaticMarkup(
      createElement(PageMeta, { title: 'X', description: 'Własny', canonical: 'https://faktografia.eu/x' }),
    );
    expect(out).toContain('content="Własny"');
    expect(out).toContain('href="https://faktografia.eu/x"');
  });
});
