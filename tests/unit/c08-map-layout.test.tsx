import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BOTTOM_GAP_CLASS,
  BOTTOM_GAP_PX,
  TOP_ZONE_CLASS,
  TOOLTIP_ZONE_CLASS,
  tooltipBottomOffset,
} from '../../src/view/map/sheetInset';
import { UnitTooltip } from '../../src/view/main/UnitTooltip';
import { BackButton } from '../../src/view/map/BackButton';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
// Położenie wpisane na sztywno: bottom-16, left-3, top-4, right-3, inset-x-3 itp.
const HARD_POSITION = /(?<![\w-])(?:-?(?:top|bottom|left|right|inset(?:-[xy])?))-(?:\d|\[)/;

const unit = { teryt: '2261011', name: 'Gdańsk', level: 'gmina' } as never;

describe('C08 strefy układu na mapie', () => {
  it('odstęp dolny jest jednym źródłem: klasa paska i piksele okienka są spójne', () => {
    expect(BOTTOM_GAP_CLASS).toBe('mb-3');
    expect(BOTTOM_GAP_PX).toBe(12);
  });

  it('okienko miejsca staje nad przeszkodą z jednym odstępem dolnym', () => {
    // Mapa kończy się na 700, przeszkoda (pasek/zgoda) zaczyna na 650 → okienko 50 + odstęp nad przeszkodą.
    expect(tooltipBottomOffset(700, 650)).toBe(50 + BOTTOM_GAP_PX);
    expect(tooltipBottomOffset(700, 800)).toBe(BOTTOM_GAP_PX);
  });

  it.each([
    'src/view/main/UnitTooltip.tsx',
    'src/view/map/BackButton.tsx',
    'src/view/main/MobileIndicatorBar.tsx',
  ])('%s: bez położenia wpisanego na sztywno', (file) => {
    const classNames = [...read(file).matchAll(/className="([^"]*)"/g)].map((m) => m[1]);
    const offenders = classNames.filter((c) => HARD_POSITION.test(c) || /\bmb-\d/.test(c));
    expect(offenders).toEqual([]);
  });

  it('UnitTooltip na telefonie bierze położenie z klasy strefy', () => {
    const html = renderToString(
      <UnitTooltip unit={unit} value={1} unitName={null} rank={1} total={10} levelNoun="gmin" isMobile onOpenProfile={() => {}} />
    );
    for (const cls of TOOLTIP_ZONE_CLASS.split(' ')) expect(html).toContain(cls);
    expect(html).not.toMatch(/bottom-16|left-3|right-3/);
  });

  it('BackButton leży w strefie górnej', () => {
    const html = renderToString(<BackButton onClick={() => {}} visible />);
    for (const cls of TOP_ZONE_CLASS.split(' ')) expect(html).toContain(cls);
  });

  it('pasek wskaźnika ma odstęp dolny z klasy strefy i znika spod otwartego profilu', () => {
    const src = read('src/view/main/MobileIndicatorBar.tsx');
    expect(src).toContain(BOTTOM_GAP_CLASS);
    expect(src).toMatch(/profileOpen \? ' invisible'/);
  });
});
