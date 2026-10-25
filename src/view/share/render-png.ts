import rough from 'roughjs';
import tokensJson from '../../../config/tokens.json';
import type { CardScene } from '../../core/share/card';
import type { MeasureFn } from '../../core/share/text-fit';

let measureCanvas: HTMLCanvasElement | null = null;

export const createMeasureFn = (): MeasureFn => {
  return (text: string, fontSize: number, fontWeight?: number | string): number => {
    if (typeof document === 'undefined') return text.length * fontSize * 0.6;
    if (!measureCanvas) {
      measureCanvas = document.createElement('canvas');
    }
    const ctx = measureCanvas.getContext('2d');
    if (!ctx) return text.length * fontSize * 0.6;
    const weightStr = fontWeight ?? 'normal';
    ctx.font = `${weightStr} ${fontSize}px sans-serif`;
    return ctx.measureText(text).width;
  };
};

function opsToPath(ops: { op: string; data: number[] }[]): string {
  let path = '';
  for (const item of ops) {
    switch (item.op) {
      case 'move':
        path += `M${item.data[0]},${item.data[1]} `;
        break;
      case 'lineTo':
        path += `L${item.data[0]},${item.data[1]} `;
        break;
      case 'bcurveTo':
        path += `C${item.data[0]},${item.data[1]} ${item.data[2]},${item.data[3]} ${item.data[4]},${item.data[5]} `;
        break;
    }
  }
  return path.trim();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    // Normalize path if starts with 'public/'
    img.src = src.startsWith('public/') ? src.replace(/^public\//, '/') : src;
  });
}

export async function renderPng(scene: CardScene): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font loading errors
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = scene.width;
  canvas.height = scene.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  if (scene.background) {
    ctx.fillStyle = scene.background;
    ctx.fillRect(0, 0, scene.width, scene.height);
  }

  const gen = rough.generator();

  for (const item of scene.items) {
    if (item.type === 'rect') {
      if (item.fill && item.fill !== 'none') {
        ctx.fillStyle = item.fill;
        ctx.fillRect(item.x, item.y, item.width, item.height);
      }
      if (item.stroke && item.strokeWidth) {
        ctx.strokeStyle = item.stroke;
        ctx.lineWidth = item.strokeWidth;
        ctx.strokeRect(item.x, item.y, item.width, item.height);
      }
    } else if (item.type === 'path') {
      const p = new Path2D(item.d);
      if (item.fill && item.fill !== 'none') {
        ctx.fillStyle = item.fill;
        ctx.fill(p);
      }
      if (item.stroke && item.strokeWidth) {
        ctx.strokeStyle = item.stroke;
        ctx.lineWidth = item.strokeWidth;
        ctx.stroke(p);
      }
    } else if (item.type === 'text') {
      ctx.font = `${item.fontWeight} ${item.fontSize}px sans-serif`;
      ctx.fillStyle = item.color;
      ctx.textAlign =
        item.align === 'center' ? 'center' : item.align === 'right' ? 'right' : 'left';
      ctx.textBaseline = 'top';

      for (let i = 0; i < item.lines.length; i++) {
        const line = item.lines[i];
        const lineY = item.y + i * item.lineHeight;
        ctx.fillText(line, item.x, lineY);
      }
    } else if (item.type === 'image') {
      try {
        const img = await loadImage(item.src);
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } catch {
        // Fallback: draw placeholder rectangle if image fails to load
        ctx.fillStyle = tokensJson.color.light.linia;
        ctx.fillRect(item.x, item.y, item.width, item.height);
      }
    } else if (item.type === 'annotation') {
      if (item.kind === 'circle') {
        const cx = item.x + item.width / 2;
        const cy = item.y + item.height / 2;
        const drawable = gen.ellipse(cx, cy, item.width, item.height, {
          stroke: item.color,
          strokeWidth: 2.5,
          roughness: 1.5,
          bowing: 1,
        });

        for (const set of drawable.sets) {
          const p = new Path2D(opsToPath(set.ops));
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 2.5;
          ctx.stroke(p);
        }
      }
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas toBlob failed'));
      }
    }, 'image/png');
  });
}
