const fs = require('fs');
let code = fs.readFileSync('src/view/map/layers/choropleth.ts', 'utf-8');

if (!code.includes('getNoDataPatternProps')) {
  // Insert import
  code = code.replace(
    "import { classColorToken, type ClassifyResult } from '@/core/map/classes';",
    "import { classColorToken, type ClassifyResult } from '@/core/map/classes';\nimport { getNoDataPatternProps } from './no-data-pattern';"
  );

  // Use the props
  code = code.replace(
    'return new GeoJsonLayer({',
    'return new GeoJsonLayer({\n      ...getNoDataPatternProps(choropleth.classByTeryt),'
  );

  // Add line color to palette caching logic
  code = code.replace(
    'return color;',
    'return color;\n    };\n    const lineColor = resolveTokenColor(\'--linia\');'
  );

  // Update getFillColor
  code = code.replace(
    'const fullColor = colorOf(cls);',
    'const fullColor = cls === \'no-data\' ? lineColor : colorOf(cls);'
  );

  // Also we need to make sure we update the trigger for the pattern props. Wait, `getNoDataPatternProps` does not change dynamically unless token changes.

  fs.writeFileSync('src/view/map/layers/choropleth.ts', code);
}
