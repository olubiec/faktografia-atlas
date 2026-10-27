import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProfileParts } from '../../src/view/profile/ProfileParts';
import type { PartsRow } from '../../src/core/parts/rows';
import tokensJson from '../../config/tokens.json';

// Ensure window object exists for matchMedia tests
if (typeof window === 'undefined') {
  (globalThis as any).window = {};
}

function mockMatchMediaWidth(width: number) {
  const breakpoint = tokensJson.breakpoints.tablet;
  window.matchMedia = vi.fn<(query: string) => MediaQueryList>().mockImplementation((query: string) => ({
    matches: width < breakpoint && query.includes(`max-width: ${breakpoint - 1}px`),
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => boolean>(),
  })) as any;
}

describe('ProfileParts component (@S20)', () => {
  beforeEach(() => {
    mockMatchMediaWidth(1024); // default desktop
  });

  const sample14Rows: PartsRow[] = Array.from({ length: 14 }, (_, i) => ({
    indicatorId: `ind_${i + 1}`,
    name: `Wskaźnik testowy ${i + 1}`,
    unit: 'os.',
    gmina: i === 0 ? null : (i + 1) * 10,
    city: (i + 1) * 6,
    rural: (i + 1) * 4,
  }));

  it('domyślnie jest zwinięty (aria-expanded="false", brak tabeli/kart w HTML)', () => {
    const html = renderToString(<ProfileParts rows={sample14Rows} year={2024} />);

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Miasto i obszar wiejski');
    expect(html).not.toContain('parts-table');
    expect(html).not.toContain('parts-cards');
  });

  it('po rozwinięciu (defaultExpanded=true) zawiera aria-expanded="true" oraz 14 wierszy tabeli na komputerze', () => {
    mockMatchMediaWidth(1024); // Desktop
    const html = renderToString(
      <ProfileParts rows={sample14Rows} year={2024} defaultExpanded={true} />
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-testid="parts-table"');

    // Nagłówki tabeli z §4c
    expect(html).toContain('Wskaźnik');
    expect(html).toContain('Gmina');
    expect(html).toContain('Miasto');
    expect(html).toContain('Obszar wiejski');

    // 14 wierszy wskaźników
    expect(html).toContain('Wskaźnik testowy 1');
    expect(html).toContain('Wskaźnik testowy 14');
  });

  it('na telefonie (< 768 px) po rozwinięciu renderuje karty per wskaźnik', () => {
    mockMatchMediaWidth(390); // Mobile
    const html = renderToString(
      <ProfileParts rows={sample14Rows} year={2024} defaultExpanded={true} />
    );

    expect(html).toContain('data-testid="parts-cards"');
    expect(html).toContain('data-testid="parts-card"');
    expect(html).not.toContain('data-testid="parts-table"');
  });

  it('formatuje null jako "brak danych"', () => {
    const rowsWithNull: PartsRow[] = [
      {
        indicatorId: 'density',
        name: 'Gęstość zaludnienia',
        unit: 'os./km²',
        gmina: null,
        city: 120.5,
        rural: null,
      },
    ];

    const html = renderToString(
      <ProfileParts rows={rowsWithNull} year={2024} defaultExpanded={true} />
    );

    expect(html).toContain('Gęstość zaludnienia');
    expect(html).toContain('brak danych');
  });

  it('wywołuje onFirstExpand dokładnie raz przy pierwszym rozwinięciu', () => {
    const onFirstExpand = vi.fn<() => void>();
    const refContainer = { handler: null as (() => void) | null };

    function renderWrapper() {
      const el = <ProfileParts rows={sample14Rows} year={2024} onFirstExpand={onFirstExpand} />;
      const jsx = (el.type as any)(el.props);
      refContainer.handler = jsx.props.children[0].props.onClick;
      return jsx;
    }

    renderToString(React.createElement(renderWrapper));

    const handleToggle = refContainer.handler;

    expect(handleToggle).not.toBeNull();
    expect(onFirstExpand).not.toHaveBeenCalled();

    // 1. Pierwsze kliknięcie w handler wygenerowany przez ProfileParts
    handleToggle!();
    expect(onFirstExpand).toHaveBeenCalledTimes(1);

    // 2. Drugie kliknięcie (zwinięcie)
    handleToggle!();
    expect(onFirstExpand).toHaveBeenCalledTimes(1);

    // 3. Trzecie kliknięcie (ponowne rozwinięcie)
    handleToggle!();
    expect(onFirstExpand).toHaveBeenCalledTimes(1);
  });

  it('przycisk ma obszar dotykowy ≥ 44 px (min-h-[44px])', () => {
    const html = renderToString(<ProfileParts rows={sample14Rows} year={2024} />);

    expect(html).toContain('min-h-[44px]');
  });

  it('po rozwinięciu zawiera podpis z PRODUKT.md §4c', () => {
    const html = renderToString(
      <ProfileParts rows={sample14Rows} year={2024} defaultExpanded={true} />
    );

    expect(html).toContain(
      'Dane GUS (Bank Danych Lokalnych) dla części gminy miejsko-wiejskiej.'
    );
  });

  it('używa wyłącznie tokenów stylów (brak sztywnych hexów ani cieni)', () => {
    const html = renderToString(
      <ProfileParts rows={sample14Rows} year={2024} defaultExpanded={true} />
    );

    expect(html).toContain('bg-arkusz');
    expect(html).toContain('border-linia');
    expect(html).toContain('text-tusz');
    expect(html).toContain('text-olowek');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(html).not.toMatch(/shadow-(?!none)/);
  });
});
