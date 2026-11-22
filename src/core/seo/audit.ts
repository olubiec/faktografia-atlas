// Strażnik jakości SEO (S08, docs/SEO.md §5): sprawdza wygenerowane strony przed wdrożeniem.
// Czyste funkcje: `readPage` wyciąga z HTML to, co ważne dla wyszukiwarki; `auditPages` zwraca błędy i ostrzeżenia.
import { canonicalFor, SITE_URL } from './site';

/** Streszczenie jednej strony – tyle trzyma generator w pamięci (bez całego HTML). */
export interface AuditPage {
  /** Ścieżka w serwisie, np. `/malopolskie/gmina-wieliczka`. */
  path: string;
  title: string;
  description: string;
  h1Count: number;
  canonical: string | null;
  noindex: boolean;
  /** Linki wewnętrzne jako ścieżki (bez domeny, parametrów i kotwicy). */
  links: string[];
  /** Fragment z `undefined` / `NaN`, gdy się pojawił. */
  badText: string | null;
  /** Identyfikatory szablonów zdań faktów na stronie (docs/KONCEPT-ODKRYCIA.md §8). */
  templates?: readonly string[];
}

export type AuditCode =
  | 'duplicate-title'
  | 'duplicate-description'
  | 'title-length'
  | 'description-length'
  | 'h1-count'
  | 'canonical'
  | 'dead-link'
  | 'sitemap-noindex'
  | 'sitemap-missing'
  | 'no-incoming-link'
  | 'bad-text'
  | 'template-share';

export interface AuditIssue {
  level: 'error' | 'warning';
  code: AuditCode;
  /** Strona, której dotyczy (dla mapy strony – adres z mapy, dla szablonu – jego identyfikator). */
  path: string;
  message: string;
}

export interface AuditOptions {
  /** Adresy istniejące poza audytowanymi stronami (strony stałe, strony spoza wycinka). */
  knownPaths?: Iterable<string>;
  /** Próg udziału stron indeksowanych z tym samym szablonem zdania (domyślnie 30%). */
  templateShare?: number;
}

export const TITLE_MAX = 65;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 160;
export const TEMPLATE_SHARE = 0.3;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** Zamienia encje HTML na znaki (długość tytułu liczy się w znakach, nie w encjach). */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : all;
    }
    return ENTITIES[code.toLowerCase()] ?? all;
  });
}

/**
 * Ścieżka wewnętrzna z adresu: bez domeny serwisu, parametrów, kotwicy i „/” na końcu.
 * Adres innej domeny, `mailto:`, sama kotwica → null (to nie link wewnętrzny).
 */
export function internalPath(href: string): string | null {
  let rest = href.trim();
  if (rest.startsWith(SITE_URL)) rest = rest.slice(SITE_URL.length) || '/';
  if (!rest.startsWith('/') || rest.startsWith('//')) return null;
  const bare = (rest.split(/[?#]/)[0] ?? '').replace(/\/+$/, '');
  return bare === '' ? '/' : bare;
}

const attrOf = (tag: string | undefined, name: string) => {
  const m = tag?.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return m ? decodeEntities(m[1] ?? '') : null;
};
const metaTag = (html: string, name: string) =>
  html.match(new RegExp(`<meta\\s[^>]*name="${name}"[^>]*>`, 'i'))?.[0];

/** Wyciąga z dokumentu HTML to, co sprawdza audyt. */
export function readPage(path: string, html: string, templates?: readonly string[]): AuditPage {
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const canonicalTag = html.match(/<link\s[^>]*rel="canonical"[^>]*>/i)?.[0];
  const links = [...html.matchAll(/<a\s[^>]*href="([^"]*)"/gi)]
    .map((m) => internalPath(decodeEntities(m[1] ?? '')))
    .filter((p): p is string => p !== null);
  const bad = html.match(/.{0,40}\b(undefined|NaN)\b.{0,40}/);
  return {
    path: internalPath(path) ?? path,
    title: title === undefined ? '' : decodeEntities(title).trim(),
    description: attrOf(metaTag(html, 'description'), 'content') ?? '',
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    canonical: attrOf(canonicalTag, 'href'),
    noindex: /noindex/i.test(attrOf(metaTag(html, 'robots'), 'content') ?? ''),
    links: [...new Set(links)],
    badText: bad ? bad[0].trim() : null,
    ...(templates ? { templates } : {}),
  };
}

/** Grupy stron z tą samą wartością (tylko grupy większe niż 1). */
function duplicates(pages: readonly AuditPage[], key: (p: AuditPage) => string): AuditPage[][] {
  const groups = new Map<string, AuditPage[]>();
  for (const p of pages) groups.set(key(p), [...(groups.get(key(p)) ?? []), p]);
  return [...groups.values()].filter((g) => g.length > 1);
}

/** Sprawdza strony i adresy z mapy strony. Zwraca listę błędów (blokują budowę) i ostrzeżeń. */
export function auditPages(
  pages: readonly AuditPage[],
  sitemapUrls: readonly string[],
  options: AuditOptions = {},
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const add = (level: AuditIssue['level'], code: AuditCode, path: string, message: string) =>
    issues.push({ level, code, path, message });
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const known = new Set([...byPath.keys(), ...[...(options.knownPaths ?? [])].map((p) => internalPath(p) ?? p)]);

  for (const [field, code, label] of [
    ['title', 'duplicate-title', 'Ten sam tytuł'],
    ['description', 'duplicate-description', 'Ten sam opis'],
  ] as const) {
    for (const group of duplicates(pages, (p) => p[field])) {
      const others = group.map((p) => p.path).join(', ');
      for (const p of group) add('error', code, p.path, `${label} na ${group.length} stronach (${others}): „${p[field]}”.`);
    }
  }

  const incoming = new Map<string, number>();
  for (const p of pages) {
    if (p.title.length > TITLE_MAX) add('warning', 'title-length', p.path, `Tytuł ma ${p.title.length} znaków (limit ${TITLE_MAX}).`);
    const d = p.description.length;
    if (d < DESCRIPTION_MIN || d > DESCRIPTION_MAX) {
      add('warning', 'description-length', p.path, `Opis ma ${d} znaków (zakres ${DESCRIPTION_MIN}–${DESCRIPTION_MAX}).`);
    }
    if (p.h1Count !== 1) add('error', 'h1-count', p.path, `Strona ma ${p.h1Count} nagłówków H1 (powinien być 1).`);
    const own = canonicalFor(p.path);
    if (p.canonical !== own) add('error', 'canonical', p.path, `Adres kanoniczny ${p.canonical ?? '(brak)'} zamiast ${own}.`);
    if (p.badText) add('error', 'bad-text', p.path, `W treści jest „undefined” albo „NaN”: …${p.badText}…`);
    for (const target of p.links) {
      if (!known.has(target)) add('error', 'dead-link', p.path, `Link do nieistniejącego adresu ${target}.`);
      else if (target !== p.path) incoming.set(target, (incoming.get(target) ?? 0) + 1);
    }
  }

  for (const url of sitemapUrls) {
    const path = internalPath(url);
    const page = path === null ? undefined : byPath.get(path);
    if (path === null || !known.has(path)) add('error', 'sitemap-missing', url, `Mapa strony podaje nieistniejący adres ${url}.`);
    else if (page?.noindex) add('error', 'sitemap-noindex', url, `Mapa strony podaje stronę z noindex: ${url}.`);
  }

  const indexable = pages.filter((p) => !p.noindex);
  for (const p of indexable) {
    if (!incoming.get(p.path)) add('warning', 'no-incoming-link', p.path, 'Strona indeksowana bez linku z innej strony.');
  }

  // Ten sam szablon zdania na zbyt wielu stronach = treść „szablonowa” (docs/KONCEPT-ODKRYCIA.md §8).
  const share = options.templateShare ?? TEMPLATE_SHARE;
  const usage = new Map<string, number>();
  for (const p of indexable) for (const t of new Set(p.templates ?? [])) usage.set(t, (usage.get(t) ?? 0) + 1);
  for (const [template, count] of usage) {
    if (count / indexable.length > share) {
      const pct = Math.round((count / indexable.length) * 100);
      add('warning', 'template-share', template, `Szablon zdania „${template}” jest na ${pct}% stron indeksowanych (próg ${Math.round(share * 100)}%).`);
    }
  }
  return issues;
}

/** Podsumowanie do logu: liczba ostrzeżeń według rodzaju, np. „no-incoming-link: 3”. */
export function summarize(issues: readonly AuditIssue[]): { errors: AuditIssue[]; warnings: AuditIssue[]; counts: string } {
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const byCode = new Map<string, number>();
  for (const w of warnings) byCode.set(w.code, (byCode.get(w.code) ?? 0) + 1);
  const counts = [...byCode].map(([code, n]) => `${code}: ${n}`).join(', ');
  return { errors, warnings, counts };
}
