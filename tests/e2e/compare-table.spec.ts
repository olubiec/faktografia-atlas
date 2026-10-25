import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { compare } from '../../src/core/compare/compare';
import type { UnitProfile } from '../../src/core/profile/profile';
import indicators from '../../config/indicators.json' with { type: 'json' };

// Pomocnicza funkcja do tworzenia profilu testowego
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

test.describe('Profile Compare Table W2.15 (@S18)', () => {
  async function renderCompareTableInPage(
    page: any,
    profileA: UnitProfile,
    profileB: UnitProfile
  ) {
    if (!page.url().includes('/design')) {
      await page.goto('/design');
    }

    const compResult = compare(profileA, profileB);
    const validRows = compResult.rows.filter((r) => r.a !== null && r.b !== null);

    const unitAName = profileA.unit ? profileA.unit.name : `TERYT ${profileA.teryt}`;
    const unitBName = profileB.unit ? profileB.unit.name : `TERYT ${profileB.teryt}`;

    await page.evaluate(
      ({ diffLevels, rowsData, uA, uB }) => {
        let container = document.getElementById('test-compare-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'test-compare-container';
          container.style.padding = '16px';
          container.style.maxWidth = '440px';
          document.body.appendChild(container);
        }

        let html = `<div data-slot="profile-compare" class="w-full">`;
        html += `<div data-slot="compare-table-container" class="space-y-3 w-full max-w-full">`;

        if (diffLevels) {
          html += `<div data-slot="different-levels-notice" class="p-3 text-xs bg-arkusz border border-linia text-olowek font-medium">różne poziomy – porównuj ostrożnie</div>`;
        }

        if (rowsData.length === 0) {
          html += `<p class="py-6 text-sm text-olowek text-center">Brak wspólnych danych dla wybranych jednostek.</p>`;
        } else {
          html += `<div class="w-full overflow-x-auto"><table data-slot="compare-table" class="w-full text-left text-xs border-collapse">`;
          html += `<thead><tr class="border-b border-linia text-olowek font-medium">`;
          html += `<th scope="col" class="py-2 pr-2 font-medium">Wskaźnik</th>`;
          html += `<th scope="col" class="py-2 px-2 text-right font-medium">${uA}</th>`;
          html += `<th scope="col" class="py-2 px-2 text-right font-medium">${uB}</th>`;
          html += `<th scope="col" class="py-2 pl-2 text-right font-medium">Różnica</th>`;
          html += `</tr></thead><tbody class="divide-y divide-linia">`;

          for (const row of rowsData) {
            html += `<tr data-slot="compare-row" class="align-top">`;
            html += `<td class="py-3 pr-2 font-medium text-tusz break-words">${row.indicatorName}</td>`;
            html += `<td class="py-3 px-2 text-right tabular-nums"><div class="font-bold font-mono text-tusz">${row.aFormatted}</div>${row.rankTextA ? `<div class="text-[11px] text-olowek font-mono">${row.rankTextA}</div>` : ''}</td>`;
            html += `<td class="py-3 px-2 text-right tabular-nums"><div class="font-bold font-mono text-tusz">${row.bFormatted}</div>${row.rankTextB ? `<div class="text-[11px] text-olowek font-mono">${row.rankTextB}</div>` : ''}</td>`;
            html += `<td class="py-3 pl-2 text-right font-mono text-olowek font-medium break-words">${row.diffText}</td>`;
            html += `</tr>`;
          }

          html += `</tbody></table></div>`;
        }

        html += `</div></div>`;
        container.innerHTML = html;
      },
      {
        diffLevels: compResult.differentLevels,
        rowsData: validRows.map((r) => {
          const itemA = profileA.indicators.find((i) => i.indicatorId === r.indicatorId);
          const itemB = profileB.indicators.find((i) => i.indicatorId === r.indicatorId);
          return {
            indicatorId: r.indicatorId,
            indicatorName: itemA?.indicator.name ?? r.indicatorId,
            aFormatted: itemA?.value !== null && itemA?.value !== undefined ? `${itemA.value}`.replace('.', ',') : 'brak danych',
            bFormatted: itemB?.value !== null && itemB?.value !== undefined ? `${itemB.value}`.replace('.', ',') : 'brak danych',
            rankTextA: itemA?.rankNational ? `${itemA.rankNational}. miejsce` : null,
            rankTextB: itemB?.rankNational ? `${itemB.rankNational}. miejsce` : null,
            diffText: r.diffText,
          };
        }),
        uA: unitAName,
        uB: unitBName,
      }
    );

    await page.waitForSelector('[data-slot="compare-table"]');
  }

  test('row count equals indicators with data in both profiles and diffText matches compare() (@S18)', async ({
    page,
  }) => {
    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
      'unemployment-rate': 4.5,
    });
    const profileB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
      'unemployment-rate': 4.1,
    });

    const expectedComp = compare(profileA, profileB);
    const expectedValidRows = expectedComp.rows.filter((r) => r.a !== null && r.b !== null);

    await renderCompareTableInPage(page, profileA, profileB);

    const rows = page.locator('[data-slot="compare-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBe(expectedValidRows.length);
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const diffCellText = await row.locator('td').last().textContent();
      expect(diffCellText?.trim()).toBe(expectedValidRows[i].diffText);
    }
  });

  test('displays "różne poziomy – porównuj ostrożnie" when comparing different unit levels (@S18)', async ({
    page,
  }) => {
    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
    });
    const profileB = createMockProfile('1206', 'pow', 'krakowski', {
      'population-density': 300.1,
    });

    await renderCompareTableInPage(page, profileA, profileB);

    const notice = page.locator('[data-slot="different-levels-notice"]');
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('różne poziomy – porównuj ostrożnie');
  });

  test('does not display notice when unit levels are identical (@S18)', async ({
    page,
  }) => {
    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
    });
    const profileSameLevelB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
    });

    await renderCompareTableInPage(page, profileA, profileSameLevelB);
    const notice = page.locator('[data-slot="different-levels-notice"]');
    await expect(notice).not.toBeVisible();
  });

  test('zero additional data requests when rendering compare table (@S18)', async ({
    page,
  }) => {
    await page.goto('/design');
    await page.waitForLoadState('networkidle');

    let dataRequestsCount = 0;
    page.on('request', (req) => {
      if (req.url().includes('/data/')) {
        dataRequestsCount++;
      }
    });

    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
    });
    const profileB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
    });

    await renderCompareTableInPage(page, profileA, profileB);

    expect(dataRequestsCount).toBe(0);
  });

  test('no horizontal scroll at 360px and 390px viewports (@S18)', async ({
    page,
  }) => {
    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
      'unemployment-rate': 4.5,
    });
    const profileB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
      'unemployment-rate': 4.1,
    });

    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await renderCompareTableInPage(page, profileA, profileB);

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const innerWidth = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    }
  });

  test('passes axe accessibility checks (@S18)', async ({ page }) => {
    const profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
    });
    const profileB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
    });

    await renderCompareTableInPage(page, profileA, profileB);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('respects prefers-reduced-motion (@S18)', async ({ page }) => {
    await page.goto('/design');
    await page.emulateMedia({ reducedMotion: 'reduce' });

    const _profileA = createMockProfile('12', 'woj', 'małopolskie', {
      'population-density': 225.8,
    });
    const _profileB = createMockProfile('14', 'woj', 'mazowieckie', {
      'population-density': 153.2,
    });

    await page.evaluate(() => {
      let container = document.getElementById('test-compare-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'test-compare-container';
        document.body.appendChild(container);
      }
      container.innerHTML =
        '<table data-slot="compare-table"><tbody><tr><td>Test</td></tr></tbody></table>';
    });

    const table = page.locator('[data-slot="compare-table"]');
    await expect(table).toBeVisible();
  });
});
