import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countCoverage } from './coverage.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

const FIXTURE_CACHE_PATH = path.join(ROOT_DIR, 'tests/fixtures/bdl/discover-cache.json');
const TMP_CACHE_PATH = '/tmp/bdl-discover-cache.json';
const REPORT_PATH = path.join(ROOT_DIR, 'docs/data-report.md');
const UNITS_PATH = path.join(ROOT_DIR, 'public/data/units.json');
const RECORDED_DIR = path.join(ROOT_DIR, 'tests/fixtures/bdl/recorded');

const BASE_URL = 'https://bdl.stat.gov.pl/api/v1';
const MAX_REQUESTS = 150;
const DELAY_MS = 200;

export const INDICATORS = [
  {
    group: 'Ludność',
    name: 'Ludność ogółem',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 72305, note: 'Ludność ogółem na koniec roku (stan w dniu 31 XII)' },
    ],
  },
  {
    group: 'Ludność',
    name: 'Gęstość zaludnienia (os./km²)',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 60559, note: 'Gęstość zaludnienia - ludność na 1 km²' },
    ],
  },
  {
    group: 'Ludność',
    name: 'Przyrost naturalny na 1000 ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 450551, note: 'Przyrost naturalny na 1000 ludności (poziom gminy)' },
      { varId: 1616456, note: 'Przyrost naturalny na 1000 ludności (poziom powiatu)' },
    ],
  },
  {
    group: 'Ludność',
    name: 'Saldo migracji na 1000 ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 453193, note: 'Saldo migracji na 1000 ludności -> ogółem (poziom gminy)' },
      { varId: 1365234, note: 'Saldo migracji ogółem (liczba bezwzględna)' },
    ],
  },
  {
    group: 'Ludność',
    name: 'Udział ludności 65+ (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 634989, note: 'Odsetek osób w wieku 65 lat i więcej w populacji ogółem (%)' },
      { varId: 155, note: 'Ludność w wieku poprodukcyjnym (ogółem)' },
    ],
  },
  {
    group: 'Ludność',
    name: 'Mediana wieku',
    expectedLevel: 'gmina (jeśli brak: powiat)',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 1650633, note: 'Mediana wieku ludności -> ogółem (lata)' },
    ],
  },
  {
    group: 'Praca',
    name: 'Stopa bezrobocia rejestrowanego (%)',
    expectedLevel: 'powiat',
    higherIsBetter: 'nie',
    candidates: [
      { varId: 461691, note: 'Stopa bezrobocia rejestrowanego - grudzień (%)' },
      { varId: 461685, note: 'Stopa bezrobocia rejestrowanego - czerwiec (%)' },
    ],
  },
  {
    group: 'Praca',
    name: 'Udział bezrobotnych w ludności w wieku produkcyjnym (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'nie',
    candidates: [
      { varId: 217828, note: 'Bezrobotni zarejestrowani (dane na poziomie powiatu)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Przeciętne wynagrodzenie brutto (zł)',
    expectedLevel: 'powiat',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 58787, note: 'Miesięczne wynagrodzenie brutto na 1 zatrudnionego (podregion, bez firm do 9 prac.)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Dochody budżetu gminy na mieszkańca (zł)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 1621732, note: 'Dochody budżetów gmin w mln zł (poziom podregionu)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Wydatki budżetu gminy na mieszkańca (zł)',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [], // brak danych
  },
  {
    group: 'Pieniądze',
    name: 'Podmioty REGON na 10 tys. ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 60530, note: 'Podmioty wpisane do rejestru REGON na 10 tys. ludności' },
    ],
  },
  {
    group: 'Mieszkania',
    name: 'Mieszkania oddane do użytku na 1000 ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [], // brak danych (brak wskaźnika per 1000 mieszkańców na poziomie gminy)
  },
  {
    group: 'Mieszkania',
    name: 'Przeciętna pow. użytkowa mieszkania na osobę (m²)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 60573, note: 'Przeciętna powierzchnia użytkowa mieszkania na 1 osobę (m²)' },
    ],
  },
  {
    group: 'Środowisko',
    name: 'Lesistość (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 194828, note: 'Lesistość w %' },
    ],
  },
  {
    group: 'Środowisko',
    name: 'Ludność korzystająca z kanalizacji (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 9153, note: 'Ludność korzystająca z sieci kanalizacyjnej (ogółem)' },
      { varId: 496, note: 'Ludność korzystająca z sieci kanalizacyjnej w miastach' },
    ],
  },
  {
    group: 'Życie',
    name: 'Wychowanie przedszkolne, dzieci 3–6 lat (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 458614, note: 'Dzieci w placówkach wychowania przedszkolnego na 1 tys. dzieci w wieku 3-5 lat' },
    ],
  },
  {
    group: 'Życie',
    name: 'Czytelnicy bibliotek publicznych na 1000 ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 60191, note: 'Czytelnicy bibliotek publicznych na 1000 ludności' },
      { varId: 1234, note: 'Czytelnicy w ciągu roku (ogółem)' },
    ],
  },
  {
    group: 'Życie',
    name: 'Noclegi udzielone turystom na 1000 ludności',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 60298, note: 'Udzielone noclegi na 1000 ludności (poziom powiatu)' },
      { varId: 40921, note: 'Udzielone noclegi ogółem styczeń-grudzień (poziom miejscowości / gminy)' },
    ],
  },
  {
    group: 'Transport',
    name: 'Samochody osobowe na 1000 ludności',
    expectedLevel: 'powiat',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 60533, note: 'Samochody osobowe na 1000 ludności (poziom powiatu)' },
    ],
  },
];

export class BdlDiscoverer {
  constructor(options = {}) {
    this.offline = options.offline ?? process.argv.includes('--offline') ?? Boolean(process.env.DISCOVER_OFFLINE);
    this.cache = {};
    this.requestCount = 0;
    this.rateLimited = false;

    this.units = [];
    this.loadUnits();
    this.loadCache();
  }

  loadUnits() {
    if (fs.existsSync(UNITS_PATH)) {
      try {
        this.units = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
      } catch {
        this.units = [];
      }
    }
  }

  loadCache() {
    if (fs.existsSync(TMP_CACHE_PATH)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(TMP_CACHE_PATH, 'utf8'));
      } catch {
        this.cache = {};
      }
    } else if (fs.existsSync(FIXTURE_CACHE_PATH)) {
      try {
        this.cache = JSON.parse(fs.readFileSync(FIXTURE_CACHE_PATH, 'utf8'));
      } catch {
        this.cache = {};
      }
    }
  }

  saveCache() {
    if (this.offline) return;
    try {
      fs.mkdirSync(path.dirname(TMP_CACHE_PATH), { recursive: true });
      fs.writeFileSync(TMP_CACHE_PATH, JSON.stringify(this.cache, null, 2), 'utf8');

      fs.mkdirSync(path.dirname(FIXTURE_CACHE_PATH), { recursive: true });
      fs.writeFileSync(FIXTURE_CACHE_PATH, JSON.stringify(this.cache, null, 2), 'utf8');
    } catch (err) {
      console.warn('Nie udało się zapisać cache:', err.message);
    }
  }

  async fetchUrl(pathAndQuery) {
    const url = pathAndQuery.startsWith('http') ? pathAndQuery : `${BASE_URL}${pathAndQuery}`;

    if (this.cache[url] && !this.cache[url].errorResult) {
      return this.cache[url];
    }

    if (this.offline || this.rateLimited || this.requestCount >= MAX_REQUESTS) {
      return this.cache[url] || null;
    }

    const headers = { Accept: 'application/json' };
    const clientId = process.env.BDL_CLIENT_ID;
    if (clientId && clientId.trim() !== '') {
      headers['X-ClientId'] = clientId.trim();
    }

    await new Promise((r) => setTimeout(r, DELAY_MS));
    this.requestCount++;

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        if (res.status === 429) {
          console.warn('API BDL zwróciło HTTP 429 (przekroczony limit zapytań). Zatrzymywanie zapytań sieciowych.');
          this.rateLimited = true;
        }
        return this.cache[url] || null;
      }

      const data = await res.json();
      if (data.errorResult) {
        if (data.errorResult.includes('limit')) {
          this.rateLimited = true;
        }
        return this.cache[url] || null;
      }

      this.cache[url] = data;
      this.saveCache();
      return data;
    } catch (err) {
      console.warn(`Błąd połączenia z API BDL (${url}):`, err.message);
      return this.cache[url] || null;
    }
  }

  getRecordedRecords(varId, levelNum) {
    const prefix = `${varId}-l${levelNum}-p`;
    if (!fs.existsSync(RECORDED_DIR)) return [];
    const files = fs
      .readdirSync(RECORDED_DIR)
      .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
      .sort();

    const records = [];
    for (const f of files) {
      try {
        const page = JSON.parse(fs.readFileSync(path.join(RECORDED_DIR, f), 'utf8'));
        if (Array.isArray(page.results)) {
          records.push(...page.results);
        }
      } catch {
        // Ignoruj błędy odczytu pojedynczych plików
      }
    }
    return records;
  }

  getLatestRecordedYear(records) {
    let latestYear = null;
    for (const r of records) {
      for (const val of r.values || []) {
        if (val.val !== null && val.val !== undefined && !Number.isNaN(val.val)) {
          if (latestYear === null || Number(val.year) > Number(latestYear)) {
            latestYear = val.year;
          }
        }
      }
    }
    return latestYear;
  }

  async getValueForUnit(varId, unitId) {
    const recorded6 = this.getRecordedRecords(varId, 6);
    const recorded5 = this.getRecordedRecords(varId, 5);
    const allRecorded = [...recorded6, ...recorded5];
    const match = allRecorded.find((r) => r.id === unitId);
    if (match && match.values && match.values.length > 0) {
      const validValues = match.values.filter((v) => v.val !== null && v.val !== undefined && !Number.isNaN(v.val));
      if (validValues.length > 0) {
        const sorted = [...validValues].sort((a, b) => Number(b.year) - Number(a.year));
        return sorted[0];
      }
    }

    const data = await this.fetchUrl(`/data/by-unit/${unitId}?var-id=${varId}&format=json&lang=pl`);
    if (!data || !data.results || data.results.length === 0) return null;
    const res = data.results[0];
    if (!res.values || res.values.length === 0) return null;
    const sorted = [...res.values].sort((a, b) => Number(b.year) - Number(a.year));
    return sorted[0];
  }

  async getCoverage(varId, latestYear) {
    const recordedGmi = this.getRecordedRecords(varId, 6);
    const recordedPow = this.getRecordedRecords(varId, 5);

    if (recordedGmi.length > 0 || recordedPow.length > 0) {
      const gmiCount = countCoverage(recordedGmi, this.units, 'gmi', latestYear);
      const powCount = countCoverage(recordedPow, this.units, 'pow', latestYear);
      return { gmiCount, powCount };
    }

    const gmiData = await this.fetchUrl(`/data/by-variable/${varId}?unit-level=6&year=${latestYear}&page-size=1&format=json&lang=pl`);
    const powData = await this.fetchUrl(`/data/by-variable/${varId}?unit-level=5&year=${latestYear}&page-size=1&format=json&lang=pl`);
    return {
      gmiCount: gmiData?.totalRecords ?? 0,
      powCount: powData?.totalRecords ?? 0,
    };
  }

  formatLevel(level) {
    if (level === 6) return 'gmina (poziom 6)';
    if (level === 5) return 'powiat (poziom 5)';
    if (level === 3) return 'podregion (poziom 3)';
    if (level === 2) return 'województwo (poziom 2)';
    if (level === 7) return 'miejscowość / gmina (poziom 7)';
    return `poziom ${level}`;
  }

  async generateReport() {
    const totalGmiUnits = this.units.filter((u) => u.level === 'gmi').length || 2479;
    const totalPowUnits = this.units.filter((u) => u.level === 'pow').length || 380;

    const summaryTableRows = [];

    const lines = [
      '# Raport odkrywania wskaźników GUS BDL (CC6.3)',
      '',
      'Raport proponuje kandydatów na zmienne BDL dla 20 wskaźników z `config/indicators.json`.',
      'Wszystkie metadane, liczby, jednostki i przykładowe wartości pochodzą z odpowiedzi API GUS BDL zarchiwizowanych w `tests/fixtures/bdl/discover-cache.json` oraz `tests/fixtures/bdl/recorded/`.',
      '',
      '---',
      '',
      '## Podsumowanie pokrycia wskaźników BDL',
      '',
      '| ID wskaźnika | Var ID | Poziom | Ostatni rok | Liczba gmin z wartością / wszystkich | Liczba powiatów z wartością / wszystkich |',
      '|---|---|---|---|---|---|',
    ];

    const reportBodyLines = [];

    for (const ind of INDICATORS) {
      reportBodyLines.push(`## ${ind.group} — ${ind.name}`);
      reportBodyLines.push(`- **Oczekiwany najniższy poziom:** ${ind.expectedLevel}`);
      reportBodyLines.push(`- **Kierunek ("więcej = lepiej?"):** ${ind.higherIsBetter}`);

      if (!ind.candidates || ind.candidates.length === 0) {
        reportBodyLines.push('- **Status:** brak danych (nie znaleziono odpowiedniej zmiennej w BDL)');
        reportBodyLines.push('');
        summaryTableRows.push(`| ${ind.name} | brak | ${ind.expectedLevel} | brak | 0 / ${totalGmiUnits} | 0 / ${totalPowUnits} |`);
        continue;
      }

      reportBodyLines.push('');
      reportBodyLines.push('### Proponowani kandydaci');
      reportBodyLines.push('');

      for (let i = 0; i < ind.candidates.length; i++) {
        const cand = ind.candidates[i];
        let details = null;

        const metaFile = path.join(RECORDED_DIR, `${cand.varId}-variable.json`);
        if (fs.existsSync(metaFile)) {
          try {
            details = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
          } catch {
            details = null;
          }
        }

        if (!details) {
          details = await this.fetchUrl(`/variables/${cand.varId}?format=json&lang=pl`);
        }

        if (!details) {
          reportBodyLines.push(`#### Kandydat ${i + 1}: Zmienna BDL ID ${cand.varId}`);
          reportBodyLines.push(`- **Uzasadnienie:** ${cand.note}`);
          reportBodyLines.push('- **Status:** brak szczegółowych metadanych z API');
          reportBodyLines.push('');
          if (i === 0) {
            summaryTableRows.push(`| ${ind.name} | ${cand.varId} | ${ind.expectedLevel} | brak | 0 / ${totalGmiUnits} | 0 / ${totalPowUnits} |`);
          }
          continue;
        }

        const nameParts = [details.n1, details.n2, details.n3, details.n4, details.n5].filter(Boolean).join(' -> ');
        const years = details.years || [];
        const minYear = years.length > 0 ? Math.min(...years) : 'brak';

        const rec6 = this.getRecordedRecords(cand.varId, 6);
        const rec5 = this.getRecordedRecords(cand.varId, 5);
        let latestYear = this.getLatestRecordedYear(rec6) || this.getLatestRecordedYear(rec5);

        if (!latestYear) {
          const maxYear = years.length > 0 ? Math.max(...years) : 'brak';
          latestYear = typeof maxYear === 'number' ? maxYear : 2023;
        }

        const coverage = await this.getCoverage(cand.varId, latestYear);
        const malopolskaVal = await this.getValueForUnit(cand.varId, '011200000000');
        const zakopaneVal = await this.getValueForUnit(cand.varId, '011216917011');
        const powTatrzanskiVal = await this.getValueForUnit(cand.varId, '011216917000');

        reportBodyLines.push(`#### Kandydat ${i + 1}: Zmienna BDL ID ${cand.varId}`);
        reportBodyLines.push(`- **Nazwa w BDL:** \`${nameParts}\``);
        reportBodyLines.push(`- **Uzasadnienie wyboru:** ${cand.note}`);
        reportBodyLines.push(`- **Jednostka miary:** ${details.measureUnitName || details.measureUnitId || '-'}`);
        reportBodyLines.push(`- **Najniższy poziom z danymi:** ${this.formatLevel(details.level)}`);
        reportBodyLines.push(`- **Dostępne lata:** ${minYear}–${latestYear} (${years.length > 0 ? years.length : '-'} lat/a)`);
        reportBodyLines.push(`- **Pokrycie w ostatnim roku (${latestYear}):**`);
        reportBodyLines.push(`  - Gminy (poziom 6): ${coverage.gmiCount} / ${totalGmiUnits} rek.`);
        reportBodyLines.push(`  - Powiaty (poziom 5): ${coverage.powCount} / ${totalPowUnits} rek.`);
        reportBodyLines.push(`- **Przykładowe wartości (${latestYear}):**`);
        reportBodyLines.push(`  - Małopolska (województwo 12): ${malopolskaVal ? `${malopolskaVal.val} (${malopolskaVal.year})` : 'brak danych'}`);

        if (zakopaneVal) {
          reportBodyLines.push(`  - Zakopane (gmina 1217011): ${zakopaneVal.val} (${zakopaneVal.year})`);
        } else if (powTatrzanskiVal) {
          reportBodyLines.push(`  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): ${powTatrzanskiVal.val} (${powTatrzanskiVal.year})`);
        } else {
          reportBodyLines.push(`  - Zakopane: brak danych`);
        }

        reportBodyLines.push('');

        if (i === 0) {
          summaryTableRows.push(
            `| ${ind.name} | ${cand.varId} | ${this.formatLevel(details.level)} | ${latestYear} | ${coverage.gmiCount} / ${totalGmiUnits} | ${coverage.powCount} / ${totalPowUnits} |`
          );
        }
      }
    }

    return [...lines, ...summaryTableRows, '', '---', '', ...reportBodyLines].join('\n');
  }
}

export async function runDiscover() {
  const discoverer = new BdlDiscoverer();
  const report = await discoverer.generateReport();
  fs.writeFileSync(REPORT_PATH, report, 'utf8');
  console.log(`Wygenerowano raport: ${REPORT_PATH}`);
  if (discoverer.rateLimited) {
    console.warn('UWAGA: API BDL zgłosiło limit HTTP 429 podczas wykonywania skryptu. Raport wygenerowano na podstawie dostępnych danych z cache.');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runDiscover().catch((err) => {
    console.error('Błąd wykonania discover.mjs:', err);
    process.exit(1);
  });
}
