import { describe, it, expect } from 'vitest';
import sampleFixture from '../fixtures/prng/sample.json' with { type: 'json' };
import unitsData from '../../public/data/units.json' with { type: 'json' };
import {
  STANDALONE_KINDS,
  isStandalone,
  toLocality,
  buildLocalities,
  summarize,
  serialize,
  assertSizeUnder
} from '../../scripts/geo/localities-parse.mjs';

describe('PRNG Localities Parser', () => {
  it('defines STANDALONE_KINDS correctly', () => {
    expect(STANDALONE_KINDS).toEqual([
      'miasto',
      'wieś',
      'osada',
      'kolonia',
      'osada leśna'
    ]);
  });

  describe('isStandalone', () => {
    it('returns true only for kategoriaObiektu "miejscowość" and allowed rodzajObiektu', () => {
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'miasto' } })).toBe(true);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'wieś' } })).toBe(true);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'osada' } })).toBe(true);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'kolonia' } })).toBe(true);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'osada leśna' } })).toBe(true);
    });

    it('rejects non-standalone types (część miasta, część wsi, przysiółek, etc.)', () => {
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'część miasta' } })).toBe(false);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'część wsi' } })).toBe(false);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'przysiółek' } })).toBe(false);
      expect(isStandalone({ properties: { kategoriaObiektu: 'miejscowość', rodzajObiektu: 'sioło' } })).toBe(false);
    });

    it('rejects features where kategoriaObiektu !== "miejscowość"', () => {
      expect(isStandalone({ properties: { kategoriaObiektu: 'uroczysko', rodzajObiektu: 'wieś' } })).toBe(false);
      expect(isStandalone(null)).toBe(false);
      expect(isStandalone({})).toBe(false);
    });
  });

  describe('toLocality', () => {
    it('converts feature with geometry properly', () => {
      const feature = {
        properties: {
          idPRNG: 201,
          nazwaGlowna: 'Zakopane',
          terytGminy: '1217011',
          rodzajObiektu: 'miasto'
        },
        geometry: {
          type: 'MultiPoint',
          coordinates: [[19.9556123, 49.2991812]]
        }
      };

      const locality = toLocality(feature);
      expect(locality).toEqual({
        id: '201',
        name: 'Zakopane',
        gminaTeryt: '1217011',
        lon: 19.9556,
        lat: 49.2992,
        kind: 'miasto'
      });
    });

    it('formats gminaTeryt to 7 digits string with leading zeros', () => {
      const feature = {
        properties: {
          idPRNG: 202,
          nazwaGlowna: 'Test',
          terytGminy: '202021',
          rodzajObiektu: 'wieś'
        },
        geometry: {
          type: 'Point',
          coordinates: [16.5, 50.5]
        }
      };

      const locality = toLocality(feature);
      expect(locality.gminaTeryt).toBe('0202021');
    });

    it('handles missing geometry by setting approx: true and null lon/lat', () => {
      const feature = {
        properties: {
          idPRNG: 203,
          nazwaGlowna: 'Bez Geometrii',
          terytGminy: '1217011',
          rodzajObiektu: 'wieś'
        },
        geometry: null
      };

      const locality = toLocality(feature);
      expect(locality.lon).toBeNull();
      expect(locality.lat).toBeNull();
      expect(locality.approx).toBe(true);
    });
  });

  describe('buildLocalities and sample fixture integration', () => {
    it('processes sample fixture and filters/maps correctly', () => {
      const result = buildLocalities(sampleFixture.features, unitsData);

      // Zakopane (101), Bukowina Tatrzańska (102), Leśniczówka Stara (103), Nowa Osada (104), Kolonia Polna (105), Bez Geometrii (109)
      const ids = result.localities.map((l) => l.id);
      expect(ids).toEqual(['101', '102', '103', '104', '105', '109']);

      // Check Osiedle Struga (id 2, część miasta) is rejected/excluded
      expect(ids.includes('2')).toBe(false);

      // Check duplikaty (101) handling: unique ids
      expect(result.localities.filter((l) => l.id === '101')).toHaveLength(1);

      // Check Zakopane and Bukowina Tatrzańska details
      const zakopane = result.localities.find((l) => l.id === '101');
      expect(zakopane).toBeDefined();
      expect(zakopane?.name).toBe('Zakopane');
      expect(zakopane?.gminaTeryt).toBe('1217011');

      const bukowina = result.localities.find((l) => l.id === '102');
      expect(bukowina).toBeDefined();
      expect(bukowina?.name).toBe('Bukowina Tatrzańska');
      expect(bukowina?.gminaTeryt).toBe('1217032');

      // Check feature without geometry gets approx: true and gmina centroid
      const noGeomLoc = result.localities.find((l) => l.id === '109');
      expect(noGeomLoc).toBeDefined();
      expect(noGeomLoc?.approx).toBe(true);
      const zakopaneGmina = unitsData.find((u) => u.teryt === '1217011');
      expect(noGeomLoc?.lon).toBe(zakopaneGmina?.centroid[0]);
      expect(noGeomLoc?.lat).toBe(zakopaneGmina?.centroid[1]);

      // Check non-existent gminaTeryt ends up in skipped
      const skippedIds = result.skipped.map((f) => String(f.properties.idPRNG));
      expect(skippedIds).toContain('110');
    });

    it('summarize produces accurate counts', () => {
      const result = buildLocalities(sampleFixture.features, unitsData);
      const summary = summarize(result);

      expect(summary.byKind).toEqual({
        miasto: 1,
        wieś: 2,
        osada: 1,
        kolonia: 1,
        'osada leśna': 1
      });
      expect(summary.approx).toBe(1);
      expect(summary.skipped).toBe(1);
    });

    it('serialize produces unindented JSON and checks size limit', () => {
      const result = buildLocalities(sampleFixture.features, unitsData);
      const localitiesToSerialize = result.localities.map(({ kind: _kind, ...rest }) => rest);
      const json = serialize(localitiesToSerialize);

      expect(json).not.toContain('\n');
      expect(json.startsWith('[')).toBe(true);
      expect(() => assertSizeUnder(json, 3 * 1024 * 1024)).not.toThrow();
      expect(() => assertSizeUnder(json, 10)).toThrow(/exceeds limit/);
    });
  });
});
