import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { absoluteUrl, canonicalFor, removeFallbackTags, SITE_URL } from '../../src/core/seo/site';
import { PageMeta } from '../../src/view/layout/PageMeta';

const root = path.resolve(__dirname, '../..');
const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;
const attr = (html: string, re: RegExp) => html.match(re)?.[1];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('S03 canonicalFor / absoluteUrl', () => {
  it('ucina „/” na końcu, ale zostawia go dla strony startowej', () => {
    expect(canonicalFor('/mapa/')).toBe('https://faktografia.eu/mapa');
    expect(canonicalFor('/')).toBe('https://faktografia.eu/');
    expect(canonicalFor('')).toBe('https://faktografia.eu/');
  });
  it('usuwa parametry i kotwicę (D6)', () => {
    expect(canonicalFor('/mapa?u=12&i=x')).toBe('https://faktografia.eu/mapa');
    expect(canonicalFor('/o-projekcie#zrodla')).toBe('https://faktografia.eu/o-projekcie');
  });
  it('domena to faktografia.eu (D1)', () => {
    expect(SITE_URL).toBe('https://faktografia.eu');
    expect(absoluteUrl('/og/x.png')).toBe('https://faktografia.eu/og/x.png');
    expect(absoluteUrl('og/x.png')).toBe('https://faktografia.eu/og/x.png');
    expect(absoluteUrl('https://example.org/a')).toBe('https://example.org/a');
  });
});

describe('S03 PageMeta', () => {
  it('jeden tytuł, jeden opis i kanoniczny adres bez parametrów z bieżącej ścieżki', () => {
    vi.stubGlobal('location', { pathname: '/o-projekcie', search: '?x=1' });
    const html = renderToString(<PageMeta title="O projekcie" description="Opis strony" />);
    expect(count(html, /<title>/g)).toBe(1);
    expect(count(html, /<meta name="description"/g)).toBe(1);
    expect(count(html, /rel="canonical"/g)).toBe(1);
    expect(attr(html, /rel="canonical" href="([^"]*)"/)).toBe('https://faktografia.eu/o-projekcie');
    expect(attr(html, /property="og:url" content="([^"]*)"/)).toBe('https://faktografia.eu/o-projekcie');
  });

  it('jawna ścieżka z parametrami też daje adres bez parametrów', () => {
    const html = renderToString(<PageMeta title="O projekcie" path="/o-projekcie?x=1" />);
    expect(attr(html, /rel="canonical" href="([^"]*)"/)).toBe('https://faktografia.eu/o-projekcie');
  });

  it('ma og:image (absolutny, 1200×630), og:locale i kartę X', () => {
    const html = renderToString(<PageMeta title="Coś" path="/" />);
    const image = attr(html, /property="og:image" content="([^"]*)"/);
    expect(image).toMatch(/^https:\/\//);
    expect(image).toBe('https://faktografia.eu/og/faktografia.png');
    expect(attr(html, /property="og:image:width" content="([^"]*)"/)).toBe('1200');
    expect(attr(html, /property="og:image:height" content="([^"]*)"/)).toBe('630');
    expect(attr(html, /property="og:locale" content="([^"]*)"/)).toBe('pl_PL');
    expect(attr(html, /name="twitter:card" content="([^"]*)"/)).toBe('summary_large_image');
  });

  it('noindex daje meta robots „noindex,follow”, bez noindex go nie ma', () => {
    const withNo = renderToString(<PageMeta title="Coś" path="/x" noindex />);
    expect(attr(withNo, /name="robots" content="([^"]*)"/)).toBe('noindex,follow');
    const without = renderToString(<PageMeta title="Coś" path="/x" />);
    expect(without).not.toContain('name="robots"');
  });
});

describe('S03 sprzątanie zapasowych tagów z index.html', () => {
  it('usuwa wszystkie elementy [data-fallback]', () => {
    const removed: string[] = [];
    const head = {
      querySelectorAll: (sel: string) => {
        expect(sel).toBe('[data-fallback]');
        return ['description', 'og:title'].map((n) => ({ remove: () => removed.push(n) }));
      },
    };
    expect(removeFallbackTags(head)).toBe(2);
    expect(removed).toEqual(['description', 'og:title']);
  });
});

describe('S03 obrazek do udostępnień', () => {
  const file = path.join(root, 'public/og/faktografia.png');

  it('ma 1200×630 (nagłówek PNG) i waży najwyżej 150 KB', () => {
    const buf = fs.readFileSync(file);
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
    expect(buf.length).toBeLessThanOrEqual(150 * 1024);
  });
});
