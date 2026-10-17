import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UNIT_COUNTS } from '../../src/core/units/counts';

interface Unit {
  teryt: string;
  bdlId: string | null;
  name: string;
  level: 'woj' | 'pow' | 'gmi';
  parent: string | null;
  bbox: [number, number, number, number];
  centroid: [number, number];
}

describe('UNIT_COUNTS', () => {
  it('matches counts in public/data/units.json', () => {
    const unitsFilePath = resolve(process.cwd(), 'public/data/units.json');
    const rawData = readFileSync(unitsFilePath, 'utf-8');
    const units: Unit[] = JSON.parse(rawData);

    const counts = {
      woj: 0,
      pow: 0,
      gmi: 0,
    };

    for (const unit of units) {
      if (unit.level in counts) {
        counts[unit.level]++;
      }
    }

    expect(counts).toEqual(UNIT_COUNTS);
  });
});
