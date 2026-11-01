import tokens from '../../../config/tokens.json';
import { fitText, type MeasureFn } from './text-fit';
import { SHARE_FORMATS, type ShareFormatKey } from './formats';
import { type MapCardData, renderMapContent } from './card-map';
import { type RankingCardData, type RankingCardItem, renderRankingContent } from './card-ranking';
import { type ProfileCardData, type ProfileCardIndicator, renderProfileContent } from './card-profile';
import { type CompareCardData, type CompareCardRow, type CompareCardUnit, renderCompareContent } from './card-compare';

export type { MapCardData, RankingCardData, RankingCardItem, ProfileCardData, ProfileCardIndicator, CompareCardData, CompareCardRow, CompareCardUnit };


export type CardKind = 'map' | 'ranking' | 'profile' | 'compare';
export type CardTheme = 'light' | 'dark';

export type TextItem = { type: 'text'; x: number; y: number; maxWidth: number; fontSize: number; fontWeight: number | string; color: string; align?: 'left' | 'center' | 'right'; lines: string[]; lineHeight: number; };
export type RectItem = { type: 'rect'; x: number; y: number; width: number; height: number; fill?: string; stroke?: string; strokeWidth?: number; rx?: number; };
export type PathItem = { type: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number; };
export type ImageItem = { type: 'image'; src: string; x: number; y: number; width: number; height: number; };
export type AnnotationItem = { type: 'annotation'; kind: 'circle'; x: number; y: number; width: number; height: number; color: string; };
export type CardItem = TextItem | RectItem | PathItem | ImageItem | AnnotationItem;

export type CardScene = { width: number; height: number; background: string; items: CardItem[]; };
export type CardSceneOptions = { measure: MeasureFn; siteUrl?: string; };

export type CardData = MapCardData | RankingCardData | ProfileCardData | CompareCardData;

export function getThemeColors(theme: CardTheme) {
  const c = tokens.color[theme];
  const seq = tokens.data.sequential[theme];
  const noDataColor = tokens.data.noData[theme];
  return { kalka: c.kalka, arkusz: c.arkusz, linia: c.linia, tusz: c.tusz, olowek: c.olowek, korekta: c.korekta, korektaTekst: c.korektaTekst, seq, noDataColor };
}

export function cardScene(kind: CardKind, data: CardData, formatKey: ShareFormatKey, theme: CardTheme, options: CardSceneOptions): CardScene {
  const fmt = SHARE_FORMATS[formatKey] ?? SHARE_FORMATS.post;
  const { width, height, safe } = fmt;
  const colors = getThemeColors(theme);
  const { measure, siteUrl = 'faktografia.pl' } = options;

  const scaleFactor = width / 1080;
  const fontScale = {
    xs: Math.round(tokens.font.scale.xs * scaleFactor), sm: Math.round(tokens.font.scale.sm * scaleFactor),
    md: Math.round(tokens.font.scale.md * scaleFactor), lg: Math.round(tokens.font.scale.lg * scaleFactor),
    xl: Math.round(tokens.font.scale.xl * scaleFactor), '2xl': Math.round(tokens.font.scale['2xl'] * scaleFactor),
    '3xl': Math.round(tokens.font.scale['3xl'] * scaleFactor), '4xl': Math.round(tokens.font.scale['4xl'] * scaleFactor),
    '5xl': Math.round(tokens.font.scale['5xl'] * scaleFactor),
  };

  const safeWidth = width - safe.left - safe.right;
  const items: CardItem[] = [];

  const footerFontSize = fontScale.xs;
  const footerLineHeight = Math.round(footerFontSize * 1.2);
  const yearVal = 'year' in data ? data.year : 2025;
  const sourceText = `Źródło: GUS, Bank Danych Lokalnych, ${yearVal}`;
  const siteUrlWidth = measure(siteUrl, footerFontSize, tokens.font.weights.text);
  const footerY = height - safe.bottom - footerLineHeight;

  items.push({ type: 'text', x: safe.left, y: footerY, maxWidth: safeWidth - siteUrlWidth - 16 * scaleFactor, fontSize: footerFontSize, fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'left', lines: [sourceText], lineHeight: footerLineHeight });
  items.push({ type: 'text', x: width - safe.right - siteUrlWidth, y: footerY, maxWidth: siteUrlWidth, fontSize: footerFontSize, fontWeight: tokens.font.weights.text, color: colors.olowek, align: 'right', lines: [siteUrl], lineHeight: footerLineHeight });

  const contentBottom = footerY - 16 * scaleFactor;
  const logoSrc = theme === 'light' ? 'public/brand/faktografia-logo-granat.svg' : 'public/brand/faktografia-logo-jasne.svg';
  const logoWidth = Math.round(180 * scaleFactor);
  const logoHeight = Math.round(28 * scaleFactor);
  const logoY = safe.top;

  items.push({ type: 'image', src: logoSrc, x: safe.left, y: logoY, width: logoWidth, height: logoHeight });
  const titleY = logoY + logoHeight + Math.round(16 * scaleFactor);

  let titleText = '';
  if (kind === 'map') {
    const d = data as MapCardData;
    titleText = `${d.indicator.name}${d.unitName ? ` (${d.unitName})` : ''}`;
  } else if (kind === 'ranking') {
    titleText = `${(data as RankingCardData).indicator.name} – ranking`;
  } else if (kind === 'profile') {
    titleText = (data as ProfileCardData).unitName;
  } else if (kind === 'compare') {
    const d = data as CompareCardData;
    titleText = `Porównanie: ${d.unitA.name} i ${d.unitB.name}`;
  }

  const titleFit = fitText(titleText, { maxWidth: safeWidth, maxLines: 2, fontSize: fontScale.xl, fontWeight: tokens.font.weights.title, measure, canvasWidth: width });
  items.push({ type: 'text', x: safe.left, y: titleY, maxWidth: safeWidth, fontSize: titleFit.fontSize, fontWeight: tokens.font.weights.title, color: colors.tusz, align: 'left', lines: titleFit.lines, lineHeight: titleFit.lineHeight });

  const contentTop = titleY + titleFit.totalHeight + Math.round(16 * scaleFactor);
  const availableContentHeight = contentBottom - contentTop;

  if (kind === 'map') renderMapContent({ data: data as MapCardData, contentTop, contentBottom, safe, safeWidth, colors, items, scaleFactor });
  else if (kind === 'ranking') renderRankingContent({ data: data as RankingCardData, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });
  else if (kind === 'profile') renderProfileContent({ data: data as ProfileCardData, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });
  else if (kind === 'compare') renderCompareContent({ data: data as CompareCardData, contentTop, availableContentHeight, safe, safeWidth, fontScale, colors, items, measure, scaleFactor });

  return { width, height, background: colors.kalka, items };
}
