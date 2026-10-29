import { describe, it, expect } from 'vitest';
import { getNoDataPatternProps } from '../../src/view/map/layers/no-data-pattern';
import { FillStyleExtension } from '@deck.gl/extensions';
import { resolveTokenColor } from '../../src/view/map/layers/choropleth';

describe('no-data-pattern', () => {
  it('returns valid deck.gl FillStyleExtension props and pattern mapping', () => {
    const classByTeryt = { '02': 'no-data', '04': 1 };
    const props = getNoDataPatternProps(classByTeryt);

    // Extensions
    expect(props.extensions).toHaveLength(1);
    expect(props.extensions[0]).toBeInstanceOf(FillStyleExtension);

    // Pattern mapping
    expect(props.fillPatternMapping).toHaveProperty('no-data-hatch');
    expect(props.fillPatternMapping['no-data-hatch'].type).toBe('hatch');

    // getFillPattern
    expect(props.getFillPattern({ properties: { teryt: '02' } })).toBe('no-data-hatch');
    expect(props.getFillPattern({ properties: { teryt: '04' } })).toBe('');
    expect(props.getFillPattern({ properties: { teryt: '99' } })).toBe('no-data-hatch'); // fallback is 'no-data'
    expect(props.getFillPattern({ properties: {} })).toBe('no-data-hatch');

    // Background color
    expect(props.getFillPatternBackgroundColor()).toEqual(resolveTokenColor('--no-data'));
  });
});
