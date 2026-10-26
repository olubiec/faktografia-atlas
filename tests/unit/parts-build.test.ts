import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error - ESM import in ts file
import { toPartsValues } from '../../scripts/data/parts.mjs';

const ROOT_DIR = path.resolve(__dirname, '../../');
const UNITS_PATH = path.join(ROOT_DIR, 'public/data/units.json');
const RECORDED_DIR = path.join(ROOT_DIR, 'tests/fixtures/bdl/recorded');

function loadRecordedPages(bdlVarId: number): any[] {
  const pages: any[] = [];
  for (let i = 0; i <= 999; i++) {
    const pageNum = String(i).padStart(3, '0');
    const file = path.join(RECORDED_DIR, `${bdlVarId}-l6-p${pageNum}.json`);
    if (fs.existsSync(file)) {
      pages.push(JSON.parse(fs.readFileSync(file, 'utf8')));
    } else {
      break;
    }
  }
  return pages;
}

describe('toPartsValues - W1.16', () => {
  const units = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));

  it('extracts city and rural parts for urban-rural municipalities from recorded 72305 (population)', () => {
    const pages72305 = loadRecordedPages(72305);
    expect(pages72305.length).toBeGreaterThan(0);

    const allowedIds = ['population', '72305'];
    const result = toPartsValues({ id: 'population', bdlVarId: 72305 }, pages72305, units, allowedIds);

    expect(result).not.toBeNull();
    expect(result?.indicatorId).toBe('population');
    expect(result?.years).toBeDefined();
    expect(Array.isArray(result?.years)).toBe(true);
    expect(result?.years).toEqual([...(result?.years || [])].sort((a, b) => a - b));

    // No timestamps
    expect((result as any).fetchedAt).toBeUndefined();

    // Check count of mother gminas present in recorded data
    // Count how many mother gminas have parts
    const partsMapKeys = Object.keys(result?.values || {});
    expect(partsMapKeys.length).toBeGreaterThan(0);

    const motherTerytsWithParts = new Set<string>();
    for (const key of partsMapKeys) {
      const motherTeryt = key.slice(0, 6) + '3';
      motherTerytsWithParts.add(motherTeryt);
    }

    for (const motherTeryt of motherTerytsWithParts) {
      const cityTeryt = motherTeryt.slice(0, 6) + '4';
      const ruralTeryt = motherTeryt.slice(0, 6) + '5';

      expect(result?.values[cityTeryt]).toBeDefined();
      expect(result?.values[ruralTeryt]).toBeDefined();
    }
  });

  it('verifies population consistency: city + rural = mother municipality', () => {
    const pages72305 = loadRecordedPages(72305);
    const resultParts = toPartsValues('population', pages72305, units, ['population']);
    expect(resultParts).not.toBeNull();

    // Extract mother municipality values for comparison
    const motherValuesMap = new Map<string, Map<number, number | null>>();
    for (const page of pages72305) {
      for (const rec of page.results || []) {
        if (!rec.id || rec.id.length !== 12) continue;
        const kind = rec.id.slice(11, 12);
        if (kind === '3') {
          const motherTeryt = rec.id.slice(2, 4) + rec.id.slice(7, 12);
          if (!motherValuesMap.has(motherTeryt)) {
            motherValuesMap.set(motherTeryt, new Map());
          }
          const yrMap = motherValuesMap.get(motherTeryt)!;
          for (const v of rec.values || []) {
            if (v && v.year !== undefined && v.year !== null) {
              yrMap.set(Number(v.year), v.val === null ? null : Number(v.val));
            }
          }
        }
      }
    }

    const years = resultParts!.years;
    const parts = resultParts!.values;

    let checkedPairCount = 0;
    for (const motherTeryt of motherValuesMap.keys()) {
      const cityTeryt = motherTeryt.slice(0, 6) + '4';
      const ruralTeryt = motherTeryt.slice(0, 6) + '5';

      if (!parts[cityTeryt] || !parts[ruralTeryt]) continue;

      const motherYrs = motherValuesMap.get(motherTeryt)!;

      years.forEach((yr, idx) => {
        const cityVal = parts[cityTeryt][idx];
        const ruralVal = parts[ruralTeryt][idx];
        const motherVal = motherYrs.get(yr);

        const isBothPresent = cityVal !== null && ruralVal !== null && motherVal !== undefined && motherVal !== null;
        const sumMatches = isBothPresent ? cityVal! + ruralVal! === motherVal! : true;
        expect(sumMatches).toBe(true);
        if (isBothPresent) {
          checkedPairCount++;
        }
      });
    }

    expect(checkedPairCount).toBeGreaterThan(0);
  });

  it('returns null when indicator is not in allowedIds', () => {
    const pages = loadRecordedPages(72305);
    const result = toPartsValues('population', pages, units, ['density', '60559']);
    expect(result).toBeNull();
  });

  it('preserves zeroes as 0 and nulls as null', () => {
    const mockPage = {
      results: [
        {
          id: '011212006114',
          level: 6,
          kind: '4',
          values: [
            { year: 2024, val: 0 },
            { year: 2025, val: null },
          ],
        },
        {
          id: '011212006115',
          level: 6,
          kind: '5',
          values: [
            { year: 2024, val: 100 },
            { year: 2025, val: 200 },
          ],
        },
      ],
    };

    const result = toPartsValues('test-indicator', [mockPage], units, ['test-indicator']);
    expect(result).not.toBeNull();
    expect(result?.years).toEqual([2024, 2025]);
    expect(result?.values['1206114']).toEqual([0, null]);
    expect(result?.values['1206115']).toEqual([100, 200]);
  });

  it('produces plain unindented JSON when serialized', () => {
    const mockPage = {
      results: [
        {
          id: '011212006114',
          level: 6,
          kind: '4',
          values: [{ year: 2024, val: 10 }],
        },
      ],
    };

    const result = toPartsValues('test', [mockPage], units, ['test']);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('\n');
    expect(serialized).not.toContain('  ');
  });
});
