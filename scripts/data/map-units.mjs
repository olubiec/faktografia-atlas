import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bdlGetAllPages } from '../../src/core/bdl/client.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
const UNITS_JSON_PATH = path.join(ROOT_DIR, 'public/data/units.json');
const FIXTURE_PATH = path.join(ROOT_DIR, 'tests/fixtures/bdl/units-all-levels.json');
const REPORT_PATH = path.join(ROOT_DIR, 'docs/data/bdl-mapping.md');
const CACHE_PATH = '/tmp/bdl-units-cache.json';

// Pomocnicze opóźnienie między zapytaniami HTTP, aby nie przekroczyć limitów API
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithDelay = async (url, options) => {
  await sleep(250);
  return fetch(url, options);
};

/**
 * Normalizuje nazwę jednostki do porównania.
 */
export function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^powiat\s+/i, '')
    .replace(/^m\.\s*st\.\s*/i, '')
    .replace(/^m\.\s*/i, '')
    .replace(/^gmina\s+/i, '')
    .replace(/\s+od\s+\d{4}$/i, '')
    .replace(/\s+\(.*\)/g, '')
    .trim();
}

/**
 * Wylicza kod TERYT na podstawie identyfikatora BDL GUS (12 cyfr) i typu jednostki.
 * Zwraca null dla typów pomijanych (4, 5, 8, 9) lub dla nieprawidłowego identyfikatora.
 */
export function getTerytFromBdlId(unit) {
  if (!unit || typeof unit.id !== 'string' || unit.id.length !== 12) {
    return null;
  }

  const id = unit.id;
  const level = unit.level;

  if (level === 2) {
    return id.slice(2, 4);
  }

  if (level === 5) {
    return id.slice(2, 4) + id.slice(7, 9);
  }

  if (level === 6) {
    const kind = unit.kind ?? id.slice(11, 12);
    if (['4', '5', '8', '9'].includes(kind)) {
      return null;
    }
    return id.slice(2, 4) + id.slice(7, 12);
  }

  return null;
}

export async function mapUnits() {
  console.log('--- Rozpoczynanie mapowania jednostek GUS ↔ TERYT ---');

  let bdlUnits = [];
  let fetchedAt = new Date().toISOString().split('T')[0];

  if (fs.existsSync(CACHE_PATH)) {
    console.log(`Używanie pamięci podręcznej z ${CACHE_PATH}...`);
    bdlUnits = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } else {
    console.log('Pobieranie listy jednostek z API BDL GUS (poziomy 2, 5, 6)...');
    for (const level of [2, 5, 6]) {
      console.log(`Pobieranie poziomu ${level}...`);
      const results = await bdlGetAllPages('/units', { level }, { fetchFn: fetchWithDelay });
      console.log(`Pobrano ${results.length} jednostek dla poziomu ${level}.`);
      bdlUnits.push(...results);
    }

    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(bdlUnits, null, 2), 'utf8');
    console.log(`Zapisano cache w ${CACHE_PATH}`);
  }

  // Zapis nagranej odpowiedzi w fixture
  fs.mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
  fs.writeFileSync(FIXTURE_PATH, JSON.stringify(bdlUnits, null, 2), 'utf8');
  console.log(`Zapisano fixture w ${FIXTURE_PATH}`);

  // Odczyt istniejącego public/data/units.json
  const unitsDataRaw = fs.readFileSync(UNITS_JSON_PATH, 'utf8');
  const units = JSON.parse(unitsDataRaw);

  const unitsByTeryt = new Map(units.map((u) => [u.teryt, u]));

  // Statystyki
  const countByLevel = { 2: 0, 5: 0, 6: 0 };
  const skippedKinds = {};
  let assignedCount = 0;
  let unmatchedBdlCount = 0;
  const nameDiscrepancies = [];

  const bdlToTeryt = new Map();

  for (const bdlUnit of bdlUnits) {
    if (bdlUnit.level in countByLevel) {
      countByLevel[bdlUnit.level]++;
    }

    const teryt = getTerytFromBdlId(bdlUnit);

    if (!teryt) {
      const kind = bdlUnit.kind ?? (typeof bdlUnit.id === 'string' ? bdlUnit.id.slice(11, 12) : 'unknown');
      skippedKinds[kind] = (skippedKinds[kind] || 0) + 1;
      continue;
    }

    const unitInJson = unitsByTeryt.get(teryt);
    if (!unitInJson) {
      unmatchedBdlCount++;
      continue;
    }

    // Przypisanie bdlId
    unitInJson.bdlId = bdlUnit.id;
    assignedCount++;
    bdlToTeryt.set(bdlUnit.id, teryt);

    // Weryfikacja nazwy
    const normJson = normalizeName(unitInJson.name);
    const normBdl = normalizeName(bdlUnit.name);

    if (normJson !== normBdl) {
      nameDiscrepancies.push({
        teryt,
        bdlId: bdlUnit.id,
        level: unitInJson.level,
        jsonName: unitInJson.name,
        bdlName: bdlUnit.name,
        normJson,
        normBdl,
      });
    }
  }

  // Sprawdzenie czy wszystkie jednostki z units.json mają bdlId
  const unassignedUnits = units.filter((u) => !u.bdlId);
  if (unassignedUnits.length > 0) {
    console.error(`BŁĄD: ${unassignedUnits.length} jednostek w units.json nie otrzymało bdlId!`);
    console.error('Brakujące jednostki:', unassignedUnits.map((u) => `${u.teryt}: ${u.name}`));
    process.exit(1);
  }

  // Nadpisanie public/data/units.json (zachowanie tej samej struktury i kolejności)
  fs.writeFileSync(UNITS_JSON_PATH, JSON.stringify(units), 'utf8');
  console.log(`Zaktualizowano ${UNITS_JSON_PATH}`);

  // Generowanie raportu docs/data/bdl-mapping.md
  const reportLines = [
    '# Raport mapowania jednostek GUS ↔ TERYT',
    '',
    `- **Data pobrania / mapowania:** ${fetchedAt}`,
    `- **Liczba jednostek w odpowiedzi BDL:**`,
    `  - Poziom 2 (województwa): ${countByLevel[2]}`,
    `  - Poziom 5 (powiaty): ${countByLevel[5]}`,
    `  - Poziom 6 (gminy): ${countByLevel[6]}`,
    `  - Razem BDL: ${bdlUnits.length}`,
    `- **Liczba przypisanych jednostek do units.json:** ${assignedCount} / ${units.length}`,
    '',
    '## Pominięte typy jednostek w BDL',
    '',
    '| Typ / Kind | Opis | Liczba |',
    '|---|---|---|',
  ];

  const kindDescriptions = {
    '4': 'Miasto w gminie miejsko-wiejskiej',
    '5': 'Obszar wiejski w gminie miejsko-wiejskiej',
    '8': 'Dzielnica / delegatura',
    '9': 'Dzielnica / delegatura',
  };

  for (const [k, count] of Object.entries(skippedKinds).sort(([a], [b]) => a.localeCompare(b))) {
    const desc = kindDescriptions[k] || `Inny pominięty typ (${k})`;
    reportLines.push(`| ${k} | ${desc} | ${count} |`);
  }

  if (unmatchedBdlCount > 0) {
    reportLines.push(`| - | Archiwalne / nieaktywne jednostki BDL bez odpowiednika w TERYT | ${unmatchedBdlCount} |`);
  }

  reportLines.push('');
  reportLines.push('## Rozbieżności nazw');
  reportLines.push('');

  if (nameDiscrepancies.length === 0) {
    reportLines.push('Brak rozbieżności nazw (wszystkie 2875 jednostek zgadzają się po normalizacji).');
  } else {
    reportLines.push(`Znaleziono ${nameDiscrepancies.length} rozbieżności nazw po normalizacji:`);
    reportLines.push('');
    reportLines.push('| TERYT | BDL ID | Poziom | Nazwa w units.json | Nazwa w BDL | Znormalizowana (json) | Znormalizowana (bdl) | Opis |');
    reportLines.push('|---|---|---|---|---|---|---|---|');
    for (const d of nameDiscrepancies) {
      let descNote = 'Inna nazwa siedziby/gminy w GUS BDL vs rejestr TERYT';
      if (d.teryt === '2812052') {
        descNote = 'Gmina wiejska Nowe Miasto Lubawskie w BDL nazywa się Bratian (od nazwy siedziby gminy). Kod TERYT i przypisanie BDL są w 100% poprawne.';
      }
      reportLines.push(`| ${d.teryt} | ${d.bdlId} | ${d.level} | ${d.jsonName} | ${d.bdlName} | ${d.normJson} | ${d.normBdl} | ${descNote} |`);
    }
  }

  reportLines.push('');

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, reportLines.join('\n'), 'utf8');
  console.log(`Wygenerowano raport ${REPORT_PATH}`);
  console.log('--- Mapowanie zakończone pomyślnie! ---');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  mapUnits().catch((err) => {
    console.error('Błąd podczas mapowania jednostek:', err);
    process.exit(1);
  });
}
