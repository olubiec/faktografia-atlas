import { describe, expect, it } from 'vitest';
import { entryViewState, projectBbox } from '@/core/map/entry-frame';
import { posterRect } from '@/core/start/poster-frame';
import { takeEntry, setEntry } from '@/core/map/entry-handoff';

const BBOX: [number, number, number, number] = [14.1234, 49.0069, 24.1455, 54.8353];

describe('M3 · kadr wejścia mapy', () => {
  for (const [vw, vh, c] of [
    [390, 844, { left: 0, top: 56, width: 390, height: 788 }],
    [1440, 900, { left: 320, top: 72, width: 1120, height: 828 }],
  ] as const) {
    it(`Polska w kadrze wejścia leży tam, gdzie plakat (${vw}×${vh}, kontener z przesunięciem)`, () => {
      const poster = posterRect(BBOX, vw, vh);
      const view = entryViewState(BBOX, poster, c);
      const r = projectBbox(BBOX, view, c);
      // Prostokąt na ekranie okna = prostokąt w kontenerze + przesunięcie kontenera.
      expect(Math.abs(r.left + c.left - poster.left)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(r.top + c.top - poster.top)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(r.width - poster.width)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(r.height - poster.height)).toBeLessThanOrEqual(0.5);
    });
  }

  it('przekazanie wejścia: odczyt kasuje je (tylko jedna mapa je zużywa)', () => {
    setEntry({ bbox: BBOX, viewport: { width: 390, height: 844 } });
    expect(takeEntry()?.bbox).toEqual(BBOX);
    expect(takeEntry()).toBeNull();
  });

  it('wejście wygasa po kilku sekundach (stare kliknięcie nie psuje późniejszej wizyty)', () => {
    setEntry({ bbox: BBOX, viewport: { width: 390, height: 844 } }, 1000);
    expect(takeEntry(1000 + 8000)).toBeNull();
  });
});
