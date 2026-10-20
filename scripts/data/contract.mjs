/**
 * Sprawdza plik wartości wskaźnika (JSON) pod kątem zgodności z kontraktem danych.
 *
 * @param {object} json - Treść pliku JSON z wartościami wskaźnika
 * @param {object} indicator - Obiekt wskaźnika z config/indicators.json
 * @param {object[]} units - Lista jednostek z public/data/units.json
 * @returns {string[]} Lista opisów błędów (pusta tablica oznacza poprawny plik)
 */
export function checkValuesFile(json, indicator, units) {
  const errors = [];

  if (!json || typeof json !== 'object') {
    return ['Plik danych musi być obiektem JSON.'];
  }
  if (!indicator || typeof indicator !== 'object') {
    return ['Brak prawidłowego obiektu wskaźnika.'];
  }
  if (!Array.isArray(units)) {
    return ['Brak prawidłowej listy jednostek.'];
  }

  // 1. Sprawdzenie indicatorId
  if (json.indicatorId !== indicator.id) {
    errors.push(
      `Niezgodność indicatorId: w pliku jest "${json.indicatorId}", w konfiguracji "${indicator.id}".`,
    );
  }

  // 2. Sprawdzenie lat (years)
  const isYearsArray = Array.isArray(json.years) && json.years.length > 0;
  if (!isYearsArray) {
    errors.push('Pole years musi być niepustą tablicą.');
  } else {
    for (let i = 0; i < json.years.length; i++) {
      const yr = json.years[i];
      if (typeof yr !== 'number' || Number.isNaN(yr)) {
        errors.push('Lata w years muszą być liczbami.');
        break;
      }
      if (i > 0 && yr <= json.years[i - 1]) {
        errors.push('Lata w years muszą być rosnące i bez powtórzeń.');
        break;
      }
    }
  }

  // 3. Sprawdzenie słownika values
  if (!json.values || typeof json.values !== 'object' || Array.isArray(json.values)) {
    errors.push('Pole values musi być obiektem.');
  } else {
    const validTeryts = new Set(units.map((u) => String(u?.teryt)));
    const allowsNegatives =
      indicator.id === 'natural-increase' || indicator.id === 'migration-balance';

    for (const [teryt, valArr] of Object.entries(json.values)) {
      if (!validTeryts.has(teryt)) {
        errors.push(`Klucz TERYT "${teryt}" w values nie występuje w units.json.`);
      }

      if (!Array.isArray(valArr)) {
        errors.push(`Wartości dla TERYT "${teryt}" muszą być tablicą.`);
        continue;
      }

      if (isYearsArray && valArr.length !== json.years.length) {
        errors.push(
          `Długość tablicy wartości dla TERYT "${teryt}" (${valArr.length}) różni się od lat (${json.years.length}).`,
        );
      }

      for (const val of valArr) {
        if (val !== null && (typeof val !== 'number' || Number.isNaN(val))) {
          errors.push(`Nieprawidłowa wartość w TERYT "${teryt}": ${val}. Oczekiwano liczby lub null.`);
          break;
        }

        if (!allowsNegatives && val !== null && typeof val === 'number' && val < 0) {
          errors.push(
            `Wskaźnik "${indicator.id}" nie może przyjmować wartości ujemnych (znaleziono ${val} dla TERYT "${teryt}").`,
          );
          break;
        }
      }
    }
  }

  // 4. Pokrycie w ostatnim roku dla minLevel (>= 95%)
  if (isYearsArray && indicator.minLevel && json.values && typeof json.values === 'object') {
    const minLevelUnits = units.filter((u) => u && u.level === indicator.minLevel);
    if (minLevelUnits.length > 0) {
      const lastYrIdx = json.years.length - 1;
      let hasValueCount = 0;

      for (const u of minLevelUnits) {
        const val = json.values[u.teryt]?.[lastYrIdx];
        if (val !== null && val !== undefined && typeof val === 'number' && !Number.isNaN(val)) {
          hasValueCount++;
        }
      }

      const missingCount = minLevelUnits.length - hasValueCount;
      const coverage = hasValueCount / minLevelUnits.length;

      if (coverage < 0.95) {
        errors.push(
          `Wskaźnik "${indicator.id}" (${indicator.name}): co najmniej 95% jednostek poziomu "${indicator.minLevel}" musi posiadać wartość w ostatnim roku (${missingCount} braków na ${minLevelUnits.length} jednostek, pokrycie ${(coverage * 100).toFixed(1)}%).`,
        );
      }
    }
  }

  return errors;
}
