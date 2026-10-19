import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Legend } from '../../src/view/legend/Legend';
import { buildLegend } from '../../src/core/legend/legend';

describe('Legend component DOM and accessibility tests', () => {
  it('renders role="list" container and role="listitem" for each item', () => {
    const items = buildLegend({
      breaks: [10, 20],
      scheme: 'sequential',
      unit: '%',
    });

    const html = renderToString(<Legend items={items} />);

    expect(html).toContain('role="list"');
    const listItemMatches = html.match(/role="listitem"/g);
    expect(listItemMatches).toHaveLength(items.length);
  });

  it('renders color swatches using strictly var(--token) and no hex colors', () => {
    const items = buildLegend({
      breaks: [100, 500],
      scheme: 'diverging',
      unit: 'zł',
    });

    const html = renderToString(<Legend items={items} />);

    // Match var(--div-1), var(--div-3), var(--div-5), var(--no-data)
    expect(html).toContain('var(--div-1)');
    expect(html).toContain('var(--div-3)');
    expect(html).toContain('var(--div-5)');
    expect(html).toContain('var(--no-data)');

    // Ensure no inline hex codes in styles
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it('renders visible labels for all classes so color is not the only information source', () => {
    const items = buildLegend({
      breaks: [12.5],
      scheme: 'sequential',
      unit: '%',
    });

    const html = renderToString(<Legend items={items} />);

    expect(html).toContain('poniżej 12,5\u00A0%');
    expect(html).toContain('powyżej 12,5\u00A0%');
    expect(html).toContain('brak danych');
  });

  it('handles longest label (e.g. 1 234 567 %) without overflow using truncate / break classes', () => {
    const items = buildLegend({
      breaks: [1234567, 9876543],
      scheme: 'sequential',
      unit: '%',
    });

    const html = renderToString(<Legend items={items} />);

    expect(html).toContain('1\u00A0234\u00A0567');
    expect(html).toContain('9\u00A0876\u00A0543');

    // Verification of overflow protection classes in DOM output
    expect(html).toMatch(/truncate|break-words|min-w-0/);
  });
});
