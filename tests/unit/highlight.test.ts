import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { pickHighlight } from '../../src/core/profile/highlight';
import { ProfileBody } from '../../src/view/profile/ProfileSheet';
import { AnnotationProvider } from '../../src/view/annotation/AnnotationProvider';
import type { ProfileIndicatorItem, UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';

describe('CC7.4c Profile Ranking Highlight Tests', () => {
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
    rankVoivodeship: number | null,
    rankNational: number | null,
    neutral = false
  ): ProfileIndicatorItem => ({
    indicatorId: id,
    indicator: {
      id,
      bdlVarId: 100,
      name,
      unit: 'zł',
      description: 'Opis',
      group: 'Gospodarka',
      higherIsBetter: neutral ? null : true,
      minLevel: 'gmi',
    },
    year: 2023,
    value: 5000,
    rankNational,
    rankVoivodeship,
    totalNational: 380,
    totalVoivodeship: 30,
    neutral,
    series: [],
  });

  describe('pickHighlight logic', () => {
    it('returns null for empty indicator list', () => {
      expect(pickHighlight([])).toBeNull();
    });

    it('returns null when no indicators have rankVoivodeship', () => {
      const items = [
        makeItem('1', 'Wskaźnik 1', null, null),
        makeItem('2', 'Wskaźnik 2', null, 5),
      ];
      expect(pickHighlight(items)).toBeNull();
    });

    it('ignores neutral indicators even if they have rankVoivodeship', () => {
      const items = [
        makeItem('1', 'Neutralny', 1, 1, true),
        makeItem('2', 'Zwykły', 3, 10, false),
      ];
      expect(pickHighlight(items)).toBe('2');
    });

    it('returns null if all ranked indicators are neutral', () => {
      const items = [
        makeItem('1', 'Neutralny 1', 1, 1, true),
        makeItem('2', 'Neutralny 2', 2, 2, true),
      ];
      expect(pickHighlight(items)).toBeNull();
    });

    it('selects indicator with the best (smallest) rankVoivodeship', () => {
      const items = [
        makeItem('1', 'Wskaźnik 1', 5, 10),
        makeItem('2', 'Wskaźnik 2', 1, 50),
        makeItem('3', 'Wskaźnik 3', 3, 2),
      ];
      expect(pickHighlight(items)).toBe('2');
    });

    it('resolves rankVoivodeship tie by smaller rankNational', () => {
      const items = [
        makeItem('1', 'Wskaźnik 1', 2, 15),
        makeItem('2', 'Wskaźnik 2', 2, 5),
        makeItem('3', 'Wskaźnik 3', 2, 20),
      ];
      expect(pickHighlight(items)).toBe('2');
    });

    it('resolves full tie (rankVoivodeship and rankNational) by original array order', () => {
      const items = [
        makeItem('1', 'Wskaźnik 1', 2, 5),
        makeItem('2', 'Wskaźnik 2', 2, 5),
        makeItem('3', 'Wskaźnik 3', 2, 5),
      ];
      expect(pickHighlight(items)).toBe('1');
    });
  });

  describe('Profile DOM rendering with highlight', () => {
    it('renders exactly one highlight/annotation in profile when valid ranked indicator exists', () => {
      const items = [
        makeItem('1', 'Wskaźnik 1', 5, 10),
        makeItem('2', 'Wskaźnik 2', 1, 5),
        makeItem('3', 'Wskaźnik 3', 3, 15),
      ];

      const profile: UnitProfile = {
        teryt: '0201000',
        unit: sampleUnits[0],
        indicators: items,
      };

      const html = renderToString(
        React.createElement(
          AnnotationProvider,
          null,
          React.createElement(ProfileBody, { profile, units: sampleUnits })
        )
      );

      expect(html).toContain('data-highlight="true"');
      const count = (html.match(/data-highlight="true"/g) || []).length;
      expect(count).toBe(1);
    });

    it('renders no highlights in profile when no ranked indicators exist', () => {
      const items = [
        makeItem('1', 'Neutralny', 1, 1, true),
        makeItem('2', 'Brak rankingu', null, null),
      ];

      const profile: UnitProfile = {
        teryt: '0201000',
        unit: sampleUnits[0],
        indicators: items,
      };

      const html = renderToString(
        React.createElement(
          AnnotationProvider,
          null,
          React.createElement(ProfileBody, { profile, units: sampleUnits })
        )
      );

      expect(html).not.toContain('data-highlight="true"');
    });
  });
});
