// Wysyłka mapy strony do Google Search Console po wdrożeniu produkcji (S14, docs/SEO-AUTOMAT.md §4–§5).
// PUT sitemaps/{adres} → GET tej samej mapy → status (pobrana, błędy, ostrzeżenia, liczba adresów).
// Sekret GSC_SERVICE_ACCOUNT czytamy tylko ze zmiennej środowiska i NIGDY go nie wypisujemy.
// Brak sekretu albo konto tylko do odczytu (HTTP 403) → komunikat i kod 0, bez czerwonego CI.
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import { SCOPE_WRITE, WM, accessToken, api, loadAccount } from './gsc-client.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const sitemapApi = (url) => `${WM}/sitemaps/${encodeURIComponent(url)}`;

/** Wiersz podsumowania z odpowiedzi `sitemaps.get`. */
export function statusRow(url, s) {
  const urls = (s.contents ?? []).reduce((sum, c) => sum + Number(c.submitted ?? 0), 0);
  return {
    url,
    pending: Boolean(s.isPending),
    lastDownloaded: s.lastDownloaded ?? '—',
    errors: Number(s.errors ?? 0),
    warnings: Number(s.warnings ?? 0),
    urls,
  };
}

export function renderSummary(rows) {
  const head = '| Mapa | Oczekuje | Ostatnio pobrana | Błędy | Ostrzeżenia | Adresy |\n|---|---|---|---|---|---|';
  const lines = rows.map((r) => `| ${r.url} | ${r.pending ? 'tak' : 'nie'} | ${r.lastDownloaded} | ${r.errors} | ${r.warnings} | ${r.urls} |`);
  return `### Mapa strony w Search Console\n\n${[head, ...lines].join('\n')}\n`;
}

/**
 * Wysyła mapy i czyta ich status. Zwraca kod wyjścia (0 także przy 403 – tylko ostrzeżenie).
 * `token` już pobrany; `log` i `summary` wstrzykiwane (testy).
 */
export async function submitSitemaps({ token, urls, log = console.log, summary }) {
  const rows = [];
  for (const url of urls) {
    try {
      await api(token, sitemapApi(url), undefined, 'PUT');
      rows.push(statusRow(url, await api(token, sitemapApi(url))));
    } catch (err) {
      if (err.status === 403) {
        log('::warning::Konto usługi ma tylko odczyt – dodaj konto usługi jako użytkownika z uprawnieniem Pełny (docs/SEO-AUTOMAT.md §5).');
        return 0;
      }
      log(`::warning::Mapa ${url}: ${err.message}`);
    }
  }
  for (const r of rows) {
    log(`${r.url}: oczekuje=${r.pending}, pobrana=${r.lastDownloaded}, błędy=${r.errors}, ostrzeżenia=${r.warnings}, adresy=${r.urls}`);
  }
  if (summary && rows.length) summary(renderSummary(rows));
  return 0;
}

/** Indeks mapy z produkcji → on sam + pliki `sitemap-*.xml`. Gdy pobranie się nie uda, sam indeks. */
export async function sitemapUrls(siteUrl, sitemapLocs, fetchText) {
  const main = `${siteUrl}/sitemap.xml`;
  try {
    return [main, ...sitemapLocs(await fetchText(main))];
  } catch {
    return [main];
  }
}

async function main() {
  // Brak sekretu → komunikat i kod 0 (gsc-client.mjs).
  const account = loadAccount('wysyłka mapy strony pominięta');
  const { createServer } = await import('vite');
  const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
  try {
    const { SITE_URL } = await vite.ssrLoadModule('/src/core/seo/site.ts');
    const { sitemapLocs } = await vite.ssrLoadModule('/src/core/seo/sitemap-diff.ts');
    const fetchText = async (u) => {
      const res = await fetch(u);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    };
    const urls = await sitemapUrls(SITE_URL, sitemapLocs, fetchText);
    const token = await accessToken(account, SCOPE_WRITE);
    const file = process.env.GITHUB_STEP_SUMMARY;
    return await submitSitemaps({ token, urls, summary: file ? (md) => appendFileSync(file, md) : undefined });
  } finally {
    await vite.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.log(`::error::Wysyłka mapy strony nie powiodła się: ${err.message}`);
      process.exit(1);
    },
  );
}
