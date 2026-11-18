import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AddIndicatorWindow } from '../../src/view/profile/AddIndicatorWindow';
import indicators from '../../config/indicators.json';

const items = (indicators as { id: string; name: string; group: string }[]).map((indicator) => ({
  indicatorId: indicator.id,
  indicator: indicator as never,
}));

describe('okno dodawania wskaźników (FIX4)', () => {
  const html = renderToString(<AddIndicatorWindow items={items as never} onAdd={() => {}} />);

  it('jest przewijane i ma ograniczoną wysokość', () => {
    expect(html).toContain('overflow-y-auto');
    expect(html).toMatch(/max-h-/);
  });

  it('każda kategoria to przycisk z aria-expanded, rozwinięta jest tylko pierwsza', () => {
    const groups = new Set(items.map((i) => i.indicator.group));
    const expanded = html.match(/aria-expanded="true"/g) ?? [];
    const collapsed = html.match(/aria-expanded="false"/g) ?? [];
    expect(expanded).toHaveLength(1);
    expect(collapsed.length).toBeGreaterThanOrEqual(groups.size - 1);
  });

  it('wskaźniki zwiniętych kategorii nie są w DOM, pola dotykowe mają min. 44 px', () => {
    const first = items[0].indicator.group;
    const other = items.find((i) => i.indicator.group !== first)!;
    expect(html).toContain(`Dodaj: ${items[0].indicator.name}`);
    expect(html).not.toContain(`Dodaj: ${other.indicator.name}`);
    expect(html).toContain('min-h-[44px]');
  });
});
