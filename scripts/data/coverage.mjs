/**
 * Liczy pokrycie danych wskaźnika dla wskazanego poziomu jednostek.
 *
 * Pokrycie = liczba rekordów, których id znajduje się w zbiorze bdlId jednostek
 * danego poziomu (z public/data/units.json) i które mają wartość (val !== null i val !== undefined)
 * w danym roku (lub jakimkolwiek roku, jeśli rok nie został podany).
 *
 * @param {Array<{id: string, values?: Array<{year: string|number, val: any}>}>} records
 * @param {Array<{bdlId: string, level: string}>} units
 * @param {string} level - np. 'gmi' lub 'pow'
 * @param {string|number} [year] - opcjonalny rok filtrujący
 * @returns {number}
 */
export function countCoverage(records, units, level, year) {
  if (!Array.isArray(records) || !Array.isArray(units)) {
    return 0;
  }

  const targetBdlIds = new Set(
    units.filter((u) => u.level === level).map((u) => u.bdlId)
  );

  let count = 0;
  for (const record of records) {
    if (!record || !record.id || !targetBdlIds.has(record.id)) {
      continue;
    }

    const values = record.values;
    if (!Array.isArray(values)) {
      continue;
    }

    const hasValidValue = values.some((v) => {
      if (v.val === null || v.val === undefined || Number.isNaN(v.val)) {
        return false;
      }
      if (year !== undefined && year !== null) {
        return String(v.year) === String(year);
      }
      return true;
    });

    if (hasValidValue) {
      count++;
    }
  }

  return count;
}
