import { describe, expect, it } from 'vitest';
import { appliesToUnit } from '../../src/core/profile/applicability';
import { overviewItem } from '../../src/core/profile/overview-item';
import { readingNotes } from '../../src/core/explain/reading-notes';

describe('appliesToUnit', () => {
  it('„miasta na prawach powiatu” nie dotyczy gminy wiejskiej', () => {
    expect(appliesToUnit('miasta na prawach powiatu – wydatki', '1201032')).toBe(false);
    expect(appliesToUnit('Miasta na prawach powiatu – wydatki', '1261011')).toBe(true);
    expect(appliesToUnit('miasta na prawach powiatu – wydatki', '1261')).toBe(true);
  });
  it('„gminy bez miast…” nie dotyczy miasta na prawach powiatu', () => {
    expect(appliesToUnit('gminy bez miast na prawach powiatu – wydatki', '1261011')).toBe(false);
    expect(appliesToUnit('gminy bez miast na prawach powiatu – wydatki', '1201032')).toBe(true);
  });
  it('województwo i zwykłe nazwy – zawsze dotyczą', () => {
    expect(appliesToUnit('miasta na prawach powiatu – wydatki', '12')).toBe(true);
    expect(appliesToUnit('Ludność ogółem', '1201032')).toBe(true);
  });
  it('overviewItem daje brak wartości, gdy wskaźnik nie dotyczy jednostki', () => {
    const values = { years: [2024], values: { '1201032': [0] } } as never;
    expect(overviewItem(values, '1201032', 2024, 'miasta na prawach powiatu – wydatki').value).toBeNull();
    expect(overviewItem(values, '1201032', 2024, 'Ludność').value).toBe(0);
  });
});

describe('readingNotes', () => {
  it('procenty: wyjaśnia, że powyżej 100% to nie błąd', () => {
    expect(readingNotes('Dzieci w przedszkolach', '%').join(' ')).toMatch(/większa niż 100%/);
  });
  it('wskaźnik bez wskazówek – pusta lista', () => {
    expect(readingNotes('Ludność ogółem', 'osoba')).toEqual([]);
  });
  it('mediana i przeliczenie na mieszkańców', () => {
    expect(readingNotes('Mediana wynagrodzeń', 'zł').join(' ')).toMatch(/środkowa/);
    expect(readingNotes('Zgony', 'na 1000 mieszkańców').join(' ')).toMatch(/stałą liczbę/);
  });
});
