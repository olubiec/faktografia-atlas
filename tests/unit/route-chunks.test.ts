import { describe, it, expect, vi } from 'vitest';
import { routeKeyFromHref, prefetchRoute, routeChunks } from '../../src/view/layout/route-chunks';

const origin = 'https://atlas.example';

describe('routeKeyFromHref', () => {
  it('mapuje znane ścieżki na klucze', () => {
    expect(routeKeyFromHref('/rankingi', origin)).toBe('Rankings');
    expect(routeKeyFromHref('/porownaj', origin)).toBe('ComparePage');
    expect(routeKeyFromHref('/biblioteka', origin)).toBe('Library');
    expect(routeKeyFromHref('/o-projekcie', origin)).toBe('About');
    expect(routeKeyFromHref('/zrodla', origin)).toBe('Sources');
    expect(routeKeyFromHref('/prywatnosc', origin)).toBe('Privacy');
    expect(routeKeyFromHref('/kontakt', origin)).toBe('Contact');
    expect(routeKeyFromHref('/zastrzezenie', origin)).toBe('DataDisclaimer');
  });
  it('ignoruje query i hash', () => {
    expect(routeKeyFromHref('/rankingi?u=12#a', origin)).toBe('Rankings');
    expect(routeKeyFromHref(`${origin}/porownaj?c=1`, origin)).toBe('ComparePage');
  });
  it('/biblioteka/:id wskazuje LibraryVariable', () => {
    expect(routeKeyFromHref('/biblioteka/60614', origin)).toBe('LibraryVariable');
  });
  it('inny origin, strona główna i nieznane to null', () => {
    expect(routeKeyFromHref('https://inna.example/rankingi', origin)).toBeNull();
    expect(routeKeyFromHref('/', origin)).toBeNull();
    expect(routeKeyFromHref('/?u=12', origin)).toBeNull();
    expect(routeKeyFromHref('/nie-ma', origin)).toBeNull();
    expect(routeKeyFromHref('/design', origin)).toBeNull();
    expect(routeKeyFromHref('/__test/ui', origin)).toBeNull();
  });
});

describe('prefetchRoute', () => {
  it('wywołuje import najwyżej raz na klucz', async () => {
    const fn = vi.fn<() => Promise<unknown>>().mockResolvedValue({});
    const chunks = { ...routeChunks, Rankings: fn };
    await prefetchRoute('Rankings', chunks);
    await prefetchRoute('Rankings', chunks);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('odrzucony import pozwala spróbować ponownie', async () => {
    const fn = vi.fn<() => Promise<unknown>>().mockRejectedValueOnce(new Error('sieć')).mockResolvedValue({});
    const chunks = { ...routeChunks, ComparePage: fn };
    await expect(prefetchRoute('ComparePage', chunks)).resolves.toBeUndefined();
    await prefetchRoute('ComparePage', chunks);
    expect(fn).toHaveBeenCalledTimes(2);
    await prefetchRoute('ComparePage', chunks);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
