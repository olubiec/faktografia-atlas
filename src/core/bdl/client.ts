import pThrottle from 'p-throttle';
import type { BdlClientOptions, BdlRequestParams } from './types';

const DEFAULT_BASE_URL = 'https://bdl.stat.gov.pl/api/v1';
const MAX_ATTEMPTS = 5;
const DEFAULT_INITIAL_DELAY = 200;

// Licznik zapytań HTTP wykonanych przez klienta
let totalRequestCount = 0;

export function getRequestCount(): number {
  return totalRequestCount;
}

export function resetRequestCount(): void {
  totalRequestCount = 0;
}

// Ogranicznik częstotliwości zapytań (max 8 zapytań na sekundę)
const throttle = pThrottle({
  limit: 8,
  interval: 1000,
});

// Pomocnicza funkcja do opóźnienia wykonania
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Usuwanie wrażliwego klucza z komunikatów błędu
function sanitizeMessage(message: string, secretKey?: string): string {
  if (!secretKey) return message;
  return message.replaceAll(secretKey, '[REDACTED]');
}

// Podstawowe pobieranie bez logiki ponawiania
async function rawFetch(
  fullUrl: string,
  headers: Record<string, string>,
  fetchFn: typeof fetch
): Promise<Response> {
  totalRequestCount++;
  return await fetchFn(fullUrl, { headers });
}

// Pobieranie z ograniczeniem szybkości (p-throttle)
const throttledRawFetch = throttle(rawFetch);

interface BdlPaginatedResponse<T> {
  results?: T[];
  links?: { next?: string };
}

// Bezpieczny odczyt process.env.BDL_CLIENT_ID w środowisku Node.js i przeglądarce
function getEnvClientId(): string | undefined {
  const globalObj = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return globalObj.process?.env?.BDL_CLIENT_ID;
}

// Wykonuje zapytanie GET do API BDL GUS z ponawianiem i limitami
export async function bdlGet<T = unknown>(
  path: string,
  params: BdlRequestParams = {},
  options: BdlClientOptions = {}
): Promise<T> {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const maxRetries = options.maxRetries ?? MAX_ATTEMPTS;
  const initialDelay = options.initialDelayMs ?? DEFAULT_INITIAL_DELAY;
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const clientId = options.clientId ?? getEnvClientId();

  // Przygotowanie adresu URL
  const urlObj = path.startsWith('http://') || path.startsWith('https://')
    ? new URL(path)
    : new URL(`${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`);

  // Domyślne parametry zapytania
  if (!urlObj.searchParams.has('format')) urlObj.searchParams.set('format', 'json');
  if (!urlObj.searchParams.has('lang')) urlObj.searchParams.set('lang', 'pl');
  if (!urlObj.searchParams.has('page-size')) urlObj.searchParams.set('page-size', '100');

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) {
      urlObj.searchParams.set(k, String(v));
    }
  }

  // Nagłówki zapytania
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (clientId && clientId.trim() !== '') {
    headers['X-ClientId'] = clientId.trim();
  }

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    attempt++;
    let response: Response;

    try {
      response = await throttledRawFetch(urlObj.toString(), headers, fetchFn);
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      const safeMsg = sanitizeMessage(rawMsg, clientId);
      lastError = new Error(safeMsg);

      if (attempt < maxRetries) {
        const backoff = initialDelay * Math.pow(2, attempt - 1);
        await delay(backoff);
        continue;
      }
      break;
    }

    if (response.ok) {
      return (await response.json()) as T;
    }

    const status = response.status;
    const isRetryable = status === 429 || (status >= 500 && status <= 599);

    if (isRetryable && attempt < maxRetries) {
      const backoff = initialDelay * Math.pow(2, attempt - 1);
      await delay(backoff);
      continue;
    }

    const errorText = await response.text().catch(() => '');
    const safeText = sanitizeMessage(errorText, clientId);
    throw new Error(`HTTP ${status} ${response.statusText}: ${safeText}`);
  }

  throw lastError || new Error('BDL API Request failed after maximum retry attempts');
}

// Pobiera wszystkie strony dla danych ze stronicowaniem (wykorzystuje links.next lub parametr page)
export async function bdlGetAllPages<T = unknown>(
  path: string,
  params: BdlRequestParams = {},
  options: BdlClientOptions = {}
): Promise<T[]> {
  const allResults: T[] = [];
  let currentPathOrUrl: string | undefined = path;
  let currentParams: BdlRequestParams | undefined = { ...params };

  while (currentPathOrUrl) {
    const pageData: BdlPaginatedResponse<T> = await bdlGet<BdlPaginatedResponse<T>>(
      currentPathOrUrl,
      currentParams,
      options
    );

    if (Array.isArray(pageData.results)) {
      allResults.push(...pageData.results);
    }

    if (pageData.links?.next) {
      currentPathOrUrl = pageData.links.next;
      currentParams = undefined; // Parametry są zawarte w pełnym adresie URL z links.next
    } else {
      currentPathOrUrl = undefined;
    }
  }

  return allResults;
}
