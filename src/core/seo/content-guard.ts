// Strażnik treści (S16, docs/SEO-AUTOMAT.md §3–§4): wykrywa na stronach obce skrypty, ukryte linki,
// przekierowania i przypadkowy `noindex`. Czyste funkcje; sieć wchodzi tylko przez przekazany `fetch`.
import { canonicalFor, SITE_URL } from './site';
import { parseSitemap, sitemapLocs } from './sitemap-diff';

export type GuardCode =
  | 'external-script'
  | 'iframe'
  | 'meta-refresh'
  | 'inline-event-handler'
  | 'hidden-text'
  | 'foreign-link'
  | 'eval-like'
  | 'noindex-on-indexable'
  | 'robots-status'
  | 'robots-no-sitemap'
  | 'sitemap-status'
  | 'page-status';

export interface GuardProblem {
  code: GuardCode;
  detail: string;
}

/**
 * Hosty, do których strona może linkować lub z których może ładować skrypt.
 * Lista zbudowana z faktycznych linków w `dist/` po `pnpm build` (28.11.2026).
 */
export const ALLOWED_HOSTS: readonly string[] = [
  'faktografia.eu', // nasza domena (linki absolutne, kanoniczne)
  'github.com', // stopka: link do repozytorium projektu
  'creativecommons.org', // stopka: licencja treści (CC)
  'stat.gov.pl', // przypisy źródeł: Główny Urząd Statystyczny
];

export interface GuardOptions {
  allowedHosts?: readonly string[];
  /** Strona jest w mapie strony, więc nie może mieć `noindex`. */
  indexable?: boolean;
  /** Nagłówek `X-Robots-Tag` odpowiedzi (tylko tryb live). */
  robotsHeader?: string | null;
}

const attr = (tag: string, name: string) =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag)?.slice(1).find((v) => v !== undefined);

function hostOf(url: string): string | null {
  if (!/^(https?:)?\/\//i.test(url.trim())) return null;
  try {
    return new URL(url.trim(), SITE_URL).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const HIDDEN = /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(?![.\d%a-z]*[1-9])|(?:left|top|right|text-indent)\s*:\s*-\d{3,}/i;

/** Treść elementu od `from` do zamykającego tagu o tej samej nazwie (z liczeniem zagnieżdżeń). */
function innerHtml(html: string, name: string, from: number): string {
  const re = new RegExp(`<(/?)${name}(?=[\\s>/])[^>]*>`, 'gi');
  re.lastIndex = from;
  for (let depth = 1, m: RegExpExecArray | null; (m = re.exec(html)); ) {
    depth += m[1] ? -1 : /\/>$/.test(m[0]) ? 0 : 1;
    if (depth === 0) return html.slice(from, m.index);
  }
  return html.slice(from);
}

/** Sprawdza jedną stronę. Zwraca listę problemów (pustą, gdy czysta). */
export function guardHtml(html: string, options: GuardOptions = {}): GuardProblem[] {
  const allowed = new Set((options.allowedHosts ?? ALLOWED_HOSTS).map((h) => h.toLowerCase()));
  const out: GuardProblem[] = [];
  const add = (code: GuardCode, detail: string) => out.push({ code, detail });
  const ok = (host: string) => allowed.has(host);

  for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    const tag = /^<script\b[^>]*>/i.exec(m[0])![0];
    const src = attr(tag, 'src');
    const host = src ? hostOf(src) : null;
    if (host && !ok(host)) add('external-script', src!);
    const type = (attr(tag, 'type') ?? '').toLowerCase();
    if (!src && !type.includes('json') && /\b(eval|atob)\s*\(/.test(m[1] ?? '')) add('eval-like', (m[1] ?? '').trim().slice(0, 80));
  }
  for (const m of html.matchAll(/<iframe\b[^>]*>/gi)) add('iframe', attr(m[0], 'src') ?? '(bez src)');
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    if ((attr(m[0], 'http-equiv') ?? '').toLowerCase() === 'refresh') add('meta-refresh', attr(m[0], 'content') ?? '');
  }
  for (const m of html.matchAll(/<[a-z][a-z0-9-]*\b[^>]*>/gi)) {
    const on = /\s(on[a-z]+)\s*=/i.exec(m[0]);
    if (on) add('inline-event-handler', `${on[1]} w ${m[0].slice(0, 60)}`);
  }
  for (const m of html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\sstyle\s*=\s*("[^"]*"|'[^']*')[^>]*>/gi)) {
    if (!HIDDEN.test(m[2]!) || /\/>$/.test(m[0])) continue;
    const inner = innerHtml(html, m[1]!, m.index + m[0].length);
    const text = inner.replace(/<[^>]*>/g, '').trim();
    if (/<a\b/i.test(inner) || text.length > 20) add('hidden-text', text.slice(0, 60) || m[0].slice(0, 60));
  }
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], 'href');
    const host = href ? hostOf(href) : null;
    if (host && !ok(host)) add('foreign-link', href!);
  }
  const robots = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter((m) => (attr(m[0], 'name') ?? '').toLowerCase() === 'robots')
    .map((m) => attr(m[0], 'content') ?? '');
  if (options.indexable && [...robots, options.robotsHeader ?? ''].some((v) => /noindex/i.test(v))) {
    add('noindex-on-indexable', 'strona z mapy strony ma noindex');
  }
  return out;
}

export interface LiveResult {
  problems: { url: string; problem: GuardProblem }[];
  /** Błąd sieci: brak wyniku, a nie problem strony (kod 0, ostrzeżenie). */
  networkError: string | null;
  checked: number;
}

export const MAX_LIVE_PAGES = 200;

/** Do `max` adresów, rozłożonych równo po posortowanej liście (ten sam wynik przy tej samej mapie). */
export function samplePages(urls: readonly string[], max: number): string[] {
  const sorted = [...new Set(urls)].sort();
  if (sorted.length <= max) return sorted;
  return Array.from({ length: max }, (_, i) => sorted[Math.floor((i * sorted.length) / max)]!);
}

/** Kontrola produkcji: `robots.txt`, mapy strony, potem próbka stron i wszystkie rankingi. */
export async function guardLive(siteUrl: string, fetchFn: typeof fetch, maxPages = MAX_LIVE_PAGES): Promise<LiveResult> {
  const result: LiveResult = { problems: [], networkError: null, checked: 0 };
  const add = (url: string, code: GuardCode, detail: string) => result.problems.push({ url, problem: { code, detail } });
  try {
    const robotsUrl = `${siteUrl}/robots.txt`;
    const robots = await fetchFn(robotsUrl);
    if (robots.status !== 200) add(robotsUrl, 'robots-status', `HTTP ${robots.status}`);
    else if (!/^\s*sitemap\s*:/im.test(await robots.text())) add(robotsUrl, 'robots-no-sitemap', 'brak linii Sitemap:');

    const indexUrl = `${siteUrl}/sitemap.xml`;
    const index = await fetchFn(indexUrl);
    if (index.status !== 200) {
      add(indexUrl, 'sitemap-status', `HTTP ${index.status}`);
      return result;
    }
    const indexXml = await index.text();
    const files = sitemapLocs(indexXml);
    const pages: string[] = [];
    const rankings: string[] = [];
    for (const file of files.length ? files : [indexUrl]) {
      const res = file === indexUrl ? index : await fetchFn(file);
      if (res.status !== 200) {
        add(file, 'sitemap-status', `HTTP ${res.status}`);
        continue;
      }
      const urls = [...parseSitemap(file === indexUrl ? indexXml : await res.text()).keys()];
      (file.includes('rankingi') ? rankings : pages).push(...urls);
    }
    for (const url of [...samplePages(pages, maxPages), ...[...new Set(rankings)].sort()]) {
      const res = await fetchFn(url);
      result.checked++;
      if (res.status !== 200) {
        add(url, 'page-status', `HTTP ${res.status}`);
        continue;
      }
      const problems = guardHtml(await res.text(), { indexable: true, robotsHeader: res.headers.get('x-robots-tag') });
      for (const problem of problems) result.problems.push({ url: canonicalFor(url), problem });
    }
  } catch (err) {
    result.networkError = err instanceof Error ? err.message : String(err);
  }
  return result;
}
