/**
 * Parser miejscowości z rejestru PRNG (GUGiK, OGC API Features).
 * Biblioteka czystych funkcji bez efektów ubocznych przy imporcie.
 */

export const LOCALITIES_MAX_BYTES = 8 * 1024 * 1024;

export const STANDALONE_KINDS = Object.freeze([
  'miasto',
  'wieś',
  'osada',
  'kolonia',
  'osada leśna'
]);

/**
 * Sprawdza, czy obiekt PRNG reprezentuje samodzielną miejscowość.
 * @param {object} feature Obiekt GeoJSON Feature z PRNG.
 * @returns {boolean} true tylko dla kategoriaObiektu === 'miejscowość' i rodzaju z STANDALONE_KINDS.
 */
export function isStandalone(feature) {
  if (!feature || typeof feature !== 'object') return false;
  const props = feature.properties;
  if (!props) return false;
  if (props.kategoriaObiektu !== 'miejscowość') return false;
  return STANDALONE_KINDS.includes(props.rodzajObiektu);
}

/**
 * Przekształca obiekt Feature na formę Locality.
 * @param {object} feature Obiekt GeoJSON Feature.
 * @returns {object} Locality { id, name, gminaTeryt, lon, lat, kind, approx? }
 */
export function toLocality(feature) {
  const props = feature?.properties || {};
  const id = String(props.idPRNG ?? '');
  const name = props.nazwaGlowna ?? '';
  const rawTeryt = String(props.terytGminy ?? '');
  const gminaTeryt = rawTeryt ? rawTeryt.padStart(7, '0') : '';
  const kind = props.rodzajObiektu ?? '';

  let coords = null;
  const geom = feature?.geometry;
  if (geom && geom.coordinates) {
    if (geom.type === 'MultiPoint' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
      coords = geom.coordinates[0];
    } else if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
      coords = geom.coordinates;
    }
  }

  const round4 = (num) => Math.round(num * 10000) / 10000;

  if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    const loc = {
      id,
      name,
      gminaTeryt,
      lon: round4(coords[0]),
      lat: round4(coords[1])
    };
    if (kind) loc.kind = kind;
    return loc;
  } else {
    const loc = {
      id,
      name,
      gminaTeryt,
      lon: null,
      lat: null,
      approx: true
    };
    if (kind) loc.kind = kind;
    return loc;
  }
}

/**
 * Buduje listę miejscowości z obiektów PRNG i bazy units.json.
 * @param {Array<object>} features Lista obiektów GeoJSON Feature.
 * @param {Array<object>} units Lista jednostek z public/data/units.json.
 * @returns {{ localities: Array<object>, skipped: Array<object>, byKind: Record<string, number> }}
 */
export function buildLocalities(features, units) {
  const gminaMap = new Map();
  if (Array.isArray(units)) {
    for (const u of units) {
      if (u.level === 'gmi' || (u.teryt && u.teryt.length === 7)) {
        gminaMap.set(u.teryt, u);
      }
    }
  }

  const skipped = [];
  const localitiesMap = new Map();
  const byKind = {};

  for (const kind of STANDALONE_KINDS) {
    byKind[kind] = 0;
  }

  const featureList = Array.isArray(features) ? features : [];

  for (const feature of featureList) {
    if (!isStandalone(feature)) {
      continue;
    }

    const locality = toLocality(feature);

    if (!gminaMap.has(locality.gminaTeryt)) {
      skipped.push(feature);
      continue;
    }

    const gmina = gminaMap.get(locality.gminaTeryt);

    if (locality.approx) {
      locality.lon = gmina.centroid[0];
      locality.lat = gmina.centroid[1];
    }

    if (!localitiesMap.has(locality.id)) {
      localitiesMap.set(locality.id, locality);
      const kind = locality.kind || feature?.properties?.rodzajObiektu;
      if (kind && byKind[kind] !== undefined) {
        byKind[kind]++;
      } else if (kind) {
        byKind[kind] = 1;
      }
    }
  }

  const localities = Array.from(localitiesMap.values());

  localities.sort((a, b) => {
    const numA = Number(a.id);
    const numB = Number(b.id);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.id.localeCompare(b.id);
  });

  return {
    localities,
    skipped,
    byKind
  };
}

/**
 * Podsumowuje wynik przetwarzania miejscowości.
 * @param {object} result Wynik funkcji buildLocalities.
 * @returns {{ byKind: Record<string, number>, approx: number, skipped: number }}
 */
export function summarize(result) {
  const localities = Array.isArray(result?.localities) ? result.localities : [];
  const skipped = Array.isArray(result?.skipped) ? result.skipped : [];

  const byKind = {};
  for (const kind of STANDALONE_KINDS) {
    byKind[kind] = 0;
  }

  if (result?.byKind) {
    Object.assign(byKind, result.byKind);
  } else {
    for (const loc of localities) {
      const k = loc.kind;
      if (k) {
        byKind[k] = (byKind[k] || 0) + 1;
      }
    }
  }

  const approxCount = localities.filter((loc) => loc.approx === true).length;
  const skippedCount = skipped.length;

  return {
    byKind,
    approx: approxCount,
    skipped: skippedCount
  };
}

/**
 * Sprawdza czy rozmiar ciągu JSON nie przekracza dopuszczalnej wartości.
 * @param {string} jsonString Ciąg JSON.
 * @param {number} maxBytes Maksymalna liczba bajtów.
 */
export function assertSizeUnder(jsonString, maxBytes) {
  const bytes = Buffer.byteLength(jsonString, 'utf8');
  if (bytes > maxBytes) {
    throw new Error(`JSON size ${bytes} B exceeds limit of ${maxBytes} B`);
  }
}

/**
 * Serializuje listę miejscowości do JSON bez wcięć i weryfikuje limit rozmiaru.
 * @param {Array<object>} localities Lista miejscowości.
 * @returns {string} Zserializowany JSON bez wcięć.
 */
export function serialize(localities) {
  const json = JSON.stringify(localities);
  // Rejestr PRNG ma ok. 60 tys. samodzielnych miejscowości: plik wychodzi ok. 5,5 MB (ok. 1,5 MB po gzip).
  // Strona ładuje go leniwie dopiero po otwarciu wyszukiwarki, więc limit to 8 MB.
  assertSizeUnder(json, LOCALITIES_MAX_BYTES);
  return json;
}
