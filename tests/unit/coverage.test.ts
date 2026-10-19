import { describe, expect, it } from 'vitest';
import { countCoverage } from '../../scripts/data/coverage.mjs';

describe('countCoverage (CC6.3d)', () => {
  const sampleUnits = [
    { teryt: '011216917011', bdlId: '011216917011', name: 'Zakopane', level: 'gmi' },
    { teryt: '011216917000', bdlId: '011216917000', name: 'powiat tatrzański', level: 'pow' },
    { teryt: '011212006113', bdlId: '011212006113', name: 'Skawina', level: 'gmi' },
  ];

  it('counts records whose id is in units for given level and year', () => {
    const records = [
      { id: '011216917011', name: 'Zakopane', values: [{ year: '2025', val: 100 }] },
      { id: '011212006113', name: 'Skawina', values: [{ year: '2025', val: 200 }] },
      { id: '011216917000', name: 'powiat tatrzański', values: [{ year: '2025', val: 500 }] },
    ];

    const gmiCount = countCoverage(records, sampleUnits, 'gmi', '2025');
    const powCount = countCoverage(records, sampleUnits, 'pow', '2025');

    expect(gmiCount).toBe(2);
    expect(powCount).toBe(1);
  });

  it('ignores sub-gmina parts (city/rural parts of urban-rural gmina) not in units.json', () => {
    // Skawina (gmina) = 011212006113 (in units)
    // Skawina - miasto = 011212006114 (NOT in units)
    // Skawina - obszar wiejski = 011212006115 (NOT in units)
    const records = [
      { id: '011212006113', name: 'Skawina', values: [{ year: '2025', val: 10 }] },
      { id: '011212006114', name: 'Skawina - miasto', values: [{ year: '2025', val: 6 }] },
      { id: '011212006115', name: 'Skawina - obszar wiejski', values: [{ year: '2025', val: 4 }] },
    ];

    const count = countCoverage(records, sampleUnits, 'gmi', '2025');
    expect(count).toBe(1);
  });

  it('does not cap result and count is strictly less than raw records when raw records contain excess parts', () => {
    const records = [
      { id: '011212006113', name: 'Skawina', values: [{ year: '2025', val: 10 }] },
      { id: '011212006114', name: 'Skawina - miasto', values: [{ year: '2025', val: 6 }] },
      { id: '011212006115', name: 'Skawina - obszar wiejski', values: [{ year: '2025', val: 4 }] },
      { id: '999999999999', name: 'Unknown unit', values: [{ year: '2025', val: 100 }] },
    ];

    const count = countCoverage(records, sampleUnits, 'gmi', '2025');
    expect(count).toBe(1);
    expect(count).toBeLessThan(records.length);
  });

  it('ignores records without value in specified year or with null/undefined val', () => {
    const records = [
      { id: '011216917011', name: 'Zakopane', values: [{ year: '2025', val: null }] },
      { id: '011212006113', name: 'Skawina', values: [{ year: '2024', val: 100 }] },
    ];

    const count2025 = countCoverage(records, sampleUnits, 'gmi', '2025');
    expect(count2025).toBe(0);
  });
});
