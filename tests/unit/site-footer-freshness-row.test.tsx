import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteFooter } from '../../src/view/layout/SiteFooter';
import { DataFreshnessText } from '../../src/view/layout/DataFreshness';

type G = { window?: unknown };

afterEach(() => {
  delete (globalThis as G).window;
});

function renderFooter(): string {
  (globalThis as G).window = {
    matchMedia: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
  };
  return renderToString(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>,
  );
}

describe('DataFreshnessText – położenie w stopce (N-33)', () => {
  it('z etykietą renderuje ją razem z przekazaną klasą', () => {
    const html = renderToString(<DataFreshnessText label="Dane GUS odświeżone: 1 stycznia" className="klasa-testowa" />);
    expect(html).toContain('Dane GUS odświeżone: 1 stycznia');
    expect(html).toMatch(/class="[^"]*klasa-testowa/);
    expect(html).toContain('text-xs');
  });

  it('bez klasy nadal działa jak dotąd', () => {
    const html = renderToString(<DataFreshnessText label="Dane GUS odświeżone: 1 stycznia" />);
    expect(html).toContain('Dane GUS odświeżone: 1 stycznia');
  });

  it('bez etykiety nie renderuje nic', () => {
    expect(renderToString(<DataFreshnessText label={null} className="x" />)).toBe('');
  });
});

describe('SiteFooter – liczba linków po zmianie układu (N-33)', () => {
  it('nadal 17 linków', () => {
    const html = renderFooter();
    expect([...html.matchAll(/<a [^>]*href="/g)]).toHaveLength(17);
  });
});
