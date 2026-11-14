import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';

// Stała lista linków stopki (kolejność ma znaczenie): logo, licencja, 3 grupy
const EXPECTED_HREFS = [
  '/',
  'https://creativecommons.org/licenses/by/4.0/deed.pl',
  '/',
  '/rankingi',
  '/porownaj',
  '/biblioteka',
  '/?i=density',
  '/?i=unemployment-rate',
  '/?i=avg-wage',
  '/?i=dwellings-per-1000',
  '/?i=forest-cover',
  '/?i=preschool-3-6',
  '/?i=cars-per-1000',
  '/o-projekcie',
  '/zrodla',
  '/prywatnosc',
  'https://github.com/olubiec/faktografia-atlas',
];
const GROUPS = ['Narzędzia', 'Działy tematyczne GUS', 'Dokumentacja'];

type G = { window?: unknown };

function render(mobile: boolean): string {
  (globalThis as G).window = {
    matchMedia: () => ({
      matches: mobile,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  };
  return renderToString(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>
  );
}

function hrefs(html: string): string[] {
  return [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

afterEach(() => {
  delete (globalThis as G).window;
});

describe('SiteFooter – zwijanie na telefonie (P1-F)', () => {
  it('liczba i kolejność linków jest taka sama na telefonie i komputerze', () => {
    const mobile = hrefs(render(true));
    const desktop = hrefs(render(false));
    expect(desktop).toEqual(EXPECTED_HREFS);
    expect(mobile).toEqual(EXPECTED_HREFS);
    expect(mobile).toHaveLength(17);
  });

  it('na telefonie 3 grupy to zwinięte <details> z <summary>', () => {
    const html = render(true);
    expect(html.match(/<details/g)).toHaveLength(3);
    expect(html.match(/<summary/g)).toHaveLength(3);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    for (const title of GROUPS) expect(html).toContain(title);
  });

  it('od tabletu grupy są rozwinięte (układ bez zmian)', () => {
    const html = render(false);
    expect(html.match(/<details[^>]*\sopen/g)).toHaveLength(3);
  });

  it('każde summary ma pole dotykowe min. 44 px i nazwę po polsku', () => {
    const html = render(true);
    const summaries = [...html.matchAll(/<summary([^>]*)>([\s\S]*?)<\/summary>/g)];
    expect(summaries).toHaveLength(3);
    summaries.forEach((m, i) => {
      expect(m[1]).toContain('min-h-[44px]');
      expect(m[2]).toContain(GROUPS[i]);
      expect(m[2]).not.toMatch(/common\.|\{\{/);
    });
  });

  it('nawigacje zachowują dostępne nazwy', () => {
    const html = render(true);
    for (const title of GROUPS) expect(html).toContain(`aria-label="${title}"`);
  });
});
