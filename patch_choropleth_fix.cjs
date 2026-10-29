const fs = require('fs');
let code = fs.readFileSync('src/view/map/layers/choropleth.ts', 'utf-8');

code = code.replace('    const lineColor = resolveTokenColor(\'--linia\');\n    };\n\n    const progress', '    const lineColor = resolveTokenColor(\'--linia\');\n\n    const progress');

// Need to update the triggers too
code = code.replace(
  'choropleth.reveal?.running,',
  'choropleth.reveal?.running,\n          choropleth.classByTeryt,' // Oops, it is already there
);

fs.writeFileSync('src/view/map/layers/choropleth.ts', code);
