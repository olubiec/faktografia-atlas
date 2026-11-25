import { classify, legendBreaks } from '../map/classes';
import { schemeFor } from '../map/choropleth';
import { LEVEL_LABELS } from '../map/main-view';
import { compare } from '../compare/compare';
import { formatValue, getFractionDigits } from '../format/number';
import { buildProfile, type Indicator, type IndicatorValues, type ProfileIndicatorItem, type UnitProfile } from '../profile/profile';
import { rankUnits } from '../ranking/ranking';
import type { Unit, UnitLevel } from '../units/types';
import { unitTitle } from '../units/label';
import { cardScene, type CardData, type SceneKind, type CardScene, type CardTheme, type HistogramCardData, type MapCardData } from './card';
import type { DeckPage } from './deck';
import type { ShareFormatKey } from './formats';
import type { MeasureFn } from './text-fit';
import { versusShareData } from './versus-data';

/** Wszystko, co strona zestawu może pokazać; dane już wczytane, niczego się tu nie pobiera. */
export type PageSceneContext = {
  year: number;
  level: UnitLevel;
  units: Unit[];
  /** Definicje wskaźników: główne i z biblioteki (te ostatnie z `higherIsBetter: null`). */
  indicators: Indicator[];
  /** Wartości po id wskaźnika – dla wskaźników z biblioteki tak samo jak dla głównych. */
  values: Record<string, IndicatorValues>;
  placeTeryt?: string | null;
  pair?: [string, string] | null;
  features?: unknown;
};

const RANKING_LIMIT = 10;

const indicatorsOf = (page: DeckPage, ctx: PageSceneContext): Indicator[] =>
  page.indicatorIds.flatMap((id) => ctx.indicators.filter((i) => i.id === id));

const placeName = (profile: UnitProfile): string => (profile.unit ? unitTitle(profile.unit) : `TERYT ${profile.teryt}`);

/** Wartość bez jednostki (jednostka jest osobnym napisem na karcie), z tą samą liczbą miejsc po przecinku. */
const plainValue = (v: number | null, unit: string): string => (v == null ? '' : formatValue(v, null, getFractionDigits(unit)));

function profileOf(teryt: string | null | undefined, inds: Indicator[], ctx: PageSceneContext): UnitProfile | null {
  if (!teryt || inds.length === 0) return null;
  const profile = buildProfile(teryt, inds, ctx.values, ctx.units);
  return profile.unit ? profile : null;
}

const rankText = (item: ProfileIndicatorItem): string | undefined => (item.rankNational ? `${item.rankNational}. miejsce w Polsce` : undefined);

function mapData(ind: Indicator, ctx: PageSceneContext): MapCardData {
  const vs = ctx.values[ind.id];
  const idx = vs ? vs.years.indexOf(ctx.year) : -1;
  const at = (u: Unit): number | null => (idx < 0 ? null : (vs.values[u.teryt]?.[idx] ?? null));
  const scope = ctx.units.filter((u) => u.level === ctx.level);
  const breaks = legendBreaks(scope.map(at));
  const classes: Record<string, 0 | 1 | 2 | 3 | 4 | 'noData'> = {};
  for (const u of scope) {
    const c = classify(at(u), breaks);
    classes[u.teryt] = c === 'no-data' ? 'noData' : (Math.min(c, 4) as 0 | 1 | 2 | 3 | 4);
  }
  return {
    indicator: { name: ind.name, unit: ind.unit, year: ctx.year }, year: ctx.year,
    unitName: `${ctx.year}, ${LEVEL_LABELS[ctx.level].toLowerCase()}`,
    features: ctx.features, classOf: classes, selectedTeryt: ctx.placeTeryt ?? undefined,
  };
}

function rankingData(ind: Indicator, ctx: PageSceneContext, side: 'top' | 'bottom') {
  const vs = ctx.values[ind.id];
  if (!vs) return null;
  const ranked = rankUnits({ values: vs, units: ctx.units, level: ctx.level, year: ctx.year, higherIsBetter: ind.higherIsBetter ?? null }).items;
  if (ranked.length === 0) return null;
  const list = side === 'bottom' ? ranked.slice(-RANKING_LIMIT) : ranked.slice(0, RANKING_LIMIT);
  const byTeryt = new Map(ctx.units.map((u) => [u.teryt, u]));
  return {
    indicator: { name: ind.name, unit: ind.unit }, year: ctx.year, selectedTeryt: ctx.placeTeryt ?? undefined,
    items: list.map((r) => ({
      teryt: r.teryt, name: (byTeryt.get(r.teryt)?.name ?? r.name).replace(/^powiat /, ''), value: r.value,
      valueText: formatValue(r.value, ind.unit), rank: r.rank, selected: r.teryt === ctx.placeTeryt,
    })),
  };
}

function histogramData(ind: Indicator, ctx: PageSceneContext): HistogramCardData | null {
  const vs = ctx.values[ind.id];
  const idx = vs ? vs.years.indexOf(ctx.year) : -1;
  if (!vs || idx < 0) return null;
  const scope = ctx.units.filter((u) => u.level === ctx.level);
  const values = scope.map((u) => vs.values[u.teryt]?.[idx] ?? null);
  return {
    indicator: { name: ind.name, unit: ind.unit }, year: ctx.year, levelName: LEVEL_LABELS[ctx.level].toLowerCase(),
    // Te same progi i schemat kolorów co legenda mapy.
    values, breaks: legendBreaks(values), scheme: schemeFor(values),
    selectedValue: ctx.placeTeryt ? (vs.values[ctx.placeTeryt]?.[idx] ?? null) : undefined,
  };
}

/** Dane karty dla strony zestawu albo null, gdy brakuje czegoś wymaganego. */
function pageCard(page: DeckPage, ctx: PageSceneContext): { kind: SceneKind; data: CardData } | null {
  const inds = indicatorsOf(page, ctx);
  const first = inds[0];
  if (!first) return null;
  const place = profileOf(ctx.placeTeryt, inds, ctx);
  switch (page.kind) {
    case 'map':
      return { kind: 'map', data: mapData(first, ctx) };
    case 'ranking': {
      const data = rankingData(first, ctx, page.options?.side ?? 'top');
      return data && { kind: 'ranking', data };
    }
    case 'histogram': {
      const data = histogramData(first, ctx);
      return data && { kind: 'histogram', data };
    }
    case 'table': {
      if (!place) return null;
      const rows = place.indicators.map((i) => ({ name: i.indicator.name, valueText: formatValue(i.value, i.indicator.unit), rank: i.rankNational ? `${i.rankNational}.` : undefined }));
      return { kind: 'table', data: { unitName: placeName(place), year: ctx.year, rows } };
    }
    case 'bignumber': {
      const item = place?.indicators[0];
      if (!place || !item || item.value == null) return null;
      return { kind: 'bignumber', data: { indicator: { name: first.name, unit: first.unit }, valueText: plainValue(item.value, first.unit), rankText: rankText(item), unitName: placeName(place), year: item.year ?? ctx.year } };
    }
    case 'trend': {
      const item = place?.indicators[0];
      if (!place || !item) return null;
      return { kind: 'trend', data: { indicator: { name: first.name, unit: first.unit }, unitName: placeName(place), series: item.series } };
    }
    case 'profile': {
      const head = place?.indicators[0];
      if (!place || !head) return null;
      const others = place.indicators.slice(1).map((i) => ({ name: i.indicator.name, value: formatValue(i.value, i.indicator.unit), unit: i.indicator.unit, rankText: i.rankNational ? `${i.rankNational}. miejsce` : undefined }));
      return { kind: 'profile', data: { unitName: placeName(place), teryt: place.teryt, indicatorName: first.name, unit: first.unit, year: head.year ?? ctx.year, bigNumber: head.value != null ? formatValue(head.value, first.unit) : 'brak danych', rankText: rankText(head), indicators: others } };
    }
    case 'compare':
    case 'versus': {
      const a = profileOf(ctx.pair?.[0], inds, ctx);
      const b = profileOf(ctx.pair?.[1], inds, ctx);
      if (!a || !b) return null;
      if (page.kind === 'versus') {
        const v = versusShareData(a, b, ctx.year).versus;
        return v && { kind: 'versus', data: v };
      }
      const rows = compare(a, b).rows.map((r) => {
        const i = inds.find((x) => x.id === r.indicatorId);
        return { indicatorName: i?.name ?? r.indicatorId, valA: formatValue(r.a, i?.unit), valB: formatValue(r.b, i?.unit), diffText: r.diffText };
      });
      return { kind: 'compare', data: { indicatorName: first.name, year: ctx.year, unitA: { name: placeName(a), teryt: a.teryt }, unitB: { name: placeName(b), teryt: b.teryt }, rows } };
    }
  }
}

/** Scena karty dla jednej strony zestawu; `label` to numer „n/N” w stopce. Null = „Brak danych dla tej strony”. */
export function pageScene(page: DeckPage, label: string, ctx: PageSceneContext, format: ShareFormatKey, theme: CardTheme, measure: MeasureFn): CardScene | null {
  const card = pageCard(page, ctx);
  if (!card) return null;
  return cardScene(card.kind, card.data, format, theme, { measure, pageLabel: label });
}
