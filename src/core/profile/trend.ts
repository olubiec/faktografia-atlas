export type TrendDirection = 'up' | 'down' | 'same';

export interface TrendResult {
  compareYear: number;
  direction: TrendDirection;
  formattedChange: string;
  text: string;
  ariaLabel: string;
}

export type SeriesItem = { year: number; value: number | null };

/**
 * Oblicza trend zmiany wskaźnika w czasie dla podanej serii danych.
 * Porównuje ostatni rok z danymi z rokiem sprzed 5 lat
 * (lub z najstarszym rokiem serii, jeśli seria jest krótsza; min. 2 lata różnicy).
 */
export function trend(series: SeriesItem[], unit: string): TrendResult | null {
  if (!series || series.length < 2) {
    return null;
  }

  // Odfiltrowanie niepoprawnych / pustych wartości i posortowanie rosnąco po roku
  const valid = series
    .filter(
      (s): s is { year: number; value: number } =>
        s.value !== null && s.value !== undefined && !Number.isNaN(s.value)
    )
    .sort((a, b) => a.year - b.year);

  if (valid.length < 2) {
    return null;
  }

  const latest = valid[valid.length - 1];
  const targetYear = latest.year - 5;

  // Szukanie punktu odniesienia: najnowszy punkt o roku <= targetYear
  let comparePoint: { year: number; value: number } | undefined;

  if (valid[0].year <= targetYear) {
    for (let i = valid.length - 1; i >= 0; i--) {
      if (valid[i].year <= targetYear) {
        comparePoint = valid[i];
        break;
      }
    }
  } else {
    comparePoint = valid[0];
  }

  if (!comparePoint) {
    return null;
  }

  const diffYears = latest.year - comparePoint.year;
  if (diffYears < 2) {
    return null;
  }

  const isPercentUnit = unit.trim() === '%';
  const v1 = comparePoint.value;
  const v2 = latest.value;

  let direction: TrendDirection;
  let formattedChange = '';
  let text = '';
  let ariaLabel = '';

  if (isPercentUnit) {
    const diff = v2 - v1; // zmiana w p.p.
    if (Math.abs(diff) < 0.1) {
      direction = 'same';
      const absFormatted = Math.abs(diff).toFixed(1).replace('.', ',');
      const signFormatted = diff > 0 ? '+' : diff < 0 ? '-' : '';
      formattedChange = `${signFormatted}${absFormatted} p.p.`;
      text = `→ ${formattedChange} od ${comparePoint.year}`;
      ariaLabel = `bez zmian (${formattedChange}) od ${comparePoint.year}`;
    } else if (diff >= 0.1) {
      direction = 'up';
      const formattedNum = diff.toFixed(1).replace('.', ',');
      formattedChange = `+${formattedNum} p.p.`;
      text = `↗ ${formattedChange} od ${comparePoint.year}`;
      ariaLabel = `rośnie o ${formattedNum} p.p. od ${comparePoint.year}`;
    } else {
      direction = 'down';
      const formattedNum = diff.toFixed(1).replace('.', ','); // z minusem
      const absFormatted = Math.abs(diff).toFixed(1).replace('.', ',');
      formattedChange = `${formattedNum} p.p.`;
      text = `↘ ${formattedChange} od ${comparePoint.year}`;
      ariaLabel = `maleje o ${absFormatted} p.p. od ${comparePoint.year}`;
    }
  } else {
    if (v1 === 0) {
      if (v2 > 0) {
        direction = 'up';
        formattedChange = '';
        text = `↗ od ${comparePoint.year}`;
        ariaLabel = `rośnie od ${comparePoint.year}`;
      } else if (v2 < 0) {
        direction = 'down';
        formattedChange = '';
        text = `↘ od ${comparePoint.year}`;
        ariaLabel = `maleje od ${comparePoint.year}`;
      } else {
        direction = 'same';
        formattedChange = '';
        text = `→ od ${comparePoint.year}`;
        ariaLabel = `bez zmian od ${comparePoint.year}`;
      }
    } else {
      const relPercent = ((v2 - v1) / Math.abs(v1)) * 100;
      if (Math.abs(relPercent) < 0.5) {
        direction = 'same';
        const absFormatted = Math.abs(relPercent).toFixed(1).replace('.', ',');
        const signFormatted = relPercent > 0 ? '+' : relPercent < 0 ? '-' : '';
        formattedChange = `${signFormatted}${absFormatted}%`;
        text = `→ ${formattedChange} od ${comparePoint.year}`;
        ariaLabel = `bez zmian (${formattedChange}) od ${comparePoint.year}`;
      } else if (relPercent >= 0.5) {
        direction = 'up';
        const formattedNum = relPercent.toFixed(1).replace('.', ',');
        formattedChange = `+${formattedNum}%`;
        text = `↗ ${formattedChange} od ${comparePoint.year}`;
        ariaLabel = `rośnie o ${formattedNum}% od ${comparePoint.year}`;
      } else {
        direction = 'down';
        const formattedNum = relPercent.toFixed(1).replace('.', ','); // z minusem
        const absFormatted = Math.abs(relPercent).toFixed(1).replace('.', ',');
        formattedChange = `${formattedNum}%`;
        text = `↘ ${formattedChange} od ${comparePoint.year}`;
        ariaLabel = `maleje o ${absFormatted}% od ${comparePoint.year}`;
      }
    }
  }

  return {
    compareYear: comparePoint.year,
    direction,
    formattedChange,
    text,
    ariaLabel,
  };
}
