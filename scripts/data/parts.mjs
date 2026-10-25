/**
 * Prekształca odpowiedzi z BDL GUS na strukturę Części (miasto / obszar wiejski) dla gmin miejsko-wiejskich.
 *
 * @param {object | string | number} indicator - Obiekt wskaźnika, string ID wskaźnika lub BDL variable ID
 * @param {object | object[]} pages - Strona lub tablica stron odpowiedzi z BDL API
 * @param {object[]} units - Lista jednostek z public/data/units.json (każda z teryt)
 * @param {Iterable<string | number>} [allowedIds] - Zbiór dozwolonych ID wskaźników lub BDL variable ID
 * @returns {object | null} Obiekt z częściami { indicatorId, years, values } lub null jeśli wskaźnik spoza allowedIds
 */
export function toPartsValues(indicator, pages, units, allowedIds) {
  let indicatorId = null;
  let bdlVarId = null;

  if (typeof indicator === 'string') {
    indicatorId = indicator;
  } else if (typeof indicator === 'number') {
    bdlVarId = String(indicator);
  } else if (indicator && typeof indicator === 'object') {
    indicatorId = indicator.id ? String(indicator.id) : null;
    bdlVarId = indicator.bdlVarId !== undefined && indicator.bdlVarId !== null ? String(indicator.bdlVarId) : null;
  }

  if (allowedIds) {
    const allowedSet = new Set(Array.from(allowedIds).map((id) => String(id)));
    let isAllowed = false;
    if (indicatorId && allowedSet.has(indicatorId)) {
      isAllowed = true;
    }
    if (bdlVarId && allowedSet.has(bdlVarId)) {
      isAllowed = true;
    }
    if (!isAllowed) {
      return null;
    }
  }

  const finalIndicatorId = indicatorId ?? (bdlVarId ?? 'unknown');

  const pageList = Array.isArray(pages)
    ? pages
    : (pages ? [pages] : []);

  // Zbiór TERYT-ów gmin miejsko-wiejskich (końcówka 3) z units.json
  const validMotherTeryts = new Set();
  if (Array.isArray(units)) {
    for (const u of units) {
      if (u && typeof u.teryt === 'string' && u.teryt.endsWith('3')) {
        validMotherTeryts.add(u.teryt);
      }
    }
  }

  const partValuesMap = new Map();
  const yearsSet = new Set();

  for (const page of pageList) {
    if (!page || !Array.isArray(page.results)) continue;
    for (const record of page.results) {
      if (!record || !record.id) continue;
      const idStr = String(record.id);
      if (idStr.length !== 12) continue;

      const level = record.level ?? 6;
      if (level !== 6) continue;

      const kind = record.kind ?? idStr.slice(11, 12);
      if (kind !== '4' && kind !== '5') continue;

      // Klucz 7-cyfrowy: id.slice(2,4) + id.slice(7,12)
      const partTeryt = idStr.slice(2, 4) + idStr.slice(7, 12);
      const motherTeryt = partTeryt.slice(0, 6) + '3';

      if (!validMotherTeryts.has(motherTeryt)) {
        continue;
      }

      if (!partValuesMap.has(partTeryt)) {
        partValuesMap.set(partTeryt, new Map());
      }
      const yearMap = partValuesMap.get(partTeryt);

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
  for (const [partTeryt, yearMap] of partValuesMap.entries()) {
    values[partTeryt] = years.map((yr) => (yearMap.has(yr) ? yearMap.get(yr) : null));
  }

  return {
    indicatorId: finalIndicatorId,
    years,
    values,
  };
}
