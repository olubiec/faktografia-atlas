import { describe, expect, it } from 'vitest';
import { legacyRedirect } from '../../src/core/url/legacy-links';
import { START_PAIRS, START_PLACES } from '../../src/core/start/examples';

// B03: stare linki `/?u=…` prowadzą na `/mapa` z tym samym zapisem; goły `/` to ekran startowy.
describe('legacyRedirect (B03)', () => {
  const cases: Array<[string, string, string | null]> = [
    ['/', '', null],
    ['/', '?logo=znak', null],
    ['/', '?e2e', null],
    ['/', '?tune', null],
    ['/', '?x=1', null],
    ['/', '?u=1217', '/mapa?u=1217'],
    ['/', '?i=density', '/mapa?i=density'],
    ['/', '?y=2023', '/mapa?y=2023'],
    ['/', '?l=pow', '/mapa?l=pow'],
    ['/', '?c=1217,1801', '/mapa?c=1217,1801'],
    ['/', '?sheet=full', '/mapa?sheet=full'],
    ['/', '?u=1217&i=density&y=2023&l=pow&e2e', '/mapa?u=1217&i=density&y=2023&l=pow&e2e'],
    ['/', '?e2e&logo=znak&tune=1&u=12', '/mapa?e2e&logo=znak&tune=1&u=12'],
    ['/', '?foo=bar&u=12&zzz', '/mapa?foo=bar&u=12&zzz'],
    ['/mapa', '?u=1217', null],
    ['/mapa', '', null],
    ['/o-projekcie', '?u=12', null],
    ['/rankingi', '?u=12', null],
    ['/biblioteka', '?i=density', null],
    ['/porownaj', '?c=1,2', null],
  ];
  it.each(cases)('%s%s → %s', (pathname, search, expected) => {
    expect(legacyRedirect(pathname, search)).toBe(expected);
  });

  it('wynik przekierowania nie przekierowuje ponownie (brak pętli)', () => {
    const target = legacyRedirect('/', '?u=12&i=density');
    expect(target).not.toBeNull();
    const url = new URL(target!, 'https://x.test');
    expect(legacyRedirect(url.pathname, url.search)).toBeNull();
  });
});

describe('przykłady ekranu startowego (B03)', () => {
  it('ma 6 miejsc i 6 par, wszystkie linki prowadzą na /mapa', () => {
    expect(START_PLACES).toHaveLength(6);
    expect(START_PAIRS).toHaveLength(6);
    for (const p of START_PLACES) expect(p.href).toBe(`/mapa?u=${p.teryt}`);
    for (const p of START_PAIRS) expect(p.href).toBe(`/mapa?c=${p.teryt1},${p.teryt2}`);
  });
  it('kody TERYT są tekstem', () => {
    for (const p of START_PLACES) expect(typeof p.teryt).toBe('string');
  });
});
