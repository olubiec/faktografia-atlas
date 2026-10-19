import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { nextPageUrl, toIndicatorValues } from '../../scripts/data/values.mjs';

const rootDir = path.resolve(__dirname, '../../');
const units = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/data/units.json'), 'utf8'));

describe('nextPageUrl', () => {
  it('returns next page url when present', () => {
    const page0 = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p000.json'), 'utf8')
    );
    expect(nextPageUrl(page0)).toBe(
      'https://bdl.stat.gov.pl/api/v1/data/by-variable/1617169?unit-level=5&format=json&lang=pl&page-size=100&page=1'
    );
  });

  it('returns null on the last page or when links.next is missing', () => {
    const page3 = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p003.json'), 'utf8')
    );
    expect(nextPageUrl(page3)).toBeNull();
    expect(nextPageUrl({})).toBeNull();
    expect(nextPageUrl(null)).toBeNull();
  });
});

describe('toIndicatorValues', () => {
  it('maps BDL page results to TERYT keys from units.json via bdlId and counts skipped records', () => {
    const page0 = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p000.json'), 'utf8')
    );

    const pageWithUnknown = {
      ...page0,
      results: [
        ...page0.results,
        { id: '999999999999', name: 'Nieznana jednostka', values: [{ year: '2023', val: 12.3 }] },
      ],
    };

    const res = toIndicatorValues('stopa-bezrobocia', [pageWithUnknown], units, '2026-10-18T12:00:00.000Z');

    expect(res.indicatorId).toBe('stopa-bezrobocia');
    expect(res.fetchedAt).toBe('2026-10-18T12:00:00.000Z');
    expect(res.report.skipped).toBe(1);

    // Powiat bocheński ma bdlId "011212001000" i teryt "1201"
    expect(res.values['1201']).toBeDefined();
    expect(res.values['999999999999']).toBeUndefined();
  });

  it('combines multi-page responses correctly', () => {
    const p0 = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p000.json'), 'utf8'));
    const p1 = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p001.json'), 'utf8'));
    const p2 = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p002.json'), 'utf8'));
    const p3 = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests/fixtures/bdl/recorded/1617169-l5-p003.json'), 'utf8'));

    const res = toIndicatorValues('stopa-bezrobocia', [p0, p1, p2, p3], units);

    expect(Object.keys(res.values).length).toBe(380);
    expect(res.years).toEqual([2023, 2024]);
  });

  it('handles missing year values as null, never 0, with ascending years and matching array lengths', () => {
    const syntheticPage = {
      results: [
        {
          id: '011212001000', // teryt 1201
          name: 'Powiat bocheński',
          values: [
            { year: '2022', val: 10.5 },
            { year: '2024', val: 12.0 },
          ],
        },
        {
          id: '011212006000', // teryt 1206
          name: 'Powiat krakowski',
          values: [
            { year: '2022', val: 0 },
            { year: '2023', val: null },
            { year: '2024', val: 5.5 },
          ],
        },
      ],
    };

    const res = toIndicatorValues('test-indicator', syntheticPage, units);

    expect(res.years).toEqual([2022, 2023, 2024]);
    expect(res.values['1201']).toEqual([10.5, null, 12.0]);
    expect(res.values['1206']).toEqual([0, null, 5.5]);
  });

  it('preserves numerical values without rounding', () => {
    const syntheticPage = {
      results: [
        {
          id: '011212001000',
          name: 'Powiat bocheński',
          values: [{ year: '2024', val: 97.3456789 }],
        },
      ],
    };

    const res = toIndicatorValues({ id: 'ind-1' }, [syntheticPage], units);
    expect(res.values['1201']).toEqual([97.3456789]);
  });
});
