import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { IndicatorInfo } from '../../src/view/explain/IndicatorInfo';
import type { Explanation } from '../../src/core/explain/explanations';

const sampleExplanationFull: Explanation = {
  indicatorId: 'density',
  short: 'Ilu ludzi mieszka średnio na 1 km² powierzchni.',
  howToRead: 'Miasta zawsze wypadają wyżej niż wsie; porównuj miasta z miastami.',
  world: {
    text: 'W Polsce gęstość zaludnienia wynosi średnio 121 osób na km².',
    source: 'GUS',
    url: 'https://stat.gov.pl',
    year: 2023,
  },
  funFact: {
    text: 'Najmniej gęsto zaludnioną gminą w Polsce jest Lutowiska.',
    source: 'Bieszczady GUS',
    url: 'https://stat.gov.pl/funfact',
  },
  definitionUrl: 'https://stat.gov.pl/pojecia-w-statystyce-publicznej/',
};

const sampleExplanationMinimal: Explanation = {
  indicatorId: 'unemployment',
  short: 'Udział zarejestrowanych bezrobotnych.',
  howToRead: 'Niższa wartość oznacza lepszą sytuację.',
  world: null,
  funFact: null,
  definitionUrl: 'https://stat.gov.pl/definicja',
};

describe('IndicatorInfo Component Unit Tests (CC13.2)', () => {
  it('nie renderuje nic (zwraca null) gdy brak objaśnienia (null lub undefined)', () => {
    const htmlNull = renderToString(
      <IndicatorInfo indicatorId="density" name="Gęstość zaludnienia" explanation={null} />
    );
    expect(htmlNull).toBe('');

    const htmlUndefined = renderToString(
      <IndicatorInfo indicatorId="density" name="Gęstość zaludnienia" explanation={undefined} />
    );
    expect(htmlUndefined).toBe('');
  });

  describe('variant="popover"', () => {
    it('renderuje przycisk (?) o min. rozmiarze 44x44 px z aria-label="Co to znaczy: <nazwa>"', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="density"
          name="Gęstość zaludnienia"
          explanation={sampleExplanationFull}
          variant="popover"
        />
      );

      expect(html).toContain('aria-label="Co to znaczy: Gęstość zaludnienia"');
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('min-w-[44px]');
      expect(html).toContain('type="button"');
    });

    it('używa komponentu Icon z iconoir-react i nie posiada kodów hex', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="density"
          name="Gęstość zaludnienia"
          explanation={sampleExplanationFull}
          variant="popover"
        />
      );

      expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
      expect(html).toContain('stroke-width="1.5"');
    });
  });

  describe('variant="inline"', () => {
    it('renderuje sekcje z nagłówkami „Co to jest”, „Jak czytać”, „Polska i świat”, „Ciekawostka”, „Źródła”', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="density"
          name="Gęstość zaludnienia"
          explanation={sampleExplanationFull}
          variant="inline"
        />
      );

      expect(html).toContain('Co to jest');
      expect(html).toContain('Ilu ludzi mieszka średnio na 1 km² powierzchni.');

      expect(html).toContain('Jak czytać');
      expect(html).toContain('Miasta zawsze wypadają wyżej niż wsie; porównuj miasta z miastami.');

      expect(html).toContain('Polska i świat');
      expect(html).toContain('W Polsce gęstość zaludnienia wynosi średnio 121 osób na km².');
      expect(html).toContain('GUS');
      expect(html).toContain('2023');

      expect(html).toContain('Ciekawostka');
      expect(html).toContain('Najmniej gęsto zaludnioną gminą w Polsce jest Lutowiska.');
      expect(html).toContain('Bieszczady GUS');

      expect(html).toContain('Źródła');
      expect(html).toContain('href="https://stat.gov.pl/pojecia-w-statystyce-publicznej/"');
    });

    it('pomija sekcje null w wariancie inline', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="unemployment"
          name="Stopa bezrobocia"
          explanation={sampleExplanationMinimal}
          variant="inline"
        />
      );

      expect(html).toContain('Co to jest');
      expect(html).toContain('Jak czytać');
      expect(html).toContain('Źródła');

      expect(html).not.toContain('Polska i świat');
      expect(html).not.toContain('Ciekawostka');
    });

    it('formatuje linki źródeł z target="_blank" i rel="noopener noreferrer"', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="density"
          name="Gęstość zaludnienia"
          explanation={sampleExplanationFull}
          variant="inline"
        />
      );

      const blankOccurrences = (html.match(/target="_blank"/g) || []).length;
      const noopenerOccurrences = (html.match(/rel="noopener noreferrer"/g) || []).length;

      expect(blankOccurrences).toBe(3);
      expect(noopenerOccurrences).toBe(3);
    });

    it('nie zawiera kodu HTML w tekście objaśnienia (renderuje wyłącznie bezpieczny tekst)', () => {
      const explanationWithHtmlChar: Explanation = {
        ...sampleExplanationMinimal,
        short: 'Tekst <script>alert(1)</script> bez HTML',
      };

      const html = renderToString(
        <IndicatorInfo
          indicatorId="unemployment"
          name="Stopa bezrobocia"
          explanation={explanationWithHtmlChar}
          variant="inline"
        />
      );

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('nie zawiera wpisanych na sztywno kolorów hex', () => {
      const html = renderToString(
        <IndicatorInfo
          indicatorId="density"
          name="Gęstość zaludnienia"
          explanation={sampleExplanationFull}
          variant="inline"
        />
      );

      expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });
  });
});
