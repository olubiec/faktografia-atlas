import { describe, expect, it } from 'vitest';
import { legacyRedirect } from '../../src/core/url/legacy-links';

// B06 (R2): stare adresy Biblioteki prowadzą na mapę. Znany spis wskaźników (jeśli jest) rozstrzyga o `/biblioteka/<id>`.
describe('legacyRedirect: /biblioteka* (B06, R2)', () => {
  const known = new Set(['b101', 'b3001']);

  it('/biblioteka → /mapa?menu=dane', () => {
    expect(legacyRedirect('/biblioteka', '')).toBe('/mapa?menu=dane');
    expect(legacyRedirect('/biblioteka/', '')).toBe('/mapa?menu=dane');
  });

  it('/biblioteka?k=…&q=fraza → /mapa?menu=dane&q=fraza (kategoria „k” znika)', () => {
    expect(legacyRedirect('/biblioteka', '?k=1&q=ludnosc')).toBe('/mapa?menu=dane&q=ludnosc');
    expect(legacyRedirect('/biblioteka', '?q=ludnosc')).toBe('/mapa?menu=dane&q=ludnosc');
    expect(legacyRedirect('/biblioteka', '?k=3')).toBe('/mapa?menu=dane');
    expect(legacyRedirect('/biblioteka', '?q=')).toBe('/mapa?menu=dane');
  });

  it('fraza ze spacją i polskimi znakami jest zakodowana raz', () => {
    expect(legacyRedirect('/biblioteka', '?q=stopa%20bezrobocia')).toBe('/mapa?menu=dane&q=stopa+bezrobocia');
    expect(legacyRedirect('/biblioteka', '?q=zażółć')).toBe(`/mapa?menu=dane&q=${encodeURIComponent('zażółć')}`);
  });

  it('/biblioteka/101 → /mapa?i=b101', () => {
    expect(legacyRedirect('/biblioteka/101', '')).toBe('/mapa?i=b101');
    expect(legacyRedirect('/biblioteka/101', '', known)).toBe('/mapa?i=b101');
  });

  it('nieistniejące /biblioteka/999 → /mapa (bez błędu)', () => {
    expect(legacyRedirect('/biblioteka/999', '', known)).toBe('/mapa');
    expect(legacyRedirect('/biblioteka/abc', '')).toBe('/mapa');
  });

  it('cztery formy razem', () => {
    const forms: Array<[string, string, string]> = [
      ['/biblioteka', '', '/mapa?menu=dane'],
      ['/biblioteka', '?k=1&q=ludnosc', '/mapa?menu=dane&q=ludnosc'],
      ['/biblioteka/101', '', '/mapa?i=b101'],
      ['/biblioteka/999', '', '/mapa'],
    ];
    for (const [path, search, expected] of forms) expect(legacyRedirect(path, search, known)).toBe(expected);
  });

  it('inne adresy zostają bez zmian', () => {
    expect(legacyRedirect('/biblioteka-x', '')).toBeNull();
    expect(legacyRedirect('/mapa', '?menu=dane')).toBeNull();
  });
});
