import type { Unit } from '../units/types';

// Typ określający stan widoku kamery mapy
export type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

// Typ dla ograniczeń widoku mapy
export type MapLimits = {
  maxBounds: [number, number, number, number];
  minZoom: number;
  minZoomOffset: number;
  maxZoom: number;
};

// Pomocnicza funkcja rzutowania Web Mercator dla szerokości geograficznej
function mercatorLat(latDeg: number): number {
  return Math.log(Math.tan(Math.PI / 4 + (latDeg * Math.PI) / 360));
}

// Pomocnicza funkcja odwrotnego rzutowania Web Mercator
function mercatorLatToDeg(m: number): number {
  return (360 / Math.PI) * Math.atan(Math.exp(m)) - 90;
}

/**
 * Zwraca prostokąt granic Polski [zachód, południe, wschód, północ] na podstawie
 * obrysów (bbox) wszystkich województw w przekazanej liście jednostek.
 */
export function countryBounds(units: Unit[]): [number, number, number, number] {
  const voivodeships = units.filter((unit) => unit.level === 'woj');

  if (voivodeships.length === 0) {
    throw new Error('Brak jednostek szczebla wojewódzkiego w danych.');
  }

  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const voivodeship of voivodeships) {
    const [w, s, e, n] = voivodeship.bbox;
    if (w < west) west = w;
    if (s < south) south = s;
    if (e > east) east = e;
    if (n > north) north = n;
  }

  return [west, south, east, north];
}

/**
 * Oblicza początkowy stan widoku mapy { longitude, latitude, zoom }, przy którym
 * prostokąt kraju mieści się w kontenerze o podanych wymiarach width x height.
 */
export function initialViewState(
  bounds: [number, number, number, number],
  width: number,
  height: number
): ViewState {
  const [west, south, east, north] = bounds;

  const longitude = (west + east) / 2;

  const mSouth = mercatorLat(south);
  const mNorth = mercatorLat(north);
  const mCenter = (mSouth + mNorth) / 2;
  const latitude = mercatorLatToDeg(mCenter);

  const tileSize = 512;
  const deltaX0 = (tileSize * (east - west)) / 360;
  const deltaY0 = (tileSize * Math.abs(mNorth - mSouth)) / (2 * Math.PI);

  const zoomX = Math.log2(width / deltaX0);
  const zoomY = Math.log2(height / deltaY0);

  const zoom = Math.min(zoomX, zoomY);

  return { longitude, latitude, zoom };
}

/**
 * Zwraca ograniczenia nawigacji po mapie: maxBounds powiększony o 50% z każdej strony,
 * minimalny zoom dopasowania do kontenera pomniejszony o 0.5 oraz maksymalny zoom równy 12.
 */
export function mapLimits(
  bounds: [number, number, number, number],
  width?: number,
  height?: number
): MapLimits {
  const [west, south, east, north] = bounds;

  const lonSpan = east - west;
  const latSpan = north - south;

  const maxBounds: [number, number, number, number] = [
    west - 0.5 * lonSpan,
    south - 0.5 * latSpan,
    east + 0.5 * lonSpan,
    north + 0.5 * latSpan,
  ];

  let minZoom = 0;
  if (width && height && width > 0 && height > 0) {
    const fitZoom = initialViewState(bounds, width, height).zoom;
    minZoom = Math.max(0, fitZoom - 0.5);
  }

  return {
    maxBounds,
    minZoom,
    minZoomOffset: minZoom,
    maxZoom: 12,
  };
}
