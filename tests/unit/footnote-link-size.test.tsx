import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProfileIndicatorRow } from '../../src/view/profile/ProfileIndicatorRow';
import type { ProfileIndicatorItem } from '../../src/core/profile/profile';

const makeItem = (footnote?: string): ProfileIndicatorItem => ({
  indicatorId: 'avg-wage',
  indicator: {
    id: 'avg-wage',
    bdlVarId: 100,
    name: 'Przeciętne wynagrodzenie',
    unit: 'zł',
    description: 'Opis',
    group: 'Gospodarka',
    higherIsBetter: true,
    minLevel: 'pow',
    footnote,
  },
  year: 2023,
  value: 5000,
  rankNational: 10,
  rankVoivodeship: 2,
  totalNational: 380,
  totalVoivodeship: 30,
  neutral: false,
  series: [],
});

describe('N-23 pole kliknięcia odnośnika przypisu (WCAG 2.5.8)', () => {
  it('odnośnik #footnote-… dostaje od <sup> inline-flex i min. 24x24 px (min-h-6, min-w-6)', () => {
    const html = renderToString(<ProfileIndicatorRow item={makeItem('bez firm do 9 pracowników')} units={[]} />);
    expect(html).toMatch(/<a [^>]*href="#footnote-1"/);
    const sup = html.match(/<sup [^>]*>/)![0].replace(/&amp;/g, '&').replace(/&gt;/g, '>');
    expect(sup).toMatch(/\[&>a\]:inline-flex/);
    expect(sup).toMatch(/\[&>a\]:min-h-6/);
    expect(sup).toMatch(/\[&>a\]:min-w-6/);
    expect(sup).toMatch(/\[&>a\]:items-center/);
    expect(sup).toMatch(/\[&>a\]:justify-center/);
    const tag = html.match(/<a [^>]*href="#footnote-1"[^>]*>/)![0];
    expect(tag).toContain('title="bez firm do 9 pracowników"');
  });

  it('wiersz bez przypisów nie renderuje <sup>', () => {
    const html = renderToString(<ProfileIndicatorRow item={makeItem()} units={[]} />);
    expect(html).not.toContain('<sup');
  });
});
