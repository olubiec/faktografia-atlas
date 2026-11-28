// Wspólny klient Google Search Console dla scripts/seo/gsc-report.mjs (S12) i gsc-topics.mjs (W26-F06).
// Token OAuth z konta usługi przez podpis JWT w node:crypto (bez nowych pakietów).
// Sekret GSC_SERVICE_ACCOUNT czytamy tylko ze zmiennej środowiska i NIGDY go nie wypisujemy.
import { createSign } from 'node:crypto';

export const SITE = 'sc-domain:faktografia.eu';
export const WM = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`;
const SCOPE_READ = 'https://www.googleapis.com/auth/webmasters.readonly';
/** Zakres zapisu (S14: wysyłka mapy strony). Konto usługi musi być użytkownikiem „Pełny”. */
export const SCOPE_WRITE = 'https://www.googleapis.com/auth/webmasters';

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

/** Token OAuth; zakres domyślnie tylko do odczytu (dotychczasowe wywołania bez zmian). */
export async function accessToken(account, scope = SCOPE_READ) {
  const now = Math.floor(Date.now() / 1000);
  const aud = account.token_uri || 'https://oauth2.googleapis.com/token';
  const unsigned = `${b64url({ alg: 'RS256', typ: 'JWT' })}.${b64url({ iss: account.client_email, scope, aud, iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key).toString('base64url');
  const res = await fetch(aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  if (!res.ok) throw new Error(`token OAuth → HTTP ${res.status}`);
  return (await res.json()).access_token;
}

/** Zapytanie do API. Metoda domyślnie: POST z ciałem, GET bez; `PUT` bez ciała podajemy wprost. */
export async function api(token, url, body, method = body ? 'POST' : 'GET') {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw Object.assign(new Error(`${new URL(url).pathname} → HTTP ${res.status}`), { status: res.status });
  const text = await res.text();
  return text ? JSON.parse(text) : {};
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
