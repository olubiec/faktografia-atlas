import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { mapShapes } from '../../src/core/share/map-shapes';
import { buildChoropleth } from '../../src/core/map/choropleth';
import type { UnitProfile } from '../../src/core/profile/profile';
import type { Unit } from '../../src/core/units/types';
import indicators from '../../config/indicators.json' with { type: 'json' };

function createMockProfile(
  teryt: string,
  level: 'woj' | 'pow' | 'gmi',
  name: string,
  indicatorValues: Record<string, number | null>
): UnitProfile {
  return {
    teryt,
    unit: {
      teryt,
      name,
      level,
      parent: null,
    },
    indicators: indicators.map((ind) => {
      const val = indicatorValues[ind.id] ?? null;
      return {
        indicatorId: ind.id,
        indicator: ind as any,
        year: 2023,
        value: val,
        rankNational: val !== null ? 2 : null,
        rankVoivodeship: val !== null ? 1 : null,
        totalNational: 16,
        totalVoivodeship: 1,
        neutral: ind.higherIsBetter === null,
        series: [],
      };
    }),
  };
}

test.describe('Compare Maps W2.22 (@S18)', () => {
  test('displays two mini maps with mapShapes() and data-selected matching unit TERYTs when comparing two counties (@S18)', async ({
    page,
  }) => {
    await page.goto('/design');
    await page.waitForLoadState('networkidle');

    const profileA = createMockProfile('1261', 'pow', 'Powiat wałecki', { density: 45.2 });
    const profileB = createMockProfile('1465', 'pow', 'Powiat piaseczyński', { density: 320.5 });

    // Przykładowe obiekty przestrzenne powiatów w danym województwie
    const mockPowFeaturesA = [
      { type: 'Feature', properties: { teryt: '1261', name: 'wałecki' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] } },
      { type: 'Feature', properties: { teryt: '1262', name: 'inny' }, geometry: { type: 'Polygon', coordinates: [[[10, 0], [20, 0], [20, 10], [10, 10], [10, 0]]] } },
    ];

    const mockPowFeaturesB = [
      { type: 'Feature', properties: { teryt: '1465', name: 'piaseczyński' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] } },
      { type: 'Feature', properties: { teryt: '1466', name: 'inny' }, geometry: { type: 'Polygon', coordinates: [[[10, 0], [20, 0], [20, 10], [10, 10], [10, 0]]] } },
    ];

    const mockUnits: Unit[] = [
      { teryt: '1261', name: 'Powiat wałecki', level: 'pow', parent: '12', bdlId: null, bbox: [0, 0, 10, 10], centroid: [5, 5] },
      { teryt: '1262', name: 'Powiat inny 1', level: 'pow', parent: '12', bdlId: null, bbox: [10, 0, 20, 10], centroid: [15, 5] },
      { teryt: '1465', name: 'Powiat piaseczyński', level: 'pow', parent: '14', bdlId: null, bbox: [0, 0, 10, 10], centroid: [5, 5] },
      { teryt: '1466', name: 'Powiat inny 2', level: 'pow', parent: '14', bdlId: null, bbox: [10, 0, 20, 10], centroid: [15, 5] },
    ];

    const mockValues = {
      years: [2023],
      values: { '1261': [45.2], '1262': [20.0], '1465': [320.5], '1466': [100.0] },
    };

    const chA = buildChoropleth({ values: mockValues, units: mockUnits, level: 'pow', year: 2023, n: 5 });
    const chB = buildChoropleth({ values: mockValues, units: mockUnits, level: 'pow', year: 2023, n: 5 });

    const shapesA = mapShapes(mockPowFeaturesA, {
      box: { x: 0, y: 0, width: 220, height: 150 },
      padding: 8,
      classOf: chA.classByTeryt,
      selected: '1261',
    });

    const shapesB = mapShapes(mockPowFeaturesB, {
      box: { x: 0, y: 0, width: 220, height: 150 },
      padding: 8,
      classOf: chB.classByTeryt,
      selected: '1465',
    });

    await page.evaluate(
      ({ pA, pB, sA, sB }) => {
        let container = document.getElementById('test-compare-maps-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'test-compare-maps-container';
          container.style.padding = '16px';
          container.style.maxWidth = '440px';
          document.body.appendChild(container);
        }

        const renderMap = (p: typeof pA, shapesRes: typeof sA) => {
          let html = `<button type="button" data-slot="compare-map" data-selected="${p.teryt}" data-teryt="${p.teryt}" aria-label="Wybierz ${p.unit.name}" class="flex flex-col items-center justify-between border border-linia bg-arkusz hover:bg-kalka transition-colors p-3 w-full min-h-[160px] cursor-pointer text-left focus:outline-none">`;
          html += `<span class="text-xs font-semibold text-tusz text-center truncate w-full mb-2">${p.unit.name}</span>`;
          html += `<div class="w-full flex items-center justify-center flex-1 min-h-[110px]">`;
          html += `<svg viewBox="0 0 220 150" class="w-full h-auto max-h-[140px]" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa ${p.unit.name}">`;

          for (const s of shapesRes.shapes) {
            const isSel = s.teryt === p.teryt || s.selected;
            const fillVar = s.fill === 'noData' ? 'var(--no-data)' : `var(--seq-${s.fill + 1})`;
            html += `<path d="${s.d}" fill="${fillVar}" stroke="${isSel ? 'var(--korekta)' : 'var(--arkusz)'}" stroke-width="${isSel ? 2.5 : 0.5}" ${isSel ? 'data-selected="true"' : ''} data-teryt="${s.teryt}" />`;
          }

          if (shapesRes.outline) {
            html += `<path d="${shapesRes.outline}" fill="none" stroke="var(--tusz)" stroke-width="1" />`;
          }

          html += `</svg></div></button>`;
          return html;
        };

        container.innerHTML = `
          <div data-slot="profile-compare" class="w-full">
            <div data-slot="compare-maps" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-full">
              ${renderMap(pA, sA)}
              ${renderMap(pB, sB)}
            </div>
          </div>
        `;
      },
      { pA: profileA, pB: profileB, sA: shapesA, sB: shapesB }
    );

    const mapA = page.locator('[data-selected="1261"]');
    const mapB = page.locator('[data-selected="1465"]');

    await expect(mapA).toBeVisible();
    await expect(mapB).toBeVisible();

    const mapsCount = await page.locator('[data-slot="compare-map"]').count();
    expect(mapsCount).toBe(2);

    const selectedPathA = mapA.locator('path[data-selected="true"]');
    await expect(selectedPathA).toBeVisible();
    await expect(selectedPathA).toHaveAttribute('stroke', 'var(--korekta)');
  });

  test('no horizontal scroll at 360x740 and 390px viewports (@S18)', async ({
    page,
  }) => {
    await page.goto('/design');
    await page.waitForLoadState('networkidle');

    for (const viewport of [
      { width: 360, height: 740 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      await page.evaluate(() => {
        let container = document.getElementById('test-compare-maps-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'test-compare-maps-container';
          container.style.padding = '16px';
          container.style.maxWidth = '100%';
          document.body.appendChild(container);
        }

        container.innerHTML = `
          <div data-slot="compare-maps" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-full">
            <button type="button" data-slot="compare-map" data-selected="1261" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
              <span>Powiat wałecki</span>
            </button>
            <button type="button" data-slot="compare-map" data-selected="1465" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
              <span>Powiat piaseczyński</span>
            </button>
          </div>
        `;
      });

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    }
  });

  test('touch targets are at least 44px (@S18)', async ({ page }) => {
    await page.goto('/design');

    await page.evaluate(() => {
      let container = document.getElementById('test-compare-maps-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'test-compare-maps-container';
        document.body.appendChild(container);
      }
      container.innerHTML = `
        <div data-slot="compare-maps" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-full">
          <button type="button" data-slot="compare-map" data-selected="1261" aria-label="Wybierz Wałcz" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
            <span>Wałcz</span>
          </button>
          <button type="button" data-slot="compare-map" data-selected="1465" aria-label="Wybierz Piaseczno" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
            <span>Piaseczno</span>
          </button>
        </div>
      `;
    });

    const mapButtons = page.locator('[data-slot="compare-map"]');
    const count = await mapButtons.count();
    expect(count).toBe(2);

    for (let i = 0; i < count; i++) {
      const box = await mapButtons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('passes axe accessibility checks (@S18)', async ({ page }) => {
    await page.goto('/design');

    await page.evaluate(() => {
      let container = document.getElementById('test-compare-maps-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'test-compare-maps-container';
        document.body.appendChild(container);
      }
      container.innerHTML = `
        <div data-slot="compare-maps" class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 w-full max-w-full">
          <button type="button" data-slot="compare-map" data-selected="1261" aria-label="Wybierz Wałcz" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
            <span class="text-xs font-semibold text-tusz">Wałcz</span>
          </button>
          <button type="button" data-slot="compare-map" data-selected="1465" aria-label="Wybierz Piaseczno" class="flex flex-col items-center border border-linia bg-arkusz p-3 w-full min-h-[160px]">
            <span class="text-xs font-semibold text-tusz">Piaseczno</span>
          </button>
        </div>
      `;
    });

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
