/**
 * Skrypt pobierający i przetwarzający miejscowości z PRNG (GUGiK).
 * Służy do generowania pliku public/data/localities.json.
 * Może działać w trybie sieciowym (z wielowątkowym pobieraniem i ponawianiem)
 * lub w trybie offline z wykorzystaniem fixtur/cache.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLocalities, serialize, summarize } from './localities-parse.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../');

const DEFAULT_UNITS_PATH = path.join(REPO_ROOT, 'public/data/units.json');
const DEFAULT_OUT_PATH = path.join(REPO_ROOT, 'public/data/localities.json');
const DEFAULT_FIXTURE_PATH = path.join(REPO_ROOT, 'tests/fixtures/prng/sample.json');
const PRNG_ENDPOINT = 'https://ogcapi.geoportal.gov.pl/res/ims/maps/PRNG/apiFeatures/collections/NazwaGeograficznaRP/items?f=json';

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    fixture: false,
    fixturePath: DEFAULT_FIXTURE_PATH,
    outPath: DEFAULT_OUT_PATH,
    unitsPath: DEFAULT_UNITS_PATH,
    cachePath: null,
    concurrency: 5,
    limit: 150,
    timeoutMs: 15000,
    maxRetries: 3
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--fixture') {
      args.fixture = true;
      if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
        args.fixturePath = path.resolve(argv[++i]);
      }
    } else if (arg === '--out' && argv[i + 1]) {
      args.outPath = path.resolve(argv[++i]);
    } else if (arg === '--units' && argv[i + 1]) {
      args.unitsPath = path.resolve(argv[++i]);
    } else if (arg === '--cache' && argv[i + 1]) {
      args.cachePath = path.resolve(argv[++i]);
    } else if (arg === '--concurrency' && argv[i + 1]) {
      args.concurrency = Math.max(1, parseInt(argv[++i], 10) || 5);
    } else if (arg === '--limit' && argv[i + 1]) {
      args.limit = Math.max(1, parseInt(argv[++i], 10) || 150);
    }
  }

  if (process.env.LOCALITIES_FIXTURE === '1') {
    args.fixture = true;
  }

  return args;
}

export async function fetchWithRetry(url, options = {}, timeoutMs = 15000, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt >= maxRetries) {
        throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts: ${err.message}`);
      }
      const backoffMs = attempt * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
}

export async function fetchAllPrngFeatures({ limit = 150, concurrency = 5, timeoutMs = 15000, maxRetries = 3 } = {}) {
  const initialUrl = `${PRNG_ENDPOINT}&limit=${limit}&offset=0`;
  console.log(`[PRNG] Pobieranie pierwszej strony: ${initialUrl}`);
  const firstData = await fetchWithRetry(initialUrl, {}, timeoutMs, maxRetries);

  const total = firstData?.numberMatched ?? 0;
  const initialFeatures = firstData?.features ?? [];
  console.log(`[PRNG] Łącznie obiektów w rejestrze PRNG: ${total}`);

  if (total <= initialFeatures.length) {
    return initialFeatures;
  }

  const totalPages = Math.ceil(total / limit);
  const allFeatures = [...initialFeatures];

  console.log(`[PRNG] Do pobrania ${totalPages - 1} kolejnych stron z limit=${limit}, concurrency=${concurrency}...`);

  let loadedPages = 1;

  for (let p = 1; p < totalPages; p += concurrency) {
    const promises = [];
    for (let b = 0; b < concurrency && (p + b) < totalPages; b++) {
      const pageIndex = p + b;
      const offset = pageIndex * limit;
      const pageUrl = `${PRNG_ENDPOINT}&limit=${limit}&offset=${offset}`;
      promises.push(
        fetchWithRetry(pageUrl, {}, timeoutMs, maxRetries)
          .then((data) => data?.features || [])
          .catch((err) => {
            console.error(`[PRNG] Błąd pobierania strony offset=${offset}: ${err.message}`);
            return [];
          })
      );
    }

    const pagesData = await Promise.all(promises);
    for (const features of pagesData) {
      allFeatures.push(...features);
    }

    loadedPages += promises.length;
    if (loadedPages % 50 < concurrency || loadedPages >= totalPages) {
      console.log(`[PRNG] Postęp: pobrano ${loadedPages}/${totalPages} stron (${allFeatures.length} obiektów)...`);
    }
  }

  return allFeatures;
}

export async function main() {
  const args = parseArgs();

  console.log('[PRNG] Uruchamianie skryptu miejscowości...');
  console.log(`[PRNG] Wczytywanie jednostek z: ${args.unitsPath}`);

  if (!fs.existsSync(args.unitsPath)) {
    throw new Error(`Plik jednostek nie istnieje: ${args.unitsPath}`);
  }

  const units = JSON.parse(fs.readFileSync(args.unitsPath, 'utf8'));
  let rawFeatures = [];

  if (args.fixture) {
    console.log(`[PRNG] Tryb offline (fixture): ${args.fixturePath}`);
    if (!fs.existsSync(args.fixturePath)) {
      throw new Error(`Plik fixture nie istnieje: ${args.fixturePath}`);
    }
    const fixtureData = JSON.parse(fs.readFileSync(args.fixturePath, 'utf8'));
    rawFeatures = Array.isArray(fixtureData) ? fixtureData : (fixtureData.features || []);
  } else if (args.cachePath && fs.existsSync(args.cachePath)) {
    console.log(`[PRNG] Wczytywanie z pamięci podręcznej (cache): ${args.cachePath}`);
    const cacheData = JSON.parse(fs.readFileSync(args.cachePath, 'utf8'));
    rawFeatures = Array.isArray(cacheData) ? cacheData : (cacheData.features || []);
  } else {
    console.log('[PRNG] Pobieranie danych z OGC API Features...');
    rawFeatures = await fetchAllPrngFeatures({
      limit: args.limit,
      concurrency: args.concurrency,
      timeoutMs: args.timeoutMs,
      maxRetries: args.maxRetries
    });

    if (args.cachePath) {
      const cacheDir = path.dirname(args.cachePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(args.cachePath, JSON.stringify(rawFeatures), 'utf8');
      console.log(`[PRNG] Zapisano pobrane obiekty w cache: ${args.cachePath}`);
    }
  }

  console.log(`[PRNG] Przetwarzanie ${rawFeatures.length} obiektów PRNG...`);
  const result = buildLocalities(rawFeatures, units);
  const stats = summarize(result);

  console.log('[PRNG] Podsumowanie przetwarzania:');
  console.log(`  - Samodzielne miejscowości: ${result.localities.length}`);
  console.log(`  - Wg rodzajów:`, stats.byKind);
  console.log(`  - Z przybliżoną pozycją (approx): ${stats.approx}`);
  console.log(`  - Pominięte obiekty: ${stats.skipped}`);

  const jsonOutput = serialize(result.localities);

  const outDir = path.dirname(args.outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(args.outPath, jsonOutput, 'utf8');
  console.log(`[PRNG] Zapisano ${result.localities.length} miejscowości do: ${args.outPath}`);
  console.log(`[PRNG] Rozmiar pliku wynikowego: ${(Buffer.byteLength(jsonOutput, 'utf8') / 1024).toFixed(1)} KB`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main().catch((err) => {
    console.error('[PRNG] Błąd krytyczny:', err);
    process.exit(1);
  });
}
