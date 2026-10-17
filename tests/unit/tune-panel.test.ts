import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import tokensJson from '../../config/tokens.json';
import { resetTokens, applyCssVariables, getCurrentTheme } from '../../src/view/tune/TunePanel';
import { diffTokens } from '../../src/view/tune/tokens-map';

describe('TunePanel unit tests', () => {
  const originalDocument = globalThis.document;
  let mockAttrs: Map<string, string>;
  let mockStyle: Map<string, string>;

  beforeEach(() => {
    mockAttrs = new Map<string, string>();
    mockStyle = new Map<string, string>();

    const mockDoc = {
      documentElement: {
        getAttribute: (attr: string) => mockAttrs.get(attr) ?? null,
        setAttribute: (attr: string, val: string) => mockAttrs.set(attr, val),
        removeAttribute: (attr: string) => mockAttrs.delete(attr),
        style: {
          setProperty: (prop: string, val: string) => mockStyle.set(prop, val),
          getPropertyValue: (prop: string) => mockStyle.get(prop) ?? '',
        },
      },
    };

    globalThis.document = mockDoc as unknown as Document;
  });

  afterEach(() => {
    globalThis.document = originalDocument;
  });

  describe('resetTokens', () => {
    it('przywraca zmodyfikowane tokeny do stanu początkowego z tokens.json', () => {
      const currentTokens = structuredClone(tokensJson);

      currentTokens.color.light.kalka = '#123456';
      currentTokens.color.dark.kalka = '#654321';
      currentTokens.data.sequential.light[0] = '#999999';
      currentTokens.data.noData.light = '#111111';

      expect(diffTokens(tokensJson, currentTokens)).not.toEqual({});

      resetTokens(currentTokens, tokensJson);

      expect(currentTokens.color.light.kalka).toBe(tokensJson.color.light.kalka);
      expect(currentTokens.color.dark.kalka).toBe(tokensJson.color.dark.kalka);
      expect(currentTokens.data.sequential.light[0]).toBe(tokensJson.data.sequential.light[0]);
      expect(currentTokens.data.noData.light).toBe(tokensJson.data.noData.light);

      expect(diffTokens(tokensJson, currentTokens)).toEqual({});
    });
  });

  describe('getCurrentTheme', () => {
    it('zwraca "light" jako domyślny motyw, gdy brak atrybutu data-theme', () => {
      expect(getCurrentTheme()).toBe('light');
    });

    it('zwraca "dark" gdy data-theme="dark"', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      expect(getCurrentTheme()).toBe('dark');
    });

    it('zwraca "light" gdy data-theme="light"', () => {
      document.documentElement.setAttribute('data-theme', 'light');
      expect(getCurrentTheme()).toBe('light');
    });
  });

  describe('applyCssVariables', () => {
    it('ustawia zmienne CSS na documentElement dla jasnego motywu', () => {
      const currentTokens = structuredClone(tokensJson);
      currentTokens.color.light.kalka = '#123456';

      applyCssVariables(currentTokens, 'light');

      expect(document.documentElement.style.getPropertyValue('--kalka')).toBe('#123456');
    });

    it('ustawia zmienne CSS na documentElement dla ciemnego motywu', () => {
      const currentTokens = structuredClone(tokensJson);
      currentTokens.color.dark.kalka = '#654321';

      applyCssVariables(currentTokens, 'dark');

      expect(document.documentElement.style.getPropertyValue('--kalka')).toBe('#654321');
    });
  });
});
