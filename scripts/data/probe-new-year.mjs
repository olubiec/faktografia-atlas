// Nocna sonda: dla każdego wskaźnika z config/indicators.json jedno zapytanie o rok po ostatnim pobranym.
// Wypisuje po przecinku id wskaźników, dla których GUS opublikował nowy rok (puste = nic nowego).
// Użycie: BDL_CLIENT_ID=… node scripts/data/probe-new-year.mjs   (koszt: 1 zapytanie na wskaźnik zamiast ok. 40)
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWithRetry } from './fetch-values.mjs';
import { hasNewYear, idsWithNewYear, yearProbeUrl } from './library-plan.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function probeAll(indicators, readYears, fetchJson) {
  const probe = {};
  for (const ind of indicators) {
    const years = await readYears(ind.id);
    // Brak pliku wartości = trzeba pobrać w całości.
    probe[ind.id] = !years?.length || hasNewYear(await fetchJson(yearProbeUrl(ind.bdlVarId, years)));
  }
  return probe;
}

async function main() {
  const clientId = process.env.BDL_CLIENT_ID;
  if (!clientId) {
    console.error('Brak BDL_CLIENT_ID.');
    process.exit(1);
  }
  const indicators = JSON.parse(await readFile(path.join(root, 'config/indicators.json'), 'utf8'));
  const readYears = async (id) => {
    try {
      return JSON.parse(await readFile(path.join(root, `public/data/values/${id}.json`), 'utf8')).years;
    } catch {
      return null;
    }
  };
  const probe = await probeAll(indicators, readYears, (url) => fetchWithRetry(url, clientId));
  console.log(idsWithNewYear(probe).join(','));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
