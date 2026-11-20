import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { SheetIndicatorPicker } from '../../src/view/main/MobileIndicatorBar';
import type { Indicator } from '../../src/core/profile/profile';

const ind = { id: 'a', name: 'Gęstość zaludnienia', unit: 'os./km²', group: 'Ludność' } as unknown as Indicator;

describe('SheetIndicatorPicker', () => {
  it('domyślnie pokazuje listę i przycisk jest rozwinięty', () => {
    const html = renderToString(<SheetIndicatorPicker indicators={[ind]} indicator={ind} onSelect={() => {}} />);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="listbox"');
  });
  it('zwinięty nie pokazuje listy (strzałka zwija)', () => {
    const html = renderToString(<SheetIndicatorPicker indicators={[ind]} indicator={ind} onSelect={() => {}} defaultOpen={false} />);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="listbox"');
  });
});
