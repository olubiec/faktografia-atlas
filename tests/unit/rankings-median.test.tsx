import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RankingMedian } from '../../src/view/ranking/RankingsView';
import type { RankedUnit } from '../../src/core/ranking/ranking';
import type { Unit } from '../../src/core/units/types';

const mk = (teryt: string, value: number, rank: number, total: number): RankedUnit => ({ teryt, name: teryt, value, rank, total });
const html = (items: RankedUnit[]) =>
  renderToString(<RankingMedian items={items} units={[] as Unit[]} unit="%" />).replace(/<!-- -->/g, '').replace(/\s/g, ' ');

describe('Rankingi: mediana z prawdziwych wartości (QS03)', () => {
  it('mediana równa medianie fixture’u (nieparzysta i parzysta liczba, nie sztywne 50)', () => {
    const odd = [mk('01', 10, 3, 3), mk('02', 30, 2, 3), mk('03', 70, 1, 3)];
    expect(html(odd)).toContain('Mediana: 30,0 %');
    const even = [mk('01', 10, 4, 4), mk('02', 20, 3, 4), mk('03', 30, 2, 4), mk('04', 100, 1, 4)];
    expect(html(even)).toContain('Mediana: 25,0 %');
  });

  it('brak wartości = brak napisu o medianie', () => {
    expect(html([])).not.toContain('Mediana');
  });
});
