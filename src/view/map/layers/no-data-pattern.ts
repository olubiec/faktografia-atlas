import { FillStyleExtension } from '@deck.gl/extensions';
import { resolveTokenColor } from './choropleth';

export function getNoDataPatternProps(classByTeryt: Record<string, string | number>) {
  return {
    extensions: [new FillStyleExtension({ pattern: true, proceduralPattern: true })],
    fillPatternMapping: {
      'no-data-hatch': { type: 'hatch', angle: 45, strokeWidth: 1, gap: 4 }
    },
    getFillPattern: (f: any) => {
      const teryt = f.properties?.teryt;
      const cls = teryt ? classByTeryt[teryt] ?? 'no-data' : 'no-data';
      return cls === 'no-data' ? 'no-data-hatch' : '';
    },
    fillPatternMask: true,
    fillPatternSizeUnits: 'pixels',
    getFillPatternScale: 1,
    getFillPatternBackgroundColor: () => resolveTokenColor('--no-data'),
  };
}
