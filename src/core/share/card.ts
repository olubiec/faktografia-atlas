import tokens from '../../../config/tokens.json';
import { mapShapes } from './map-shapes';
import { fitText, type MeasureFn } from './text-fit';
import { SHARE_FORMATS, type ShareFormatKey } from './formats';

export type CardKind = 'map' | 'ranking' | 'profile' | 'compare';
export type CardTheme = 'light' | 'dark';

export type TextItem = {
  type: 'text';
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontWeight: number | string;
  color: string;
  align?: 'left' | 'center' | 'right';
  lines: string[];
  lineHeight: number;
};

export type RectItem = {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
};

export type PathItem = {
  type: 'path';
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type ImageItem = {
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnnotationItem = {
  type: 'annotation';
  kind: 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type CardItem = TextItem | RectItem | PathItem | ImageItem | AnnotationItem;

export type CardScene = {
  width: number;
  height: number;
  background: string;
  items: CardItem[];
};

export type CardSceneOptions = {
  measure: MeasureFn;
  siteUrl?: string;
};

export type MapCardData = {
  indicator: { name: string; unit?: string; year?: number };
  year: number;
  unitName?: string;
  features?: unknown;
  classOf?: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> | ((teryt: string) => 0 | 1 | 2 | 3 | 4 | 'noData');
  selectedTeryt?: string;
};

export type RankingCardItem = {
  teryt?: string;
  name: string;
  value: number | null;
  valueText?: string;
  rank?: number;
  selected?: boolean;
};

export type RankingCardData = {
  indicator: { name: string; unit?: string };
  year: number;
  items: RankingCardItem[];
  selectedTeryt?: string;
};

export type ProfileCardIndicator = {
  name: string;
  value: string;
  unit?: string;
  rankText?: string;
};

export type ProfileCardData = {
  unitName: string;
  teryt?: string;
  indicatorName: string;
  unit?: string;
  year: number;
  bigNumber: string;
  rankText?: string;
  indicators: ProfileCardIndicator[];
};

export type CompareCardRow = {
  indicatorName: string;
  valA: string;
  valB: string;
  diffText: string;
};

export type CompareCardUnit = {
  name: string;
  teryt: string;
  features?: unknown;
  classOf?: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> | ((teryt: string) => 0 | 1 | 2 | 3 | 4 | 'noData');
};

export type CompareCardData = {
  indicatorName: string;
  year: number;
  unitA: CompareCardUnit;
  unitB: CompareCardUnit;
  rows: CompareCardRow[];
};

export type CardData = MapCardData | RankingCardData | ProfileCardData | CompareCardData;

function getThemeColors(theme: CardTheme) {
  const c = tokens.color[theme];
  const seq = tokens.data.sequential[theme];
  const noDataColor = tokens.data.noData[theme];
  return {
    kalka: c.kalka,
    arkusz: c.arkusz,
    linia: c.linia,
    tusz: c.tusz,
    olowek: c.olowek,
    korekta: c.korekta,
    korektaTekst: c.korektaTekst,
    seq,
    noDataColor,
  };
}

export function cardScene(
  kind: CardKind,
  data: CardData,
  formatKey: ShareFormatKey,
  theme: CardTheme,
  options: CardSceneOptions
): CardScene {
  const fmt = SHARE_FORMATS[formatKey] ?? SHARE_FORMATS.post;
  const { width, height, safe } = fmt;
  const colors = getThemeColors(theme);
  const { measure, siteUrl = 'faktografia.pl' } = options;

  const scaleFactor = width / 1080;

  const fontScale = {
    xs: Math.round(tokens.font.scale.xs * scaleFactor),
    sm: Math.round(tokens.font.scale.sm * scaleFactor),
    md: Math.round(tokens.font.scale.md * scaleFactor),
    lg: Math.round(tokens.font.scale.lg * scaleFactor),
    xl: Math.round(tokens.font.scale.xl * scaleFactor),
    '2xl': Math.round(tokens.font.scale['2xl'] * scaleFactor),
    '3xl': Math.round(tokens.font.scale['3xl'] * scaleFactor),
    '4xl': Math.round(tokens.font.scale['4xl'] * scaleFactor),
    '5xl': Math.round(tokens.font.scale['5xl'] * scaleFactor),
  };

  const safeWidth = width - safe.left - safe.right;
  const items: CardItem[] = [];

  // Footer area calculations
  const footerFontSize = fontScale.xs;
  const footerLineHeight = Math.round(footerFontSize * 1.2);
  const yearVal = 'year' in data ? data.year : 2025;
  const sourceText = `Źródło: GUS, Bank Danych Lokalnych, ${yearVal}`;

  const siteUrlWidth = measure(siteUrl, footerFontSize, tokens.font.weights.text);

  const footerY = height - safe.bottom - footerLineHeight;

  // Exact 1 source line
  items.push({
    type: 'text',
    x: safe.left,
    y: footerY,
    maxWidth: safeWidth - siteUrlWidth - 16 * scaleFactor,
    fontSize: footerFontSize,
    fontWeight: tokens.font.weights.text,
    color: colors.olowek,
    align: 'left',
    lines: [sourceText],
    lineHeight: footerLineHeight,
  });

  // Footer siteUrl
  items.push({
    type: 'text',
    x: width - safe.right - siteUrlWidth,
    y: footerY,
    maxWidth: siteUrlWidth,
    fontSize: footerFontSize,
    fontWeight: tokens.font.weights.text,
    color: colors.olowek,
    align: 'right',
    lines: [siteUrl],
    lineHeight: footerLineHeight,
  });

  const contentBottom = footerY - 16 * scaleFactor;

  // Header area: Exact 1 Logo
  const logoSrc = theme === 'light' ? 'public/brand/faktografia-logo-granat.svg' : 'public/brand/faktografia-logo-jasne.svg';
  const logoWidth = Math.round(180 * scaleFactor);
  const logoHeight = Math.round(28 * scaleFactor);
  const logoY = safe.top;

  items.push({
    type: 'image',
    src: logoSrc,
    x: safe.left,
    y: logoY,
    width: logoWidth,
    height: logoHeight,
  });

  const titleY = logoY + logoHeight + Math.round(16 * scaleFactor);

  let titleText = '';
  if (kind === 'map') {
    const d = data as MapCardData;
    const unitPart = d.unitName ? ` (${d.unitName})` : '';
    titleText = `${d.indicator.name}${unitPart}`;
  } else if (kind === 'ranking') {
    const d = data as RankingCardData;
    titleText = `${d.indicator.name} – ranking`;
  } else if (kind === 'profile') {
    const d = data as ProfileCardData;
    titleText = d.unitName;
  } else if (kind === 'compare') {
    const d = data as CompareCardData;
    titleText = `Porównanie: ${d.unitA.name} i ${d.unitB.name}`;
  }

  const titleFit = fitText(titleText, {
    maxWidth: safeWidth,
    maxLines: 2,
    fontSize: fontScale.xl,
    fontWeight: tokens.font.weights.title,
    measure,
    canvasWidth: width,
  });

  items.push({
    type: 'text',
    x: safe.left,
    y: titleY,
    maxWidth: safeWidth,
    fontSize: titleFit.fontSize,
    fontWeight: tokens.font.weights.title,
    color: colors.tusz,
    align: 'left',
    lines: titleFit.lines,
    lineHeight: titleFit.lineHeight,
  });

  const contentTop = titleY + titleFit.totalHeight + Math.round(16 * scaleFactor);
  const availableContentHeight = contentBottom - contentTop;

  // Kind-specific layouts
  if (kind === 'map') {
    renderMapContent({
      data: data as MapCardData,
      contentTop,
      contentBottom,
      safe,
      safeWidth,
      colors,
      items,
      scaleFactor,
    });
  } else if (kind === 'ranking') {
    renderRankingContent({
      data: data as RankingCardData,
      contentTop,
      availableContentHeight,
      safe,
      safeWidth,
      fontScale,
      colors,
      items,
      measure,
      scaleFactor,
    });
  } else if (kind === 'profile') {
    renderProfileContent({
      data: data as ProfileCardData,
      contentTop,
      availableContentHeight,
      safe,
      safeWidth,
      fontScale,
      colors,
      items,
      measure,
      scaleFactor,
    });
  } else if (kind === 'compare') {
    renderCompareContent({
      data: data as CompareCardData,
      contentTop,
      availableContentHeight,
      safe,
      safeWidth,
      fontScale,
      colors,
      items,
      measure,
      scaleFactor,
    });
  }

  return {
    width,
    height,
    background: colors.kalka,
    items,
  };
}

function renderMapContent({
  data,
  contentTop,
  contentBottom,
  safe,
  safeWidth,
  colors,
  items,
  scaleFactor,
}: {
  data: MapCardData;
  contentTop: number;
  contentBottom: number;
  safe: { left: number; right: number };
  safeWidth: number;
  colors: ReturnType<typeof getThemeColors>;
  items: CardItem[];
  scaleFactor: number;
}) {
  const legendHeight = Math.round(24 * scaleFactor);
  const mapY = contentTop;
  const mapHeight = contentBottom - contentTop - legendHeight - Math.round(12 * scaleFactor);

  if (data.features && mapHeight > 50) {
    const mapBox = {
      x: safe.left,
      y: mapY,
      width: safeWidth,
      height: mapHeight,
    };

    const res = mapShapes(data.features, {
      box: mapBox,
      padding: 10 * scaleFactor,
      classOf: data.classOf,
      selected: data.selectedTeryt,
    });

    for (const shape of res.shapes) {
      const fillColor =
        shape.fill === 'noData'
          ? colors.noDataColor
          : colors.seq[shape.fill] ?? colors.noDataColor;

      items.push({
        type: 'path',
        d: shape.d,
        fill: fillColor,
        stroke: shape.selected ? colors.korekta : colors.arkusz,
        strokeWidth: shape.selected ? 2.5 : 0.5,
      });
    }

    if (res.outline) {
      items.push({
        type: 'path',
        d: res.outline,
        stroke: colors.tusz,
        strokeWidth: 1.5,
      });
    }
  }

  // Render legend bar
  const legendY = contentBottom - legendHeight;
  const classCount = 5;
  const classWidth = Math.round((safeWidth - 100 * scaleFactor) / classCount);

  items.push({
    type: 'text',
    x: safe.left,
    y: legendY,
    maxWidth: safeWidth,
    fontSize: Math.round(tokens.font.scale.xs * scaleFactor),
    fontWeight: tokens.font.weights.text,
    color: colors.olowek,
    align: 'left',
    lines: ['mniej → więcej'],
    lineHeight: Math.round(tokens.font.scale.xs * scaleFactor * 1.2),
  });

  const legendBarX = safe.left + Math.round(100 * scaleFactor);
  for (let i = 0; i < classCount; i++) {
    items.push({
      type: 'rect',
      x: legendBarX + i * classWidth,
      y: legendY,
      width: classWidth - 2,
      height: Math.round(12 * scaleFactor),
      fill: colors.seq[i],
    });
  }
}

function renderRankingContent({
  data,
  contentTop,
  availableContentHeight,
  safe,
  safeWidth,
  fontScale,
  colors,
  items,
  measure,
  scaleFactor,
}: {
  data: RankingCardData;
  contentTop: number;
  availableContentHeight: number;
  safe: { left: number; right: number };
  safeWidth: number;
  fontScale: Record<string, number>;
  colors: ReturnType<typeof getThemeColors>;
  items: CardItem[];
  measure: MeasureFn;
  scaleFactor: number;
}) {
  const itemsList = data.items.length <= 20 ? data.items : data.items.slice(0, 20);
  if (itemsList.length === 0) return;

  const rowGap = Math.max(2, Math.floor((availableContentHeight - itemsList.length * 16 * scaleFactor) / itemsList.length));
  const rowHeight = Math.min(Math.round(36 * scaleFactor), Math.floor(availableContentHeight / itemsList.length) - rowGap);

  let maxValue = 0;
  for (const it of itemsList) {
    if (it.value !== null && Math.abs(it.value) > maxValue) {
      maxValue = Math.abs(it.value);
    }
  }
  if (maxValue === 0) maxValue = 1;

  const rankWidth = Math.round(36 * scaleFactor);
  const valWidth = Math.round(100 * scaleFactor);
  const nameWidth = Math.round(420 * scaleFactor);
  const barStartX = safe.left + rankWidth + nameWidth + Math.round(12 * scaleFactor);
  const maxBarWidth = safeWidth - rankWidth - nameWidth - valWidth - Math.round(24 * scaleFactor);

  let currentY = contentTop;

  for (let i = 0; i < itemsList.length; i++) {
    const item = itemsList[i];
    const isSelected = item.selected || (data.selectedTeryt && item.teryt === data.selectedTeryt);

    const rankStr = `${item.rank ?? i + 1}.`;
    items.push({
      type: 'text',
      x: safe.left,
      y: currentY + Math.round(2 * scaleFactor),
      maxWidth: rankWidth,
      fontSize: fontScale.sm,
      fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text,
      color: isSelected ? colors.korektaTekst : colors.olowek,
      lines: [rankStr],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    const nameFit = fitText(item.name, {
      maxWidth: nameWidth,
      maxLines: 1,
      fontSize: fontScale.sm,
      fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text,
      measure,
      canvasWidth: 1080 * scaleFactor,
      minFontSize: fontScale.xs,
    });

    items.push({
      type: 'text',
      x: safe.left + rankWidth,
      y: currentY + Math.round(2 * scaleFactor),
      maxWidth: nameWidth,
      fontSize: nameFit.fontSize,
      fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text,
      color: isSelected ? colors.korektaTekst : colors.tusz,
      lines: nameFit.lines,
      lineHeight: nameFit.lineHeight,
    });

    // Bar rect
    const barRatio = item.value !== null ? Math.max(0.02, Math.abs(item.value) / maxValue) : 0;
    const barWidth = Math.max(0, Math.round(maxBarWidth * barRatio));

    if (barWidth > 0) {
      items.push({
        type: 'rect',
        x: barStartX,
        y: currentY + Math.round(4 * scaleFactor),
        width: barWidth,
        height: Math.max(4, rowHeight - Math.round(8 * scaleFactor)),
        fill: isSelected ? colors.korekta : colors.seq[3],
      });
    }

    // Value text
    const valStr = item.valueText ?? (item.value !== null ? String(item.value) : 'brak danych');
    items.push({
      type: 'text',
      x: barStartX + barWidth + Math.round(8 * scaleFactor),
      y: currentY + Math.round(2 * scaleFactor),
      maxWidth: valWidth,
      fontSize: fontScale.sm,
      fontWeight: isSelected ? tokens.font.weights.heading : tokens.font.weights.text,
      color: isSelected ? colors.korektaTekst : colors.tusz,
      lines: [valStr],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    currentY += rowHeight + rowGap;
  }
}

function renderProfileContent({
  data,
  contentTop,
  availableContentHeight,
  safe,
  safeWidth,
  fontScale,
  colors,
  items,
  measure,
  scaleFactor,
}: {
  data: ProfileCardData;
  contentTop: number;
  availableContentHeight: number;
  safe: { left: number; right: number };
  safeWidth: number;
  fontScale: Record<string, number>;
  colors: ReturnType<typeof getThemeColors>;
  items: CardItem[];
  measure: MeasureFn;
  scaleFactor: number;
}) {
  let currentY = contentTop;

  // Indicator name
  const indNameFit = fitText(data.indicatorName, {
    maxWidth: safeWidth,
    maxLines: 1,
    fontSize: fontScale.lg,
    fontWeight: tokens.font.weights.subtitle,
    measure,
    canvasWidth: 1080 * scaleFactor,
  });

  items.push({
    type: 'text',
    x: safe.left,
    y: currentY,
    maxWidth: safeWidth,
    fontSize: indNameFit.fontSize,
    fontWeight: tokens.font.weights.subtitle,
    color: colors.olowek,
    lines: indNameFit.lines,
    lineHeight: indNameFit.lineHeight,
  });

  currentY += indNameFit.totalHeight + Math.round(12 * scaleFactor);

  // Big number + unit
  const numText = data.unit ? `${data.bigNumber} ${data.unit}` : data.bigNumber;
  const numFontSize = fontScale['4xl'];
  const numFit = fitText(numText, {
    maxWidth: safeWidth,
    maxLines: 1,
    fontSize: numFontSize,
    fontWeight: tokens.font.weights.title,
    measure,
    canvasWidth: 1080 * scaleFactor,
  });

  const numY = currentY;
  items.push({
    type: 'text',
    x: safe.left,
    y: numY,
    maxWidth: safeWidth,
    fontSize: numFit.fontSize,
    fontWeight: tokens.font.weights.title,
    color: colors.tusz,
    lines: numFit.lines,
    lineHeight: numFit.lineHeight,
  });

  // Exactly 1 Annotation (circle around the big number)
  const numWidth = measure(numText, numFit.fontSize, tokens.font.weights.title);
  items.push({
    type: 'annotation',
    kind: 'circle',
    x: safe.left - Math.round(8 * scaleFactor),
    y: numY - Math.round(4 * scaleFactor),
    width: Math.min(safeWidth, numWidth + Math.round(16 * scaleFactor)),
    height: numFit.totalHeight + Math.round(8 * scaleFactor),
    color: colors.korekta,
  });

  currentY += numFit.totalHeight + Math.round(16 * scaleFactor);

  // Rank text
  if (data.rankText) {
    items.push({
      type: 'text',
      x: safe.left,
      y: currentY,
      maxWidth: safeWidth,
      fontSize: fontScale.md,
      fontWeight: tokens.font.weights.subtitle,
      color: colors.korektaTekst,
      lines: [data.rankText],
      lineHeight: Math.round(fontScale.md * 1.2),
    });
    currentY += Math.round(28 * scaleFactor);
  }

  currentY += Math.round(20 * scaleFactor);

  // 5 additional indicators list
  const remainingHeight = availableContentHeight - (currentY - contentTop);
  const indList = data.indicators.slice(0, 5);
  if (indList.length === 0) return;

  const itemHeight = Math.floor(remainingHeight / indList.length);

  for (const ind of indList) {
    const valText = ind.unit ? `${ind.value} ${ind.unit}` : ind.value;
    const nameWidth = Math.round(safeWidth * 0.6);
    const valWidth = safeWidth - nameWidth - Math.round(16 * scaleFactor);

    const nameFit = fitText(ind.name, {
      maxWidth: nameWidth,
      maxLines: 2,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.text,
      measure,
      canvasWidth: 1080 * scaleFactor,
    });

    items.push({
      type: 'text',
      x: safe.left,
      y: currentY,
      maxWidth: nameWidth,
      fontSize: nameFit.fontSize,
      fontWeight: tokens.font.weights.text,
      color: colors.tusz,
      lines: nameFit.lines,
      lineHeight: nameFit.lineHeight,
    });

    items.push({
      type: 'text',
      x: safe.left + nameWidth + Math.round(16 * scaleFactor),
      y: currentY,
      maxWidth: valWidth,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.heading,
      color: colors.tusz,
      align: 'right',
      lines: [valText],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    currentY += itemHeight;
  }
}

function renderCompareContent({
  data,
  contentTop,
  availableContentHeight,
  safe,
  safeWidth,
  fontScale,
  colors,
  items,
  measure,
  scaleFactor,
}: {
  data: CompareCardData;
  contentTop: number;
  availableContentHeight: number;
  safe: { left: number; right: number };
  safeWidth: number;
  fontScale: Record<string, number>;
  colors: ReturnType<typeof getThemeColors>;
  items: CardItem[];
  measure: MeasureFn;
  scaleFactor: number;
}) {
  let currentY = contentTop;

  // Render 2 mini-maps if features exist
  const miniMapHeight = Math.min(Math.round(180 * scaleFactor), Math.floor(availableContentHeight * 0.3));
  const miniMapWidth = Math.round((safeWidth - 24 * scaleFactor) / 2);

  if (data.unitA.features || data.unitB.features) {
    if (data.unitA.features) {
      const boxA = { x: safe.left, y: currentY, width: miniMapWidth, height: miniMapHeight };
      const shapesA = mapShapes(data.unitA.features, {
        box: boxA,
        padding: 5 * scaleFactor,
        classOf: data.unitA.classOf,
        selected: data.unitA.teryt,
      });
      for (const s of shapesA.shapes) {
        items.push({
          type: 'path',
          d: s.d,
          fill: s.fill === 'noData' ? colors.noDataColor : colors.seq[s.fill] ?? colors.noDataColor,
          stroke: s.selected ? colors.korekta : colors.arkusz,
          strokeWidth: s.selected ? 2 : 0.5,
        });
      }
    }

    if (data.unitB.features) {
      const boxB = { x: safe.left + miniMapWidth + Math.round(24 * scaleFactor), y: currentY, width: miniMapWidth, height: miniMapHeight };
      const shapesB = mapShapes(data.unitB.features, {
        box: boxB,
        padding: 5 * scaleFactor,
        classOf: data.unitB.classOf,
        selected: data.unitB.teryt,
      });
      for (const s of shapesB.shapes) {
        items.push({
          type: 'path',
          d: s.d,
          fill: s.fill === 'noData' ? colors.noDataColor : colors.seq[s.fill] ?? colors.noDataColor,
          stroke: s.selected ? colors.korekta : colors.arkusz,
          strokeWidth: s.selected ? 2 : 0.5,
        });
      }
    }

    currentY += miniMapHeight + Math.round(16 * scaleFactor);
  }

  // Table rows (up to 8 rows)
  const rowsList = data.rows.slice(0, 8);
  if (rowsList.length === 0) return;

  const tableHeaderY = currentY;
  const col1Width = Math.round(safeWidth * 0.4);
  const col23Width = Math.round(safeWidth * 0.18);
  const col4Width = safeWidth - col1Width - col23Width * 2;

  // Table headers
  items.push({
    type: 'text',
    x: safe.left,
    y: tableHeaderY,
    maxWidth: col1Width,
    fontSize: fontScale.xs,
    fontWeight: tokens.font.weights.subtitle,
    color: colors.olowek,
    lines: ['Wskaźnik'],
    lineHeight: Math.round(fontScale.xs * 1.2),
  });

  items.push({
    type: 'text',
    x: safe.left + col1Width,
    y: tableHeaderY,
    maxWidth: col23Width,
    fontSize: fontScale.xs,
    fontWeight: tokens.font.weights.subtitle,
    color: colors.olowek,
    lines: [data.unitA.name],
    lineHeight: Math.round(fontScale.xs * 1.2),
  });

  items.push({
    type: 'text',
    x: safe.left + col1Width + col23Width,
    y: tableHeaderY,
    maxWidth: col23Width,
    fontSize: fontScale.xs,
    fontWeight: tokens.font.weights.subtitle,
    color: colors.olowek,
    lines: [data.unitB.name],
    lineHeight: Math.round(fontScale.xs * 1.2),
  });

  items.push({
    type: 'text',
    x: safe.left + col1Width + col23Width * 2,
    y: tableHeaderY,
    maxWidth: col4Width,
    fontSize: fontScale.xs,
    fontWeight: tokens.font.weights.subtitle,
    color: colors.olowek,
    lines: ['Różnica'],
    lineHeight: Math.round(fontScale.xs * 1.2),
  });

  currentY += Math.round(20 * scaleFactor);

  const remainingHeight = availableContentHeight - (currentY - contentTop);
  const rowHeight = Math.floor(remainingHeight / rowsList.length);

  for (const row of rowsList) {
    const nameFit = fitText(row.indicatorName, {
      maxWidth: col1Width - 8,
      maxLines: 2,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.text,
      measure,
      canvasWidth: 1080 * scaleFactor,
    });

    items.push({
      type: 'text',
      x: safe.left,
      y: currentY,
      maxWidth: col1Width,
      fontSize: nameFit.fontSize,
      fontWeight: tokens.font.weights.text,
      color: colors.tusz,
      lines: nameFit.lines,
      lineHeight: nameFit.lineHeight,
    });

    items.push({
      type: 'text',
      x: safe.left + col1Width,
      y: currentY,
      maxWidth: col23Width,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.subtitle,
      color: colors.tusz,
      lines: [row.valA],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    items.push({
      type: 'text',
      x: safe.left + col1Width + col23Width,
      y: currentY,
      maxWidth: col23Width,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.subtitle,
      color: colors.tusz,
      lines: [row.valB],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    items.push({
      type: 'text',
      x: safe.left + col1Width + col23Width * 2,
      y: currentY,
      maxWidth: col4Width,
      fontSize: fontScale.sm,
      fontWeight: tokens.font.weights.text,
      color: colors.olowek,
      lines: [row.diffText],
      lineHeight: Math.round(fontScale.sm * 1.2),
    });

    currentY += rowHeight;
  }
}
