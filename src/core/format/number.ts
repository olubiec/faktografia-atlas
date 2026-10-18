/**
 * Mapa liczby miejsc po przecinku w zależności od jednostki wskaźnika.
 */
export const UNIT_FRACTION_DIGITS: Record<string, number> = {
  'osoba': 0,
  'osoby': 0,
  'zł': 0,
  '%': 1,
  'na 1000': 1,
  'na 10 tys.': 1,
  'os./km²': 1,
  'm²': 1,
  'lata': 1,
};

/**
 * Zwraca domyślną liczbę miejsc po przecinku dla danej jednostki.
 */
export function getFractionDigits(unit?: string | null): number {
  if (!unit) {
    return 1;
  }
  const trimmed = unit.trim();
  if (trimmed in UNIT_FRACTION_DIGITS) {
    return UNIT_FRACTION_DIGITS[trimmed];
  }
  return 1;
}

/**
 * Formatuje liczbę zgodnie z polską konwencją (Intl.NumberFormat('pl-PL')).
 * Używa niełamiącej spacji jako separatora tysięcy oraz przecinka dziesiętnego.
 * Dodaje niełamiącą spację przed jednostką (np. %, zł, osoba).
 * Dla null / undefined / NaN zwraca "brak danych".
 */
export function formatValue(
  value: number | null | undefined,
  unit?: string | null,
  customFractionDigits?: number,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'brak danych';
  }

  const fractionDigits =
    customFractionDigits ??
    (unit ? getFractionDigits(unit) : Number.isInteger(value) ? 0 : 1);

  const formatter = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    useGrouping: 'always',
  });

  // W V8/ICU separatorem tysięcy jest spacja niełamiąca \u00A0 lub wąska \u202F.
  // Ujednolicamy do klasycznej spacji niełamiącej \u00A0.
  const formattedNumber = formatter
    .format(value)
    .replace(/\u202F/g, '\u00A0');

  if (!unit) {
    return formattedNumber;
  }

  const cleanUnit = unit.trim();
  if (!cleanUnit) {
    return formattedNumber;
  }

  return `${formattedNumber}\u00A0${cleanUnit}`;
}

/**
 * Formatuje źródło danych dla danej liczby / wskaźnika.
 * Wartość domyślna: "Źródło: GUS, BDL, <rok>".
 */
export function formatSource(year?: number | string | null): string {
  if (year === null || year === undefined || String(year).trim() === '') {
    return 'Źródło: GUS, BDL';
  }
  return `Źródło: GUS, BDL, ${year}`;
}
