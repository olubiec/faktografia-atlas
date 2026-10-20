// Helper do rysowania owalu roughjs wokół prostokąta (np. wybranej jednostki na mapie).

import rough from 'roughjs';
import tokensJson from '../../../config/tokens.json';

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoughEllipseOptions {
  color?: string;
  padding?: number;
  strokeWidth?: number;
  iterations?: number;
}

function getKorektaColor(): string {
  if (typeof window !== 'undefined' && typeof getComputedStyle !== 'undefined' && document.documentElement) {
    const computed = getComputedStyle(document.documentElement)
      .getPropertyValue('--korekta')
      .trim();
    if (computed) return computed;
  }
  return tokensJson.color.light.korekta;
}

export function roughEllipse(
  svgElement: SVGSVGElement,
  bbox: BBox,
  options: RoughEllipseOptions = {}
): SVGGElement {
  const color = options.color || getKorektaColor();
  const padding = options.padding ?? 6;
  const strokeWidth = options.strokeWidth ?? 2.5;

  const width = bbox.width + padding * 2;
  const height = bbox.height + padding * 2;
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const rc = rough.svg(svgElement);
  const g = rc.ellipse(cx, cy, width, height, {
    stroke: color,
    strokeWidth,
    bowing: 1,
    roughness: 1.5,
  });

  g.setAttribute('stroke', color);
  svgElement.appendChild(g);

  return g;
}
