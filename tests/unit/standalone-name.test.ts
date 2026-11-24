import { describe, expect, it } from 'vitest';
import { standaloneName } from '../../src/core/catalog/standalone-name';

const path = 'Ludność > Stan i struktura > Ludność wg płci i wieku';
describe('standaloneName', () => {
  it('dopisuje temat do samej cechy', () => {
    expect(standaloneName('ogółem – 0', path)).toBe('Ludność wg płci i wieku – ogółem – 0');
    expect(standaloneName('mężczyźni – 5', path)).toBe('Ludność wg płci i wieku – mężczyźni – 5');
  });
  it('zostawia nazwę z podmiotem', () => {
    expect(standaloneName('Ludność ogółem', path)).toBe('Ludność ogółem');
  });
  it('bez ścieżki nic nie zmienia', () => {
    expect(standaloneName('ogółem', null)).toBe('ogółem');
  });
});
