import { describe, expect, it } from 'vitest';
import { formatSource, formatValue } from '../../src/core/format/number';
import indicators from '../../config/indicators.json';

describe('formatValue', () => {
  it('zwraca "brak danych" dla null oraz undefined', () => {
    expect(formatValue(null)).toBe('brak danych');
    expect(formatValue(null, '%')).toBe('brak danych');
    expect(formatValue(null, 'zł')).toBe('brak danych');
    expect(formatValue(undefined)).toBe('brak danych');
  });

  it('formatuje liczby 0, 1234.5, 1000000 i ujemne z niełamiącą spacją i przecinkiem dziesiętnym', () => {
    expect(formatValue(0)).toBe('0');
    expect(formatValue(1234.5)).toBe('1\u00A0234,5');
    expect(formatValue(1000000)).toBe('1\u00A0000\u00A0000');
    expect(formatValue(-1234.5)).toBe('-1\u00A0234,5');
  });

  it('dodaje niełamiącą spację przed % oraz zł', () => {
    expect(formatValue(12.3, '%')).toBe('12,3\u00A0%');
    expect(formatValue(0, '%')).toBe('0,0\u00A0%');
    expect(formatValue(1234, 'zł')).toBe('1\u00A0234\u00A0zł');
    expect(formatValue(0, 'zł')).toBe('0\u00A0zł');
    expect(formatValue(-1000000, 'zł')).toBe('-1\u00A0000\u00A0000\u00A0zł');
  });

  it('dobiera odpowiednią liczbę miejsc po przecinku dla jednostek z config/indicators.json', () => {
    const uniqueUnits = Array.from(new Set(indicators.map((ind) => ind.unit)));

    expect(uniqueUnits).toContain('osoba');
    expect(uniqueUnits).toContain('os./km²');
    expect(uniqueUnits).toContain('na 1000');
    expect(uniqueUnits).toContain('%');
    expect(uniqueUnits).toContain('lata');
    expect(uniqueUnits).toContain('zł');
    expect(uniqueUnits).toContain('na 10 tys.');
    expect(uniqueUnits).toContain('m²');

    expect(formatValue(12.34, '%')).toBe('12,3\u00A0%');
    expect(formatValue(1234.56, 'zł')).toBe('1\u00A0235\u00A0zł');
    expect(formatValue(72305, 'osoba')).toBe('72\u00A0305\u00A0osoba');
    expect(formatValue(100.8, 'osoby')).toBe('101\u00A0osoby');
    expect(formatValue(3.456, 'na 1000')).toBe('3,5\u00A0na 1000');
    expect(formatValue(102.5, 'os./km²')).toBe('102,5\u00A0os./km²');
    expect(formatValue(42.1, 'na 10 tys.')).toBe('42,1\u00A0na 10 tys.');
    expect(formatValue(28.4, 'm²')).toBe('28,4\u00A0m²');
    expect(formatValue(41.2, 'lata')).toBe('41,2\u00A0lata');
  });
});

describe('formatSource', () => {
  it('formatuje źródło z podanym rokiem', () => {
    expect(formatSource(2023)).toBe('Źródło: GUS, BDL, 2023');
    expect(formatSource('2024')).toBe('Źródło: GUS, BDL, 2024');
  });

  it('formatuje źródło bez roku gdy rok jest nieobecny lub null', () => {
    expect(formatSource(null)).toBe('Źródło: GUS, BDL');
    expect(formatSource()).toBe('Źródło: GUS, BDL');
  });
});
