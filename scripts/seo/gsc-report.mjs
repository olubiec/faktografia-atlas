// Tygodniowy raport z Google Search Console jako zgłoszenie na GitHubie (S12, docs/SEO.md §7–§8).
// Token OAuth i zapytania do API: scripts/seo/gsc-client.mjs (wspólne z gsc-topics.mjs, W26-F06).
// Sekret GSC_SERVICE_ACCOUNT czytamy tylko ze zmiennej środowiska i NIGDY go nie wypisujemy.
//
// Użycie: node scripts/seo/gsc-report.mjs [--dry-run] [--record <katalog>]
//   --dry-run   wypisuje Markdown zamiast tworzyć zgłoszenie
//   --record    zapisuje surowe odpowiedzi API (format tests/fixtures/seo/gsc-*.json)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { SITE, WM, accessToken, api, loadAccount, searchAnalytics } from './gsc-client.mjs';

// Limit dobowy URL Inspection to 2000 na właściwość; 150 adresów tygodniowo obraca się po całej mapie strony (S15).
const SAMPLE_SIZE = 150;
const root = path.resolve(import.meta.dirname, '../..');
const { values: args } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false }, record: { type: 'string' } } });

// Brak sekretu (np. fork, nowe repo) → czytelny komunikat i kod 0, bez czerwonego CI (gsc-client.mjs).
const account = loadAccount('raport Search Console pominięty');

async function week(token, range) {
  const q = (dimensions) => searchAnalytics(token, range, dimensions);
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
  const token = await accessToken(account);
  const current = await week(token, range.current);
  const previous = await week(token, range.previous);
  const sitemaps = await api(token, `${WM}/sitemaps`);
  let urls = [];
  try {
    urls = await sitemapUrls(SITE_URL, core.sitemapLocations);
  } catch (err) {
    console.log(`::warning::Nie udało się pobrać mapy strony (${err.message}) – raport bez próbki indeksowania.`);
  }
  const sampling = await vite.ssrLoadModule('/src/core/seo/gsc-sample.ts');

  let previousState = null;
  const canIssue = !args['dry-run'] && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY;
  if (canIssue) {
    const res = await github('GET', '/issues?labels=seo&state=all&per_page=1&sort=created&direction=desc');
    if (res.ok) previousState = core.parseState((await res.json())[0]?.body ?? '');
  }
  // Kursor i stan adresów z poprzedniego zgłoszenia; pierwszy tydzień → kursor 0, bez flagi spadku.
  const rotation = sampling.readRotation(previousState);
  const picked = sampling.pickSample(urls, rotation.cursor, SAMPLE_SIZE);
  const inspections = await inspect(token, picked.sample);

  if (args.record) {
    const dir = path.resolve(args.record);
    await mkdir(dir, { recursive: true });
    const save = (name, data) => writeFile(path.join(dir, name), `${JSON.stringify(data, null, 2)}\n`);
    await save('gsc-searchanalytics-current.json', current);
    await save('gsc-searchanalytics-previous.json', previous);
    await save('gsc-sitemaps.json', sitemaps);
    await save('gsc-inspect.json', inspections);
  }

  // (W26-F06) „Tematy do rozważenia” i mnożniki tematów – tylko informacja, nic nie powstaje samo.
  const trend = await vite.ssrLoadModule('/src/core/facts/trend-boost.ts');
  const { topicCandidates, renderSignals } = await vite.ssrLoadModule('/src/core/facts/topic-candidates.ts');
  const keywords = JSON.parse(await readFile(path.join(root, 'config/topic-keywords.json'), 'utf8'));
  const pages = [...urls, ...(current.page.rows ?? []).map((r) => r.keys?.[0] ?? '')];
  const signals = renderSignals(trend.topicTrends(current.query, previous.query, keywords), topicCandidates(current.query, pages, keywords));
  // previousState: null – porównanie spadku robi teraz S15 (na stanie z całej mapy), nie stara flaga z jednej próbki.
  const report = core.buildReport({ window: range, current, previous, sitemaps, inspections, previousState: null });
  const toPath = (u) => u.replace(SITE_URL, '') || '/';
  const inspected = Object.fromEntries(inspections.filter((i) => i.result?.inspectionResult?.indexStatusResult).map((i) => [toPath(i.url), i.result.inspectionResult.indexStatusResult.verdict === 'PASS' ? 'i' : 'n']));
  const known = new Set(urls.map(toPath));
  const before = rotation.coverage && Object.fromEntries(Object.entries(rotation.coverage).filter(([u]) => known.has(u)));
  const merged = sampling.mergeCoverage(before, inspected);
  const dropFlag = sampling.coverageDropFlag(before, merged);
  if (dropFlag) report.flags.push(dropFlag);
  // Stan w zgłoszeniu: dotychczasowe pola + kursor i skrócona mapa adres → stan.
  const state = { ...report.state, cursor: picked.cursor, coverage: merged.coverage };
  const rendered = core.renderMarkdown(report).replace(/<!-- gsc-state:.*? -->/, () => `<!-- gsc-state:${JSON.stringify(state)} -->`);
  const markdown = `${rendered}\n${signals}`;
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
