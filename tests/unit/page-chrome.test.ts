import { describe, expect, it } from 'vitest';
import { footer, HEADER } from '@/core/seo/page-chrome';
import { renderDiscoverIndex } from '@/core/seo/discover-template';

describe('statyczna ramka stron: logo i przyciski', () => {
  it('logo ma dwa obrazki (jasne i ciemne tło) wybierane motywem strony, nie systemu', () => {
    for (const html of [HEADER, footer('1 stycznia 2026')]) {
      expect(html).toContain('logo-na-jasnym');
      expect(html).toContain('logo-na-ciemnym');
      expect(html).not.toContain('<picture>');
    }
  });

  it('spis /zestawienia ładuje aplikację (menu „Wybierz dane”), a linki do zestawień to przyciski', () => {
    const html = renderDiscoverIndex(
      [{ name: 'Ludność', slug: 'ludnosc', path: '/temat/ludnosc', indicators: [{ id: 'population', name: 'Ludność', unit: 'osoba', group: 'Ludność', higherIsBetter: null }] }],
      [{ slug: 'a', indicatorId: 'population', level: 'gmi', kind: 'value', dir: 1, title: 'A', h1: 'Gminy A' }] as never,
      '2026-01-01T00:00:00Z',
      { css: ['/assets/x.css'], entry: '/assets/index-abc.js' },
    );
    expect(html).toContain('<script type="module" crossorigin src="/assets/index-abc.js">');
    expect(html).toContain('id="root"');
    expect(html).toContain('Zobacz temat: Ludność');
    expect(html).not.toContain('Temat: Ludność</a></p>');
    expect(html).toMatch(/<a href="\/zestawienie\/a" class="[^"]*min-h-\[44px\][^"]*border/);
  });
});
