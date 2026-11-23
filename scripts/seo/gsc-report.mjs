// Tygodniowy raport z Google Search Console jako zgłoszenie na GitHubie (S12, docs/SEO.md §7–§8).
// Token OAuth z konta usługi przez podpis JWT w node:crypto (bez nowych pakietów).
// Sekret GSC_SERVICE_ACCOUNT czytamy tylko ze zmiennej środowiska i NIGDY go nie wypisujemy.
//
// Użycie: node scripts/seo/gsc-report.mjs [--dry-run] [--record <katalog>]
//   --dry-run   wypisuje Markdown zamiast tworzyć zgłoszenie
//   --record    zapisuje surowe odpowiedzi API (format tests/fixtures/seo/gsc-*.json)
import { createSign } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';

const SITE = 'sc-domain:faktografia.eu';
const SAMPLE_SIZE = 40;
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const root = path.resolve(import.meta.dirname, '../..');
const { values: args } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false }, record: { type: 'string' } } });

// Brak sekretu (np. fork, nowe repo) → czytelny komunikat i kod 0, bez czerwonego CI.
const raw = process.env.GSC_SERVICE_ACCOUNT;
if (!raw || !raw.trim()) {
  console.log('Brak sekretu GSC_SERVICE_ACCOUNT – raport Search Console pominięty. Dodaj go w ustawieniach repozytorium (docs/SEO.md §7).');
  process.exit(0);
}

let account;
try {
  account = JSON.parse(raw);
  if (!account.client_email || !account.private_key) throw new Error('brak pól');
} catch {
  // bez treści sekretu w komunikacie
  console.log('::error::Sekret GSC_SERVICE_ACCOUNT nie jest poprawnym kluczem JSON konta usługi (potrzebne client_email i private_key).');
  process.exit(1);
}

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const aud = account.token_uri || 'https://oauth2.googleapis.com/token';
  const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({ iss: account.client_email, scope: SCOPE, aud, iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key).toString('base64url');
  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`token OAuth → HTTP ${res.status}`);
  return (await res.json()).access_token;
}

async function api(token, url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${new URL(url).pathname} → HTTP ${res.status}`);
  return res.json();
}

const WM = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`;

async function week(token, range) {
  const q = (dimensions) =>
    api(token, `${WM}/searchAnalytics/query`, { startDate: range.start, endDate: range.end, ...(dimensions.length ? { dimensions } : {}), rowLimit: 1000 });
  return { totals: await q([]), query: await q(['query']), page: await q(['page']) };
}

async function sitemapUrls(siteUrl, sitemapLocations) {
  const get = async (u) => (await fetch(u)).text();
  const index = await get(`${siteUrl}/sitemap.xml`);
  const locs = sitemapLocations(index);
  if (!index.includes('<sitemapindex')) return locs;
  const all = [];
  for (const loc of locs) all.push(...sitemapLocations(await get(loc)));
  return all;
}

async function inspect(token, urls) {
  const out = [];
  for (const url of urls) {
    try {
      out.push({ url, result: await api(token, 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: SITE, languageCode: 'pl' }) });
    } catch (err) {
      console.log(`::warning::Inspekcja ${url}: ${err.message}`);
      out.push({ url, result: null });
    }
  }
  return out;
}

async function github(method, route, body) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}${route}`, {
    method,
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

const { createServer } = await import('vite');
const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
try {
  const core = await vite.ssrLoadModule('/src/core/seo/gsc-report.ts');
  const { SITE_URL } = await vite.ssrLoadModule('/src/core/seo/site.ts');
  const range = core.reportWindow(new Date());
  const token = await accessToken();
  const current = await week(token, range.current);
  const previous = await week(token, range.previous);
  const sitemaps = await api(token, `${WM}/sitemaps`);
  let urls = [];
  try {
    urls = await sitemapUrls(SITE_URL, core.sitemapLocations);
  } catch (err) {
    console.log(`::warning::Nie udało się pobrać mapy strony (${err.message}) – raport bez próbki indeksowania.`);
  }
  const inspections = await inspect(token, core.sample(urls, SAMPLE_SIZE));

  let previousState = null;
  const canIssue = !args['dry-run'] && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY;
  if (canIssue) {
    const res = await github('GET', '/issues?labels=seo&state=all&per_page=1&sort=created&direction=desc');
    if (res.ok) previousState = core.parseState((await res.json())[0]?.body ?? '');
  }

  if (args.record) {
    const dir = path.resolve(args.record);
    await mkdir(dir, { recursive: true });
    const save = (name, data) => writeFile(path.join(dir, name), `${JSON.stringify(data, null, 2)}\n`);
    await save('gsc-searchanalytics-current.json', current);
    await save('gsc-searchanalytics-previous.json', previous);
    await save('gsc-sitemaps.json', sitemaps);
    await save('gsc-inspect.json', inspections);
  }

  const markdown = core.renderMarkdown(core.buildReport({ window: range, current, previous, sitemaps, inspections, previousState }));
  const title = `SEO – tydzień ${range.current.start} – ${range.current.end}`;
  if (!canIssue) {
    console.log(`# ${title}\n\n${markdown}`);
  } else {
    // etykieta `seo` – utworzenie, jeśli jej nie ma (422 = już istnieje)
    await github('POST', '/labels', { name: 'seo', color: '1d76db', description: 'Raporty SEO (S12)' });
    const res = await github('POST', '/issues', { title, body: markdown, labels: ['seo'] });
    if (!res.ok) throw new Error(`utworzenie zgłoszenia → HTTP ${res.status}`);
    console.log(`Zgłoszenie: ${(await res.json()).html_url}`);
  }
} finally {
  await vite.close();
}
