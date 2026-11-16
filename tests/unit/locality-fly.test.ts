import { describe, it, expect } from 'vitest';
import { cameraTransition } from '../../src/core/map/camera';
import { stepCrossfade, initialCrossfade } from '../../src/core/map/crossfade';
import { readFileSync } from 'node:fs';

describe('wybór miejscowości i drill-up – płynne przejścia', () => {
  const from = { longitude: 19, latitude: 52, zoom: 5.5 };
  const to = { longitude: 21, latitude: 52.2, zoom: 11.5 };

  it('lot do miejscowości (in) trwa > 0, a przy reduced motion jest skokiem', () => {
    expect(cameraTransition(from, to, 'in', false).duration).toBeGreaterThan(0);
    expect(cameraTransition(from, to, 'in', true).duration).toBe(0);
  });

  it('AtlasMap kieruje wybór miejscowości przez animateToView, nie przez skok', () => {
    const src = readFileSync('src/view/map/AtlasMap.tsx', 'utf8');
    const block = src.slice(src.indexOf('onLocalitySelectView'));
    expect(block.slice(0, 400)).toContain("animateToView(targetView, 'in')");
    expect(block.slice(0, 400)).not.toContain('setCurrentViewState(targetView)');
  });

  it('drill-up: po zmianie zakresu stara warstwa zostaje pod spodem, nowa wjeżdża od 0', () => {
    let s = stepCrossfade(initialCrossfade, 'gminy:A', 1, false).next;
    const frame = stepCrossfade(s, 'powiaty:A', 1, false);
    expect(frame.incoming).toBe(0);
    expect(frame.showOutgoing).toBe(true);
    s = frame.next;
    const mid = stepCrossfade(s, 'powiaty:A', 0.5, false);
    expect(mid.incoming).toBeGreaterThan(0);
    expect(mid.showOutgoing).toBe(true);
  });

  it('reduced motion: drill-up bez crossfade', () => {
    const s = stepCrossfade(initialCrossfade, 'gminy:A', 1, true).next;
    const f = stepCrossfade(s, 'powiaty:A', 0.3, true);
    expect(f.incoming).toBe(1);
    expect(f.showOutgoing).toBe(false);
  });
});
