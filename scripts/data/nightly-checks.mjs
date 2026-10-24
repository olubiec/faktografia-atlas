// Kontrole nocnego pobierania danych (workflow „Fetch data”): liczby kontrolne i wykrywanie realnych zmian.
// Użycie w workflow: node scripts/data/nightly-checks.mjs control        – liczby kontrolne na plikach w public/data/values/
//                    node scripts/data/nightly-checks.mjs revert-noise   – przywraca pliki, w których zmieniły się tylko fetchedAt/report
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VOLATILE = new Set(['fetchedAt', 'report']);

/**
 * Znajduje wskaźniki z config/indicators.json, które nie mają objaśnienia w public/data/explanations.json.
 * Zwraca listę ID brakujących wskaźników (brak pliku/null = wszystkie wskaźniki).
 */
export function findMissingExplanations(indicators, explanations) {
  const allIds = (indicators ?? []).map((i) => (typeof i === 'string' ? i : i?.id)).filter(Boolean);
  if (!explanations) {
    return allIds;
  }

  let existing = new Set();
  if (explanations instanceof Map || explanations instanceof Set) {
    existing = explanations;
  } else if (Array.isArray(explanations)) {
    existing = new Set(explanations.map((item) => (typeof item === 'string' ? item : item?.indicatorId ?? item?.id)).filter(Boolean));
  } else if (Array.isArray(explanations?.items)) {
    existing = new Set(explanations.items.map((item) => (typeof item === 'string' ? item : item?.indicatorId ?? item?.id)).filter(Boolean));
  }

  return allIds.filter((id) => !existing.has(id));
}

/** Czy dane (poza polami fetchedAt i report) różnią się między dwiema wersjami pliku wartości. */
export function substantiveChange(a, b) {
  const strip = (o) => JSON.stringify(Object.fromEntries(Object.entries(o ?? {}).filter(([k]) => !VOLATILE.has(k))));
  return strip(a) !== strip(b);
}

/**
 * Liczby kontrolne: 16 województw, ≥ 2470 gmin, suma ludności województw w ostatnim roku 36–39 mln.
 * Zwraca listę błędów (pusta = w porządku).
 */
export function checkControlNumbers(population, units) {
  const errors = [];
  const woj = units.filter((u) => u.level === 'woj');
  const gmi = units.filter((u) => u.level === 'gmi');
  if (woj.length !== 16) errors.push(`Oczekiwano 16 województw w units.json, jest ${woj.length}.`);
  if (!population || !Array.isArray(population.years) || !population.values) {
    return [...errors, 'Brak pliku ludności (population.json) albo ma zły kształt.'];
  }
  const last = population.years.length - 1;
  const withValue = (list) => list.filter((u) => typeof population.values[u.teryt]?.[last] === 'number');
  const gmiWithValue = withValue(gmi).length;
  if (gmiWithValue < 2470) errors.push(`Ludność: tylko ${gmiWithValue} gmin z wartością w ostatnim roku (wymagane ≥ 2470).`);
  const wojWithValue = withValue(woj);
  if (wojWithValue.length !== 16) errors.push(`Ludność: ${wojWithValue.length} z 16 województw ma wartość w ostatnim roku.`);
  const sum = wojWithValue.reduce((s, u) => s + population.values[u.teryt][last], 0);
  if (sum < 36_000_000 || sum > 39_000_000) errors.push(`Suma ludności województw (${population.years[last]}) = ${sum}, poza zakresem 36–39 mln.`);
  return errors;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = path.join(root, 'public/data/values');
  const mode = process.argv[2];

  if (mode === 'control') {
    const errors = checkControlNumbers(readJson(path.join(dir, 'population.json')), readJson(path.join(root, 'public/data/units.json')));
    if (errors.length) {
      console.error('Liczby kontrolne nie przechodzą:\n- ' + errors.join('\n- '));
      process.exit(1);
    }
    console.log('Liczby kontrolne: OK.');

    let explanations = null;
    try {
      explanations = readJson(path.join(root, 'public/data/explanations.json'));
    } catch {
      // plik może nie istnieć
    }
    let indicators = [];
    try {
      indicators = readJson(path.join(root, 'config/indicators.json'));
    } catch {
      // plik może nie istnieć
    }
    const missing = findMissingExplanations(indicators, explanations);
    if (missing.length) {
      console.log(`Wskaźniki bez objaśnienia (${missing.length}): ${missing.join(', ')}`);
    } else {
      console.log('Wszystkie wskaźniki posiadają objaśnienia.');
    }
    return;
  }

  if (mode === 'revert-noise') {
    const changed = [];
    for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
      const rel = `public/data/values/${name}`;
      let before = null;
      try {
        before = JSON.parse(execFileSync('git', ['show', `HEAD:${rel}`], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
      } catch {
        // plik nowy
      }
      const now = readJson(path.join(dir, name));
      if (before && !substantiveChange(before, now)) {
        execFileSync('git', ['checkout', '--', rel], { cwd: root });
      } else {
        changed.push(name.replace(/\.json$/, ''));
      }
    }
    writeFileSync(path.join(process.env.RUNNER_TEMP ?? '/tmp', 'zmienione-wskazniki.txt'), changed.join('\n') + '\n');
    console.log(changed.length ? `Zmienione wskaźniki (${changed.length}): ${changed.join(', ')}` : 'Brak zmian w danych (tylko znaczniki czasu).');
    return;
  }

  console.error('Użycie: node scripts/data/nightly-checks.mjs control|revert-noise');
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
