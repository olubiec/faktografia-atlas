import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import tokens from '../../config/tokens.json';
import {
  buildIntroTimeline,
  stageAt,
  totalDuration,
} from '../../src/core/motion/timeline';

describe('timeline - czysta logika osi czasu', () => {
  it('buildIntroTimeline generuje etapy w kolejności z podanych tokenów motion', () => {
    const timeline = buildIntroTimeline({
      reducedMotion: false,
      motion: tokens.motion,
    });

    expect(timeline).toHaveLength(3);

    expect(timeline[0]).toEqual({
      id: 'outline',
      start: 0,
      duration: tokens.motion.drawOutline,
    });

    expect(timeline[1]).toEqual({
      id: 'fill',
      start: tokens.motion.drawOutline,
      duration: tokens.motion.base,
    });

    expect(timeline[2]).toEqual({
      id: 'annotate',
      start: tokens.motion.drawOutline + tokens.motion.base,
      duration: tokens.motion.slow,
    });
  });

  it('reducedMotion: true ustawia wszystkie duration = 0 i start = 0', () => {
    const timeline = buildIntroTimeline({
      reducedMotion: true,
      motion: tokens.motion,
    });

    expect(timeline).toEqual([
      { id: 'outline', start: 0, duration: 0 },
      { id: 'fill', start: 0, duration: 0 },
      { id: 'annotate', start: 0, duration: 0 },
    ]);
  });

  it('totalDuration zwraca sumę czasów trwania etapów', () => {
    const normalTimeline = buildIntroTimeline({
      reducedMotion: false,
      motion: tokens.motion,
    });
    const expectedTotal =
      tokens.motion.drawOutline + tokens.motion.base + tokens.motion.slow;
    expect(totalDuration(normalTimeline)).toBe(expectedTotal);

    const reducedTimeline = buildIntroTimeline({
      reducedMotion: true,
      motion: tokens.motion,
    });
    expect(totalDuration(reducedTimeline)).toBe(0);
  });

  it('stageAt wylicza etap i progress (0-1) dla danego t w ms w trybie zwykłym', () => {
    const timeline = buildIntroTimeline({
      reducedMotion: false,
      motion: tokens.motion,
    });

    // Przed startem (t < 0)
    expect(stageAt(timeline, -50)).toEqual({ id: 'outline', progress: 0 });

    // Poczatek outline (t = 0)
    expect(stageAt(timeline, 0)).toEqual({ id: 'outline', progress: 0 });

    // Srodek outline (t = 600)
    expect(stageAt(timeline, 600)).toEqual({ id: 'outline', progress: 0.5 });

    // Koniec outline / poczatek fill (t = 1200)
    expect(stageAt(timeline, 1200)).toEqual({ id: 'fill', progress: 0 });

    // Srodek fill (t = 1350)
    expect(stageAt(timeline, 1350)).toEqual({ id: 'fill', progress: 0.5 });

    // Koniec fill / poczatek annotate (t = 1500)
    expect(stageAt(timeline, 1500)).toEqual({ id: 'annotate', progress: 0 });

    // Srodek annotate (t = 1800)
    expect(stageAt(timeline, 1800)).toEqual({ id: 'annotate', progress: 0.5 });

    // Koniec animacji (t = 2100)
    expect(stageAt(timeline, 2100)).toEqual({ id: 'annotate', progress: 1 });

    // Po koncu animacji (t > 2100)
    expect(stageAt(timeline, 3000)).toEqual({ id: 'annotate', progress: 1 });
  });

  it('stageAt dla reducedMotion zwroci przed startem progress 0, a od startu ostatni etap z progress 1', () => {
    const timeline = buildIntroTimeline({
      reducedMotion: true,
      motion: tokens.motion,
    });

    expect(stageAt(timeline, -10)).toEqual({ id: 'outline', progress: 0 });
    expect(stageAt(timeline, 0)).toEqual({ id: 'annotate', progress: 1 });
    expect(stageAt(timeline, 1000)).toEqual({ id: 'annotate', progress: 1 });
  });

  it('zrodlo timeline.ts nie zawiera zahardkodowanych liczb 1200, 300, 600', () => {
    const filePath = path.resolve(__dirname, '../../src/core/motion/timeline.ts');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).not.toMatch(/\b1200\b/);
    expect(source).not.toMatch(/\b300\b/);
    expect(source).not.toMatch(/\b600\b/);
  });
});
