import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { fitProjection } from '@/core/share/projection';
import { mapShapes } from '@/core/share/map-shapes';

function loadMalopolskiePowiaty(): FeatureCollection {
  const filePath = resolve(process.cwd(), 'tests/fixtures/geo/malopolskie.topo.json');
  const raw = readFileSync(filePath, 'utf-8');
  const topoData = JSON.parse(raw);
  return feature(topoData, topoData.objects.pow) as unknown as FeatureCollection;
}

function parseCoordinatesFromD(d: string): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  // Match pairs like M10.5,20.3 or L10,20
  const matches = d.matchAll(/([ML])\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/gi);
  for (const m of matches) {
    const x = parseFloat(m[2]);
    const y = parseFloat(m[3]);
    coords.push([x, y]);
  }
  return coords;
}

describe('W1.13 fitProjection', () => {
  it('maps geographic bbox corners into target box with padding', () => {
    // Equator lon/lat square where Mercator dx == dy
    const bbox: [number, number, number, number] = [-10, -5, 10, 5];
    const box = { width: 100, height: 100, x: 0, y: 0 };
    const project = fitProjection(bbox, box, 10);

    const [xMin, yMin] = project([-10, 5]); // Top-Left
    const [xMax, yMax] = project([10, -5]); // Bottom-Right

    expect(xMin).toBeGreaterThanOrEqual(10);
    expect(yMin).toBeGreaterThanOrEqual(10);
    expect(xMax).toBeLessThanOrEqual(90);
    expect(yMax).toBeLessThanOrEqual(90);
  });

  it('centers wide bbox vertically preserving aspect ratio', () => {
    // Wide geographic bbox: lon 0 to 20, lat 0 to 5
    const bbox: [number, number, number, number] = [0, 0, 20, 5];
    const box = { width: 500, height: 500 };
    const project = fitProjection(bbox, box, 0);

    const [, topY] = project([0, 5]);
    const [, bottomY] = project([0, 0]);

    // Top and bottom Y should be centered around box height / 2 = 250
    const centerY = (topY + bottomY) / 2;
    expect(centerY).toBeCloseTo(250, 1);
    expect(topY).toBeGreaterThan(0);
    expect(bottomY).toBeLessThan(500);
  });
});

describe('W1.13 mapShapes', () => {
  it('processes 22 powiaty from Małopolskie topojson fixture', () => {
    const powCollection = loadMalopolskiePowiaty();
    expect(powCollection.features.length).toBe(22);

    const result = mapShapes(powCollection, {
      box: { width: 500, height: 500, x: 0, y: 0 },
      padding: 10,
      classOf: (teryt) => (teryt === '1201' ? 3 : 'noData'),
      selected: '1201',
    });

    // 1. Number of shapes equals number of units
    expect(result.shapes.length).toBe(22);

    // 2. Selected flag is true ONLY for selected unit
    const selectedShape = result.shapes.find((s) => s.teryt === '1201');
    expect(selectedShape).toBeDefined();
    expect(selectedShape?.selected).toBe(true);
    expect(selectedShape?.fill).toBe(3);

    const nonSelectedShapes = result.shapes.filter((s) => s.teryt !== '1201');
    expect(nonSelectedShapes.every((s) => s.selected === false)).toBe(true);
    expect(nonSelectedShapes.every((s) => s.fill === 'noData')).toBe(true);

    // 3. No NaN in d or outline
    for (const shape of result.shapes) {
      expect(shape.d).not.toContain('NaN');
      expect(shape.d.length).toBeGreaterThan(0);
    }
    expect(result.outline).not.toContain('NaN');
    expect(result.outline.length).toBeGreaterThan(0);

    // 4. All projected points lie within box (with padding: x,y in [10, 490])
    for (const shape of result.shapes) {
      const coords = parseCoordinatesFromD(shape.d);
      for (const [x, y] of coords) {
        expect(x).toBeGreaterThanOrEqual(10 - 0.2);
        expect(x).toBeLessThanOrEqual(490 + 0.2);
        expect(y).toBeGreaterThanOrEqual(10 - 0.2);
        expect(y).toBeLessThanOrEqual(490 + 0.2);
      }
    }

    // 5. Total path length for 22 powiaty < 200 kB (200,000 bytes)
    const totalPathLength = result.shapes.reduce((sum, s) => sum + s.d.length, 0);
    expect(totalPathLength).toBeLessThan(200000);

    // 6. Wide bbox -> drawing centered vertically
    let minY = Infinity;
    let maxY = -Infinity;
    for (const shape of result.shapes) {
      const coords = parseCoordinatesFromD(shape.d);
      for (const [, y] of coords) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const centerY = (minY + maxY) / 2;
    // Box height is 500, center should be ~250
    expect(centerY).toBeCloseTo(250, 1);
  });

  it('handles object classification map and array selected options', () => {
    const powCollection = loadMalopolskiePowiaty();
    const classMap: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> = {
      '1201': 0,
      '1202': 1,
      '1203': 2,
      '1204': 3,
      '1205': 4,
    };

    const result = mapShapes(powCollection, {
      box: { width: 300, height: 300 },
      classOf: classMap,
      selected: ['1201', '1202'],
    });

    expect(result.shapes.find((s) => s.teryt === '1201')?.fill).toBe(0);
    expect(result.shapes.find((s) => s.teryt === '1201')?.selected).toBe(true);

    expect(result.shapes.find((s) => s.teryt === '1202')?.fill).toBe(1);
    expect(result.shapes.find((s) => s.teryt === '1202')?.selected).toBe(true);

    expect(result.shapes.find((s) => s.teryt === '1203')?.fill).toBe(2);
    expect(result.shapes.find((s) => s.teryt === '1203')?.selected).toBe(false);

    // Existing unit not in classMap falls back to 'noData'
    const unmappedShape = result.shapes.find((s) => s.teryt === '1206');
    expect(unmappedShape).toBeDefined();
    expect(unmappedShape?.fill).toBe('noData');
  });
});
