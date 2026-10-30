import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('explanations.json', () => {
  it('has valid structure and limits', () => {
    const dataPath = path.join(__dirname, '../../public/data/explanations.json');
    const content = fs.readFileSync(dataPath, 'utf-8');
    const json = JSON.parse(content);

    const indicatorsContent = fs.readFileSync(path.join(__dirname, '../../config/indicators.json'), 'utf-8');
    const indicators = JSON.parse(indicatorsContent);
    const indicatorIds = indicators.map((ind: any) => ind.id);

    expect(Object.keys(json).length).toBe(20);

    for (const id of indicatorIds) {
      const explanation = json[id];
      expect(explanation).toBeDefined();
      expect(explanation.short.length).toBeLessThanOrEqual(160);
      expect(explanation.howToRead.length).toBeLessThanOrEqual(240);
      expect(typeof explanation.definitionUrl).toBe('string');
    }
  });
});
