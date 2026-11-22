import { SITE_URL } from './site';

export interface AuditPage {
  path: string;
  html: string;
}
export interface AuditResult {
  errors: string[];
  warnings: string[];
}

const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 160;

const first = (html: string, re: RegExp) => re.exec(html)?.[1];
const isNoindex = (html: string) => /<meta name="robots" content="[^"]*noindex/.test(html);

function duplicates(values: Map<string, string[]>, what: string, errors: string[]) {
  for (const [value, paths] of values) {
    if (paths.length > 1) errors.push(`Powtórzony ${what} „${value}”: ${paths.slice(0, 3).join(', ')}${paths.length > 3 ? ` (+${paths.length - 3})` : ''}`);
  }
}

/**
 * Strażnik jakości stron miejsc. `knownPaths` = adresy istniejące poza `pages` (strona główna, mapa, strony informacyjne);
 * `sitemapUrls` = pełne adresy z mapy strony. Błędy przerywają budowę, ostrzeżenia trafiają do podsumowania.
 */
export function auditPages(pages: readonly AuditPage[], sitemapUrls: readonly string[], knownPaths: readonly string[] = []): AuditResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const exists = (p: string) => byPath.has(p) || knownPaths.includes(p);
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();
  const incoming = new Map<string, number>();

  for (const page of pages) {
    const title = first(page.html, /<title>([^<]*)<\/title>/);
    const description = first(page.html, /<meta name="description" content="([^"]*)"/);
    if (!title) errors.push(`${page.path}: brak tytułu`);
    else {
      titles.set(title, [...(titles.get(title) ?? []), page.path]);
      if (title.length > TITLE_MAX) warnings.push(`${page.path}: tytuł ma ${title.length} znaków (limit ${TITLE_MAX})`);
    }
    if (!description) errors.push(`${page.path}: brak opisu`);
    else {
      descriptions.set(description, [...(descriptions.get(description) ?? []), page.path]);
      if (description.length < DESC_MIN || description.length > DESC_MAX) warnings.push(`${page.path}: opis ma ${description.length} znaków (${DESC_MIN}–${DESC_MAX})`);
    }
    const h1s = (page.html.match(/<h1[ >]/g) ?? []).length;
    if (h1s !== 1) errors.push(`${page.path}: ${h1s} nagłówków H1 (powinien być 1)`);
    const canonical = first(page.html, /<link rel="canonical" href="([^"]*)"/);
    if (canonical !== `${SITE_URL}${page.path}`) errors.push(`${page.path}: kanoniczny adres ${canonical ?? '(brak)'} ≠ własny`);
    if (/undefined|NaN/.test(page.html)) errors.push(`${page.path}: w treści jest „undefined” albo „NaN”`);
    for (const m of page.html.matchAll(/<a [^>]*href="(\/[^"]*)"/g)) {
      const target = m[1]!.split(/[?#]/)[0]!.replace(/&amp;/g, '&') || '/';
      if (!exists(target)) errors.push(`${page.path}: martwy link do ${target}`);
      else if (target !== page.path) incoming.set(target, (incoming.get(target) ?? 0) + 1);
    }
  }
  duplicates(titles, 'tytuł', errors);
  duplicates(descriptions, 'opis', errors);

  for (const url of sitemapUrls) {
    if (!url.startsWith(`${SITE_URL}/`)) {
      errors.push(`Mapa strony: adres spoza domeny ${url}`);
      continue;
    }
    const path = url.slice(SITE_URL.length) || '/';
    const page = byPath.get(path);
    if (!exists(path)) errors.push(`Mapa strony: nieistniejący adres ${path}`);
    else if (page && isNoindex(page.html)) errors.push(`Mapa strony: adres ${path} ma noindex`);
  }
  for (const page of pages) {
    if (!isNoindex(page.html) && !incoming.has(page.path)) warnings.push(`${page.path}: brak linku przychodzącego z innej strony`);
  }
  return { errors, warnings };
}
