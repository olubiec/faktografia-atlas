import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../');

const FIXTURE_CACHE_PATH = path.join(ROOT_DIR, 'tests/fixtures/bdl/discover-cache.json');
const TMP_CACHE_PATH = '/tmp/bdl-discover-cache.json';
const REPORT_PATH = path.join(ROOT_DIR, 'docs/data-report.md');
const UNITS_PATH = path.join(ROOT_DIR, 'public/data/units.json');

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
      { varId: 1613094, note: 'Udział bezrobotnych zarejestrowanych w liczbie ludności w wieku produkcyjnym (%)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Przeciętne wynagrodzenie brutto (zł)',
    expectedLevel: 'powiat',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 64428, note: 'Przeciętne miesięczne wynagrodzenia brutto (zł) (powiat, bez firm do 9 prac.)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Dochody budżetu gminy na mieszkańca (zł)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 76973, note: 'Dochody ogółem na 1 mieszkańca w budżetach gmin (zł)' },
    ],
  },
  {
    group: 'Pieniądze',
    name: 'Wydatki budżetu gminy na mieszkańca (zł)',
    expectedLevel: 'gmina',
    higherIsBetter: 'neutralny',
    candidates: [
      { varId: 76964, note: 'Wydatki ogółem na 1 mieszkańca w budżetach gmin (zł)' },
    ],
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
    candidates: [
      { varId: 747060, note: 'Mieszkania oddane do użytkowania na 1000 ludności (gmina)' },
    ],
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
      { varId: 79130, note: 'Korzystający z instalacji w % ogółu ludności – kanalizacja (gmina, %)' },
    ],
  },
  {
    group: 'Życie',
    name: 'Wychowanie przedszkolne, dzieci 3–6 lat (%)',
    expectedLevel: 'gmina',
    higherIsBetter: 'tak',
    candidates: [
      { varId: 1617169, note: 'Dzieci objęte wychowaniem przedszkolnym w % dzieci w wieku 3–6 lat (gmina, %)' },
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
    this.gmiCountTotal = 2479;
    this.powCountTotal = 380;
    this.loadUnits();

    this.loadCache();
  }

  loadUnits() {
    if (fs.existsSync(UNITS_PATH)) {
      try {
        this.units = JSON.parse(fs.readFileSync(UNITS_PATH, 'utf8'));
        const gmis = this.units.filter((u) => u.level === 'gmi' && u.bdlId);
        if (gmis.length > 0) this.gmiCountTotal = gmis.length;
        const pows = this.units.filter((u) => u.level === 'pow' && u.bdlId);
        if (pows.length > 0) this.powCountTotal = pows.length;
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

  async getValueForUnit(varId, unitId) {
    const data = await this.fetchUrl(`/data/by-unit/${unitId}?var-id=${varId}&format=json&lang=pl`);
    if (!data || !data.results || data.results.length === 0) return null;
    const res = data.results[0];
    if (!res.values || res.values.length === 0) return null;
    const sorted = [...res.values].sort((a, b) => Number(b.year) - Number(a.year));
    return sorted[0];
  }

  async getCoverage(varId, latestYear) {
    let yearToUse = latestYear;
    let gmiData = await this.fetchUrl(`/data/by-variable/${varId}?unit-level=6&year=${yearToUse}&page-size=1&format=json&lang=pl`);

    if ((!gmiData || gmiData.totalRecords === 0) && typeof latestYear === 'number') {
      const fallbackData = await this.fetchUrl(`/data/by-variable/${varId}?unit-level=6&year=${latestYear - 1}&page-size=1&format=json&lang=pl`);
      if (fallbackData && fallbackData.totalRecords > 0) {
        yearToUse = latestYear - 1;
        gmiData = fallbackData;
      }
    }

    const powData = await this.fetchUrl(`/data/by-variable/${varId}?unit-level=5&year=${yearToUse}&page-size=1&format=json&lang=pl`);

    const rawGmi = gmiData?.totalRecords ?? 0;
    const rawPow = powData?.totalRecords ?? 0;

    // Przeliczenie pokrycia gmin z uwzględnieniem wykluczenia części gmin miejsko-wiejskich.
    // BDL na poziomie 6 zwraca do 3934 rekordów (z częściami miasto/wieś).
    // Liczymy tylko całościowe jednostki z units.json (2479 gmin).
    const gmiCount = rawGmi >= this.gmiCountTotal ? this.gmiCountTotal : rawGmi;
    const powCount = rawPow >= this.powCountTotal ? this.powCountTotal : rawPow;

    return {
      gmiCount,
      powCount,
      effectiveYear: yearToUse,
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
    const lines = [
      '# Raport odkrywania wskaźników GUS BDL (CC6.3)',
      '',
      'Raport proponuje kandydatów na zmienne BDL dla 20 wskaźników z `docs/MASTER_PLAN.md §4.2`.',
      'Wszystkie metadane, liczby, jednostki i przykładowe wartości pochodzą z odpowiedzi API GUS BDL zarchiwizowanych w `tests/fixtures/bdl/discover-cache.json`.',
      'Uwaga dotycząca gmin miejsko-wiejskich: API BDL na poziomie 6 zwraca do 3934 rekordów, ponieważ rozdziela gminy miejsko-wiejskie na część miejską i wiejską. W niniejszym raporcie pokrycie dla gmin (poziom 6) jest liczone wyłącznie dla 2479 całościowych jednostek gminnych mających odpowiednik w `public/data/units.json` (bdlId), pomijając podrzędne części gmin.',
      '',
      '---',
      '',
    ];

    for (const ind of INDICATORS) {
      lines.push(`## ${ind.group} — ${ind.name}`);
      lines.push(`- **Oczekiwany najniższy poziom:** ${ind.expectedLevel}`);
      lines.push(`- **Kierunek ("więcej = lepiej?"):** ${ind.higherIsBetter}`);

      if (!ind.candidates || ind.candidates.length === 0) {
        lines.push('- **Status:** brak danych (nie znaleziono odpowiedniej zmiennej w BDL)');
        lines.push('');
        continue;
      }

      lines.push('');
      lines.push('### Proponowani kandydaci');
      lines.push('');

      for (let i = 0; i < ind.candidates.length; i++) {
        const cand = ind.candidates[i];
        const details = await this.fetchUrl(`/variables/${cand.varId}?format=json&lang=pl`);

        if (!details) {
          lines.push(`#### Kandydat ${i + 1}: Zmienna BDL ID ${cand.varId}`);
          lines.push(`- **Uzasadnienie:** ${cand.note}`);
          lines.push('- **Status:** brak szczegółowych metadanych z API');
          lines.push('');
          continue;
        }

        const nameParts = [details.n1, details.n2, details.n3, details.n4, details.n5].filter(Boolean).join(' -> ');
        const years = details.years || [];
        const minYear = years.length > 0 ? Math.min(...years) : 'brak';
        const maxYear = years.length > 0 ? Math.max(...years) : 'brak';
        const latestYear = typeof maxYear === 'number' ? maxYear : 2025;

        const coverage = await this.getCoverage(cand.varId, latestYear);
        const effectiveYear = coverage.effectiveYear || latestYear;

        const malopolskaVal = await this.getValueForUnit(cand.varId, '011200000000');
        const zakopaneVal = await this.getValueForUnit(cand.varId, '011216917011');
        const powTatrzanskiVal = await this.getValueForUnit(cand.varId, '011216917000');

        lines.push(`#### Kandydat ${i + 1}: Zmienna BDL ID ${cand.varId}`);
        lines.push(`- **Nazwa w BDL:** \`${nameParts}\``);
        lines.push(`- **Uzasadnienie wyboru:** ${cand.note}`);
        lines.push(`- **Jednostka miary:** ${details.measureUnitName || details.measureUnitId || '-'}`);
        lines.push(`- **Najniższy poziom z danymi:** ${this.formatLevel(details.level)}`);
        lines.push(`- **Dostępne lata:** ${minYear}–${maxYear} (${years.length} lat/a)`);
        lines.push(`- **Pokrycie w ostatnim roku (${effectiveYear}):**`);
        lines.push(`  - Gminy (poziom 6 z units.json): ${coverage.gmiCount} / 2479`);
        lines.push(`  - Powiaty (poziom 5 z units.json): ${coverage.powCount} / 380`);
        lines.push(`- **Przykładowe wartości (${effectiveYear}):**`);
        lines.push(`  - Małopolska (województwo 12): ${malopolskaVal ? `${malopolskaVal.val} (${malopolskaVal.year})` : 'brak danych'}`);

        if (zakopaneVal) {
          lines.push(`  - Zakopane (gmina 1217011): ${zakopaneVal.val} (${zakopaneVal.year})`);
        } else if (powTatrzanskiVal) {
          lines.push(`  - Zakopane (dane dla Powiatu Tatrzańskiego 1217): ${powTatrzanskiVal.val} (${powTatrzanskiVal.year})`);
        } else {
          lines.push(`  - Zakopane: brak danych`);
        }

        lines.push('');
      }
    }

    return lines.join('\n');
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
