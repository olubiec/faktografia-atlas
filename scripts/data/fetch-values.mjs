import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataUrl } from './record-bdl.mjs';
import { nextPageUrl, toIndicatorValues } from './values.mjs';

export function redactSecret(text, secret) {
  if (!secret || typeof text !== 'string') return text;
  return text.replaceAll(secret, '[REDACTED]');
}

export function assertNoSecret(text, secret) {
  if (secret && text.includes(secret)) {
    throw new Error('Wyjście zawiera sekret BDL_CLIENT_ID');
  }
}

export async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Wykonuje zapytanie HTTP z obsługą limitów tempa (2 s) i ponowień dla 429 i 5xx (maks. 5 prób).
 */
export async function fetchWithRetry(url, clientId, options = {}) {
  const {
    fetchFn = globalThis.fetch,
    sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)),
    intervalMs = 2000,
    maxAttempts = 5,
    stats = null,
  } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleepFn(intervalMs);
    if (stats) stats.requests++;

    let res;
    try {
      res = await fetchFn(url, {
        headers: { 'X-ClientId': clientId, Accept: 'application/json' },
      });
    } catch (err) {
      if (attempt === maxAttempts) {
        throw new Error(redactSecret(`Brak odpowiedzi z ${url}: ${err.message}`, clientId));
      }
      await sleepFn(5000 * attempt);
      continue;
    }

    if (res.ok) {
      return await res.json();
    }
    if (res.status === 404) {
      return null;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
      const backoff = res.status === 429 ? 60000 * attempt : 5000 * attempt;
      await sleepFn(backoff);
      continue;
    }
    throw new Error(redactSecret(`HTTP ${res.status} ${res.statusText} dla ${url}`, clientId));
  }
  throw new Error(redactSecret(`Nie udało się pobrać ${url}`, clientId));
}

export function getLevelsForIndicator(indicator) {
  const levels = [2, 5];
  if (indicator.minLevel === 'gmi') {
    levels.push(6);
  }
  return levels;
}

/**
 * Pobiera wszystkie strony dla danego wskaźnika i poziomów, a następnie tworzy IndicatorValues.
 */
export async function fetchIndicatorValues(indicator, units, clientId, options = {}) {
  const {
    fetchFn = globalThis.fetch,
    sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)),
    intervalMs = 2000,
    maxAttempts = 5,
    offlineFixture = false,
    recordedDir = null,
    stats = { requests: 0 },
  } = options;

  const levels = getLevelsForIndicator(indicator);
  const allPages = [];

  for (const level of levels) {
    if (offlineFixture) {
      // Ładowanie nagrań z pliku fixture
      let page = 0;
      for (;;) {
        const fixtureName = `${indicator.bdlVarId}-l${level}-p${String(page).padStart(3, '0')}.json`;
        const fixturePath = path.join(recordedDir, fixtureName);
        if (await exists(fixturePath)) {
          const content = JSON.parse(await readFile(fixturePath, 'utf8'));
          allPages.push(content);
          if (!nextPageUrl(content)) break;
          page++;
        } else {
          break;
        }
      }
    } else {
      // Pobieranie sieciowe strona po stronie
      let currentUrl = dataUrl(indicator.bdlVarId, level, 0);
      let pageCount = 0;

      while (currentUrl) {
        const pageJson = await fetchWithRetry(currentUrl, clientId, {
          fetchFn,
          sleepFn,
          intervalMs,
          maxAttempts,
          stats,
        });

        if (!pageJson) break;

        allPages.push(pageJson);
        currentUrl = nextPageUrl(pageJson);
        pageCount++;

        if (pageCount > 300) {
          throw new Error(`Przekroczono limit 300 stron dla wskaźnika ${indicator.id} na poziomie ${level}`);
        }
      }
    }
  }

  return toIndicatorValues(indicator, allPages, units);
}

export function generateReportRow(indicator, result, units, requests) {
  const years = result.years ?? [];
  const lastYear = years.length > 0 ? years[years.length - 1] : null;
  const lastYearIdx = years.length > 0 ? years.length - 1 : -1;

  const unitsByTeryt = new Map();
  const totalByLevel = { woj: 0, pow: 0, gmi: 0 };
  for (const u of units) {
    unitsByTeryt.set(u.teryt, u);
    if (u.level in totalByLevel) {
      totalByLevel[u.level]++;
    }
  }

  const withValByLevel = { woj: 0, pow: 0, gmi: 0 };
  if (lastYearIdx >= 0) {
    for (const [teryt, vals] of Object.entries(result.values ?? {})) {
      const u = unitsByTeryt.get(teryt);
      if (u && u.level in withValByLevel) {
        const val = vals[lastYearIdx];
        if (val !== null && val !== undefined) {
          withValByLevel[u.level]++;
        }
      }
    }
  }

  const levels = getLevelsForIndicator(indicator);
  const levelStats = [];
  if (levels.includes(2)) levelStats.push(`woj: ${withValByLevel.woj}/${totalByLevel.woj}`);
  if (levels.includes(5)) levelStats.push(`pow: ${withValByLevel.pow}/${totalByLevel.pow}`);
  if (levels.includes(6)) levelStats.push(`gmi: ${withValByLevel.gmi}/${totalByLevel.gmi}`);

  return `${indicator.id}\tostatni rok: ${lastYear ?? 'brak'}\tjednostki z wartością: [${levelStats.join(', ')}]\tzapytań: ${requests}`;
}

async function main() {
  const clientId = process.env.BDL_CLIENT_ID;
  if (!clientId) {
    console.error('Brak BDL_CLIENT_ID w środowisku. Ustaw sekret w GitHub (Settings → Secrets → Actions).');
    process.exit(1);
  }

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const unitsPath = path.join(root, 'public/data/units.json');
  const indicatorsPath = path.join(root, 'config/indicators.json');

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;

  const skipExisting = process.argv.includes('--skip-existing');
  const offlineFixture = process.argv.includes('--offline-fixture');

  const outDirArg = process.argv.find((a) => a.startsWith('--out-dir='));
  const outDir = outDirArg ? path.resolve(outDirArg.slice(10)) : path.join(root, 'public/data/values');

  const recordedDir = path.join(root, 'tests/fixtures/bdl/recorded');

  const units = JSON.parse(await readFile(unitsPath, 'utf8'));
  const indicators = JSON.parse(await readFile(indicatorsPath, 'utf8')).filter(
    (i) => !only || only.has(i.id)
  );

  await mkdir(outDir, { recursive: true });

  const stats = { requests: 0 };
  const reports = [];

  for (const ind of indicators) {
    const outFile = path.join(outDir, `${ind.id}.json`);
    if (skipExisting && (await exists(outFile))) {
      console.log(`[skip] ${ind.id} - plik już istnieje.`);
      continue;
    }

    const requestsBefore = stats.requests;
    const result = await fetchIndicatorValues(ind, units, clientId, {
      offlineFixture,
      recordedDir,
      stats,
    });

    const text = JSON.stringify(result, null, 2) + '\n';
    assertNoSecret(text, clientId);

    // Zapis pliku dopiero po pomyślnym pobraniu wszystkich stron dla wskaźnika
    await writeFile(outFile, text);

    const indRequests = stats.requests - requestsBefore;
    const row = generateReportRow(ind, result, units, indRequests);
    reports.push(row);
    console.log(row);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    const msg = String(err?.message ?? err).replaceAll(process.env.BDL_CLIENT_ID || '\u0000', '[REDACTED]');
    console.error(`Error: ${msg}`);
    process.exit(1);
  });
}
