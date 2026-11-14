import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RankingList, RankingSummary } from '../../src/view/pages/Rankings';
import type { RankedUnit } from '../../src/core/ranking/ranking';

const unit = 'os./km²';
const items: RankedUnit[] = [
  { teryt: '14', name: 'mazowieckie', value: 4451.5, rank: 1, total: 3 },
  { teryt: '24', name: 'śląskie', value: 345.5, rank: 2, total: 3 },
  { teryt: '06', name: 'lubelskie', value: 85, rank: 3, total: 3 },
];

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Rankings – lista (P1-A)', () => {
  it('pokazuje nazwy jednostek, a żadna pozycja nie jest samym kodem liczbowym', () => {
    const html = renderToString(<RankingList items={items} unit={unit} />);
    const lis = [...html.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => text(m[1]).trim());
    expect(lis).toHaveLength(3);
    for (const li of lis) expect(li).not.toMatch(/^\d+\s*[-–]/);
    expect(lis[1]).toContain('śląskie');
    expect(lis[1]).toContain('345,5');
  });

  it('formatuje liczby po polsku (spacja tysięcy, przecinek)', () => {
    const html = text(renderToString(<RankingList items={items} unit={unit} />));
    expect(html).toMatch(/4\s451,5/);
    expect(html).not.toContain('4451.5');
  });

  it('pusta nazwa nie zamienia się w sam kod', () => {
    const html = text(
      renderToString(<RankingList items={[{ ...items[0], name: '' }]} unit={unit} />),
    );
    expect(html).not.toMatch(/\b14 -/);
    expect(html).toContain('Bez nazwy');
  });

  it('pusta lista nie wywala się', () => {
    expect(() => renderToString(<RankingList items={[]} unit={unit} />)).not.toThrow();
  });
});

describe('Rankings – podsumowanie (P1-A)', () => {
  it('zawiera nazwę jednostki i jednostkę miary przy najwyżej/najniżej', () => {
    const t = text(renderToString(<RankingSummary items={items} unit={unit} />));
    expect(t).toMatch(/Najwyżej: mazowieckie, 4\s451,5\s+os\.\/km²/);
    expect(t).toMatch(/Najniżej: lubelskie, 85,0\s+os\.\/km²/);
  });

  it('liczy prawdziwą medianę, a nie wpisaną na sztywno', () => {
    const t = text(renderToString(<RankingSummary items={items} unit={unit} />));
    expect(t).toMatch(/Mediana: 345,5\s+os\.\/km²/);
    expect(t).not.toContain('Mediana: 50');
  });

  it('mediana dla parzystej liczby pozycji to średnia dwóch środkowych', () => {
    const t = text(renderToString(<RankingSummary items={items.slice(0, 2)} unit={unit} />));
    expect(t).toMatch(/Mediana: 2\s398,5\s+os\.\/km²/);
  });

  it('jedna pozycja: najwyżej i najniżej to ta sama jednostka', () => {
    const t = text(renderToString(<RankingSummary items={[items[1]]} unit={unit} />));
    expect(t).toContain('Najwyżej: śląskie');
    expect(t).toContain('Najniżej: śląskie');
  });

  it('brak pozycji: komunikat „brak danych”, bez wyjątku', () => {
    const t = text(renderToString(<RankingSummary items={[]} unit={unit} />));
    expect(t).toContain('brak danych');
  });
});
