// Model strony tematu `/temat/<grupa>` (W26-F04, docs/KONCEPT-ODKRYCIA.md §7a pkt 1):
// co mierzymy (z linkami do rankingów), najwyżej i najniżej wśród powiatów, 3 najsilniejsze fakty, zestawienia.
import { referenceIndex } from '../facts/lists';
import { factSentence } from '../facts/sentences';
import type { Fact } from '../facts/types';
import type { DiscoverContext } from './list-page';
import { LEVELS, rankingPath } from './ranking-page';
import { shortIndicatorName, showValue } from './sentences';
import { DISCOVER_INDEX, DISCOVER_INDEX_NAME, fitText, listPath, plural, type Topic } from './topics';
import type { PageLink } from './unit-page';

const DESC_MIN = 70;
const DESC_MAX = 160;
/** Ile faktów na stronie tematu. */
export const TOPIC_FACTS = 3;
/** Fakty o skali kraju (skrajność, zmiana 10 lat) – porównanie z całą Polską, zrozumiałe bez kontekstu. */
const NATIONAL_TYPES = new Set<Fact['type']>(['F1', 'F4']);

export interface Extreme {
  name: string;
  path: string;
  value: string;
}

export interface TopicIndicatorView {
  id: string;
  name: string;
  about: string | null;
  rankings: PageLink[];
  year: number | null;
  /** Najwyższa i najniższa wartość wśród powiatów i miast na prawach powiatu. */
  high: Extreme | null;
  low: Extreme | null;
}

export interface TopicFact {
  name: string;
  path: string;
  sentence: string;
}

export interface TopicPage {
  topic: Topic;
  path: string;
  title: string;
  description: string;
  h1: string;
  lead: string[];
  indicators: TopicIndicatorView[];
  facts: TopicFact[];
  lists: PageLink[];
  others: PageLink[];
  mapHref: string;
  crumbs: PageLink[];
  lastmod: string;
}

function extremes(ctx: DiscoverContext, id: string, unit: string): Pick<TopicIndicatorView, 'year' | 'high' | 'low'> {
  const data = ctx.values[id];
  const scope = ctx.units.filter((u) => u.level === 'pow');
  const idx = data ? referenceIndex(data, scope) : -1;
  if (!data || idx < 0) return { year: null, high: null, low: null };
  const rows = scope
    .map((u) => ({ teryt: u.teryt, v: data.values[u.teryt]?.[idx] }))
    .filter((r): r is { teryt: string; v: number } => r.v != null)
    .sort((a, b) => b.v - a.v || a.teryt.localeCompare(b.teryt));
  const view = (r: { teryt: string; v: number } | undefined): Extreme | null =>
    r ? { name: ctx.headings.get(r.teryt) ?? r.teryt, path: ctx.paths.pathByTeryt.get(r.teryt) ?? '', value: showValue(r.v, unit) } : null;
  return { year: data.years[idx] ?? null, high: view(rows[0]), low: view(rows.at(-1)) };
}

/** 3 najsilniejsze fakty krajowe tematu: różne jednostki i różne wskaźniki. */
export function topicFacts(topic: Topic, facts: readonly Fact[], ctx: DiscoverContext): TopicFact[] {
  const ids = new Set(topic.indicators.map((i) => i.id));
  const pool = facts
    .filter((f) => ids.has(f.indicatorId) && NATIONAL_TYPES.has(f.type))
    .sort((a, b) => b.strength - a.strength || a.type.localeCompare(b.type) || a.teryt.localeCompare(b.teryt) || a.indicatorId.localeCompare(b.indicatorId));
  const out: TopicFact[] = [];
  const usedUnits = new Set<string>();
  const usedIndicators = new Set<string>();
  // Najpierw różne wskaźniki; gdy temat ma ich mniej niż 3, dobieramy kolejne fakty innych jednostek.
  for (const f of [...pool, ...pool]) {
    if (out.length >= TOPIC_FACTS) break;
    const second = out.length >= Math.min(TOPIC_FACTS, topic.indicators.length);
    if (usedUnits.has(f.teryt) || (!second && usedIndicators.has(f.indicatorId))) continue;
    const unit = ctx.units.find((u) => u.teryt === f.teryt);
    const indicator = topic.indicators.find((i) => i.id === f.indicatorId);
    const path = ctx.paths.pathByTeryt.get(f.teryt);
    if (!unit || !indicator || !path) continue;
    const sentence = factSentence(f, { indicator, level: unit.level });
    if (!sentence) continue;
    out.push({ name: ctx.headings.get(f.teryt) ?? unit.name, path, sentence });
    usedUnits.add(f.teryt);
    usedIndicators.add(f.indicatorId);
  }
  return out;
}

/** Buduje model strony jednego tematu. */
export function buildTopicPage(topic: Topic, all: readonly Topic[], facts: readonly Fact[], ctx: DiscoverContext): TopicPage {
  const names = topic.indicators.map((i) => shortIndicatorName(i.name, i.unit));
  const indicators = topic.indicators.map((ind) => {
    const about = ctx.explanations.find((e) => e.indicatorId === ind.id)?.short ?? null;
    const rankings = (['woj', 'pow', 'gmi'] as const).map((l) => ({ teryt: '', name: `Ranking ${LEVELS[l].gen}`, path: rankingPath(ind, l) }));
    return { id: ind.id, name: shortIndicatorName(ind.name, ind.unit), about, rankings, ...extremes(ctx, ind.id, ind.unit) };
  });
  const years = indicators.map((i) => i.year).filter((y): y is number => y !== null);
  const year = years.length ? Math.max(...years) : null;
  const lists = ctx.lists.lists
    .filter((l) => topic.indicators.some((i) => i.id === l.indicatorId))
    .map((l) => ({ teryt: '', name: l.h1, path: listPath(l.slug) }));
  const lower = names.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1)));
  const lead = [
    `Temat „${topic.name}” to ${plural(names.length, 'wskaźnik', 'wskaźniki', 'wskaźników')} z Banku Danych Lokalnych GUS: ${lower.join(', ')}.`,
    ...(year === null ? [] : [`Najnowsze dane są za ${year} r.`]),
    `Poniżej: co mierzymy, najwyższe i najniższe wartości wśród powiatów, najmocniejsze fakty i ${plural(lists.length, 'zestawienie', 'zestawienia', 'zestawień')}.`,
  ];
  const variants = names.map((_, k) => `${topic.name} według GUS: ${lower.slice(0, names.length - k).join(', ')} – rankingi, zestawienia i fakty o gminach i powiatach.`);
  let description = fitText(variants, DESC_MAX).slice(0, DESC_MAX);
  if (description.length < DESC_MIN) description = `${description} Źródło: GUS, Bank Danych Lokalnych.`;
  const lastmod =
    topic.indicators
      .map((i) => ctx.values[i.id]?.fetchedAt)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1) ?? new Date(0).toISOString();
  return {
    topic,
    path: topic.path,
    title: `${topic.name} w Polsce – rankingi i zestawienia GUS`,
    description,
    h1: `${topic.name} – dane GUS o gminach i powiatach`,
    lead,
    indicators,
    facts: topicFacts(topic, facts, ctx),
    lists,
    others: all.filter((t) => t.path !== topic.path).map((t) => ({ teryt: '', name: t.name, path: t.path })),
    mapHref: `/mapa?i=${encodeURIComponent(topic.indicators[0]?.id ?? '')}&l=pow`,
    crumbs: [
      { teryt: '', name: 'Faktografia', path: '/' },
      { teryt: '', name: DISCOVER_INDEX_NAME, path: DISCOVER_INDEX },
      { teryt: '', name: topic.name, path: topic.path },
    ],
    lastmod,
  };
}
