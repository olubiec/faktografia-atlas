import { describe, expect, it } from 'vitest';
import { LOCALITIES_MAX_BYTES, serialize } from '../../scripts/geo/localities-parse.mjs';

// Dane syntetyczne do testu: lista o rozmiarze zbliżonym do prawdziwego pliku z PRNG (ok. 5,5 MB).
const makeList = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: String(100000 + i),
    name: `Miejscowość testowa ${i}`,
    gminaTeryt: '1217011',
    lon: 19.1234,
    lat: 50.1234,
    kind: 'wieś',
  }));

describe('serialize: limit rozmiaru localities.json (CC5.3c)', () => {
  it('limit to 8 MB', () => {
    expect(LOCALITIES_MAX_BYTES).toBe(8 * 1024 * 1024);
  });

  it('przyjmuje plik ok. 5,5 MB (prawdziwy rozmiar rejestru PRNG)', () => {
    const list = makeList(55000);
    const bytes = Buffer.byteLength(JSON.stringify(list), 'utf8');
    expect(bytes).toBeGreaterThan(5 * 1024 * 1024);
    expect(() => serialize(list)).not.toThrow();
  });

  it('odrzuca plik większy niż 8 MB', () => {
    expect(() => serialize(makeList(90000))).toThrow(/exceeds limit/);
  });
});
