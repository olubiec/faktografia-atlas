import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import topojson from 'topojson-client';
import type { Topology, GeometryObject } from 'topojson-specification';
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

describe('Admin TopoJSON Geometry Build', () => {
  const topoPath = path.resolve('public/geo/admin.topo.json');
  let topo: Topology | null = null;
  let stats: fs.Stats | null = null;

  beforeAll(() => {
    if (fs.existsSync(topoPath)) {
      stats = fs.statSync(topoPath);
      topo = JSON.parse(fs.readFileSync(topoPath, 'utf-8')) as Topology;
    }
  });

  it('file exists and size is <= 3 MB', () => {
    expect(fs.existsSync(topoPath)).toBe(true);
    expect(stats).not.toBeNull();
    const size = stats?.size ?? 0;
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(3 * 1024 * 1024);
  });

  it('is a valid TopoJSON topology containing woj, pow, and gmi layers', () => {
    expect(topo).not.toBeNull();
    if (!topo) return;

    expect(topo.type).toBe('Topology');
    expect(topo.objects).toBeDefined();
    expect(Object.keys(topo.objects)).toEqual(expect.arrayContaining(['woj', 'pow', 'gmi']));
  });

  const layerSpecs = [
    { name: 'woj', count: 16, terytLen: 2 },
    { name: 'pow', count: 380, terytLen: 4 },
    { name: 'gmi', count: 2479, terytLen: 7 }
  ];

  layerSpecs.forEach(({ name, count, terytLen }) => {
    it(`layer ${name} has ${count} objects with correct TERYT length (${terytLen}) and properties`, () => {
      expect(topo).not.toBeNull();
      if (!topo) return;

      const layerObject = topo.objects[name] as GeometryObject;
      expect(layerObject).toBeDefined();

      const featureCollection = topojson.feature(topo, layerObject) as FeatureCollection<Polygon | MultiPolygon>;
      expect(featureCollection.features.length).toBe(count);

      const teryts = new Set<string>();

      featureCollection.features.forEach(feature => {
        const props = feature.properties || {};
        const keys = Object.keys(props);

        // Zostają tylko pola teryt i name
        expect(keys.sort()).toEqual(['name', 'teryt']);

        // TERYT musi być stringiem o odpowiedniej długości z zerami wiodącymi
        expect(typeof props.teryt).toBe('string');
        expect(props.teryt).toHaveLength(terytLen);
        expect(props.teryt).toMatch(new RegExp(`^\\d{${terytLen}}$`));

        // Nazwa powinna być niepustym stringiem
        expect(typeof props.name).toBe('string');
        expect(props.name.trim().length).toBeGreaterThan(0);

        // TERYT unikalny w warstwie
        expect(teryts.has(props.teryt)).toBe(false);
        teryts.add(props.teryt);

        // Brak pustych geometrii
        expect(feature.geometry).not.toBeNull();
        expect(feature.geometry.type).toMatch(/^(Polygon|MultiPolygon)$/);
        expect(feature.geometry.coordinates).toBeDefined();
        expect(feature.geometry.coordinates.length).toBeGreaterThan(0);
      });

      expect(teryts.size).toBe(count);
    });
  });
});
