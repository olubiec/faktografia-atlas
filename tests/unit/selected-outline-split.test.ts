import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as choropleth from '../../src/view/map/layers/choropleth';
import { selectedOutlineLayerFactory } from '../../src/view/map/layers/selected-outline';

const root = path.resolve(__dirname, '../..');
const lines = (f: string) => fs.readFileSync(path.join(root, f), 'utf-8').split('\n').length - 1;

describe('podział choropleth.ts: obrys wybranej jednostki', () => {
  it('oba pliki mają najwyżej 220 linii', () => {
    expect(lines('src/view/map/layers/choropleth.ts')).toBeLessThanOrEqual(220);
    expect(lines('src/view/map/layers/selected-outline.ts')).toBeLessThanOrEqual(220);
  });

  it('fabryka z choropleth.ts i z selected-outline.ts to ten sam obiekt', () => {
    expect(choropleth.selectedOutlineLayerFactory).toBe(selectedOutlineLayerFactory);
    expect(selectedOutlineLayerFactory.id).toBe('selected-outline-layer');
  });

  it('choropleth.ts nadal eksportuje wszystkie trzy nazwy', () => {
    expect(typeof choropleth.resolveTokenColor).toBe('function');
    expect(choropleth.choroplethLayerFactory.id).toBe('choropleth-layer');
    expect(choropleth.selectedOutlineLayerFactory).toBeDefined();
  });

  it('selected-outline.ts nie importuje z ./choropleth', () => {
    const src = fs.readFileSync(path.join(root, 'src/view/map/layers/selected-outline.ts'), 'utf-8');
    expect(src).not.toMatch(/from ['"]\.\/choropleth['"]/);
  });
});
