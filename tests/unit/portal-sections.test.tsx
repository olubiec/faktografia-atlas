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
    expect(html).toContain('Brama do Biblioteki GUS');
    expect(html).toContain('64 000 zmiennych');
  });

  it('renders FeaturedComparisons with contrasting pairs', () => {
    const html = renderToString(
      <MemoryRouter>
        <FeaturedComparisons />
      </MemoryRouter>
    );

    expect(html).toContain('Warszawa');
    expect(html).toContain('Kraków');
    expect(html).toContain('Poznań');
    expect(html).toContain('Wrocław');
  });
});
