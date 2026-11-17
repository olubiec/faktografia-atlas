// Krzywa przyspieszenia z tokenu motion.easing (cubic-bezier) jako funkcja czasu 0..1.

export function parseCubicBezier(easingStr: string): (t: number) => number {
  const match = easingStr.match(/cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
  if (!match) {
    return (t: number) => t;
  }
  const x1 = parseFloat(match[1]);
  const y1 = parseFloat(match[2]);
  const x2 = parseFloat(match[3]);
  const y2 = parseFloat(match[4]);

  return function ease(x: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let tLo = 0;
    let tHi = 1;
    let t = x;

    for (let i = 0; i < 12; i++) {
      const currentX = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
      if (currentX < x) {
        tLo = t;
      } else {
        tHi = t;
      }
      t = (tLo + tHi) / 2;
    }

    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  };
}
