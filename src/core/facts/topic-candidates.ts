// „Tematy do rozważenia” (W26-F06, KONCEPT-ODKRYCIA §7a pkt 3): zapytania z wyświetleniami, pozycją 8–30
// i bez dopasowanej strony. Tylko lista w raporcie tygodniowym – strona powstaje dopiero po decyzji człowieka.
import { normalize, queryTopic, type QueryRows, type TopicKeywords, type TopicTrend } from './trend-boost';

export interface TopicCandidate {
  query: string;
  impressions: number;
  clicks: number;
  position: number;
  topic: string | null;
}

export const CANDIDATE_POSITION = { min: 8, max: 30 } as const;
export const MAX_CANDIDATES = 10;

/** Słowa adresu (ostatni segment ścieżki, bez liczb i słów krótszych niż 3 znaki). */
function pathTokens(url: string): string[] {
  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    // ścieżka względna – zostaje jak jest
  }
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  return normalize(last)
    .split(' ')
    .filter((t) => t.length >= 3 && !/^\d+$/.test(t));
}

/** Ta sama podstawa wyrazu: wspólny początek ≥ min(5, krótsze − 1), co najmniej 3 znaki („gmina”/„gminy”). */
function sameStem(a: string, b: string): boolean {
  if (a === b) return true;
  const need = Math.min(5, Math.max(3, Math.min(a.length, b.length) - 1));
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= need;
}

/** Strona pasuje do zapytania, gdy każde słowo jej adresu występuje w zapytaniu (z odmianą). */
export function pageMatchesQuery(url: string, query: string): boolean {
  const page = pathTokens(url);
  if (page.length === 0) return false;
  const words = normalize(query).split(' ');
  return page.every((p) => words.some((w) => sameStem(p, w)));
}

/** Do 10 zapytań z pozycją 8–30 bez dopasowanej strony, od największej liczby wyświetleń. */
export function topicCandidates(current: QueryRows, pages: readonly string[], dict: TopicKeywords): TopicCandidate[] {
  return (current.rows ?? [])
    .filter((r) => r.impressions > 0 && r.position >= CANDIDATE_POSITION.min && r.position <= CANDIDATE_POSITION.max)
    .map((r) => ({ query: r.keys?.[0] ?? '', impressions: r.impressions, clicks: r.clicks, position: r.position }))
    .filter((r) => r.query && !pages.some((p) => pageMatchesQuery(p, r.query)))
    .sort((a, b) => b.impressions - a.impressions || a.query.localeCompare(b.query, 'pl'))
    .slice(0, MAX_CANDIDATES)
    .map((r) => ({ ...r, topic: queryTopic(r.query, dict) }));
}

const pl = (v: number, digits = 1) => v.toLocaleString('pl-PL', { maximumFractionDigits: digits });
const cell = (s: string) => s.replace(/\|/g, '\\|');

/** Sekcja Markdown do raportu tygodniowego (S12). */
export function renderSignals(trends: TopicTrend[], candidates: TopicCandidate[]): string {
  const out = ['## Tematy do rozważenia', ''];
  out.push('Zapytania, na które się wyświetlamy (pozycja 8–30), a nie mamy pod nie strony. Nic nie powstaje automatycznie: napisz „rób <temat>”, a sesja zbuduje zestawienie albo sekcję huba w zwykłym PR.', '');
  if (candidates.length === 0) out.push('Brak zapytań spełniających warunki w tym tygodniu.');
  else {
    out.push('| Zapytanie | Wyświetlenia | Kliknięcia | Pozycja | Temat |', '|---|---:|---:|---:|---|');
    for (const c of candidates) out.push(`| ${cell(c.query)} | ${pl(c.impressions)} | ${pl(c.clicks)} | ${pl(c.position)} | ${c.topic ?? '–'} |`);
  }
  out.push('', '## Tematy w górę (kolejność faktów)', '');
  out.push(`Mnożnik = 1 + wzrost wyświetleń tydzień do tygodnia (najwyżej 1,5; tylko tematy z ≥ 100 wyświetleń). Zmienia wyłącznie kolejność istniejących faktów; nowa wartość trafia do config/facts.json w PR robota (gałąź robot/trend-boost).`, '');
  if (trends.length === 0) out.push('Brak zapytań przypisanych do tematów.');
  else {
    out.push('| Temat | Wyświetlenia | Tydzień wcześniej | Zmiana | Mnożnik |', '|---|---:|---:|---:|---:|');
    for (const t of trends) {
      const change = t.growth == null ? '–' : `${t.growth > 0 ? '+' : ''}${pl(t.growth * 100, 0)}%`;
      out.push(`| ${t.topic} | ${pl(t.current)} | ${pl(t.previous)} | ${change} | ${pl(t.boost, 2)} |`);
    }
  }
  return `${out.join('\n')}\n`;
}
