export type BoundingBox = [minLon: number, minLat: number, maxLon: number, maxLat: number];

export type TargetBox = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export type Padding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export type ProjectionFn = (point: [number, number]) => [number, number];

function lonToMercX(lon: number): number {
  return (lon * Math.PI) / 180;
}

function latToMercY(lat: number): number {
  const clampedLat = Math.min(85.05112878, Math.max(-85.05112878, lat));
  const rad = (clampedLat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

/**
 * Fits a Web Mercator projection to a target box with padding, preserving aspect ratio.
 * Wide bboxes will be centered vertically, tall bboxes centered horizontally.
 */
export function fitProjection(
  bbox: BoundingBox,
  box: TargetBox,
  padding: Padding = 0
): ProjectionFn {
  const [minLon, minLat, maxLon, maxLat] = bbox;

  const xMin = lonToMercX(minLon);
  const xMax = lonToMercX(maxLon);
  const yMin = latToMercY(minLat);
  const yMax = latToMercY(maxLat);

  const wProj = xMax - xMin;
  const hProj = yMax - yMin;

  const x0 = box.x ?? 0;
  const y0 = box.y ?? 0;

  const pLeft = typeof padding === 'number' ? padding : (padding.left ?? 0);
  const pRight = typeof padding === 'number' ? padding : (padding.right ?? 0);
  const pTop = typeof padding === 'number' ? padding : (padding.top ?? 0);
  const pBottom = typeof padding === 'number' ? padding : (padding.bottom ?? 0);

  const wAvail = Math.max(0, box.width - pLeft - pRight);
  const hAvail = Math.max(0, box.height - pTop - pBottom);

  let scale = 1;
  if (wProj > 0 && hProj > 0) {
    scale = Math.min(wAvail / wProj, hAvail / hProj);
  }

  const wRender = wProj * scale;
  const hRender = hProj * scale;

  const offsetX = x0 + pLeft + (wAvail - wRender) / 2;
  const offsetY = y0 + pTop + (hAvail - hRender) / 2;

  return ([lon, lat]: [number, number]): [number, number] => {
    const x = offsetX + (lonToMercX(lon) - xMin) * scale;
    const y = offsetY + (yMax - latToMercY(lat)) * scale;
    return [x, y];
  };
}
