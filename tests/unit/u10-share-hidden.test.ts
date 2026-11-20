import { afterEach, describe, expect, it, vi } from 'vitest';
import { isShareEnabled } from '../../src/core/share/share-flag';

function stubWindow(search: string, store: Record<string, string> = {}) {
  vi.stubGlobal('window', {
    location: { search },
    sessionStorage: {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isShareEnabled (U10)', () => {
  it('domyślnie jest wyłączony', () => {
    stubWindow('');
    expect(isShareEnabled()).toBe(false);
    stubWindow('?u=14&i=b1');
    expect(isShareEnabled()).toBe(false);
  });

  it('bez window (render po stronie serwera) jest wyłączony', () => {
    vi.stubGlobal('window', undefined);
    expect(isShareEnabled()).toBe(false);
  });

  it('z ?share=1 jest włączony', () => {
    stubWindow('?share=1');
    expect(isShareEnabled()).toBe(true);
    stubWindow('?u=14&share=1');
    expect(isShareEnabled()).toBe(true);
  });

  it('inne wartości ?share nie włączają', () => {
    stubWindow('?share=0');
    expect(isShareEnabled()).toBe(false);
    stubWindow('?share=true');
    expect(isShareEnabled()).toBe(false);
  });

  it('po wejściu z ?share=1 zostaje włączony na stronie bez parametru', () => {
    const store: Record<string, string> = {};
    stubWindow('?share=1', store);
    expect(isShareEnabled()).toBe(true);
    stubWindow('', store);
    expect(isShareEnabled()).toBe(true);
    stubWindow('', {});
    expect(isShareEnabled()).toBe(false);
  });
});
