import React from 'react';
import rough from 'roughjs';
import type { CardScene } from '../../core/share/card';

export interface CardSvgProps {
  scene: CardScene;
  className?: string;
  style?: React.CSSProperties;
}

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

export const CardSvg: React.FC<CardSvgProps> = ({ scene, className, style }) => {
  const { width, height, background, items } = scene;
  const gen = rough.generator();

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Podgląd karty"
    >
      {background && (
        <rect x={0} y={0} width={width} height={height} fill={background} />
      )}
      {items.map((item, idx) => {
        if (item.type === 'text') {
          const anchor =
            item.align === 'center'
              ? 'middle'
              : item.align === 'right'
              ? 'end'
              : 'start';
          return (
            <g key={`text-${idx}`}>
              {item.lines.map((line, lIdx) => {
                const lineY = item.y + lIdx * item.lineHeight;
                return (
                  <text
                    key={`line-${lIdx}`}
                    x={item.x}
                    y={lineY}
                    fill={item.color}
                    fontSize={item.fontSize}
                    fontWeight={item.fontWeight}
                    textAnchor={anchor}
                    dominantBaseline="hanging"
                    fontFamily="sans-serif"
                  >
                    {line}
                  </text>
                );
              })}
            </g>
          );
        }

        if (item.type === 'rect') {
          return (
            <rect
              key={`rect-${idx}`}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              fill={item.fill ?? 'none'}
              stroke={item.stroke}
              strokeWidth={item.strokeWidth}
              rx={item.rx}
            />
          );
        }

        if (item.type === 'path') {
          return (
            <path
              key={`path-${idx}`}
              d={item.d}
              fill={item.fill ?? 'none'}
              stroke={item.stroke}
              strokeWidth={item.strokeWidth}
            />
          );
        }

        if (item.type === 'image') {
          return (
            <image
              key={`image-${idx}`}
              href={item.src}
              x={item.x}
              y={item.y}
              width={item.width}
              height={item.height}
              preserveAspectRatio="xMidYMid meet"
            />
          );
        }

        if (item.type === 'annotation') {
          if (item.kind === 'circle') {
            const cx = item.x + item.width / 2;
            const cy = item.y + item.height / 2;
            const drawable = gen.ellipse(cx, cy, item.width, item.height, {
              stroke: item.color,
              strokeWidth: 2.5,
              roughness: 1.5,
              bowing: 1,
            });

            return (
              <g key={`annotation-${idx}`}>
                {drawable.sets.map((set, sIdx) => (
                  <path
                    key={`ann-set-${sIdx}`}
                    d={opsToPath(set.ops)}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={2.5}
                  />
                ))}
              </g>
            );
          }
        }

        return null;
      })}
    </svg>
  );
};
