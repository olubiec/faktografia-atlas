import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RankingBars } from '../../src/view/ranking/RankingBars';

const items = [
  { teryt: '14', name: 'mazowieckie', value: 180, rank: 1, total: 2 },
  { teryt: '32', name: 'zachodniopomorskie', value: 90, rank: 2, total: 2 },
];

describe('UI-FIX 6: ranking – pełna nazwa w osobnej linii', () => {
  const html = renderToStaticMarkup(<RankingBars items={items} unit="os." onSelect={() => {}} />);

  it('nazwa nie jest ucinana ani zawijana w środku słowa', () => {
    expect(html).toContain('mazowieckie');
    expect(html).toContain('zachodniopomorskie');
    expect(html).not.toMatch(/line-clamp|truncate|break-words|break-all/);
  });

  it('nazwa jest przed paskiem i wartością (druga linia), numeracja zostaje', () => {
    const name = html.indexOf('data-slot="ranking-name"');
    const bar = html.indexOf('data-slot="ranking-bar"');
    expect(name).toBeGreaterThan(-1);
    expect(bar).toBeGreaterThan(name);
    expect(html.indexOf('180,0')).toBeGreaterThan(bar);
    expect(html).toContain('1.');
    expect(html).toContain('2.');
  });

  it('wiersz ma pole dotykowe min. 44 px', () => {
    expect(html).toContain('min-h-[44px]');
  });
});
