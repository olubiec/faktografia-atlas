import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BdlDiscoverer, INDICATORS } from '../../scripts/data/discover.mjs';

const REPORT_PATH = path.resolve('docs/data-report.md');
const FIXTURE_PATH = path.resolve('tests/fixtures/bdl/discover-cache.json');

describe('BdlDiscoverer & docs/data-report.md (CC6.3)', () => {
  it('lista INDICATORS zawiera dokładnie 20 wskaźników z MASTER_PLAN.md §4.2', () => {
    expect(INDICATORS).toHaveLength(20);

    const names = INDICATORS.map((i) => i.name);
    expect(names).toContain('Ludność ogółem');
    expect(names).toContain('Gęstość zaludnienia (os./km²)');
    expect(names).toContain('Przyrost naturalny na 1000 ludności');
    expect(names).toContain('Saldo migracji na 1000 ludności');
    expect(names).toContain('Udział ludności 65+ (%)');
    expect(names).toContain('Mediana wieku');
    expect(names).toContain('Stopa bezrobocia rejestrowanego (%)');
    expect(names).toContain('Udział bezrobotnych w ludności w wieku produkcyjnym (%)');
    expect(names).toContain('Przeciętne wynagrodzenie brutto (zł)');
    expect(names).toContain('Dochody budżetu gminy na mieszkańca (zł)');
    expect(names).toContain('Wydatki budżetu gminy na mieszkańca (zł)');
    expect(names).toContain('Podmioty REGON na 10 tys. ludności');
    expect(names).toContain('Mieszkania oddane do użytku na 1000 ludności');
    expect(names).toContain('Przeciętna pow. użytkowa mieszkania na osobę (m²)');
    expect(names).toContain('Lesistość (%)');
    expect(names).toContain('Ludność korzystająca z kanalizacji (%)');
    expect(names).toContain('Wychowanie przedszkolne, dzieci 3–6 lat (%)');
    expect(names).toContain('Czytelnicy bibliotek publicznych na 1000 ludności');
    expect(names).toContain('Noclegi udzielone turystom na 1000 ludności');
    expect(names).toContain('Samochody osobowe na 1000 ludności');
  });

  it('plik fixture tests/fixtures/bdl/discover-cache.json istnieje i zawiera odpowiedzi z API BDL', () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const content = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf8'));
    expect(Object.keys(content).length).toBeGreaterThan(10);
  });

  it('BdlDiscoverer generuje raport w trybie offline korzystając wyłącznie z fixtury', async () => {
    const discoverer = new BdlDiscoverer({ offline: true });
    const report = await discoverer.generateReport();

    expect(report).toBeTypeOf('string');
    expect(report).toContain('# Raport odkrywania wskaźników GUS BDL (CC6.3)');

    for (const ind of INDICATORS) {
      expect(report, `Brak wpisu dla wskaźnika: ${ind.name}`).toContain(ind.name);
    }
  });

  it('raport zawiera "brak danych" dla wskaźników bez wytypowanych zmiennych', async () => {
    const discoverer = new BdlDiscoverer({ offline: true });
    const report = await discoverer.generateReport();

    // Wskaźnik "Wydatki budżetu gminy na mieszkańca (zł)" oraz "Mieszkania oddane do użytku na 1000 ludności" mają brak kandydatów
    expect(report).toContain('## Pieniądze — Wydatki budżetu gminy na mieszkańca (zł)');
    expect(report).toContain('## Mieszkania — Mieszkania oddane do użytku na 1000 ludności');
    expect(report).toContain('brak danych (nie znaleziono odpowiedniej zmiennej w BDL)');
  });

  it('liczby w raporcie zgadzają się z wartościami w fixturze API dla znanych zmiennych (np. Gęstość zaludnienia ID 60559)', async () => {
    const discoverer = new BdlDiscoverer({ offline: true });
    const report = await discoverer.generateReport();

    // DLA ID 60559 Zakopane (1217011) ma wartość gęstości zaludnienia z BDL
    expect(report).toContain('Zmienna BDL ID 60559');
    expect(report).toContain('295.8'); // Wartość dla Zakopanego z BDL 2025
    expect(report).toContain('225.9'); // Wartość dla Małopolski z BDL 2025
  });

  it('istniejący plik docs/data-report.md jest kompletny i ma wpisy dla wszystkich 20 wskaźników', () => {
    expect(fs.existsSync(REPORT_PATH)).toBe(true);
    const content = fs.readFileSync(REPORT_PATH, 'utf8');

    for (const ind of INDICATORS) {
      expect(content, `Brak sekcji w docs/data-report.md dla ${ind.name}`).toContain(ind.name);
    }
  });
});
