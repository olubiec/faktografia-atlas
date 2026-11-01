import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { PortalSections } from '../../src/view/home/PortalSections';
import { FeaturedComparisons } from '../../src/view/home/FeaturedComparisons';

describe('PortalSections Unit Tests (W16-M01)', () => {
  it('renders quick start section with key localities and regions', () => {
    const html = renderToString(
      <MemoryRouter>
        <PortalSections />
      </MemoryRouter>
    );

    expect(html).toContain('Szybki start');
    expect(html).toContain('Warszawa');
    expect(html).toContain('Kraków');
    expect(html).toContain('Kleszczów');
  });

  it('renders thematic sections and library entry point', () => {
    const html = renderToString(
      <MemoryRouter>
        <PortalSections />
      </MemoryRouter>
    );

    expect(html).toContain('Działy tematyczne GUS');
    expect(html).toMatch(/Biblioteka 64 000 zmiennych BDL/i);
  });

  it('renders FeaturedComparisons with contrasting pairs', () => {
    const html = renderToString(
      <MemoryRouter>
        <FeaturedComparisons />
      </MemoryRouter>
    );

    expect(html).toContain('Pojedynki miejsc');
    expect(html).toContain('Warszawa vs Kraków');
    expect(html).toContain('Kleszczów vs Przytuły');
  });
});
