import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { z } from 'zod';
import {
  ExplanationSchema,
  loadExplanations,
  resetExplanationsCache,
  type Explanation,
} from '../../src/core/explain/explanations';

const sampleFixturePath = path.join(
  process.cwd(),
  'tests/fixtures/explanations.sample.json'
);
const sampleFixtureJson = fs.readFileSync(sampleFixturePath, 'utf8');
const sampleFixtureData = JSON.parse(sampleFixtureJson);

describe('explanations.ts unit tests (CC13.2)', () => {
  beforeEach(() => {
    resetExplanationsCache();
  });

  describe('ExplanationSchema validation', () => {
    it('waliduje poprawny wpis z wolną strukturą world i funFact', () => {
      const validEntry = sampleFixtureData.items[0];
      const result = ExplanationSchema.safeParse(validEntry);
      expect(result.success).toBe(true);
      const data = (result as z.SafeParseSuccess<Explanation>).data;
      expect(data.indicatorId).toBe('density');
      expect(data.short).toBe('Ilu ludzi mieszka średnio na 1 km² powierzchni.');
      expect(data.world?.source).toBe('GUS');
      expect(data.funFact?.text).toBe('Najmniej gęsto zaludnioną gminą w Polsce jest Lutowiska.');
      expect(data.definitionUrl).toBe('https://stat.gov.pl/pojecia-w-statystyce-publicznej/');
    });

    it('waliduje poprawny wpis z null w world i funFact', () => {
      const validEntryWithNulls = sampleFixtureData.items[1];
      const result = ExplanationSchema.safeParse(validEntryWithNulls);
      expect(result.success).toBe(true);
      const data = (result as z.SafeParseSuccess<Explanation>).data;
      expect(data.indicatorId).toBe('unemployment');
      expect(data.world).toBeNull();
      expect(data.funFact).toBeNull();
    });

    it('odrzuca wpis gdy short przekracza limit 160 znaków', () => {
      const invalidEntry = {
        indicatorId: 'test-long',
        short: 'a'.repeat(161),
        howToRead: 'Jak czytać',
        world: null,
        funFact: null,
        definitionUrl: 'https://stat.gov.pl',
      };
      const result = ExplanationSchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('odrzuca wpis gdy howToRead przekracza limit 240 znaków', () => {
      const invalidEntry = {
        indicatorId: 'test-long-howtoread',
        short: 'Prosty opis',
        howToRead: 'a'.repeat(241),
        world: null,
        funFact: null,
        definitionUrl: 'https://stat.gov.pl',
      };
      const result = ExplanationSchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('odrzuca wpis gdy adres URL nie zaczyna się od https://', () => {
      const invalidEntry = {
        indicatorId: 'http-url',
        short: 'Opis krótki',
        howToRead: 'Jak czytać',
        world: null,
        funFact: null,
        definitionUrl: 'http://stat.gov.pl',
      };
      const result = ExplanationSchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('odrzuca wpis gdy brak wymaganego pola short', () => {
      const invalidEntry = {
        indicatorId: 'missing-short',
        howToRead: 'Jak czytać',
        world: null,
        funFact: null,
        definitionUrl: 'https://stat.gov.pl',
      };
      const result = ExplanationSchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });
  });

  describe('loadExplanations', () => {
    it('wczytuje plik z fixtures i zachowuje 2 poprawne wpisy oraz odrzuca 1 błędny', async () => {
      const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => sampleFixtureData,
      } as Response);

      const map = await loadExplanations(mockFetch, '/data/explanations.json');

      expect(map.size).toBe(2);
      expect(map.has('density')).toBe(true);
      expect(map.has('unemployment')).toBe(true);
      expect(map.has('invalid-entry')).toBe(false);
    });

    it('pobiera plik tylko raz przy wielu równoległych lub kolejnych wywołaniach', async () => {
      const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
        ok: true,
        json: async () => sampleFixtureData,
      } as Response);

      const [res1, res2] = await Promise.all([
        loadExplanations(mockFetch, '/data/explanations.json'),
        loadExplanations(mockFetch, '/data/explanations.json'),
      ]);

      const res3 = await loadExplanations(mockFetch, '/data/explanations.json');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(res1).toBe(res2);
      expect(res2).toBe(res3);
    });

    it('obsługuje błąd 404 zwracając pustą mapę bez zgłaszania wyjątku ani błędu w konsoli', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const map = await loadExplanations(mockFetch, '/data/nonexistent.json');

      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(0);
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('obsługuje błąd sieci (fetch reject) zwracając pustą mapę bez błędu w konsoli', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn<typeof fetch>().mockRejectedValue(new Error('Network error'));

      const map = await loadExplanations(mockFetch, '/data/explanations.json');

      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(0);
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
