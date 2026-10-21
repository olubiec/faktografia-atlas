import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { formatParentFootnoteText } from '../../src/core/profile/footnotes';
import { ProfileIndicatorRow } from '../../src/view/profile/ProfileIndicatorRow';
import type { ProfileIndicatorItem } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('CC13.5b Footnotes Formatting Unit Tests', () => {
  const sampleUnits: Unit[] = [
    {
      teryt: '3003',
      bdlId: '101',
      name: 'powiat chodzieski',
      level: 'pow',
      parent: '30',
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
    {
      teryt: '3003011',
      bdlId: '102',
      name: 'gmina Chodzież',
      level: 'gmi',
      parent: '3003',
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
    {
      teryt: '3003021',
      bdlId: '103',
      name: 'miasto Margonin',
      level: 'gmi',
      parent: '3003',
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
    {
      teryt: '30',
      bdlId: '100',
      name: 'województwo wielkopolskie',
      level: 'woj',
      parent: null,
      bbox: [0, 0, 0, 0],
      centroid: [0, 0],
    },
    {
      teryt: '0201',
      bdlId: '1',
      name: 'bolesławiecki',
      level: 'pow',
      parent: '02',
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

  describe('formatParentFootnoteText', () => {
    it('formats unit names starting with "powiat " as "dane dla: <nazwa>"', () => {
      const text = formatParentFootnoteText('3003', sampleUnits);
      expect(text).toBe('dane dla: powiat chodzieski');
    });

    it('formats unit names starting with "gmina " as "dane dla: <nazwa>"', () => {
      const text = formatParentFootnoteText('3003011', sampleUnits);
      expect(text).toBe('dane dla: gmina Chodzież');
    });

    it('formats unit names starting with "miasto " as "dane dla: <nazwa>"', () => {
      const text = formatParentFootnoteText('3003021', sampleUnits);
      expect(text).toBe('dane dla: miasto Margonin');
    });

    it('formats unit names starting with "województwo " as "dane dla: <nazwa>"', () => {
      const text = formatParentFootnoteText('30', sampleUnits);
      expect(text).toBe('dane dla: województwo wielkopolskie');
    });

    it('retains "dane dla <poziom> <nazwa>" for unit names without level word prefix', () => {
      const text = formatParentFootnoteText('0201', sampleUnits);
      expect(text).toBe('dane dla powiatu bolesławiecki');
    });
  });

  describe('ProfileIndicatorRow footnote separator rendering', () => {
    it('renders comma separator between multiple footnote links in superscript', () => {
      const item = makeItem('1', 'Ludność', 'dane szacunkowe', '3003');
      const footnotes = [
        { id: 1, text: 'dane dla: powiat chodzieski' },
        { id: 3, text: 'dane szacunkowe' },
      ];

      const html = renderToString(
        React.createElement(ProfileIndicatorRow, {
          item,
          units: sampleUnits,
          footnotes,
        })
      );

      // DOM: dwa linki z numerami i separator "," między nimi w indeksie górnym
      expect(html).toContain('<sup');
      expect(html).toContain(
        '<a href="#footnote-1" title="dane dla: powiat chodzieski" class="text-olowek hover:text-tusz underline focus:outline-none focus:ring-1 focus:ring-tusz">1</a>' +
          ',' +
          '<a href="#footnote-3" title="dane szacunkowe" class="text-olowek hover:text-tusz underline focus:outline-none focus:ring-1 focus:ring-tusz">3</a>'
      );
    });

    it('renders single footnote without comma separator', () => {
      const item = makeItem('1', 'Ludność', undefined, '3003');
      const footnotes = [{ id: 1, text: 'dane dla: powiat chodzieski' }];

      const html = renderToString(
        React.createElement(ProfileIndicatorRow, {
          item,
          units: sampleUnits,
          footnotes,
        })
      );

      expect(html).toContain('<sup');
      expect(html).toContain(
        '<a href="#footnote-1" title="dane dla: powiat chodzieski" class="text-olowek hover:text-tusz underline focus:outline-none focus:ring-1 focus:ring-tusz">1</a>'
      );
      expect(html).not.toContain(',');
    });
  });
});
