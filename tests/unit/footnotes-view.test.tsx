import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Footnotes } from '../../src/view/profile/Footnotes';
import { ProfileIndicatorRow } from '../../src/view/profile/ProfileIndicatorRow';
import { ProfileBody } from '../../src/view/profile/ProfileSheet';
import type { ProfileIndicatorItem, UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('CC7.4b Footnotes View Components Tests', () => {
  const sampleUnits: Unit[] = [
    {
      teryt: '0201000',
      bdlId: '1',
      name: 'bolesławiecki',
      level: 'pow',
      parent: '0200000',
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
  ];

  const makeItem = (
    id: string,
    name: string,
    footnote?: string,
    fromParent?: string
  ): ProfileIndicatorItem => ({
    indicatorId: id,
    indicator: {
      id,
      bdlVarId: 100,
      name,
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
    fromParent,
    series: [],
  });

  it('renders Footnotes component as an ordered list with proper ids and text', () => {
    const list = [
      { id: 1, text: 'dane dla powiatu bolesławiecki' },
      { id: 2, text: 'bez firm do 9 pracowników' },
    ];

    const html = renderToString(<Footnotes footnotes={list} />);

    expect(html).toContain('<ol');
    expect(html).toContain('id="footnote-1"');
    expect(html).toContain('id="footnote-2"');
    expect(html).toContain('dane dla powiatu bolesławiecki');
    expect(html).toContain('bez firm do 9 pracowników');
  });

  it('renders nothing in Footnotes component when list is empty', () => {
    const html = renderToString(<Footnotes footnotes={[]} />);
    expect(html).toBe('');
  });

  it('renders superscript anchor links in ProfileIndicatorRow matching footnote numbers', () => {
    const item = makeItem('1', 'Wynagrodzenie', 'bez firm do 9 pracowników', '0201000');
    const footnotes = [
      { id: 1, text: 'dane dla powiatu bolesławiecki' },
      { id: 2, text: 'bez firm do 9 pracowników' },
    ];

    const html = renderToString(
      <ProfileIndicatorRow item={item} units={sampleUnits} footnotes={footnotes} />
    );

    expect(html).toContain('<sup');
    expect(html).toContain('<a href="#footnote-1"');
    expect(html).toContain('<a href="#footnote-2"');
    expect(html).toContain('title="dane dla powiatu bolesławiecki"');
    expect(html).toContain('title="bez firm do 9 pracowników"');
  });

  it('renders numbered footnotes list at bottom of ProfileBody and deduplicated source sentence', () => {
    const items = [
      makeItem('1', 'Wynagrodzenie', 'bez firm do 9 pracowników', '0201000'),
      makeItem('2', 'Praca', 'bez firm do 9 pracowników'),
    ];

    const profile: UnitProfile = {
      teryt: '0201011',
      unit: {
        teryt: '0201011',
        bdlId: '10',
        name: 'Bolesławiec',
        level: 'gmi',
        parent: '0201000',
        bbox: [0, 0, 0, 0],
        centroid: [0, 0],
      },
      indicators: items,
    };

    const html = renderToString(<ProfileBody profile={profile} units={sampleUnits} />);

    expect(html).toContain('id="footnote-1"');
    expect(html).toContain('id="footnote-2"');
    expect(html).toContain('Źródło: GUS, BDL, 2023');
  });
});
