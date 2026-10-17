import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tokensMap, diffTokens } from '../../src/view/tune/tokens-map';
import tokensJson from '../../config/tokens.json';

describe('tokensMap', () => {
  const cssPath = path.resolve('src/styles/tokens.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  function collectCssVarNames(obj: unknown): string[] {
    if (typeof obj === 'string') {
      return [obj];
    }
    if (Array.isArray(obj)) {
      return obj.flatMap(collectCssVarNames);
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).flatMap(collectCssVarNames);
    }
    return [];
  }

  it('mapuje każdy klucz kolorów, typografii i odstępów do istniejącej zmiennej CSS', () => {
    const varNames = collectCssVarNames(tokensMap);
    expect(varNames.length).toBeGreaterThan(0);

    for (const varName of varNames) {
      expect(cssContent, `Zmienna CSS ${varName} powinna istnieć w src/styles/tokens.css`).toContain(varName);
    }
  });

  it('zawiera klucze kolorów z config/tokens.json', () => {
    for (const key of Object.keys(tokensJson.color.light)) {
      expect(tokensMap.color.light).toHaveProperty(key);
    }
    for (const key of Object.keys(tokensJson.color.dark)) {
      expect(tokensMap.color.dark).toHaveProperty(key);
    }
  });

  it('zawiera klucze typografii z config/tokens.json', () => {
    expect(tokensMap.font).toHaveProperty('sans');
    expect(tokensMap.font).toHaveProperty('mono');
    for (const key of Object.keys(tokensJson.font.scale)) {
      expect(tokensMap.font.scale).toHaveProperty(key);
    }
  });
});

describe('diffTokens', () => {
  it('zwraca pusty obiekt dla identycznych danych', () => {
    const diff = diffTokens(tokensJson, tokensJson);
    expect(diff).toEqual({});
  });

  it('zwraca jeden wpis dla jednej zmienionej wartości koloru', () => {
    const current = JSON.parse(JSON.stringify(tokensJson));
    current.color.light.kalka = '#000000';

    const diff = diffTokens(tokensJson, current);
    expect(diff).toEqual({
      color: {
        light: {
          kalka: '#000000',
        },
      },
    });
  });

  it('zachowuje ścieżkę przy zmianie zagnieżdżonej', () => {
    const current = JSON.parse(JSON.stringify(tokensJson));
    current.data.sequential.light[0] = '#FFFFFF';

    const diff = diffTokens(tokensJson, current);
    expect(diff).toEqual({
      data: {
        sequential: {
          light: ['#FFFFFF', '#A9B8CF', '#7088AE', '#3D5A8A', '#15233F'],
        },
      },
    });
  });
});
