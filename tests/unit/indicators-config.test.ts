import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const INDICATORS_CONFIG_PATH = path.resolve('config/indicators.json');

const indicatorSchema = z.object({
  id: z.string().min(1),
  bdlVarId: z.number().int().positive(),
  name: z.string().min(1),
  unit: z.string().min(1),
  description: z.string().min(1),
  group: z.string().min(1),
  higherIsBetter: z.boolean().nullable(),
  minLevel: z.enum(['woj', 'pow', 'gmi']),
  footnote: z.string().optional(),
});

const indicatorsListSchema = z.array(indicatorSchema);

describe('config/indicators.json (CC6.3b)', () => {
  it('plik config/indicators.json istnieje i zawiera poprawny JSON', () => {
    expect(fs.existsSync(INDICATORS_CONFIG_PATH)).toBe(true);
    const content = fs.readFileSync(INDICATORS_CONFIG_PATH, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('zawiera dokładnie 20 wskaźników zgodnych ze schematem Indicator Zod', () => {
    const raw = JSON.parse(fs.readFileSync(INDICATORS_CONFIG_PATH, 'utf8'));
    const parsed = indicatorsListSchema.parse(raw);

    expect(parsed).toHaveLength(20);
  });

  it('wszystkie id są unikalne i bdlVarId są liczbami', () => {
    const raw = JSON.parse(fs.readFileSync(INDICATORS_CONFIG_PATH, 'utf8'));
    const parsed = indicatorsListSchema.parse(raw);

    const ids = parsed.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);

    for (const item of parsed) {
      expect(typeof item.bdlVarId).toBe('number');
      expect(item.bdlVarId).toBeGreaterThan(0);
    }
  });

  it('zawiera oczekiwane identyfikatory 20 wskaźników', () => {
    const raw = JSON.parse(fs.readFileSync(INDICATORS_CONFIG_PATH, 'utf8'));
    const parsed = indicatorsListSchema.parse(raw);
    const ids = new Set(parsed.map((i) => i.id));

    const expectedIds = [
      'population',
      'density',
      'natural-increase',
      'migration-balance',
      'share-65plus',
      'median-age',
      'unemployment-rate',
      'unemployed-share-working-age',
      'avg-wage',
      'income-per-capita',
      'spending-per-capita',
      'regon-per-10k',
      'dwellings-per-1000',
      'dwelling-area-per-person',
      'forest-cover',
      'sewerage-share',
      'preschool-3-6',
      'library-readers-per-1000',
      'tourist-nights-per-1000',
      'cars-per-1000',
    ];

    for (const expectedId of expectedIds) {
      expect(ids.has(expectedId)).toBe(true);
    }
  });
});
