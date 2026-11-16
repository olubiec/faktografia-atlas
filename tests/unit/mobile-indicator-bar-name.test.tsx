import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MobileIndicatorBar } from '../../src/view/main/MobileIndicatorBar';
import type { MainView } from '../../src/view/map/hooks/useMainView';
import type { ChoroplethData } from '../../src/view/map/hooks/useChoropleth';
import type { UnitIndex } from '../../src/core/units/types';

// WCAG 2.5.3: widoczny tekst przycisku musi być zawarty w jego nazwie dostępnej.
// Tekst widoczny ma rozdzielać nazwę, rok i zakres odstępami (nie „…km²202550,4”).

const emptyIndex: UnitIndex = { byTeryt: new Map(), childrenByParent: new Map() };

const view = {
  indicator: {
    id: 'x',
    bdlVarId: 1,
    name: 'Stopa bezrobocia rejestrowanego',
    unit: '%',
    description: '',
    group: '',
    higherIsBetter: null,
    minLevel: 'woj',
  },
  indicators: [],
  values: null,
  year: 2023,
  years: [2023],
  level: 'woj',
  setIndicator: () => {},
  setYear: () => {},
  setLevel: () => {},
} as unknown as MainView;

const choropleth = {
  indicatorId: 'x',
  year: 2023,
  level: 'woj',
  classes: 4,
  scheme: 'sequential',
  breaks: [10, 20, 30],
  classByTeryt: {},
  reveal: { running: false, progress: 1 },
  activeScope: { level: 'woj', activeWojTeryt: null, activePowTeryt: null },
  revealResults: new Map(),
} as unknown as ChoroplethData;

/** Tekst widoczny pierwszego przycisku paska (bez znaczników i komentarzy Reacta). */
function visibleButtonText(): string {
  const html = renderToString(
    <MobileIndicatorBar
      view={view}
      choropleth={choropleth}
      ranking={null}
      index={emptyIndex}
      selectedTeryt={null}
      onSelectUnit={() => {}}
    />
  );
  const button = html.match(/<button[^>]*>([\s\S]*?)<\/button>/);
  expect(button).not.toBeNull();
  return (button?.[1] ?? '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '');
}

describe('MobileIndicatorBar: tekst widoczny przycisku (WCAG 2.5.3)', () => {
  it('nazwa i rok są rozdzielone spacją', () => {
    expect(visibleButtonText()).toMatch(/Stopa bezrobocia rejestrowanego\s+2023/);
  });

  it('rok i początek zakresu są rozdzielone spacją', () => {
    expect(visibleButtonText()).toMatch(/2023\s+10/);
  });
});
