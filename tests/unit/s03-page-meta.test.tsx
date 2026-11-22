import { readFileSync, statSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { PageMeta } from '../../src/view/layout/PageMeta';
import { canonicalFor } from '../../src/core/seo/site';

const html = (el: React.ReactElement) => renderToString(el).replace(/<!-- -->/g, '');
const count = (h: string, re: RegExp) => (h.match(re) ?? []).length;

// Węzeł nie ma window, więc kanoniczny adres podajemy jawnie albo bierzemy domyślnie ze strony głównej.
describe('W25-S03: PageMeta', () => {
  it('jeden tytuł, jeden opis, kanoniczny adres, og:image absolutny, karta X', () => {
    const h = html(<PageMeta title="O projekcie" description="Opis strony" canonical={canonicalFor('/o-projekcie?x=1')} />);
    expect(count(h, /<title>/g)).toBe(1);
    expect(count(h, /name="description"/g)).toBe(1);
    expect(h).toContain('rel="canonical" href="https://faktografia.eu/o-projekcie"');
    expect(h).toMatch(/property="og:image" content="https:\/\//);
    expect(h).toContain('name="twitter:card" content="summary_large_image"');
    expect(h).toContain('property="og:locale" content="pl_PL"');
  });

  it('domyślny kanoniczny adres to strona główna', () => {
    expect(html(<PageMeta title="A" />)).toContain('href="https://faktografia.eu/"');
  });

  it('noindex daje meta robots; domyślnie go nie ma', () => {
    expect(html(<PageMeta title="A" />)).not.toContain('name="robots"');
    expect(html(<PageMeta title="B" noindex />)).toContain('name="robots" content="noindex,follow"');
  });

  it('po starcie usuwa tagi zastępcze z index.html (data-fallback)', () => {
    const src = readFileSync('src/view/layout/PageMeta.tsx', 'utf8');
    expect(src).toContain("querySelectorAll('[data-fallback]')");
    expect(readFileSync('index.html', 'utf8').match(/data-fallback/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it('canonicalFor: bez ukośnika na końcu, strona główna z ukośnikiem', () => {
    expect(canonicalFor('/mapa/')).toBe('https://faktografia.eu/mapa');
    expect(canonicalFor('/')).toBe('https://faktografia.eu/');
    expect(canonicalFor('')).toBe('https://faktografia.eu/');
  });

  it('obrazek do udostępnień ma 1200×630 i do 150 KB', () => {
    const file = 'public/og/faktografia.png';
    const buf = readFileSync(file);
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
    expect(statSync(file).size).toBeLessThanOrEqual(150 * 1024);
  });
});
