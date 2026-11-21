import { describe, expect, it } from 'vitest';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Header } from '../../src/view/Header';
import { NotFound } from '../../src/view/NotFound';
import { About } from '../../src/view/pages/About';
import { PageMeta } from '../../src/view/layout/PageMeta';

const app = readFileSync('src/App.tsx', 'utf8');

describe('trasy są leniwe (B03)', () => {
  const staticImports = [...app.matchAll(/^import\s.+?from\s+['"](.+?)['"];?$/gm)].map((m) => m[1]);

  it('App.tsx nie importuje statycznie ekranu mapy ani stron', () => {
    for (const path of staticImports) {
      expect(path, `statyczny import ${path}`).not.toMatch(/view\/(Home|map\/|pages\/|test\/|start\/|NotFound)/);
    }
  });

  it('mapa, ekran startowy i strony ładują się przez React.lazy', () => {
    expect(app).toMatch(/lazy\(\(\) =>\s*import\('\.\/view\/Home'\)/);
    expect(app).toMatch(/lazy\(\(\) =>\s*import\('\.\/view\/start\/StartPage'\)/);
    expect(app).toMatch(/lazy\(\(\) =>\s*import\('\.\/view\/pages\/About'\)/);
  });

  it('trasa `/` to ekran startowy z przekierowaniem starych linków, a `/mapa` to mapa', () => {
    expect(app).toMatch(/path="\/mapa"/);
    expect(app).toMatch(/path="\/"/);
    expect(app).toContain('legacyRedirect');
  });
});

describe('menu (B03)', () => {
  it('ma dokładnie 2 pozycje: Start i Mapa', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>,
    );
    const nav = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
    const links = [...nav.matchAll(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
    expect(links.map((l) => l[1])).toEqual(['/', '/mapa']);
    expect(links.map((l) => l[2].replace(/<[^>]+>/g, '').trim())).toEqual(['Start', 'Mapa']);
    for (const name of ['Rankingi', 'Porównaj', 'Biblioteka']) expect(nav).not.toContain(name);
  });

  it('logo prowadzi na `/`', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/mapa?u=12']}>
        <Header />
      </MemoryRouter>,
    );
    expect(html).toMatch(/<a [^>]*aria-label="Faktografia – strona główna"[^>]*href="\/"/);
  });
});

describe('nazwa „Faktografia” (B03)', () => {
  it('PageMeta nie dopisuje „Atlas”', () => {
    const html = renderToString(<PageMeta title="Coś" />);
    expect(html).toContain('<title>Coś – Faktografia</title>');
    expect(html).not.toContain('Faktografia Atlas');
  });
  it('404 i „O projekcie” mają tytuł i nagłówek bez „Atlas”', () => {
    for (const el of [<NotFound key="n" />, <About key="a" />]) {
      const html = renderToString(<MemoryRouter>{el}</MemoryRouter>);
      expect(html).toMatch(/<title>[^<]*Faktografia<\/title>/);
      expect(html).not.toContain('Faktografia Atlas');
    }
  });
  it('index.html ma tytuł „Faktografia”', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('<title>Faktografia</title>');
  });
});
