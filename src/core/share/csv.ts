import type { CompareRow } from '../compare/compare';
import type { Indicator, IndicatorValues, UnitProfile } from '../profile/profile';
import { rankUnits } from '../ranking/ranking';
import { unitTitle } from '../units/label';
import type { Unit } from '../units/types';

const SOURCE_TEXT = 'GUS, Bank Danych Lokalnych (CC BY 4.0)';

const DIACRITICS_MAP: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
};

/**
 * Zamienia ciąg znaków na czytelny identyfikator ASCII w nazwie pliku.
 * Usuwa polskie znaki, spacje i znaki specjalne, zastępując je pojedynczymi myślnikami.
 */
function slugify(text: string): string {
  let result = text;
  for (const [key, value] of Object.entries(DIACRITICS_MAP)) {
    result = result.replaceAll(key, value);
  }
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  result = result.replace(/[^a-zA-Z0-9]+/g, '-');
  result = result.toLowerCase().replace(/^-+|-+$/g, '');
  return result;
}

/**
 * Generuje bezpieczną nazwę pliku ASCII bez polskich znaków i spacji.
 * Np. shareFileName('faktografia', ['gęstość zaludnienia', 'powiaty', 2024], 'csv')
 * -> 'faktografia-gestosc-zaludnienia-powiaty-2024.csv'
 */
export function shareFileName(
  kind: string,
  parts: (string | number | null | undefined)[],
  ext: string,
): string {
  const allParts = [kind, ...parts].filter((p) => p !== null && p !== undefined && p !== '');
  const slugParts = allParts.map((p) => slugify(String(p))).filter((p) => p.length > 0);
  const slug = slugParts.join('-');
  const cleanExt = ext.replace(/^\.+/, '').toLowerCase();
  return `${slug}.${cleanExt}`;
}

/**
 * Formatuje pojedynczą komórkę tabeli CSV.
 * - null / undefined / NaN -> puste pole ""
 * - liczby -> przecinek dziesiętny, bez spacji tysięcy
 * - wartości ze średnikiem, cudzysłowem lub nową linią -> w cudzysłowie z podwojonym cudzysłowem
 */
function formatCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'number') {
    if (Number.isNaN(val) || !Number.isFinite(val)) {
      return '';
    }
    return String(val).replace('.', ',');
  }
  const str = String(val);
  if (/[;\r\n"]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Konwertuje nagłówki i wiersze do formatu CSV.
 * Generuje nagłówek UTF-8 BOM, separator ';', przecinek dziesiętny i końce linii \r\n.
 */
export function toCsv(
  columns: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const headerLine = columns.map(formatCell).join(';');
  const rowLines = rows.map((row) => row.map(formatCell).join(';'));
  const lines = [headerLine, ...rowLines];
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

/**
 * Generuje tabelę CSV dla widoku wskaźnika (zbiorcza tabela jednostek dla danego wskaźnika i roku).
 * Kolumny: TERYT; Nazwa; Poziom; <Nazwa wskaźnika> (<jednostka>); Rok; Miejsce; Źródło
 */
export function indicatorTableCsv(
  units: Unit[],
  values: IndicatorValues,
  indicator: Indicator,
  year: number,
): string {
  const valueColName = indicator.unit ? `${indicator.name} (${indicator.unit})` : indicator.name;
  const columns = ['TERYT', 'Nazwa', 'Poziom', valueColName, 'Rok', 'Miejsce', 'Źródło'];

  const ranked = rankUnits({
    values,
    units,
    level: indicator.minLevel,
    year,
    higherIsBetter: indicator.higherIsBetter,
  });

  const rankedTeryts = new Set(ranked.items.map((r) => r.teryt));

  const rows: (string | number | null | undefined)[][] = [];

  for (const item of ranked.items) {
    const u = units.find((x) => x.teryt === item.teryt);
    const level = u ? u.level : indicator.minLevel;
    rows.push([item.teryt, item.name, level, item.value, year, item.rank, SOURCE_TEXT]);
  }

  // Dołącz jednostki szczebla bez danych dla tego roku
  const missingUnits = units.filter((u) => u.level === indicator.minLevel && !rankedTeryts.has(u.teryt));
  missingUnits.sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  for (const u of missingUnits) {
    rows.push([u.teryt, u.name, u.level, null, year, null, SOURCE_TEXT]);
  }

  return toCsv(columns, rows);
}

/**
 * Generuje tabelę CSV dla profilu jednostki (jeden wiersz na wskaźnik).
 */
export function profileCsv(profile: UnitProfile): string {
  const columns = [
    'TERYT',
    'Nazwa',
    'Wskaźnik',
    'Grupa',
    'Jednostka',
    'Rok',
    'Wartość',
    'Miejsce w Polsce',
    'Miejsce w województwie',
    'Źródło',
  ];

  const unitName = profile.unit ? unitTitle(profile.unit) : profile.teryt;

  const rows: (string | number | null | undefined)[][] = profile.indicators.map((item) => [
    profile.teryt,
    unitName,
    item.indicator.name,
    item.indicator.group,
    item.indicator.unit,
    item.year,
    item.value,
    item.rankNational,
    item.rankVoivodeship,
    SOURCE_TEXT,
  ]);

  return toCsv(columns, rows);
}

function extractUnitName(unitOrProfile: UnitProfile | Unit | string | null | undefined): string {
  if (!unitOrProfile) return '';
  if (typeof unitOrProfile === 'string') return unitOrProfile;
  if ('unit' in unitOrProfile) {
    return unitOrProfile.unit ? unitTitle(unitOrProfile.unit) : unitOrProfile.teryt;
  }
  if ('name' in unitOrProfile) {
    return unitOrProfile.name;
  }
  return '';
}

/**
 * Generuje tabelę CSV dla porównania dwóch jednostek (jeden wiersz na wskaźnik).
 */
export function compareCsv(
  rowsData: CompareRow[],
  a: UnitProfile | Unit | string | null | undefined,
  b: UnitProfile | Unit | string | null | undefined,
  indicators?: Indicator[],
): string {
  const nameA = extractUnitName(a) || 'Jednostka A';
  const nameB = extractUnitName(b) || 'Jednostka B';

  const columns = ['Wskaźnik', nameA, nameB, 'Różnica', 'Źródło'];

  const rows: (string | number | null | undefined)[][] = rowsData.map((row) => {
    let indicatorName = row.indicatorId;
    if (indicators) {
      const ind = indicators.find((i) => i.id === row.indicatorId);
      if (ind) indicatorName = ind.name;
    } else if (a && typeof a === 'object' && 'indicators' in a) {
      const item = a.indicators.find((i) => i.indicatorId === row.indicatorId);
      if (item?.indicator?.name) indicatorName = item.indicator.name;
    } else if (b && typeof b === 'object' && 'indicators' in b) {
      const item = b.indicators.find((i) => i.indicatorId === row.indicatorId);
      if (item?.indicator?.name) indicatorName = item.indicator.name;
    }

    return [indicatorName, row.a, row.b, row.diffText, SOURCE_TEXT];
  });

  return toCsv(columns, rows);
}
