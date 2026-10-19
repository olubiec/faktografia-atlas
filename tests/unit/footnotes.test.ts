import { describe, it, expect } from 'vitest';
import { collectFootnotes } from '../../src/core/profile/footnotes';
import type { ProfileIndicatorItem } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('CC7.4b collectFootnotes unit tests', () => {
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
    {
      teryt: '0200000',
      bdlId: '2',
      name: 'dolnośląskie',
      level: 'woj',
      parent: null,
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
  ];

  const makeIndicatorItem = (
    id: string,
    footnote?: string,
    fromParent?: string
  ): ProfileIndicatorItem => ({
    indicatorId: id,
    indicator: {
      id,
      bdlVarId: 100,
      name: `Indicator ${id}`,
      unit: 'zł',
      description: 'Desc',
      group: 'Group',
      higherIsBetter: true,
      minLevel: 'pow',
      footnote,
    },
    year: 2023,
    value: 100,
    rankNational: 1,
    rankVoivodeship: 1,
    totalNational: 100,
    totalVoivodeship: 10,
    neutral: false,
    fromParent,
    series: [],
  });

  it('returns empty array when no footnotes or fromParent exist', () => {
    const items = [makeIndicatorItem('1'), makeIndicatorItem('2')];
    const footnotes = collectFootnotes(items, sampleUnits);
    expect(footnotes).toEqual([]);
  });

  it('generates footnote for fromParent using unit level and name', () => {
    const items = [makeIndicatorItem('1', undefined, '0201000')];
    const footnotes = collectFootnotes(items, sampleUnits);

    expect(footnotes).toHaveLength(1);
    expect(footnotes[0]).toEqual({
      id: 1,
      text: 'dane dla powiatu bolesławiecki',
    });
  });

  it('collects indicator footnote and fromParent footnote in order of occurrence', () => {
    const items = [
      makeIndicatorItem('1', undefined, '0201000'),
      makeIndicatorItem('2', 'bez firm do 9 pracowników'),
    ];
    const footnotes = collectFootnotes(items, sampleUnits);

    expect(footnotes).toHaveLength(2);
    expect(footnotes[0]).toEqual({ id: 1, text: 'dane dla powiatu bolesławiecki' });
    expect(footnotes[1]).toEqual({ id: 2, text: 'bez firm do 9 pracowników' });
  });

  it('deduplicates identical footnote texts and assigns the same number', () => {
    const items = [
      makeIndicatorItem('1', 'bez firm do 9 pracowników'),
      makeIndicatorItem('2', undefined, '0201000'),
      makeIndicatorItem('3', 'bez firm do 9 pracowników'),
      makeIndicatorItem('4', undefined, '0201000'),
    ];
    const footnotes = collectFootnotes(items, sampleUnits);

    expect(footnotes).toHaveLength(2);
    expect(footnotes[0]).toEqual({ id: 1, text: 'bez firm do 9 pracowników' });
    expect(footnotes[1]).toEqual({ id: 2, text: 'dane dla powiatu bolesławiecki' });
  });
});
