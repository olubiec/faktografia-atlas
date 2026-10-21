import React from 'react';
import { describe, test, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RankingBars } from '../../src/view/ranking/RankingBars';
import type { RankedUnit } from '../../src/core/ranking/ranking';

const mockItems: RankedUnit[] = Array.from({ length: 16 }, (_, i) => ({
  teryt: String(i + 1).padStart(2, '0'),
  name: `Województwo ${i + 1}`,
  value: (16 - i) * 10,
  rank: i + 1,
  total: 16,
}));

describe('<RankingBars /> UI component', () => {
  test('renders limit items by default and shows expand button text', () => {
    const html = renderToString(<RankingBars items={mockItems} unit="os./km²" />);

    // Default limit is 10 items
    expect(html).toContain('Województwo 1');
    expect(html).toContain('Województwo 10');
    expect(html).not.toContain('Województwo 11');

    expect(html).toMatch(/Pokaż wszystkie.*16/);
  });

  test('includes selected unit even if beyond limit', () => {
    // Selected unit is Województwo 15 (index 14, beyond limit 10)
    const html = renderToString(
      <RankingBars items={mockItems} unit="os./km²" selectedTeryt="15" limit={10} />
    );

    expect(html).toContain('Województwo 1');
    expect(html).toContain('Województwo 10');
    expect(html).toContain('Województwo 15'); // included because it is selected
    expect(html).not.toContain('Województwo 11');
  });

  test('highlights selected unit with bold and korekta token class', () => {
    const html = renderToString(
      <RankingBars items={mockItems} unit="os./km²" selectedTeryt="02" />
    );

    expect(html).toContain('Województwo 2');
    expect(html).toContain('text-korekta');
    expect(html).toContain('font-bold');
  });

  test('renders row buttons named by their visible text (WCAG 2.5.3) and min 44px touch target', () => {
    const html = renderToString(
      <RankingBars items={mockItems.slice(0, 3)} unit="os./km²" onSelect={() => {}} />
    );

    // Nazwa przycisku to jego widoczny tekst: miejsce, nazwa, wartość (bez osobnego aria-label, który by mu przeczył).
    const button = html.match(/<button[^>]*>/)?.[0] ?? '';
    expect(button).not.toContain('aria-label');
    expect(html).toContain('Województwo 1');
    expect(html).toContain('160,0\u00A0os./km²');
    expect(html).toContain('min-h-[44px]');
  });

  test('renders negative values with proper structure', () => {
    const itemsWithNegatives: RankedUnit[] = [
      { teryt: '01', name: 'Dodatnia', value: 50, rank: 1, total: 2 },
      { teryt: '02', name: 'Ujemna', value: -25, rank: 2, total: 2 },
    ];

    const html = renderToString(<RankingBars items={itemsWithNegatives} unit="na 1000" />);

    expect(html).toContain('Dodatnia');
    expect(html).toContain('Ujemna');
    expect(html).toContain('-25,0\u00A0na 1000');
  });
});
