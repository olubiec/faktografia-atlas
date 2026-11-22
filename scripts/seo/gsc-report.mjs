// Tygodniowy raport z Search Console jako zgłoszenie (Issue) na GitHubie.
// Sekret GSC_SERVICE_ACCOUNT (JSON konta usługi) trafia tylko do zmiennej środowiska kroku i nie jest nigdzie wypisywany.
import { createSign } from 'node:crypto';
import { createServer } from 'vite';

const SITE = 'sc-domain:faktografia.eu';
const SITE_URL = 'https://faktografia.eu';
const SAMPLE = 40;
const DAY = 86_400_000;

const secret = process.env.GSC_SERVICE_ACCOUNT;
if (!secret) {
  console.log('[gsc] Brak sekretu GSC_SERVICE_ACCOUNT: raport pominięty (dodaj sekret według docs/SEO.md §7).');
  process.exit(0);
}

const b64 = (x) => Buffer.from(x).toString('base64url');

async function accessToken(account) {
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: account.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  const unsigned = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify(claim))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  if (!r.ok) throw new Error(`Logowanie konta usługi nie powiodło się (HTTP ${r.status})`);
  return (await r.json()).access_token;
}

const day = (ms) => new Date(ms).toISOString().slice(0, 10);

async function main() {
  const token = await accessToken(JSON.parse(secret));
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const api = async (url, body) => {
    const r = await fetch(url, body ? { method: 'POST', headers: auth, body: JSON.stringify(body) } : { headers: auth });
    if (!r.ok) throw new Error(`${new URL(url).pathname}: HTTP ${r.status}`);
    return r.json();
  };
  const site = encodeURIComponent(SITE);
  // Dane Search Console mają 2–3 dni opóźnienia: okno kończy się 3 dni temu.
  const end = Date.now() - 3 * DAY;
  const periods = { current: [end - 6 * DAY, end], previous: [end - 13 * DAY, end - 7 * DAY] };
  const query = async (range, dimension) =>
    (await api(`https://www.googleapis.com/webmasters/v3/sites/${site}/searchAnalytics/query`, { startDate: day(range[0]), endDate: day(range[1]), dimensions: [dimension], rowLimit: 250 })).rows ?? [];
  const period = async (range) => {
    const [queries, pages] = [await query(range, 'query'), await query(range, 'page')];
    const clicks = pages.reduce((s, r) => s + r.clicks, 0);
    const impressions = pages.reduce((s, r) => s + r.impressions, 0);
    const position = pages.length ? pages.reduce((s, r) => s + r.position * r.impressions, 0) / Math.max(impressions, 1) : 0;
    return { totals: { clicks, impressions, position }, queries, pages };
  };
  const current = await period(periods.current);
  const previous = await period(periods.previous);
  const hasPrevious = previous.totals.impressions > 0;

  const sm = (await api(`https://www.googleapis.com/webmasters/v3/sites/${site}/sitemaps`)).sitemap ?? [];
  const sitemaps = sm.map((s) => ({
    path: s.path,
    submitted: (s.contents ?? []).reduce((n, c) => n + Number(c.submitted ?? 0), 0),
    indexed: (s.contents ?? []).reduce((n, c) => n + Number(c.indexed ?? 0), 0),
    errors: Number(s.errors ?? 0),
    warnings: Number(s.warnings ?? 0),
  }));

  // Próbka adresów z mapy strony przez inspekcję URL.
  const index = await (await fetch(`${SITE_URL}/sitemap.xml`)).text();
  const urls = [];
  for (const m of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const xml = await (await fetch(m[1])).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
  }
  const sample = urls.sort(() => Math.random() - 0.5).slice(0, SAMPLE);
  const inspections = [];
  for (const url of sample) {
    try {
      const res = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: SITE });
      const s = res.inspectionResult?.indexStatusResult ?? {};
      inspections.push({ url, verdict: s.verdict ?? 'UNKNOWN', coverageState: s.coverageState ?? '' });
    } catch (e) {
      console.warn(`[gsc] inspekcja pominięta: ${e.message}`);
    }
  }

  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  let report;
  try {
    const { buildReport } = await server.ssrLoadModule('/src/core/seo/gsc-report.ts');
    report = buildReport({ window: { start: day(periods.current[0]), end: day(periods.current[1]) }, current, previous: hasPrevious ? previous : null, sitemaps, inspections });
  } finally {
    await server.close();
  }

  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !process.env.GITHUB_TOKEN) {
    console.log(report.markdown);
    return;
  }
  const r = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: `SEO – tydzień ${day(periods.current[1])}`, body: report.markdown, labels: ['seo'] }),
  });
  if (!r.ok) throw new Error(`Nie udało się utworzyć zgłoszenia (HTTP ${r.status})`);
  console.log(`[gsc] zgłoszenie utworzone; flagi: ${report.flags.length}`);
}

main().catch((e) => {
  // Błąd nie może zawieść całego CI: czytelny komunikat bez sekretów.
  console.error(`[gsc] BŁĄD: ${e.message}`);
  process.exit(1);
});
