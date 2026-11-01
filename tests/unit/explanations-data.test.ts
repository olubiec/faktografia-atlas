import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ExplanationSchema, ExplanationsFileSchema } from '../../src/core/explain/explanations';

describe('Explanations Data Integrity (W15-M07)', () => {
  const explanationsPath = path.resolve(process.cwd(), 'public/data/explanations.json');
  const indicatorsPath = path.resolve(process.cwd(), 'config/indicators.json');

  it('explanations.json exists and conforms to ExplanationsFileSchema', () => {
    expect(fs.existsSync(explanationsPath)).toBe(true);
    const raw = fs.readFileSync(explanationsPath, 'utf8');
    const json = JSON.parse(raw);
    const parsed = ExplanationsFileSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it('contains explanations for all 20 indicators in config/indicators.json with valid lengths', () => {
    const raw = fs.readFileSync(explanationsPath, 'utf8');
    const json = JSON.parse(raw);
    const indicatorsRaw = fs.readFileSync(indicatorsPath, 'utf8');
    const indicators: Array<{ id: string }> = JSON.parse(indicatorsRaw);

    expect(indicators.length).toBe(20);
    expect(json.items.length).toBe(20);

    const itemsMap = new Map<string, any>(json.items.map((it: any) => [it.indicatorId, it]));

    for (const ind of indicators) {
      const item = itemsMap.get(ind.id);
      expect(item, `Brak wyjaśnienia dla wskaźnika ${ind.id}`).toBeDefined();

      const validation = ExplanationSchema.safeParse(item);
      expect(validation.success, `Błąd walidacji wskaźnika ${ind.id}: ${JSON.stringify(validation.error?.issues)}`).toBe(true);

      // Limity długości tekstu
      expect(item.short.length).toBeLessThanOrEqual(160);
      expect(item.howToRead.length).toBeLessThanOrEqual(240);
      expect(item.definitionUrl.startsWith('https://')).toBe(true);
    }
  });
});
