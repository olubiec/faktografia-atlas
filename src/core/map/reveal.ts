export type RevealUnit = {
  teryt: string;
  centroid: [number, number];
};

export type RevealOptions = {
  total: number;
  minTile: number;
  reducedMotion: boolean;
};

export type RevealResult = {
  teryt: string;
  order: number;
  delay: number;
  duration: number;
};

function distSq(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

export function revealPlan(
  units: RevealUnit[],
  origin: [number, number],
  options: RevealOptions
): RevealResult[] {
  const { total, minTile, reducedMotion } = options;
  const n = units.length;

  if (n === 0) {
    return [];
  }

  // Sort units by distance to origin, then lexicographically by teryt to break ties
  const sorted = [...units].sort((a, b) => {
    const da = distSq(a.centroid, origin);
    const db = distSq(b.centroid, origin);
    if (da !== db) {
      return da - db;
    }
    return a.teryt.localeCompare(b.teryt);
  });

  return sorted.map((unit, index) => {
    let delay = 0;
    let duration = 0;

    if (!reducedMotion) {
      if (n === 1) {
        delay = 0;
        duration = total;
      } else {
        delay = (index / (n - 1)) * Math.max(0, total - minTile);
        duration = minTile;
      }
    }

    return {
      teryt: unit.teryt,
      order: index,
      delay,
      duration,
    };
  });
}
