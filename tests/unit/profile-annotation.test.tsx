import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileSheetMobile } from '../../src/view/profile/ProfileSheetMobile';
import profileSample from '../fixtures/synthetic/profile-sample.json';

// Zapisujemy opcje przekazane do rough-notation oraz uruchamiamy efekty od razu (bez DOM).
const annotateCalls: Array<Record<string, unknown>> = [];
let refCall = 0;
vi.mock('rough-notation', () => ({
  annotate: (_el: unknown, options: Record<string, unknown>) => {
    annotateCalls.push(options);
    return { show: () => {}, hide: () => {}, remove: () => {} };
  },
}));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  const patched = {
    ...actual,
    useEffect: (fn: () => void) => {
      fn();
    },
    // Kolejność w Annotate: containerRef, targetRef (potrzebuje elementu), annotationRef
    useRef: (init: unknown) => ({ current: init === null && refCall++ % 3 === 1 ? {} : init }),
  };
  return { ...patched, default: patched };
});

function stubBrowser(reduced: boolean) {
  const noop = class {
    observe() {}
    disconnect() {}
  };
  vi.stubGlobal('window', {
    matchMedia: () => ({
      matches: reduced,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }),
    innerHeight: 740,
    ResizeObserver: noop,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '' },
  });
  vi.stubGlobal('document', { documentElement: {}, body: {}, querySelector: () => null });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => cb());
  vi.stubGlobal('ResizeObserver', noop);
  vi.stubGlobal('MutationObserver', noop);
}

describe('P1-D zakreślenie liczby w profilu (arkusz mobilny)', () => {
  beforeEach(() => {
    annotateCalls.length = 0;
    refCall = 0;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('treść arkusza jest w kolumnie z overflow-x-clip, więc zakreślenie "4 451,0" nie wychodzi poza kolumnę (390 px)', () => {
    const profile = buildProfile(
      '0201011',
      profileSample.indicators as any,
      profileSample.valuesById as any,
      profileSample.units as any
    );
    stubBrowser(false);
    const html = renderToString(
      <ProfileSheetMobile
        isOpen={true}
        profile={profile}
        units={profileSample.units as any}
        onClose={() => {}}
      />
    );
    const m = html.match(/<div[^>]*data-testid="profile-sheet-column"[^>]*>/);
    expect(m).not.toBeNull();
    expect(m![0]).toContain('overflow-x-clip');
    expect(m![0]).toContain('min-w-0');
    expect(m![0]).toContain('max-w-full');
    // Kolumna owija całą treść profilu
    expect(html.indexOf('profile-sheet-column')).toBeLessThan(html.indexOf('TERYT 0201011'));
  });

  it('przy prefers-reduced-motion zakreślenie ma animate = false', async () => {
    stubBrowser(true);
    const { Annotate } = await import('../../src/view/annotation/Annotate');
    renderToString(
      <Annotate type="circle">
        <span>4 451,0</span>
      </Annotate>
    );
    expect(annotateCalls.length).toBeGreaterThan(0);
    expect(annotateCalls.every((o) => o.animate === false)).toBe(true);
  });

  it('bez reduced-motion zakreślenie jest animowane (animate = true)', async () => {
    stubBrowser(false);
    const { Annotate } = await import('../../src/view/annotation/Annotate');
    renderToString(
      <Annotate type="circle">
        <span>4 451,0</span>
      </Annotate>
    );
    expect(annotateCalls.length).toBeGreaterThan(0);
    expect(annotateCalls.every((o) => o.animate === true)).toBe(true);
  });
});
