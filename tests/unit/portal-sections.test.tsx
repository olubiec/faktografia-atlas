import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PortalSections } from '../../src/view/home/PortalSections';
import { FeaturedComparisons } from '../../src/view/home/FeaturedComparisons';

describe('PortalSections Unit Tests (W16-M01)', () => {
  it('renders quick start section with key localities and regions', () => {
    render(
      <MemoryRouter>
        <PortalSections />
      </MemoryRouter>
    );

    expect(screen.getByText('Szybki start')).toBeDefined();
    expect(screen.getByText('Warszawa')).toBeDefined();
    expect(screen.getByText('Kraków')).toBeDefined();
    expect(screen.getByText('Kleszczów')).toBeDefined();
  });

  it('renders thematic sections and library entry point', () => {
    render(
      <MemoryRouter>
        <PortalSections />
      </MemoryRouter>
    );

    expect(screen.getByText('Działy tematyczne GUS')).toBeDefined();
    expect(screen.getByText(/Biblioteka 64 000 zmiennych BDL/i)).toBeDefined();
  });

  it('renders FeaturedComparisons with contrasting pairs', () => {
    render(
      <MemoryRouter>
        <FeaturedComparisons />
      </MemoryRouter>
    );

    expect(screen.getByText('Pojedynki miejsc')).toBeDefined();
    expect(screen.getByText('Warszawa vs Kraków')).toBeDefined();
    expect(screen.getByText('Kleszczów vs Przytuły')).toBeDefined();
  });
});
