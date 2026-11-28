import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import { YouAreHere } from '../../src/view/start/YouAreHere';
import type { DistEntry } from '../../src/core/facts/percentile-types';

const dist: DistEntry = { m: 105, lo: 0, hi: 200, b: Array.from({ length: 20 }, (_, i) => 20 - i) };

describe('W32-O06 pasek „Na tle kraju”', () => {
  it('znacznik leży w przedziale wartości; poza zakresem – na krawędzi', () => {
    const bin = (v: number) => renderToString(<YouAreHere dist={dist} value={v} name="X" />).match(/data-marker="(\d+)"/)?.[1];
    expect(bin(32)).toBe('3');
    expect(bin(105)).toBe('10');
    expect(bin(-50)).toBe('0');
    expect(bin(9999)).toBe('19');
    const html = renderToString(<YouAreHere dist={dist} value={32} name="Maszewo" unitLabel="na 1000" />);
    expect(html).toContain('data-marker="3"');
    expect(html.match(/<rect/g)).toHaveLength(20);
  });
  it('aria-label zawiera nazwę, wartość i medianę; legenda tekstowa pod spodem', () => {
    const html = renderToString(<YouAreHere dist={dist} value={32} name="Maszewo" unitLabel="na 1000" />);
    expect(html).toMatch(/role="img"/);
    expect(html).toMatch(/aria-label="Maszewo: 32[^"]*; mediana gmin: 105[^"]*"/);
    expect(html).toContain('▲ Maszewo: 32');
  });
  it('brak dist = brak elementu svg', () => {
    expect(renderToString(<YouAreHere dist={null} value={1} name="X" />)).not.toContain('<svg');
    expect(renderToString(<YouAreHere dist={undefined} value={1} name="X" />)).toBe('');
  });
  it('tylko tokeny: bez klas korekta i bez kolorów wpisanych w kodzie', () => {
    const src = fs.readFileSync('src/view/start/YouAreHere.tsx', 'utf8');
    expect(src).not.toMatch(/korekta/);
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/);
    expect(src).not.toMatch(/animate|transition/);
  });
});
