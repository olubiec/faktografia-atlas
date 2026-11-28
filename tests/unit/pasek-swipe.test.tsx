import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { IndicatorStrip } from '@/view/start/IndicatorStrip';
import { useSwipe } from '@/view/start/useSwipe';

type Handlers = ReturnType<typeof useSwipe>;
function handlers(onPrev: () => void, onNext: () => void): Handlers {
  const found: Handlers[] = [];
  function Probe({ out }: { out: (h: Handlers) => void }) {
    out(useSwipe(onPrev, onNext));
    return null;
  }
  renderToString(<Probe out={(h) => found.push(h)} />);
  const h = found[0];
  if (!h) throw new Error('brak uchwytów');
  return h;
}
const touch = (x: number, y: number) => ({ touches: [{ clientX: x, clientY: y }], changedTouches: [{ clientX: x, clientY: y }] }) as never;

describe('pasek wskaźników: przesuwanie palcem', () => {
  it('pasek ma uchwyty dotyku i pozwala na pionowe przewijanie strony', () => {
    const html = renderToString(<IndicatorStrip size={5} itemAt={(i) => ({ key: String(i), title: `W${i}` })} active={2} onSelect={() => {}} panelId="p" idBase="b" />);
    expect(html).toContain('touch-pan-y');
  });
  it('ruch w lewo = następny, w prawo = poprzedni, w pionie nic', () => {
    const prev = vi.fn<() => void>();
    const next = vi.fn<() => void>();
    const h = handlers(prev, next);
    h.onTouchStart(touch(200, 100));
    h.onTouchEnd(touch(100, 105));
    expect(next).toHaveBeenCalledTimes(1);
    h.onTouchStart(touch(100, 100));
    h.onTouchEnd(touch(200, 100));
    expect(prev).toHaveBeenCalledTimes(1);
    h.onTouchStart(touch(100, 100));
    h.onTouchEnd(touch(100, 260));
    expect(prev).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
