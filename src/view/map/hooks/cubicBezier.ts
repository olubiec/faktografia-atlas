// Krzywa easing z napisu cubic-bezier(...) (np. z tokenów czasu ruchu kamery).
export function parseCubicBezier(easingStr: string): (t: number) => number {
  const match = easingStr.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (!match) {
    return (t: number) => t;
  }
  const [x1, y1, x2, y2] = match.slice(1, 5).map(parseFloat);

  return function ease(x: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let [tLo, tHi, t] = [0, 1, x];

    for (let i = 0; i < 12; i++) {
      const currentX = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
      if (currentX < x) tLo = t;
      else tHi = t;
      t = (tLo + tHi) / 2;
    }

    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  };
}
