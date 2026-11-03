import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExplanationSchema, ExplanationsFileSchema } from '../../src/core/explain/explanations';
import { ContextBlock } from '../../src/view/explain/ContextBlock';

describe('Explanations Data Integrity (W18-P01)', () => {
  const explanationsPath = path.resolve(process.cwd(), 'public/data/explanations.json');
  const indicatorsPath = path.resolve(process.cwd(), 'config/indicators.json');

  it('explanations.json exists and conforms to ExplanationsFileSchema', () => {
    expect(fs.existsSync(explanationsPath)).toBe(true);
    const raw = fs.readFileSync(explanationsPath, 'utf8');
    const json = JSON.parse(raw);
    const parsed = ExplanationsFileSchema.safeParse(json);
    expect(parsed.success).toBe(true);
  });

  it('contains complete coverage for all 20 indicators from config/indicators.json with character limits and valid URLs', () => {
    const raw = fs.readFileSync(explanationsPath, 'utf8');
    const json = JSON.parse(raw);
    const indicatorsRaw = fs.readFileSync(indicatorsPath, 'utf8');
    const indicators: Array<{ id: string }> = JSON.parse(indicatorsRaw);

    expect(indicators.length).toBe(20);
    expect(json.items.length).toBe(20);

    const itemsMap = new Map<string, any>(json.items.map((it: any) => [it.indicatorId, it]));

    // Brak duplikatów
    expect(itemsMap.size).toBe(20);

    for (const ind of indicators) {
      const item = itemsMap.get(ind.id);
      expect(item, `Brak wyjaśnienia dla wskaźnika ${ind.id}`).toBeDefined();

      const validation = ExplanationSchema.safeParse(item);
      expect(
        validation.success,
        `Błąd walidacji wskaźnika ${ind.id}: ${JSON.stringify(validation.error?.issues)}`
      ).toBe(true);

      // Limity długości i zawartość
      expect(item.short.length).toBeGreaterThan(0);
      expect(item.short.length).toBeLessThanOrEqual(160);

      expect(item.howToRead.length).toBeGreaterThan(0);
      expect(item.howToRead.length).toBeLessThanOrEqual(240);

      expect(item.definitionUrl.startsWith('https://stat.gov.pl')).toBe(true);
    }
  });

  it('ContextBlock displays indicator explanation and link to GUS definition', () => {
    const dummyIndicator = {
      id: 'density',
      name: 'Gęstość zaludnienia (os./km²)',
      unit: 'os./km²',
      higherIsBetter: null,
    };
    const dummyUnit = { teryt: '0201011', name: 'Gmina Testowa', level: 'gmi' as const, parent: '0201' };
    const dummyItem = {
      indicatorId: 'density',
      name: 'Gęstość zaludnienia',
      unit: 'os./km²',
      higherIsBetter: null,
      value: 120,
      formattedValue: '120',
      rankNational: 5,
      totalNational: 50,
      rankVoivodeship: 1,
      totalVoivodeship: 10,
    };
    const dummyExplanation = {
      indicatorId: 'density',
      short: 'Jak tłoczno jest na jednym kilometrze kwadratowym.',
      howToRead: 'Duże miasta mają tysiące osób na km², wsie kilkadziesiąt.',
      world: null,
      funFact: null,
      definitionUrl: 'https://stat.gov.pl/metainformacje/slownik-pojec/pojecia-stosowane-w-statystyce-publicznej/3915,pojecie.html',
    };

    const html = renderToString(
      React.createElement(ContextBlock, {
        item: dummyItem,
        indicator: dummyIndicator,
        teryt: '0201011',
        year: 2024,
        units: [dummyUnit],
        explanation: dummyExplanation,
        showExplanation: true,
      })
    );

    expect(html).toContain('Co to jest');
    expect(html).toContain('Jak tłoczno jest na jednym kilometrze kwadratowym.');
    expect(html).toContain('Jak czytać');
    expect(html).toContain('Duże miasta mają tysiące osób na km², wsie kilkadziesiąt.');
    expect(html).toContain('Definicja GUS');
    expect(html).toContain('https://stat.gov.pl/metainformacje/slownik-pojec/pojecia-stosowane-w-statystyce-publicznej/3915,pojecie.html');
  });
});
