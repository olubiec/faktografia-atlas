import { describe, it, expect } from 'vitest';
import { isSameView, SAME_VIEW_PX } from '@/core/map/camera-plan';

const base = { longitude: 20, latitude: 50, zoom: 8 };
const degPerPx = 360 / (512 * 2 ** base.zoom);

describe('isSameView (@Q404)', () => {
  it('ten sam widok to „bez ruchu”', () => {
    expect(isSameView(base, { ...base })).toBe(true);
  });
  it('przesunięcie poniżej progu w pikselach nadal jest tym samym widokiem', () => {
    const to = { ...base, longitude: base.longitude + degPerPx * (SAME_VIEW_PX * 0.5) };
    expect(isSameView(base, to)).toBe(true);
  });
  it('podobny zoom, ale środek o setki km dalej, to już ruch', () => {
    expect(isSameView(base, { ...base, longitude: base.longitude + 2 })).toBe(false);
    expect(isSameView(base, { ...base, latitude: base.latitude + 1 })).toBe(false);
  });
  it('zmiana zoomu o 0,05 lub więcej to ruch', () => {
    expect(isSameView(base, { ...base, zoom: base.zoom + 0.05 })).toBe(false);
    expect(isSameView(base, { ...base, zoom: base.zoom - 0.2 })).toBe(false);
  });
});
