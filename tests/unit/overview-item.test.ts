import { describe, expect, it } from 'vitest';
import { overviewItem } from '../../src/core/profile/overview-item';
import { formatValue } from '../../src/core/format/number';

const values = {
  years: [2023, 2024, 2025],
  values: { '1': [600000, 640000, 653000], '2': [null, null, null] } as Record<string, (number | null)[]>,
};

describe('overviewItem – wartość z wybranego wskaźnika i roku', () => {
  it('bierze wartość z roku widoku, nie z innego wskaźnika', () => {
    const it = overviewItem(values, '1', 2025);
    expect(it.value).toBe(653000);
    expect(it.year).toBe(2025);
    expect(it.series).toEqual([
      { year: 2023, value: 600000 },
      { year: 2024, value: 640000 },
      { year: 2025, value: 653000 },
    ]);
  });
  it('rok wcześniejszy daje wartość z tego roku', () => {
    expect(overviewItem(values, '1', 2024).value).toBe(640000);
  });
  it('brak wartości = null, bez podstawiania czegokolwiek', () => {
    expect(overviewItem(values, '2', 2025).value).toBeNull();
    expect(overviewItem(values, '999', 2025).value).toBeNull();
    expect(overviewItem(null, '1', 2025).value).toBeNull();
    expect(overviewItem(values, '1', null).value).toBeNull();
    expect(overviewItem(values, '1', 1999).value).toBeNull();
  });
  it('sformatowana wartość ma jednostkę wskaźnika', () => {
    expect(formatValue(overviewItem(values, '1', 2025).value! / 1000, 'tys. zł')).toContain('653');
  });
});
