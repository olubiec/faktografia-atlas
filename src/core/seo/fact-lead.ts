// Fakty na stronie miejsca (W26-F03, KONCEPT-ODKRYCIA §8): 3 zdania faktów do `lead`,
// sąsiedzi (F3) i bliźniak (F8) jako linki wewnętrzne. Dane z public/data/facts/<WW>.json (robot).
import type { FactsShard } from '../facts/build';
import { decodeFact, decodeTwin } from '../facts/codec';
import { factSentence, factTemplate } from '../facts/sentences';
import type { SlugUnit } from './slug';
import { shortIndicatorName, showValue, unitHeading, type IndicatorFact } from './sentences';
import type { PageLink, PageProfileItem, UnitPageContext } from './unit-page';

/** Część pliku faktów potrzebna stronie. */
export type PageFacts = Pick<FactsShard, 'units' | 'near' | 'twins'>;

export interface TwinLink extends PageLink {
  /** Nazwa województwa bliźniaka, np. „zachodniopomorskie”. */
  voivodeship: string;
  /** Ile wskaźników porównano. */
  dims: number;
  year: number;
}

export interface FactLead {
  sentences: string[];
  /** Identyfikatory szablonów zdań (audyt S08: ten sam szablon na > 30% stron = ostrzeżenie). */
  templates: string[];
  /** Wskaźniki użyte w zdaniach (żeby zdania S06 ich nie powtarzały). */
  indicatorIds: string[];
  around: PageLink[];
  twin: TwinLink | null;
}

/** Pas typowości F9 (config/facts.json thresholds.typicalBand). */
const TYPICAL_BAND = 10;

/** Link do strony jednostki; pusta ścieżka, gdy strony nie ma (takie linki się pomija). */
function linkTo(u: SlugUnit, ctx: UnitPageContext): PageLink {
  return { teryt: u.teryt, name: unitHeading(u, ctx.units), path: ctx.paths.pathByTeryt.get(u.teryt) ?? '' };
}

/** Zdania faktów, sąsiedzi i bliźniak jednostki. Brak faktów w pliku = pusta lista (strona zostaje przy S06). */
export function factLead(unit: SlugUnit, facts: PageFacts, ctx: UnitPageContext): FactLead {
  const byTeryt = new Map(ctx.units.map((u) => [u.teryt, u]));
  const voivodeship = (t: string) => byTeryt.get(t.slice(0, 2))?.name ?? '';
  const sentences: string[] = [];
  const templates: string[] = [];
  const indicatorIds: string[] = [];
  for (const raw of facts.units[unit.teryt] ?? []) {
    const f = decodeFact(unit.teryt, raw);
    const ind = ctx.indicators.find((i) => i.id === f.indicatorId);
    if (!ind) continue;
    const text = factSentence(f, {
      indicator: { name: ind.name, unit: ind.unit },
      level: unit.level,
      voivodeshipName: voivodeship(unit.teryt),
      typicalBand: TYPICAL_BAND,
    });
    if (!text || sentences.includes(text)) continue;
    sentences.push(text);
    templates.push(factTemplate(f, TYPICAL_BAND));
    indicatorIds.push(f.indicatorId);
  }

  // Sąsiedzi: tylko istniejące adresy, każdy adres raz (gmina miasta na prawach powiatu = adres powiatu).
  const seen = new Set<string>([ctx.paths.pathByTeryt.get(unit.teryt) ?? '']);
  const around: PageLink[] = [];
  for (const t of facts.near?.[unit.teryt] ?? []) {
    const u = byTeryt.get(t);
    const link = u ? linkTo(u, ctx) : null;
    if (!link?.path || seen.has(link.path)) continue;
    seen.add(link.path);
    around.push(link);
  }

  const rawTwin = facts.twins?.[unit.teryt];
  const twinFact = rawTwin ? decodeTwin(unit.teryt, rawTwin) : null;
  const twinUnit = twinFact && twinFact.twin !== unit.teryt ? byTeryt.get(twinFact.twin) : undefined;
  const twinLink = twinUnit ? linkTo(twinUnit, ctx) : null;
  const twin =
    twinFact && twinUnit && twinLink?.path
      ? { ...twinLink, voivodeship: voivodeship(twinUnit.teryt), dims: twinFact.dims, year: twinFact.year }
      : null;
  return { sentences, templates, indicatorIds, around, twin };
}

/** Wskaźnik z najwyższym / najniższym miejscem w kraju (bez neutralnych i danych jednostki nadrzędnej). */
export function extremes(items: PageProfileItem[], ctx: UnitPageContext) {
  const facts: (IndicatorFact & { score: number; id: string })[] = [];
  for (const ind of ctx.indicators) {
    const it = items.find((i) => i.indicatorId === ind.id);
    if (!it || ind.higherIsBetter === null || it.fromParent || it.value === null || it.year === null) continue;
    if (!it.rankNational || !it.totalNational) continue;
    const [name, value] = [shortIndicatorName(ind.name, ind.unit), showValue(it.value, ind.unit)];
    facts.push({ id: ind.id, name, value, year: it.year, rank: it.rankNational, total: it.totalNational, score: it.rankNational / it.totalNational });
  }
  const sorted = [...facts].sort((a, b) => a.score - b.score);
  return { best: sorted[0] ?? null, worst: sorted.length > 1 ? sorted[sorted.length - 1] : null };
}

/**
 * `lead` strony (W26-F03): zdanie o ludności, zdania faktów, potem pozostałe zdania S06 – bez tych o wskaźniku,
 * o którym mówi już fakt, i bez powtórzonych zdań. Bez faktów: dotychczasowe zdania S06.
 */
export function mergeLead(fl: FactLead | null, intro: string | null, rest: [string | null, string | undefined][]): string[] {
  const used = new Set(fl?.indicatorIds ?? []);
  const others = rest.filter(([, id]) => !id || !used.has(id)).map(([text]) => text);
  return [intro, ...(fl?.sentences ?? []), ...others].filter((s, i, all): s is string => s !== null && all.indexOf(s) === i);
}

/** „11 wskaźników”, „3 wskaźniki”. */
const indicatorsWord = (n: number) => {
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'wskaźniki' : 'wskaźników';
};

/** Tekst przed linkiem bliźniaka: „Najbardziej podobne miejsce w innym województwie według 11 wskaźników GUS (2025 r.):”. */
export function twinIntro(twin: Pick<TwinLink, 'dims' | 'year'>): string {
  return `Najbardziej podobne miejsce w innym województwie według ${twin.dims} ${indicatorsWord(twin.dims)} GUS (${twin.year} r.):`;
}
