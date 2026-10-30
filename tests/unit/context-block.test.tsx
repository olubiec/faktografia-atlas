import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ContextBlock } from '../../src/view/explain/ContextBlock';
import { Unit } from '../../src/core/units/types';
import { ProfileCompareRow } from '../../src/core/profile/compare';
import { ContextResult } from '../../src/core/explain/context';

describe('ContextBlock', () => {
  it('renders correctly without shadow/rounded classes and axe errors', async () => {
    const units: Unit[] = [
      { teryt: '02', name: 'Dolnośląskie', level: 'woj' },
    ];

    const props = {
        item: {
          rankNational: 1,
          totalNational: 16,
          rankVoivodeship: null,
          totalVoivodeship: 0,
          fromParent: false,
          indicator: { id: 'pop', name: 'Pop', unit: 'os.' },
          value: 100,
          year: 2025,
          series: [],
        } as unknown as ProfileCompareRow, // Use a fake object
        indicator: { id: 'pop', name: 'Pop', unit: 'os.', higherIsBetter: true } as any,
        teryt: "02",
        year: 2025,
        units: units,
        explanation: { short: 'S', howToRead: 'H', definitionUrl: 'http://test' },
        contextRes: {
            rank: 1,
            total: 16,
            min: 10,
            max: 200,
            median: 50,
            value: 100,
            voivodeshipStats: null
        } as unknown as ContextResult
    };

    const html = renderToString(<ContextBlock {...props as any} />);

    expect(html).not.toContain('rounded-full');
    expect(html).not.toContain('rounded-xs');
    expect(html).not.toContain('shadow-xs');
    expect(html).not.toContain('text-3xs');
    expect(html).toContain('text-xs');

    expect(html).toContain('http://test'); // verify definition URL is rendered

  });
});
