import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';

const { capture, optOut, reset, init } = vi.hoisted(() => ({
  capture: vi.fn<() => void>(),
  optOut: vi.fn<() => void>(),
  reset: vi.fn<() => void>(),
  init: vi.fn<() => void>(),
}));

vi.mock('posthog-js', () => ({
  default: { init, capture, opt_out_capturing: optOut, reset },
}));

// Środowisko testów to node (bez DOM): hooki zastępujemy prostymi atrapami
vi.mock('react', async (importActual) => {
  const actual = await importActual<typeof import('react')>();
  return {
    ...actual,
    useState: (v: unknown) => [typeof v === 'function' ? (v as () => unknown)() : v, vi.fn<() => void>()],
    useEffect: () => undefined,
  };
});

import { writeConsent, readConsent } from '../../src/core/consent/consent';
import {
  startAnalytics,
  trackSearch,
  resetAnalyticsForTesting,
} from '../../src/core/consent/analytics';
import { ConsentBar } from '../../src/view/consent/ConsentBar';
import { Privacy } from '../../src/view/pages/Privacy';

function createStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => undefined,
    length: 0,
    key: () => null,
  };
}

// Szuka w drzewie elementów przycisku o podanym tekście
function findButton(node: ReactNode, label: string): (() => void) | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findButton(n, label);
      if (r) return r;
    }
    return null;
  }
  const el = node as { type?: unknown; props?: { children?: ReactNode; onClick?: () => void } };
  const text = (c: ReactNode): string =>
    Array.isArray(c) ? c.map(text).join('') : typeof c === 'string' ? c : '';
  if (el.type === 'button' && el.props?.onClick && text(el.props.children).includes(label)) {
    return el.props.onClick;
  }
  return findButton(el.props?.children, label);
}

describe('Cofnięcie zgody zatrzymuje analitykę (N-47)', () => {
  beforeEach(() => {
    capture.mockClear();
    optOut.mockClear();
    reset.mockClear();
    resetAnalyticsForTesting();
  });

  it('ConsentBar: „Nie” po wcześniejszym starcie wyłącza wysyłanie', async () => {
    const storage = createStorage();
    writeConsent(storage, 'granted');
    expect(await startAnalytics('phc_test', storage)).toBe(true);
    trackSearch('Kraków');
    expect(capture).toHaveBeenCalledTimes(1);

    // Pasek pyta tylko, gdy zgody jeszcze nie ma – dostaje osobny, pusty magazyn
    const barStorage = createStorage();
    const deny = findButton(ConsentBar({ storage: barStorage }), 'Nie');
    expect(deny).toBeTypeOf('function');
    deny!();

    expect(readConsent(barStorage)).toBe('denied');
    expect(optOut).toHaveBeenCalled();
    capture.mockClear();
    trackSearch('Kraków');
    expect(capture).not.toHaveBeenCalled();
  });

  it('Privacy: cofnięcie zgody wyłącza wysyłanie od razu', async () => {
    const storage = createStorage();
    writeConsent(storage, 'granted');
    await startAnalytics('phc_test', storage);

    const revoke = findButton(Privacy(), 'Cofnij');
    expect(revoke).toBeTypeOf('function');
    revoke!();

    expect(optOut).toHaveBeenCalled();
    capture.mockClear();
    trackSearch('Kraków');
    expect(capture).not.toHaveBeenCalled();
  });
});
