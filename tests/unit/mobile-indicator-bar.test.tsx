import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MobileIndicatorBar } from '../../src/view/main/MobileIndicatorBar';
import type { MainView } from '../../src/view/map/hooks/useMainView';
import type { ChoroplethData } from '../../src/view/map/hooks/useChoropleth';
import type { UnitIndex } from '../../src/core/units/types';

// Uwaga: środowisko Vitest to 'node' (bez DOM), więc geometrię paska i atrapę 110 px
// sprawdza test Playwright w tests/e2e/mobile-indicator-consent-P1-C.spec.ts.

const emptyIndex: UnitIndex = { byTeryt: new Map(), childrenByParent: new Map() };

function makeView(name: string, unit: string, year: number | null): MainView {
  return {
    indicator: { id: 'x', bdlVarId: 1, name, unit, description: '', group: '', higherIsBetter: null, minLevel: 'woj' },
    indicators: [],
    values: null,
    year,
    years: year == null ? [] : [year],
    level: 'woj',
    setIndicator: () => {},
    setYear: () => {},
    setLevel: () => {},
  } as unknown as MainView;
}

function makeChoropleth(breaks: number[]): ChoroplethData {
  return {
    indicatorId: 'x',
    year: 2023,
    level: 'woj',
    classes: breaks.length + 1,
    scheme: 'sequential',
    breaks,
    classByTeryt: {},
    reveal: { running: false, progress: 1 },
    activeScope: { level: 'woj', activeWojTeryt: null, activePowTeryt: null },
    revealResults: new Map(),
  } as unknown as ChoroplethData;
}

function render(view: MainView, choropleth: ChoroplethData | null) {
  return renderToString(
    <MobileIndicatorBar
      view={view}
      choropleth={choropleth}
      ranking={null}
      index={emptyIndex}
      selectedTeryt={null}
      onSelectUnit={() => {}}
    />
  );
}

/** Tekst zakresu legendy z gotowego HTML (null, gdy go nie ma). */
function rangeText(html: string): string | null {
  const match = html.match(/text-xs text-olowek break-words">([^<]*)</);
  return match ? match[1] : null;
}

describe('MobileIndicatorBar: zakres legendy z jednostką', () => {
  it('pokazuje min – max z jednostką', () => {
    const range = rangeText(render(makeView('X', '%', 2023), makeChoropleth([10, 20, 30])));
    expect(range).not.toBeNull();
    expect(range).toContain('10');
    expect(range).toContain('30');
    expect(range).toContain('%');
    expect(range).toContain('–');
  });

  it('wartość 0 jest pokazywana jako 0, a nie pomijana', () => {
    const range = rangeText(render(makeView('X', 'zł', 2023), makeChoropleth([0, 5])));
    expect(range).not.toBeNull();
    expect(range).toContain('0');
    expect(range).toContain('5');
  });

  it('pojedynczy próg pokazuje jedną wartość, bez myślnika', () => {
    const range = rangeText(render(makeView('X', '%', 2023), makeChoropleth([7])));
    expect(range).toContain('7');
    expect(range).not.toContain('–');
  });

  it('kolejność progów nie ma znaczenia (min i max są wyliczane)', () => {
    const sorted = rangeText(render(makeView('X', '%', 2023), makeChoropleth([10, 20, 30])));
    const shuffled = rangeText(render(makeView('X', '%', 2023), makeChoropleth([30, 10, 20])));
    expect(shuffled).toBe(sorted);
  });

  it('brak danych kartogramu = brak zakresu', () => {
    expect(rangeText(render(makeView('X', '%', 2023), null))).toBeNull();
  });

  it('pusta lista progów = brak zakresu', () => {
    expect(rangeText(render(makeView('X', '%', 2023), makeChoropleth([])))).toBeNull();
  });
});

describe('MobileIndicatorBar: nazwa, rok i legenda w HTML', () => {
  it('pokazuje nazwę wskaźnika i rok', () => {
    const html = render(makeView('Stopa bezrobocia rejestrowanego', '%', 2023), makeChoropleth([5, 10]));
    expect(html).toContain('Stopa bezrobocia rejestrowanego');
    expect(html).toContain('2023');
    expect(html).toContain('aria-label="Wskaźnik: Stopa bezrobocia rejestrowanego 2023, ');
  });

  it('bardzo długa nazwa jest w całości w DOM i ma limit 2 linii zamiast obcinania', () => {
    const longName = 'Bardzo długa nazwa wskaźnika '.repeat(8).trim();
    const html = render(makeView(longName, '%', 2023), makeChoropleth([1, 2]));
    expect(html).toContain(longName);
    expect(html).toContain('line-clamp-2');
  });

  it('bez roku i bez danych: nazwa zostaje, brak roku i zakresu', () => {
    const html = render(makeView('Wskaźnik bez roku', '%', null), null);
    expect(html).toContain('Wskaźnik bez roku');
    expect(html).toContain('aria-label="Wskaźnik: Wskaźnik bez roku"');
    expect(rangeText(html)).toBeNull();
  });

  it('rysuje 5 próbek legendy i przesuwa pasek o zmienną --consent-offset', () => {
    const html = render(makeView('X', '%', 2023), makeChoropleth([1, 2, 3, 4]));
    const swatches = html.match(/data-slot="legend-swatch"/g) ?? [];
    expect(swatches).toHaveLength(5);
    expect(html).toContain('translateY(calc(var(--consent-offset, 0px) * -1))');
  });
});
