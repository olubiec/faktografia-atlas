import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

test('package.json zawiera wszystkie wymagane zależności (CC1.2)', () => {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'maplibre-gl', 'react-map-gl', '@deck.gl/core', '@deck.gl/layers',
    '@deck.gl/mapbox', '@deck.gl/extensions', 'topojson-client', 'cmdk',
    'minisearch', '@observablehq/plot',
    'react-modal-sheet', 'zod', 'p-throttle', 'posthog-js', 'rough-notation',
    'roughjs', 'iconoir-react', 'tweakpane', '@axe-core/playwright',
    'mapshaper', 'topojson-server', '@types/topojson-client',
    '@types/geojson',
    'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge'
  ];

  requiredDeps.forEach(dep => {
    expect(deps).toHaveProperty(dep);
  });
});
