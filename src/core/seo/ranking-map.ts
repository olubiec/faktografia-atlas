// Statyczna mapa rankingu (SVG) dla stron /ranking/… – obrazek widoczny dla Grafiki Google i do wklejenia
// w prezentację. Kształty i projekcja jak w kartach udostępniania (share/map-shapes), klasy kwantylowe
// jak na mapie (map/classes), kolory wyłącznie z config/tokens.json. Czyste funkcje, bez Reacta.
import type { Feature } from 'geojson';
import tokens from '../../../config/tokens.json';
import { displayUnit, formatValue, getFractionDigits } from '../format/number';
import { classify, computeBreaks } from '../map/classes';
import { mapShapes } from '../share/map-shapes';
import { escapeAttr as attr, escapeHtml as text } from './html';
import { showValue } from './sentences';

export const MAP_WIDTH = 640;
const TITLE_H = 60;
const MAP_AREA = 540;
const LEGEND_Y = TITLE_H + MAP_AREA + 8;
export const MAP_HEIGHT = LEGEND_Y + 124;
/** Ok. tyle znaków tytułu mieści się w linii przy rozmiarze sm (2 linie, dalej wielokropek). */
const TITLE_LINE = 62;
const CLASSES = 5;
/** Nazwa pliku obok index.html strony rankingu. */
export const MAP_FILE = 'mapa.svg';

export interface MapValue {
  teryt: string;
  name: string;
  value: number;
}

export interface RankingMapInput {
  /** Granice jednostek z zakresu rankingu (także te bez danych). */
  features: readonly Feature[];
  values: readonly MapValue[];
  title: string;
  unit: string;
  year: number | null;
}

const colors = tokens.color.light;
const seq = tokens.data.sequential.light;
const noData = tokens.data.noData.light;
const font = tokens.font;

/** Adres pliku mapy dla strony rankingu. */
export const rankingMapSrc = (pagePath: string) => `${pagePath.replace(/\/$/, '')}/${MAP_FILE}`;

/** Najwyższa i najniższa wartość (do opisu alt). */
function extremes(values: readonly MapValue[]): { max: MapValue; min: MapValue } | null {
  if (values.length === 0) return null;
  let max = values[0]!;
  let min = values[0]!;
  for (const v of values) {
    if (v.value > max.value) max = v;
    if (v.value < min.value) min = v;
  }
  return { max, min };
}

/** Opis obrazka: co pokazuje, jak czytać kolory i skrajne wartości z liczbami. */
export function rankingMapAlt(input: Pick<RankingMapInput, 'title' | 'values' | 'unit'>): string {
  const ex = extremes(input.values);
  const base = `Mapa: ${input.title}. Im ciemniejszy kolor, tym wyższa wartość.`;
  if (!ex) return base;
  return `${base} Najwyższa: ${ex.max.name} (${showValue(ex.max.value, input.unit)}), najniższa: ${ex.min.name} (${showValue(ex.min.value, input.unit)}).`;
}

/** Liczby w ścieżce: separator tylko przed liczbą nieujemną (minus sam oddziela). */
const joinNums = (nums: number[]) => nums.reduce((acc, n, i) => acc + (i > 0 && n >= 0 ? ' ' : '') + n, '');

/**
 * Zmniejsza ścieżkę z map-shapes (`M x,yLx,y…Z`): punkty zaokrąglone do pełnych pikseli, powtórzone punkty
 * usunięte, współrzędne względne. Pierścień, z którego zostały mniej niż 3 punkty (niewidoczny), znika.
 */
export function compactPath(d: string): string {
  const rings: string[] = [];
  for (const raw of d.split('M')) {
    const pts = raw
      .replace(/Z/g, '')
      .split('L')
      .map((p) => p.trim().split(',').map((n) => Math.round(Number(n))))
      .filter((p): p is [number, number] => p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
    const kept: [number, number][] = [];
    for (const p of pts) {
      const prev = kept[kept.length - 1];
      if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) kept.push(p);
    }
    const first = kept[0];
    const last = kept[kept.length - 1];
    if (first && last && kept.length > 1 && first[0] === last[0] && first[1] === last[1]) kept.pop();
    if (kept.length < 3) continue;
    const deltas = kept.slice(1).flatMap((p, i) => [p[0] - kept[i]![0], p[1] - kept[i]![1]]);
    rings.push(`M${joinNums(kept[0]!)}l${joinNums(deltas)}z`);
  }
  return rings.join('');
}

/** Liczba w legendzie bez jednostki (jednostka raz, nad legendą), żeby podpisy się nie nakładały. */
const legendNumber = (value: number, unit: string) =>
  formatValue(value, null, getFractionDigits(unit)).replace(/^-/, '−');

/** Tytuł w maks. 2 liniach; za długi kończy się wielokropkiem. */
export function titleLines(title: string): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    if (line && (line + ' ' + word).length > TITLE_LINE) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  if (lines.length <= 2) return lines;
  return [lines[0]!, `${lines[1]!.slice(0, TITLE_LINE - 1)}…`];
}

/** Legenda: dla każdej klasy najmniejsza i największa wartość jednostek, które do niej trafiły. */
function legend(values: readonly MapValue[], breaks: number[], unit: string, anyNoData: boolean): string {
  const ranges: { min: number; max: number }[] = [];
  for (const v of values) {
    const c = classify(v.value, breaks);
    if (c === 'no-data') continue;
    const r = ranges[c];
    ranges[c] = r ? { min: Math.min(r.min, v.value), max: Math.max(r.max, v.value) } : { min: v.value, max: v.value };
  }
  const step = MAP_WIDTH / CLASSES;
  const y = LEGEND_Y + 20;
  const small = font.scale.xs;
  const unitLabel = unit.trim() ? `<text x="8" y="${LEGEND_Y + 10}">Wartość (${text(displayUnit(unit))})</text>` : '';
  const items = seq.map((fill, i) => {
    const x = i * step + 8;
    const r = ranges[i];
    const label = r
      ? `<text x="${x}" y="${y + 34}">od ${text(legendNumber(r.min, unit))}</text><text x="${x}" y="${y + 52}">do ${text(legendNumber(r.max, unit))}</text>`
      : '';
    return `<rect x="${x}" y="${y}" width="${step - 24}" height="14" fill="${fill}"/>${label}`;
  });
  const footY = MAP_HEIGHT - 16;
  const nd = anyNoData
    ? `<rect x="8" y="${footY - 30}" width="14" height="14" fill="${noData}" stroke="${colors.linia}"/><text x="28" y="${footY - 18}">brak danych</text>`
    : '';
  return `<g font-size="${small}" fill="${colors.olowek}">${unitLabel}${items.join('')}${nd}<text x="8" y="${footY}">Źródło: GUS, Bank Danych Lokalnych · faktografia.eu</text></g>`;
}

/** Dokument SVG mapy rankingu. */
export function rankingMapSvg(input: RankingMapInput): string {
  const byTeryt = new Map(input.values.map((v) => [v.teryt, v.value]));
  const breaks = computeBreaks(input.values.map((v) => v.value), 'quantile', CLASSES);
  const classOf = (teryt: string) => {
    const c = classify(byTeryt.get(teryt), breaks);
    return c === 'no-data' ? 'noData' : (Math.min(c, CLASSES - 1) as 0 | 1 | 2 | 3 | 4);
  };
  const { shapes } = mapShapes([...input.features], { box: { x: 0, y: TITLE_H, width: MAP_WIDTH, height: MAP_AREA }, padding: 8, classOf });
  const paths = shapes
    .map((s) => ({ ...s, d: compactPath(s.d) }))
    .filter((s) => s.d)
    .map((s) => `<path d="${s.d}" fill="${s.fill === 'noData' ? noData : seq[s.fill]}"/>`)
    .join('');
  const anyNoData = shapes.some((s) => s.fill === 'noData');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" ` +
    `font-family="${attr(font.sans)}" role="img" aria-label="${attr(rankingMapAlt(input))}">` +
    `<title>${text(input.title)}</title>` +
    `<rect width="${MAP_WIDTH}" height="${MAP_HEIGHT}" fill="${colors.arkusz}"/>` +
    `<g font-size="${font.scale.sm}" font-weight="${font.weights.heading}" fill="${colors.tusz}">` +
    titleLines(input.title).map((l, i) => `<text x="8" y="${24 + i * 24}">${text(l)}</text>`).join('') +
    '</g>' +
    `<g stroke="${colors.arkusz}" stroke-width="0.6" stroke-linejoin="round">${paths}</g>` +
    `${legend(input.values, breaks, input.unit, anyNoData)}</svg>\n`
  );
}

/** Rysunek na stronie rankingu: obrazek z opisem alt i podpisem ze źródłem. */
export function rankingMapFigure(src: string, alt: string, caption: string): string {
  return (
    `<figure class="mt-8"><img src="${attr(src)}" alt="${attr(alt)}" width="${MAP_WIDTH}" height="${MAP_HEIGHT}" ` +
    `decoding="async" class="block h-auto w-full max-w-2xl border border-linia">` +
    `<figcaption class="mt-2 text-sm text-olowek">${text(caption)}</figcaption></figure>`
  );
}
