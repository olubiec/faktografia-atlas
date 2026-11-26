import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import indicatorsData from '../../config/indicators.json' with { type: 'json' };
import fixture from '../fixtures/catalog/search-queries.json' with { type: 'json' };
import { buildCatalogTree } from '../../src/core/catalog/tree';
import { DataMenuBody } from '../../src/view/data-menu/DataMenu';
import type { AvailableFile } from '../../src/core/indicators/registry';
import type { Indicator } from '../../src/core/profile/profile';

const tree = buildCatalogTree(indicatorsData as Indicator[], fixture.available as AvailableFile);
const noop = () => {};
const render = (layout: 'columns' | 'stack') =>
  renderToString(<DataMenuBody tree={tree} selectedId={null} onSelect={noop} onClose={noop} layout={layout} />);

describe('UI-FIX 4: panel „Wybierz dane” – przewijanie kategorii', () => {
  it('układ kolumnowy: lewa lista działów ma własny scroll, a siatka ma ograniczoną wysokość', () => {
    const html = render('columns');
    expect(html).toMatch(/<nav[^>]*aria-label="Działy"[^>]*md:overflow-y-auto/);
    expect(html).toMatch(/<section[^>]*aria-label="Wskaźniki"[^>]*md:overflow-y-auto/);
    expect(html).toContain('md:max-h-[65dvh]');
  });

  it('telefon: lista działów nie dostaje własnego scrolla (przewija je kontener arkusza)', () => {
    expect(render('stack')).not.toMatch(/<nav[^>]*aria-label="Działy"[^>]*overflow-y-auto/);
  });
});
