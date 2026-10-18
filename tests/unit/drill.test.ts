import { describe, it, expect, beforeEach } from 'vitest';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import type { Unit, UnitIndex } from '../../src/core/units/types';
import {
  getDrillState,
  getParentTeryt,
  getInitialSelectedFromUrl,
} from '../../src/core/map/drill';

describe('Drill Logic (CC4.2)', () => {
  let index: UnitIndex;

  beforeEach(() => {
    index = buildIndex(unitsData as Unit[]);
  });

  describe('getDrillState', () => {
    it('returns country level state when selected is null', () => {
      const state = getDrillState(null, index);

      expect(state.selected).toBeNull();
      expect(state.parent).toBeNull();
      expect(state.layerIds).toEqual(['woj-layer', 'country-layer']);
      expect(state.activeWojTeryt).toBeNull();
      expect(state.activePowTeryt).toBeNull();
      expect(state.bbox).toBeNull();
      expect(state.unitName).toBeNull();
    });

    it('returns country level state when selected TERYT is unknown', () => {
      const state = getDrillState('9999999', index);

      expect(state.selected).toBeNull();
      expect(state.parent).toBeNull();
      expect(state.layerIds).toEqual(['woj-layer', 'country-layer']);
    });

    it('returns voivodeship drill state when a 2-digit TERYT is selected', () => {
      const state = getDrillState('02', index); // dolnośląskie

      expect(state.selected).toBe('02');
      expect(state.parent).toBeNull();
      expect(state.layerIds).toEqual(['woj-layer', 'pow-layer', 'country-layer']);
      expect(state.activeWojTeryt).toBe('02');
      expect(state.activePowTeryt).toBeNull();
      expect(state.bbox).toBeDefined();
      expect(state.unitName).toBe('dolnośląskie');
    });

    it('returns powiat drill state when a 4-digit TERYT is selected', () => {
      const state = getDrillState('0201', index); // powiat bolesławiecki

      expect(state.selected).toBe('0201');
      expect(state.parent).toBe('02');
      expect(state.layerIds).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);
      expect(state.activeWojTeryt).toBe('02');
      expect(state.activePowTeryt).toBe('0201');
      expect(state.unitName).toBe('powiat bolesławiecki');
    });

    it('returns gmina drill state when a 7-digit TERYT is selected', () => {
      const state = getDrillState('0201011', index); // Bolesławiec

      expect(state.selected).toBe('0201011');
      expect(state.parent).toBe('0201');
      expect(state.layerIds).toEqual(['woj-layer', 'pow-layer', 'gmi-layer', 'country-layer']);
      expect(state.activeWojTeryt).toBe('02');
      expect(state.activePowTeryt).toBe('0201');
      expect(state.unitName).toBe('Bolesławiec');
    });
  });

  describe('getParentTeryt', () => {
    it('returns null for country level or voivodeship', () => {
      expect(getParentTeryt(null, index)).toBeNull();
      expect(getParentTeryt('02', index)).toBeNull();
    });

    it('returns 2-digit woj TERYT for powiat', () => {
      expect(getParentTeryt('0201', index)).toBe('02');
    });

    it('returns 4-digit pow TERYT for gmina', () => {
      expect(getParentTeryt('0201011', index)).toBe('0201');
    });

    it('returns null for invalid TERYT', () => {
      expect(getParentTeryt('invalid', index)).toBeNull();
    });
  });

  describe('getInitialSelectedFromUrl', () => {
    it('extracts valid TERYT from ?u= query parameter', () => {
      expect(getInitialSelectedFromUrl('?u=02&e2e=1', index)).toBe('02');
      expect(getInitialSelectedFromUrl('?e2e=1&u=0201', index)).toBe('0201');
      expect(getInitialSelectedFromUrl('?u=0201011', index)).toBe('0201011');
    });

    it('returns null when ?u= parameter is absent or empty', () => {
      expect(getInitialSelectedFromUrl('', index)).toBeNull();
      expect(getInitialSelectedFromUrl('?e2e=1', index)).toBeNull();
      expect(getInitialSelectedFromUrl('?u=', index)).toBeNull();
    });

    it('returns null when ?u= parameter contains invalid TERYT', () => {
      expect(getInitialSelectedFromUrl('?u=invalid', index)).toBeNull();
      expect(getInitialSelectedFromUrl('?u=9999999', index)).toBeNull();
    });
  });
});
