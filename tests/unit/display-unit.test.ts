import { describe, expect, it } from 'vitest';
import { displayUnit, formatValue } from '@/core/format/number';

describe('jednostki po liczbie (polska odmiana)', () => {
  it('„osoba” z GUS pokazujemy jako „osób”', () => {
    expect(displayUnit('osoba')).toBe('osób');
    expect(displayUnit('osoby')).toBe('osób');
    expect(formatValue(81016, 'osoba')).toBe('81 016 osób');
    expect(formatValue(81016, 'osoba')).not.toMatch(/osoba/);
  });

  it('zapisy m2 i km2 z GUS dostają indeks górny, inne jednostki bez zmian', () => {
    expect(displayUnit('m2')).toBe('m²');
    expect(displayUnit('km2')).toBe('km²');
    expect(displayUnit('zł')).toBe('zł');
    expect(displayUnit(' % ')).toBe('%');
  });
});
