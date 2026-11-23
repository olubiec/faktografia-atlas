// Wspólny klient Google Search Console dla scripts/seo/gsc-report.mjs (S12) i gsc-topics.mjs (W26-F06).
// Token OAuth z konta usługi przez podpis JWT w node:crypto (bez nowych pakietów).
// Sekret GSC_SERVICE_ACCOUNT czytamy tylko ze zmiennej środowiska i NIGDY go nie wypisujemy.
import { createSign } from 'node:crypto';

export const SITE = 'sc-domain:faktografia.eu';
export const WM = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`;
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

/**
 * Klucz konta usługi ze zmiennej środowiska. Brak sekretu (fork, nowe repo) → komunikat i kod 0,
 * bez czerwonego CI. Zły format → błąd bez treści sekretu.
 */
export function loadAccount(skipped) {
  const raw = process.env.GSC_SERVICE_ACCOUNT;
  if (!raw || !raw.trim()) {
    console.log(`Brak sekretu GSC_SERVICE_ACCOUNT – ${skipped}. Dodaj go w ustawieniach repozytorium (docs/SEO.md §7).`);
    process.exit(0);
  }
  try {
    const account = JSON.parse(raw);
    if (!account.client_email || !account.private_key) throw new Error('brak pól');
    return account;
  } catch {
    // bez treści sekretu w komunikacie
    console.log('::error::Sekret GSC_SERVICE_ACCOUNT nie jest poprawnym kluczem JSON konta usługi (potrzebne client_email i private_key).');
    process.exit(1);
  }
}

const b64url = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

export async function accessToken(account) {
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

export async function api(token, url, body) {
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${new URL(url).pathname} → HTTP ${res.status}`);
  return res.json();
}

/** searchanalytics.query za okres; `dimensions` puste = sumy. */
export function searchAnalytics(token, range, dimensions) {
  return api(token, `${WM}/searchAnalytics/query`, {
    startDate: range.start,
    endDate: range.end,
    ...(dimensions.length ? { dimensions } : {}),
    rowLimit: 1000,
  });
}
