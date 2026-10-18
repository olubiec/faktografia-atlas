/**
 * Tworzy URL do następnej strony odpowiedzi BDL lub zwraca null na ostatniej stronie.
 *
 * @param {object} page - Odpowiedź BDL API dla danej strony
 * @returns {string | null}
 */
export function nextPageUrl(page) {
  if (!page || typeof page !== 'object') return null;
  const next = page.links?.next;
  return typeof next === 'string' && next.length > 0 ? next : null;
}

/**
 * Zamienia odpowiedzi z BDL GUS na strukturę IndicatorValues (public/data/values/<indicatorId>.json).
 *
 * @param {object | string} indicator - Obiekt wskaźnika lub identyfikator wskaźnika (string)
 * @param {object | object[]} pages - Strona lub tablica stron odpowiedzi z BDL API
 * @param {object[]} units - Lista jednostek z public/data/units.json (każda z teryt i bdlId)
 * @param {string} [fetchedAt] - ISO timestamp pobrania (opcjonalny)
 * @returns {object} Obiekt wskaźnika z wartościami per TERYT i raportem skipped
 */
export function toIndicatorValues(indicator, pages, units, fetchedAt) {
  const indicatorId = typeof indicator === 'string'
    ? indicator
    : (indicator?.id ?? String(indicator?.bdlVarId ?? ''));

  const pageList = Array.isArray(pages)
    ? pages
    : (pages ? [pages] : []);

  const bdlIdToTeryt = new Map();
  if (Array.isArray(units)) {
    for (const u of units) {
      if (u && u.bdlId && u.teryt) {
        bdlIdToTeryt.set(String(u.bdlId), String(u.teryt));
      }
    }
  }

  let skippedCount = 0;
  const terytValuesMap = new Map();
  const yearsSet = new Set();

  for (const page of pageList) {
    if (!page || !Array.isArray(page.results)) continue;
    for (const record of page.results) {
      if (!record || !record.id) continue;
      const bdlId = String(record.id);
      const teryt = bdlIdToTeryt.get(bdlId);

      if (!teryt) {
        skippedCount++;
        continue;
      }

      if (!terytValuesMap.has(teryt)) {
        terytValuesMap.set(teryt, new Map());
      }
      const yearMap = terytValuesMap.get(teryt);

      if (Array.isArray(record.values)) {
        for (const v of record.values) {
          if (v && v.year !== undefined && v.year !== null) {
            const yr = Number(v.year);
            if (!Number.isNaN(yr)) {
              yearsSet.add(yr);
              const val = (v.val === null || v.val === undefined || Number.isNaN(Number(v.val)))
                ? null
                : Number(v.val);
              yearMap.set(yr, val);
            }
          }
        }
      }
    }
  }

  const years = Array.from(yearsSet).sort((a, b) => a - b);

  const values = {};
  for (const [teryt, yearMap] of terytValuesMap.entries()) {
    values[teryt] = years.map((yr) => (yearMap.has(yr) ? yearMap.get(yr) : null));
  }

  return {
    indicatorId,
    years,
    values,
    fetchedAt: fetchedAt || new Date().toISOString(),
    report: {
      skipped: skippedCount,
    },
  };
}
