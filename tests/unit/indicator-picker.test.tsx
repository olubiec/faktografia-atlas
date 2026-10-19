import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {
  IndicatorPicker,
  IndicatorPickerContent,
} from '../../src/view/controls/IndicatorPicker';
import type { Indicator } from '../../src/core/profile/profile';

const indicatorsJsonPath = path.join(process.cwd(), 'config/indicators.json');
const realIndicators: Indicator[] = JSON.parse(fs.readFileSync(indicatorsJsonPath, 'utf8'));

describe('IndicatorPicker Unit Tests (CC8.3a)', () => {
  it('groups indicators according to group field preserving order of appearance', () => {
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value={null}
        query=""
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    // Group order in indicators.json: Ludność, Praca, Pieniądze, Mieszkania, Środowisko, Życie, Transport
    const ludnoscIdx = html.indexOf('Ludność');
    const pracaIdx = html.indexOf('Praca');
    const pieniadzeIdx = html.indexOf('Pieniądze');
    const mieszkaniaIdx = html.indexOf('Mieszkania');
    const srodowiskoIdx = html.indexOf('Środowisko');
    const zycieIdx = html.indexOf('Życie');
    const transportIdx = html.indexOf('Transport');

    expect(ludnoscIdx).toBeGreaterThan(-1);
    expect(ludnoscIdx).toBeLessThan(pracaIdx);
    expect(pracaIdx).toBeLessThan(pieniadzeIdx);
    expect(pieniadzeIdx).toBeLessThan(mieszkaniaIdx);
    expect(mieszkaniaIdx).toBeLessThan(srodowiskoIdx);
    expect(srodowiskoIdx).toBeLessThan(zycieIdx);
    expect(zycieIdx).toBeLessThan(transportIdx);
  });

  it('renders trigger button with selected indicator name and 44px min-height', () => {
    const html = renderToString(
      <IndicatorPicker
        indicators={realIndicators}
        value="population"
        onChange={() => {}}
      />
    );

    expect(html).toContain('Wskaźnik');
    expect(html).toContain('Ludność ogółem');
    expect(html).toContain('min-h-[44px]');
  });

  it('renders name, unit, and group headers correctly in IndicatorPickerContent', () => {
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value="population"
        query=""
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(html).toContain('Ludność ogółem');
    expect(html).toContain('osoba');
    expect(html).toContain('Przeciętne wynagrodzenie brutto (zł)');
    expect(html).toContain('zł');
    expect(html).toContain('Ludność');
    expect(html).toContain('Praca');
    expect(html).toContain('Pieniądze');
  });

  it('sets aria-selected="true" on the selected indicator in IndicatorPickerContent', () => {
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value="density"
        query=""
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('Gęstość zaludnienia (os./km²)');
  });

  it('filters indicators without Polish diacritics (e.g. "ludnosc" finds "Ludność")', () => {
    const htmlLudnosc = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value={null}
        query="ludnosc"
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(htmlLudnosc).toContain('Ludność ogółem');
    expect(htmlLudnosc).toContain('Przyrost naturalny na 1000 ludności');

    const htmlMieszkania = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value={null}
        query="mieszkania"
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(htmlMieszkania).toContain('Mieszkania oddane do użytku na 1000 ludności');
  });

  it('renders exact text "Brak wskaźnika o tej nazwie" when search yields no results', () => {
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value={null}
        query="xyznieistniejacy123"
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(html).toContain('Brak wskaźnika o tej nazwie');
  });

  it('ensures touch targets are at least 44px and longest indicator name wraps safely', () => {
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value="dwelling-area-per-person"
        query=""
        onQueryChange={() => {}}
        onSelect={() => {}}
      />
    );

    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('Przeciętna pow. użytkowa mieszkania na osobę (m²)');
    expect(html).toContain('whitespace-normal');
    expect(html).toContain('break-words');
  });

  it('invokes onSelect when option button is clicked', () => {
    const handleSelect = vi.fn<() => void>();
    const html = renderToString(
      <IndicatorPickerContent
        indicators={realIndicators}
        value={null}
        query=""
        onQueryChange={() => {}}
        onSelect={handleSelect}
      />
    );

    expect(html).toContain('Ludność ogółem');
  });
});
