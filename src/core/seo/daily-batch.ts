// Codzienna porcja adresów do indeksowania (S18, docs/SEO-AUTOMAT.md §9). Czyste funkcje, bez sieci i Reacta.

/** Domyślna liczba adresów na dobę (tyle da się wkleić do Search Console bez wysiłku). */
export const DAILY_LIMIT = 10;

/** Etykieta zgłoszeń z listą dnia. */
export const DAILY_LABEL = 'seo-dzien';

const pathOf = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
};

/**
 * Grupa priorytetu (mniejsza = ważniejsza) albo null, gdy adresu nie wolno zgłaszać.
 * Lista dozwolonych, więc nieznany typ strony (gmina, miejscowość, porównanie) odpada sam.
 */
export function priorityOf(url: string): number | null {
  const p = pathOf(url);
  if (p === '') return null;
  // rankingi i zestawienia gmin są noindex razem ze stronami gmin (D7)
  if (/gmin/.test(p)) return null;
  if (p === '/' || p === '/mapa' || p === '/miejsca') return 0;
  if (p.startsWith('/wojewodztwo/')) return 1;
  if (p.startsWith('/powiat/') || p.startsWith('/miasto/')) return 2;
  if (p === '/ranking' || p.startsWith('/ranking/')) return 3;
  if (p.startsWith('/temat/') || p === '/zestawienia' || p.startsWith('/zestawienie/')) return 4;
  if (p === '/o-projekcie' || p === '/zrodla') return 5;
  return null;
}

/** Numer doby od 1970 (UTC) z daty `RRRR-MM-DD`. */
function dayNumber(date: string): number {
  const t = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(t) ? 0 : Math.floor(t / 86_400_000);
}

export interface BatchInput {
  /** Adresy z mapy strony. */
  urls: readonly string[];
  /** Adresy odhaczone przez właściciela (pomijane). */
  done?: readonly string[];
  /** Dzień `RRRR-MM-DD` (rotacja). */
  date: string;
  limit?: number;
}

/**
 * Do `limit` adresów na dobę: grupy po kolei od najważniejszej, wewnątrz grupy porcja
 * przesuwa się o `limit` adresów na dobę (ta sama data = ten sam wynik). Zwraca mniej, gdy lista się kończy.
 */
export function pickDailyBatch({ urls, done = [], date, limit = DAILY_LIMIT }: BatchInput): string[] {
  const skip = new Set(done);
  const seen = new Set<string>();
  const groups = new Map<number, string[]>();
  for (const url of urls) {
    const prio = priorityOf(url);
    if (prio === null || skip.has(url) || seen.has(url)) continue;
    seen.add(url);
    const list = groups.get(prio) ?? [];
    list.push(url);
    groups.set(prio, list);
  }
  const day = dayNumber(date);
  const out: string[] = [];
  for (const prio of [...groups.keys()].sort((a, b) => a - b)) {
    const list = groups.get(prio) ?? [];
    const start = (day * limit) % list.length;
    const rotated = [...list.slice(start), ...list.slice(0, start)];
    out.push(...rotated.slice(0, limit - out.length));
    if (out.length >= limit) break;
  }
  return out;
}

/** Tytuł zgłoszenia dnia (wariant z jednego dnia, zostaje dla zgodności). */
export const issueTitle = (date: string): string => `SEO – dzień ${date.slice(0, 10)}`;

/** Tytuł stałego zgłoszenia: ta sama kartka, nadpisywana codziennie. */
export const issueTitleUpdated = (date: string): string => `SEO – do zgłoszenia w Google (aktualizacja ${date.slice(0, 10)})`;

/** Nagłówek sekcji z pamięcią odhaczonych adresów. */
export const DONE_HEADING = '## Zrobione';

/**
 * Treść stałego zgłoszenia: krótka instrukcja, checklista adresów na dziś i sekcja „Zrobione”
 * (pamięć odhaczonych adresów między dniami; `done` bez duplikatów i bez adresów z dzisiejszej listy).
 */
export function renderIssueBody(urls: readonly string[], date: string, done: readonly string[] = [], calendarUrl?: string): string {
  const head = [
    ...(calendarUrl ? [`📅 [Kalendarium danych](${calendarUrl})`, ''] : []),
    `Lista na ${date.slice(0, 10)}: ${urls.length} adresów do zgłoszenia w Google.`,
    '',
    'Jak to zrobić (około 5 minut, wystarczy telefon):',
    '1. Otwórz Search Console → Sprawdzanie adresu URL.',
    '2. Wklej adres z listy poniżej i kliknij „Poproś o zindeksowanie”.',
    '3. Po zrobieniu odznacz kratkę przy tym adresie. Odhaczony adres nie wróci na kolejne listy.',
    '',
    'To jedno stałe zgłoszenie: automat codziennie nadpisuje listę. Nieodhaczone adresy wrócą na listę następnego dnia. Bing dostaje te same adresy automatycznie (IndexNow).',
    '',
  ];
  const today = new Set(urls);
  const doneList = [...new Set(done)].filter((u) => !today.has(u));
  const list = urls.length === 0 ? ['Na dziś nic nie zostało do zgłoszenia.'] : urls.map((u) => `- [ ] ${u}`);
  const memory = doneList.length === 0 ? [] : ['', DONE_HEADING, '', ...doneList.map((u) => `- [x] ${u}`)];
  return [...head, ...list, ...memory].join('\n');
}

/**
 * Odhaczone adresy (`- [x] https://…`, także duże X) z treści zgłoszenia: z listy dnia i z sekcji „Zrobione”,
 * bez duplikatów (kolejność pierwszego wystąpienia); reszta linii jest ignorowana.
 */
export function parseCheckedUrls(body: string): string[] {
  const out = new Set<string>();
  for (const m of body.matchAll(/^\s*[-*]\s+\[[xX]\]\s+(https?:\/\/\S+)\s*$/gm)) out.add(m[1] ?? '');
  return [...out];
}
