import { test, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

test('package.json zawiera wszystkie wymagane zależności (CC1.2)', () => {
  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredDeps = [
    'nuqs', 'maplibre-gl', 'react-map-gl', '@deck.gl/core', '@deck.gl/layers',
    '@deck.gl/mapbox', '@deck.gl/extensions', 'topojson-client', 'cmdk',
    'minisearch', 'motion', '@observablehq/plot', 'd3-scale', 'd3-array',
    'react-modal-sheet', 'zod', 'p-throttle', 'posthog-js', 'rough-notation',
    'roughjs', 'iconoir-react', 'tweakpane', '@axe-core/playwright',
    'mapshaper', 'topojson-server', '@types/topojson-client',
    '@types/d3-scale', '@types/d3-array', '@types/geojson',
    'radix-ui', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tw-animate-css'
  ];

  requiredDeps.forEach(dep => {
    expect(deps).toHaveProperty(dep);
  });
});
