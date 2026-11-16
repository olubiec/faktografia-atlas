import { describe, expect, it } from 'vitest';
import { readEmbedParams, hasSourceFooter } from '@/core/embed/embed-params';
import { buildIndex } from '@/core/units/units';
import { DEFAULT_INDICATOR_ID } from '@/core/map/main-view';
import units from '../fixtures/context-test-units.json';

const index = buildIndex(
  units.map((u) => ({
    ...u,
    bdlId: null,
    name: u.teryt,
    bbox: [0, 0, 1, 1] as [number, number, number, number],
    centroid: [0, 0] as [number, number],
  })) as Parameters<typeof buildIndex>[0]
);

describe('readEmbedParams', () => {
  it('odczytuje poprawne parametry 1:1', () => {
    const r = readEmbedParams('?w=map&i=density&l=pow&theme=dark&h=600');
    expect(r.widget).toBe('map');
    expect(r.state.i).toBe('density');
    expect(r.state.l).toBe('pow');
    expect(r.theme).toBe('dark');
    expect(r.height).toBe(600);
  });

  it('nieznane wartości dają domyślne bez wyjątku', () => {
    const r = readEmbedParams('?w=xyz&theme=neon&h=999');
    expect(r.widget).toBe('map');
    expect(r.theme).toBe('light');
    expect(r.height).toBe(400);
    expect(r.state.i).toBe(DEFAULT_INDICATOR_ID);
  });

  it('pusty adres daje domyślne', () => {
    const r = readEmbedParams('');
    expect(r).toMatchObject({ widget: 'map', theme: 'light', height: 400 });
    expect(r.state.i).toBe(DEFAULT_INDICATOR_ID);
  });

  it('trend bez poprawnego u wraca do mapy', () => {
    expect(readEmbedParams('?w=trend').widget).toBe('map');
    expect(readEmbedParams('?w=trend&u=9999999', index).widget).toBe('map');
  });

  it('trend z poprawnym u (TERYT jako string) zostaje trendem', () => {
    const r = readEmbedParams('?w=trend&u=1201000', index);
    expect(r.widget).toBe('trend');
    expect(r.state.u).toBe('1201000');
  });

  it('ranking jest rozpoznawany', () => {
    expect(readEmbedParams('?w=ranking').widget).toBe('ranking');
  });

  it('hideSource, nologo, source=0 są ignorowane, a stopka zawsze jest', () => {
    const base = readEmbedParams('?w=ranking&i=density');
    const hacked = readEmbedParams('?w=ranking&i=density&hideSource=1&nologo=1&source=0');
    expect(hacked).toEqual(base);
    expect(Object.keys(hacked)).not.toContain('hideSource');
    expect(Object.keys(hacked)).not.toContain('source');
    expect(hasSourceFooter()).toBe(true);
  });
});
