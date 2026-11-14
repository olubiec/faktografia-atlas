import { describe, it, expect } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { MobileMenuLinks } from '../../src/view/Header';

// Linki menu telefonu (hamburger) renderowane do HTML.
function renderMenu(initialEntry = '/') {
  return renderToString(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MobileMenuLinks onNavigate={() => {}} />
    </MemoryRouter>
  );
}

// Wyciąga z HTML pary: href, tekst, klasy każdego linku (<a …>tekst</a>).
function parseLinks(html: string) {
  const matches = [...html.matchAll(/<a ([^>]*)>([^<]*)<\/a>/g)];
  return matches.map((m) => {
    const attrs = m[1];
    const href = /href="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const className = /class="([^"]*)"/.exec(attrs)?.[1] ?? '';
    const ariaCurrent = /aria-current="([^"]*)"/.exec(attrs)?.[1];
    return { href, label: m[2], className, ariaCurrent };
  });
}

// Ścieżki zadeklarowane w src/App.tsx (atrybuty path="…").
function readAppRoutes(): string[] {
  const appSource = readFileSync(resolve(__dirname, '../../src/App.tsx'), 'utf8');
  return [...appSource.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);
}

describe('Menu telefonu (hamburger) – P1-G', () => {
  it('menu ma dokładnie 6 linków w tej kolejności', () => {
    const links = parseLinks(renderMenu());

    expect(links.map((l) => l.label)).toEqual([
      'Biblioteka',
      'Rankingi',
      'Porównaj',
      'O projekcie',
      'Skąd są dane',
      'Prywatność',
    ]);
    expect(links.map((l) => l.href)).toEqual([
      '/biblioteka',
      '/rankingi',
      '/porownaj',
      '/o-projekcie',
      '/zrodla',
      '/prywatnosc',
    ]);
  });

  it('nie zawiera linku Kontakt (dodaje go osobne zadanie P2-E)', () => {
    const labels = parseLinks(renderMenu()).map((l) => l.label);
    expect(labels).not.toContain('Kontakt');
  });

  it('każdy href jest trasą zadeklarowaną w src/App.tsx', () => {
    const routes = readAppRoutes();
    const links = parseLinks(renderMenu());

    expect(routes.length).toBeGreaterThan(0);
    for (const link of links) {
      // Adres bez parametrów zapytania (?i=…) musi być dokładnie jedną z tras.
      const pathOnly = link.href.split('?')[0];
      expect(routes).toContain(pathOnly);
    }
  });

  it('każdy link zachowuje parametry adresu (np. ?i=density) z bieżącej strony', () => {
    const links = parseLinks(renderMenu('/?i=density'));

    expect(links).toHaveLength(6);
    for (const link of links) {
      expect(link.href.endsWith('?i=density')).toBe(true);
    }
  });

  it('każdy link ma pole dotykowe min. 44 px wysokości', () => {
    for (const link of parseLinks(renderMenu())) {
      expect(link.className).toContain('min-h-[44px]');
    }
  });

  it('aktualna podstrona jest oznaczona jako aria-current="page", pozostałe nie', () => {
    const links = parseLinks(renderMenu('/rankingi'));

    const current = links.filter((l) => l.ariaCurrent === 'page');
    expect(current.map((l) => l.label)).toEqual(['Rankingi']);
  });

  it('na stronie spoza listy (np. Mapa) żaden link nie jest oznaczony jako aktywny', () => {
    const links = parseLinks(renderMenu('/'));
    expect(links.filter((l) => l.ariaCurrent === 'page')).toEqual([]);
  });
});
