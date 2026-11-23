// Sygnały z Search Console (W26-F06, KONCEPT-ODKRYCIA §7a–§7b): wzrost wyświetleń zapytań wg tematu
// (grupy wskaźników) → mnożnik kolejności faktów `trendBoost` w config/facts.json. Bez AI: słownik
// config/topic-keywords.json. Mnożnik zmienia tylko kolejność istniejących, prawdziwych faktów.
import type { FactsConfig } from './types';

/** config/topic-keywords.json: grupa wskaźników → słowa (początek wyrazu, `x$` = cały wyraz, fraza ze spacją). */
export interface TopicKeywords {
  groups: Record<string, string[]>;
}
/** Wiersz searchanalytics.query (wymiar `query`) – podzbiór. */
export interface QueryRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  position: number;
}
export interface QueryRows {
  rows?: QueryRow[];
}
export interface TopicTrend {
  topic: string;
  current: number;
  previous: number;
  /** Wzrost tydzień do tygodnia (0,4 = +40%); null = brak poprzedniego tygodnia. */
  growth: number | null;
  boost: number;
}

/** Minimum wyświetleń tematu w tygodniu, żeby mnożnik był różny od 1. */
export const MIN_TOPIC_IMPRESSIONS = 100;
/** Mnożnik = 1 + min(0,5, wzrost). */
export const MAX_BOOST = 0.5;

const round2 = (v: number) => Math.round(v * 100) / 100;

/** Małe litery, bez polskich znaków (ł → l), słowa oddzielone spacją. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function hits(query: string, tokens: string[], keyword: string): boolean {
  const k = keyword.endsWith('$') ? normalize(keyword.slice(0, -1)) : normalize(keyword);
  if (!k) return false;
  if (k.includes(' ')) return ` ${query} `.includes(` ${k}`);
  return keyword.endsWith('$') ? tokens.includes(k) : tokens.some((t) => t.startsWith(k));
}

/** Temat zapytania: grupa z największą liczbą trafień (remis – kolejność w słowniku); brak trafień → null. */
export function queryTopic(query: string, dict: TopicKeywords): string | null {
  const q = normalize(query);
  const tokens = q.split(' ');
  let best: string | null = null;
  let bestScore = 0;
  for (const [topic, words] of Object.entries(dict.groups)) {
    const score = words.filter((w) => hits(q, tokens, w)).length;
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best;
}

function impressionsByTopic(rows: QueryRows, dict: TopicKeywords): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of rows.rows ?? []) {
    const topic = queryTopic(r.keys?.[0] ?? '', dict);
    if (topic) out.set(topic, (out.get(topic) ?? 0) + r.impressions);
  }
  return out;
}

/** Mnożnik tematu: 1 + min(0,5, wzrost), tylko przy ≥ 100 wyświetleń i danych z poprzedniego tygodnia. */
export function boostFor(current: number, previous: number): number {
  if (current < MIN_TOPIC_IMPRESSIONS || previous <= 0) return 1;
  return round2(1 + Math.min(MAX_BOOST, Math.max(0, current / previous - 1)));
}

/** Tematy z wyświetleniami w którymkolwiek tygodniu, od największego mnożnika. */
export function topicTrends(current: QueryRows, previous: QueryRows, dict: TopicKeywords): TopicTrend[] {
  const cur = impressionsByTopic(current, dict);
  const prev = impressionsByTopic(previous, dict);
  return Object.keys(dict.groups)
    .filter((topic) => cur.has(topic) || prev.has(topic))
    .map((topic) => {
      const c = cur.get(topic) ?? 0;
      const p = prev.get(topic) ?? 0;
      return { topic, current: c, previous: p, growth: p > 0 ? round2(c / p - 1) : null, boost: boostFor(c, p) };
    })
    .sort((a, b) => b.boost - a.boost || b.current - a.current);
}

/** Pole `trendBoost` do zapisu: tylko tematy z mnożnikiem > 1, klucze w stałej kolejności. */
export function trendBoostMap(trends: TopicTrend[]): Record<string, number> {
  const entries = trends.filter((t) => t.boost > 1).map((t) => [t.topic, t.boost] as const);
  return Object.fromEntries(entries.sort((a, b) => a[0].localeCompare(b[0], 'pl')));
}

/** Podmienia w tekście config/facts.json tylko linię `"trendBoost": {…}` (reszta pliku bez zmian). */
export function replaceTrendBoost(text: string, boost: Record<string, number>): string {
  const keys = Object.keys(boost);
  const value = keys.length ? `{ ${keys.map((k) => `${JSON.stringify(k)}: ${boost[k]}`).join(', ')} }` : '{}';
  const re = /"trendBoost": *\{[^}]*\}/;
  if (!re.test(text)) throw new Error('config/facts.json: brak pola "trendBoost"');
  return text.replace(re, `"trendBoost": ${value}`);
}

/**
 * Hak silnika faktów: `trendBoost` jest zapisany wg grupy („Mieszkania”), a siła faktu
 * (strength.ts) czyta go wg wskaźnika – rozwijamy grupę na jej wskaźniki. Jawny wskaźnik wygrywa.
 */
export function expandTrendBoost<C extends Pick<FactsConfig, 'trendBoost'>>(config: C, indicators: readonly { id: string; group: string }[]): C {
  const source = config.trendBoost ?? {};
  const out: Record<string, number> = {};
  for (const ind of indicators) {
    const v = source[ind.id] ?? source[ind.group];
    if (v != null) out[ind.id] = v;
  }
  return { ...config, trendBoost: out };
}
