import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { inPolygon, locateUnit, shapesOf, type LonLat, type Topology } from '../../src/core/geo/locate';

// F05: „Użyj mojej lokalizacji” – gmina z punktu w granicach (prawdziwa topologia małopolskiego z public/geo).
const topo = JSON.parse(readFileSync(resolve(process.cwd(), 'tests/fixtures/geo/malopolskie.topo.json'), 'utf8')) as Topology;

/** Gmina o najbliższym „środku” (średnia wierzchołków obrysu) – zła metoda, z którą porównujemy. */
function nearestCentre(point: LonLat): string {
  let best = '';
  let bestD = Infinity;
  for (const s of shapesOf(topo)) {
    const ring = s.polygons[0]![0]!;
    const cx = ring.reduce((a, p) => a + p[0]!, 0) / ring.length;
    const cy = ring.reduce((a, p) => a + p[1]!, 0) / ring.length;
    const d = (cx - point[0]) ** 2 + (cy - point[1]) ** 2;
    if (d < bestD) [best, bestD] = [s.unit.teryt, d];
  }
  return best;
}

describe('@F05 locateUnit – gmina z punktu', () => {
  it('punkt w Krakowie (Rynek Główny) → gmina Kraków (TERYT jako tekst)', () => {
    const unit = locateUnit(topo, [19.937, 50.061]);
    expect(unit).toEqual({ teryt: '1261011', name: 'Kraków' });
    expect(typeof unit?.teryt).toBe('string');
  });

  it('punkt przy zachodniej granicy Krakowa → Kraków, choć najbliższy środek ma Zabierzów', () => {
    const point: LonLat = [19.819, 50.07];
    expect(nearestCentre(point)).toBe('1206162'); // Zabierzów – metoda „najbliższy środek” myli się
    expect(locateUnit(topo, point)?.teryt).toBe('1261011');
  });

  it('punkt przy granicy Babic i Alwerni → Babice (point-in-polygon, nie najbliższy środek)', () => {
    const point: LonLat = [19.5, 50.042];
    expect(nearestCentre(point)).toBe('1203013'); // Alwernia
    expect(locateUnit(topo, point)).toEqual({ teryt: '1203022', name: 'Babice' });
  });

  it('punkt poza granicami (Bałtyk, Berlin) i niepoprawne współrzędne → brak gminy', () => {
    expect(locateUnit(topo, [18.5, 55.2])).toBeNull();
    expect(locateUnit(topo, [13.4, 52.52])).toBeNull();
    expect(locateUnit(topo, [Number.NaN, 50])).toBeNull();
  });

  it('wielokąt z dziurą: punkt w dziurze nie należy do wielokąta', () => {
    const outer = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
    const hole = [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]];
    expect(inPolygon([2, 2], [outer, hole])).toBe(true);
    expect(inPolygon([5, 5], [outer, hole])).toBe(false);
    expect(inPolygon([11, 5], [outer, hole])).toBe(false);
  });

  it('poziom powiatów: Kraków to miasto na prawach powiatu (1261)', () => {
    expect(locateUnit(topo, [19.937, 50.061], 'pow')?.teryt).toBe('1261');
  });
});
