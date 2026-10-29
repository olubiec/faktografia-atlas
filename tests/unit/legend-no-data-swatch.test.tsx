import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Legend } from '../../src/view/legend/Legend';

describe('legend-no-data-swatch', () => {
  it('renders repeating-linear-gradient for no-data swatch', () => {
    const items = [
      { token: '--seq-1', from: 0, to: 10, label: '0 - 10' },
      { token: '--no-data', from: null, to: null, label: 'brak danych' }
    ];

    const html = renderToString(<Legend items={items} />);

    expect(html).toContain('background:repeating-linear-gradient');
    expect(html).toContain('var(--linia)');
    expect(html).toContain('var(--no-data)');
    expect(html).toContain('background-color:var(--seq-1)');
  });
});
