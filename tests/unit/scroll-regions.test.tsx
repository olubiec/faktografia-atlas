import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { ProfileParts } from '../../src/view/profile/ProfileParts';
import { ProfileCompareTable } from '../../src/view/profile/ProfileCompareTable';
import { SourcesIndicatorTable } from '../../src/view/pages/SourcesIndicatorTable';
import type { PartsRow } from '../../src/core/parts/rows';
import type { UnitProfile, ProfileIndicatorItem } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import tokensJson from '../../config/tokens.json';

// Przewijane poziomo tabele muszą być dostępne z klawiatury (WCAG 2.1.1) i nazwane.

const rows: PartsRow[] = Array.from({ length: 3 }, (_, i) => ({
  indicatorId: `ind_${i + 1}`,
  name: `Wskaźnik testowy ${i + 1}`,
  unit: 'os.',
  gmina: (i + 1) * 10,
  city: (i + 1) * 6,
  rural: (i + 1) * 4,
}));

const unitA: Unit = { teryt: '12', bdlId: null, name: 'małopolskie', level: 'woj', parent: null, bbox: [0, 0, 1, 1], centroid: [0, 0] };
const unitB: Unit = { teryt: '14', bdlId: null, name: 'mazowieckie', level: 'woj', parent: null, bbox: [0, 0, 1, 1], centroid: [0, 0] };

function item(value: number): ProfileIndicatorItem {
  return {
    indicatorId: 'pop',
    indicator: { id: 'pop', bdlVarId: 1, name: 'Ludność', unit: 'osób', description: '', group: 'x', higherIsBetter: null, minLevel: 'woj' },
    year: 2023, value, rankNational: 1, rankVoivodeship: 1, totalNational: 16, totalVoivodeship: 1, neutral: true, series: [],
  };
}
const profile = (unit: Unit, v: number): UnitProfile => ({ teryt: unit.teryt, unit, indicators: [item(v)] });

function mockWidth(width: number) {
  const bp = tokensJson.breakpoints.tablet;
  window.matchMedia = vi.fn<(query: string) => unknown>().mockImplementation((query: string) => ({
    matches: width < bp && query.includes(`max-width: ${bp - 1}px`),
    media: query,
    onchange: null,
    addListener: vi.fn<() => void>(),
    removeListener: vi.fn<() => void>(),
    addEventListener: vi.fn<() => void>(),
    removeEventListener: vi.fn<() => void>(),
    dispatchEvent: vi.fn<() => void>(),
  })) as unknown as typeof window.matchMedia;
}

/** Zwraca otwierający znacznik pierwszego elementu z klasą overflow-x-auto. */
function scrollTag(html: string): string {
  const m = html.match(/<[a-z0-9]+ [^>]*class="[^"]*overflow-x-auto[^"]*"[^>]*>/);
  expect(m, 'brak elementu z overflow-x-auto').not.toBeNull();
  return m![0];
}

function expectRegion(tag: string) {
  expect(tag).toMatch(/tabindex="0"/);
  expect(tag).toMatch(/role="region"/);
  expect(tag).toMatch(/aria-label="[^"]+"/);
  expect(tag).toMatch(/focus-visible:ring/);
}

describe('Przewijane tabele dostępne z klawiatury (@S21)', () => {
  const original = typeof window !== 'undefined' ? window.matchMedia : undefined;
  beforeEach(() => {
    if (typeof window === 'undefined') (globalThis as any).window = {};
    mockWidth(1440);
  });
  afterEach(() => {
    if (original) window.matchMedia = original;
  });

  it('ProfileParts (komputer): kontener tabeli ma tabindex, role=region i nazwę', () => {
    const html = renderToString(<ProfileParts rows={rows} year={2024} defaultExpanded />);
    const tag = scrollTag(html);
    expectRegion(tag);
    expect(tag).toContain('aria-label="Miasto i obszar wiejski – tabela"');
  });

  it('ProfileParts (telefon): karty bez poziomego przewijania nie mają tabindex', () => {
    mockWidth(390);
    const html = renderToString(<ProfileParts rows={rows} year={2024} defaultExpanded />);
    expect(html).toContain('parts-cards');
    expect(html).not.toContain('overflow-x-auto');
    expect(html).not.toContain('tabindex');
  });

  it('ProfileCompareTable: kontener tabeli ma tabindex, role=region i nazwę', () => {
    const html = renderToString(
      <ProfileCompareTable profileA={profile(unitA, 110)} profileB={profile(unitB, 100)} />,
    );
    const tag = scrollTag(html);
    expectRegion(tag);
    expect(tag).toContain('aria-label="Porównanie miejsc – tabela"');
  });

  it('SourcesIndicatorTable: kontener tabeli ma tabindex, role=region i nazwę', () => {
    const html = renderToString(
      <StaticRouter location="/zrodla">
        <SourcesIndicatorTable />
      </StaticRouter>,
    );
    const tag = scrollTag(html);
    expectRegion(tag);
    expect(tag).toContain('aria-label="Wskaźniki i źródła – tabela"');
  });
});
