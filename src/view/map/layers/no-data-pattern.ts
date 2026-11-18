import { FillStyleExtension } from '@deck.gl/extensions';
import { resolveTokenColor } from './choropleth';

/** Kreskowanie „brak danych”; używane wyłącznie przez warstwę choropleth-nodata-layer. */
export function getNoDataPatternProps() {
  return {
    extensions: [new FillStyleExtension({ pattern: true, proceduralPattern: true })],
    fillPatternMapping: {
      'no-data-hatch': { type: 'hatch', angle: 45, strokeWidth: 1, gap: 4 }
    },
    getFillPattern: () => 'no-data-hatch',
    fillPatternMask: true,
    fillPatternSizeUnits: 'pixels',
    getFillPatternScale: 1,
    getFillPatternBackgroundColor: () => resolveTokenColor('--no-data'),
  };
}
