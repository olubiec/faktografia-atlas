// Nagrywa odpowiedzi API BDL (GUS) dla wskaźników z config/indicators.json do
// tests/fixtures/bdl/recorded/. Uruchamia go wyłącznie workflow „BDL record”
// w GitHub Actions z sekretem BDL_CLIENT_ID. Jules i testy korzystają z nagrań offline.
//
// Nagrywa: /variables/<id> oraz wszystkie strony /data/by-variable/<id>
// dla poziomu 5 (powiaty) i 6 (gminy; tylko gdy minLevel = "gmi").
// Żeby pliki nie były ogromne, w każdym rekordzie zostają tylko 2 ostatnie lata z wartościami
// (struktura stron, `totalRecords` i `links` bez zmian).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE_URL = 'https://bdl.stat.gov.pl/api/v1';
export const KEEP_YEARS = 2;

export function dataUrl(varId, level, page = 0) {
  const url = new URL(`${BASE_URL}/data/by-variable/${varId}`);
  url.searchParams.set('unit-level', String(level));
  url.searchParams.set('format', 'json');
  url.searchParams.set('lang', 'pl');
  url.searchParams.set('page-size', '100');
  url.searchParams.set('page', String(page));
  return url.toString();
}

export function variableUrl(varId) {
  return `${BASE_URL}/variables/${varId}?format=json&lang=pl`;
}

export function levelsFor(indicator) {
  return indicator.minLevel === 'gmi' ? [5, 6] : [5];
}

export function fixtureName(varId, level, page) {
  return `${varId}-l${level}-p${String(page).padStart(3, '0')}.json`;
}

/** Zostawia w każdym rekordzie tylko `keep` najnowszych lat z wartością (val !== null). */
export function trimYears(pageJson, keep = KEEP_YEARS) {
  const results = (pageJson.results ?? []).map((r) => {
    const withVal = (r.values ?? []).filter((v) => v.val !== null && v.val !== undefined);
    const years = [...new Set(withVal.map((v) => String(v.year)))].sort().slice(-keep);
    return { ...r, values: (r.values ?? []).filter((v) => years.includes(String(v.year))) };
  });
  return { ...pageJson, results };
}

/** Czy jest następna strona (API podaje links.next). */
export function hasNext(pageJson) {
  return Boolean(pageJson?.links?.next);
}

export function assertNoSecret(text, secret) {
  if (secret && text.includes(secret)) {
    throw new Error('Nagranie zawiera klucz API – przerywam bez zapisu.');
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Z kluczem: 10/s, 500/15 min, 5000/12 h. Jedno zapytanie co 2 s mieści się w 500/15 min z zapasem.
async function getJson(url, clientId, stats, { intervalMs = 2000, maxAttempts = 6 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(intervalMs);
    stats.requests++;
    let res;
    try {
      res = await fetch(url, { headers: { 'X-ClientId': clientId, Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
    } catch (err) {
      if (attempt === maxAttempts) throw new Error(`Brak odpowiedzi z ${url}: ${err.message}`);
      await sleep(5000 * attempt);
      continue;
    }
    if (res.ok) return await res.json();
    if (res.status === 404) return null;
    if ((res.status === 429 || res.status >= 500) && attempt < maxAttempts) {
      // 429 = przekroczony limit: czekamy dłużej (okno limitu to 15 min)
      await sleep(res.status === 429 ? 60000 * attempt : 5000 * attempt);
      continue;
    }
    throw new Error(`HTTP ${res.status} ${res.statusText} dla ${url}`);
  }
  throw new Error(`Nie udało się pobrać ${url}`);
}

async function main() {
  const clientId = process.env.BDL_CLIENT_ID;
  if (!clientId) {
    console.error('Brak BDL_CLIENT_ID w środowisku. Ustaw sekret w GitHub (Settings → Secrets → Actions).');
    process.exit(1);
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const outDir = path.join(root, 'tests/fixtures/bdl/recorded');
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.slice(7).split(',')) : null;

  const indicators = JSON.parse(await readFile(path.join(root, 'config/indicators.json'), 'utf8'))
    .filter((i) => !only || only.has(i.id));
  await mkdir(outDir, { recursive: true });

  const stats = { requests: 0 };
  const report = [];
  for (const ind of indicators) {
    const meta = await getJson(variableUrl(ind.bdlVarId), clientId, stats);
    if (!meta) throw new Error(`Zmienna ${ind.bdlVarId} (${ind.id}) nie istnieje w BDL.`);
    const metaText = JSON.stringify(meta, null, 2);
    assertNoSecret(metaText, clientId);
    await writeFile(path.join(outDir, `${ind.bdlVarId}-variable.json`), metaText + '\n');

    for (const level of levelsFor(ind)) {
      let page = 0;
      let records = 0;
      for (;;) {
        const json = await getJson(dataUrl(ind.bdlVarId, level, page), clientId, stats);
        if (!json) break;
        const text = JSON.stringify(trimYears(json));
        assertNoSecret(text, clientId);
        await writeFile(path.join(outDir, fixtureName(ind.bdlVarId, level, page)), text + '\n');
        records += json.results?.length ?? 0;
        if (!hasNext(json)) break;
        page++;
        if (page > 200) throw new Error(`Za dużo stron dla ${ind.id} na poziomie ${level}.`);
      }
      report.push(`${ind.id}\tvar ${ind.bdlVarId}\tpoziom ${level}\tstron ${page + 1}\trekordów ${records}`);
      console.log(report.at(-1));
    }
  }
  const summary = `Wskaźników: ${indicators.length}, zapytań: ${stats.requests}\n` + report.join('\n') + '\n';
  await writeFile(path.join(outDir, 'REPORT.txt'), summary);
  console.log(summary);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    const msg = String(err?.message ?? err).replaceAll(process.env.BDL_CLIENT_ID || '\u0000', '[REDACTED]');
    console.error(`Error: ${msg}`);
    process.exit(1);
  });
}
