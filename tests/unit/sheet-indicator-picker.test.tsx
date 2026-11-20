import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SheetIndicatorPicker } from '../../src/view/main/SheetIndicatorPicker';
import type { Indicator } from '../../src/core/profile/profile';

const ind = { id: 'a', name: 'Gęstość zaludnienia', unit: 'os./km²', group: 'Ludność' } as unknown as Indicator;

describe('SheetIndicatorPicker', () => {
  it('domyślnie jest rozwinięty: lista widoczna, aria-expanded=true', () => {
    const html = renderToString(<SheetIndicatorPicker indicators={[ind]} indicator={ind} onSelect={() => {}} />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="listbox"');
    expect(html).toContain('aria-label="Zwiń listę"');
  });
  it('zwinięty nie pokazuje listy, a strzałka ma etykietę „Rozwiń listę”', () => {
    const html = renderToString(<SheetIndicatorPicker indicators={[ind]} indicator={ind} onSelect={() => {}} defaultOpen={false} />);
    expect(html).toContain('aria-label="Rozwiń listę"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="listbox"');
  });
});
