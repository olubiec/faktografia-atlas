import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initialCrossfade,
  stepCrossfade,
  crossfadeEnabled,
  crossfadeLayers,
  type CrossfadeState,
} from '@/core/map/crossfade';
import { readFileSync } from 'node:fs';

// Przejście poziomów w obie strony, unikalne id warstw i brak przenikania na ekranach dotykowych.

function run(from: string, to: string, steps: number[], speedup = 3) {
  let s: CrossfadeState = stepCrossfade(initialCrossfade, from, 1, false, speedup).next;
  return [1, ...steps].map((p) => {
    const f = stepCrossfade(s, to, p, false, speedup);
    s = f.next;
    return f;
  });
}

describe('przenikanie poziomów w obie strony', () => {
  for (const [dir, from, to] of [
    ['w dół (woj → pow)', 'woj::', 'pow:12:'],
    ['w górę (gmi → pow)', 'gmi:12:1201', 'pow:12:'],
    ['w górę (pow → woj)', 'pow:12:', 'woj::'],
  ] as const) {
    it(`${dir}: stara gaśnie, nowa wjeżdża, na końcu tylko nowa`, () => {
      const frames = run(from, to, [0.05, 0.15, 0.25, 0.4, 1]);
      expect(frames[0]).toMatchObject({ incoming: 0, outgoing: 1, showOutgoing: true });
      const mid = frames[2];
      expect(mid.incoming).toBeGreaterThan(0);
      expect(mid.incoming).toBeLessThan(1);
      expect(mid.outgoing).toBeCloseTo(1 - mid.incoming, 5);
      // Przenikanie kończy się po 1/3 odsłaniania (ok. 300 ms z 900 ms).
      expect(frames[4]).toMatchObject({ incoming: 1, outgoing: 0, showOutgoing: false });
      expect(frames[5]).toMatchObject({ incoming: 1, outgoing: 0, showOutgoing: false });
    });
  }

  it('wolna pierwsza klatka (postęp już > 1/3) nie zawiesza przejścia', () => {
    const frames = run('woj::', 'pow:12:', [0.5]);
    expect(frames[1]).toMatchObject({ incoming: 1, showOutgoing: false });
  });
});

describe('id warstw przenikania', () => {
  it('stara i nowa warstwa mają różne id', () => {
    const [, f] = run('woj::', 'pow:12:', [0.1]);
    const specs = crossfadeLayers('choropleth-layer', f, true);
    expect(specs).toHaveLength(2);
    expect(new Set(specs.map((x) => x.id)).size).toBe(2);
    expect(specs.filter((x) => x.pickable)).toHaveLength(1);
  });

  it('bez starej warstwy: jedna, w pełni widoczna', () => {
    const [, f] = run('woj::', 'pow:12:', [0.1]);
    expect(crossfadeLayers('choropleth-layer', f, false)).toEqual([
      { id: 'choropleth-layer', role: 'incoming', opacity: 1, pickable: true },
    ]);
  });

  it('fabryki warstw w rejestrze mają unikalne id', async () => {
    const { getLayerFactories } = await import('@/view/map/layers/registry');
    const ids = getLayerFactories().map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('ekran dotykowy (pointer: coarse)', () => {
  it('crossfadeEnabled: wyłączone dla coarse, reduced motion i trybu testowego', () => {
    expect(crossfadeEnabled({ reducedMotion: false, coarsePointer: false, testMode: false })).toBe(true);
    expect(crossfadeEnabled({ reducedMotion: false, coarsePointer: true, testMode: false })).toBe(false);
    expect(crossfadeEnabled({ reducedMotion: true, coarsePointer: false, testMode: false })).toBe(false);
    expect(crossfadeEnabled({ reducedMotion: false, coarsePointer: false, testMode: true })).toBe(false);
  });

  // Minimalna topologia: jeden kwadrat jako województwo, powiat i gmina.
  const square = { type: 'Polygon', arcs: [[0]] };
  const topoData = {
    type: 'Topology',
    arcs: [[[14, 49], [24, 49], [24, 54], [14, 54], [14, 49]]],
    objects: {
      woj: { type: 'GeometryCollection', geometries: [{ ...square, properties: { teryt: '12' } }] },
      pow: { type: 'GeometryCollection', geometries: [{ ...square, properties: { teryt: '1201' } }] },
      gmi: { type: 'GeometryCollection', geometries: [{ ...square, properties: { teryt: '1201011' } }] },
    },
  };
  const colors = { kalka: [1, 1, 1, 255], arkusz: [2, 2, 2, 255], tusz: [3, 3, 3, 255] } as const;
  const choro = (level: 'woj' | 'pow', progress: number) =>
    ({
      indicatorId: 'x',
      year: 2023,
      level,
      classes: null,
      scheme: 'sequential',
      classByTeryt: {},
      activeScope: level === 'pow' ? { activeWojTeryt: '12', activePowTeryt: null } : null,
      reveal: { running: progress < 1, progress },
    }) as any;

  let coarse = false;
  beforeEach(() => {
    vi.stubGlobal('window', {
      matchMedia: (q: string) => ({ matches: q === '(pointer: coarse)' && coarse }),
      location: { search: '' },
    });
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
  });
  afterEach(() => vi.unstubAllGlobals());

  async function ids(level: 'woj' | 'pow', progress: number) {
    const { choroplethLayerFactory } = await import('@/view/map/layers/choropleth');
    const out = choroplethLayerFactory.create({ topoData, colors: colors as any, choropleth: choro(level, progress) });
    const list = Array.isArray(out) ? out : out ? [out] : [];
    return list.map((l) => ({ id: l.id, opacity: l.props.opacity }));
  }

  it('komputer: w trakcie przejścia dwie warstwy o różnych id, w obie strony', async () => {
    coarse = false;
    await ids('woj', 1);
    await ids('pow', 1);
    const down = await ids('pow', 0.1);
    expect(down.map((l) => l.id)).toEqual(['choropleth-layer-out', 'choropleth-layer']);
    await ids('pow', 1);
    await ids('woj', 1);
    const up = await ids('woj', 0.1);
    expect(up.map((l) => l.id)).toEqual(['choropleth-layer-out', 'choropleth-layer']);
    expect(await ids('woj', 1)).toEqual([{ id: 'choropleth-layer', opacity: 1 }]);
  });

  it('telefon: zawsze jedna warstwa w pełni widoczna, bez przenikania', async () => {
    coarse = true;
    for (const [level, p] of [['woj', 1], ['pow', 1], ['pow', 0.1], ['woj', 1], ['woj', 0.2]] as const) {
      expect(await ids(level, p)).toEqual([{ id: 'choropleth-layer', opacity: 1 }]);
    }
  });
});

describe('kamera: lot do miejscowości nie jest przerywany skokiem', () => {
  it('gałąź „locality” w useMapViewState nie anuluje animacji ani nie skacze', () => {
    const src = readFileSync('src/view/map/hooks/useMapViewState.ts', 'utf8');
    const start = src.indexOf("if (action === 'locality'");
    const block = src.slice(start, src.indexOf('} else if', start));
    expect(block).not.toContain('cancelAnimationFrame');
    expect(block).not.toContain('setCurrentViewState(');
    expect(block).toContain('animateToView(target');
  });
});
