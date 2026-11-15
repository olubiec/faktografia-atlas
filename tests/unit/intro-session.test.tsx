import { describe, expect, it, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import tokens from '../../config/tokens.json';
import {
  PHONE_DURATION_RATIO,
  buildIntroTimeline,
  hasSeenIntro,
  markIntroSeen,
  totalDuration,
} from '../../src/core/motion/timeline';
import { IntroOverlay } from '../../src/view/map/IntroOverlay';

function makeStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => {
      store[k] = v;
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => undefined,
    length: 0,
    key: () => null,
  };
}

function stubWindow(storage: Storage | (() => never), opts: { reduced?: boolean } = {}) {
  const win = {
    location: { search: '' },
    innerWidth: 390,
    matchMedia: () => ({ matches: !!opts.reduced }),
    get sessionStorage() {
      if (typeof storage === 'function') return storage();
      return storage;
    },
  };
  vi.stubGlobal('window', win);
}

afterEach(() => vi.unstubAllGlobals());

describe('intro – czas na telefonie', () => {
  it('czas telefon <= 0,6 × desktop', () => {
    const desktop = totalDuration(buildIntroTimeline({ reducedMotion: false, motion: tokens.motion }));
    const phone = totalDuration(
      buildIntroTimeline({ reducedMotion: false, motion: tokens.motion, compact: true }),
    );
    expect(phone).toBeGreaterThan(0);
    expect(phone).toBeLessThanOrEqual(PHONE_DURATION_RATIO * desktop);
  });

  it('reduced-motion: czas 0 także w wersji kompaktowej', () => {
    const t = buildIntroTimeline({ reducedMotion: true, motion: tokens.motion, compact: true });
    expect(totalDuration(t)).toBe(0);
  });
});

describe('intro – raz na sesję', () => {
  it('helpery: pierwszy raz nie widziane, potem widziane', () => {
    const s = makeStorage();
    expect(hasSeenIntro(s)).toBe(false);
    markIntroSeen(s);
    expect(hasSeenIntro(s)).toBe(true);
  });

  it('helpery nie rzucają, gdy storage zawodzi', () => {
    const bad = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(hasSeenIntro(bad)).toBe(false);
    expect(() => markIntroSeen(bad)).not.toThrow();
  });

  it('pierwszy render pokazuje intro, drugi w tej samej sesji nie', () => {
    stubWindow(makeStorage());
    expect(renderToString(<IntroOverlay />)).toContain('<svg');
    expect(renderToString(<IntroOverlay />)).toBe('');
  });

  it('reduced-motion: mapa od razu, bez intra', () => {
    stubWindow(makeStorage(), { reduced: true });
    expect(renderToString(<IntroOverlay />)).toBe('');
  });

  it('niedostępny sessionStorage nie psuje renderu', () => {
    stubWindow(() => {
      throw new Error('blocked');
    });
    expect(renderToString(<IntroOverlay />)).toContain('<svg');
  });

  it('nakładka przyjmuje dotyk (pointer-events-auto), by móc przerwać intro', () => {
    stubWindow(makeStorage());
    expect(renderToString(<IntroOverlay />)).toContain('pointer-events-auto');
  });
});
