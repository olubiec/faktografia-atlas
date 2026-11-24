import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dropReason, isPopular, popularOnly } from '@/core/catalog/curation';
import type { AvailableFile, AvailableVariable } from '@/core/indicators/registry';

const RECENT = [2020, 2021, 2022, 2023, 2024];
const v = (id: string, n: string, c: string, u = 'osoba', y = RECENT): AvailableVariable =>
  ({ id, n, u, s: 'X', c, lv: ['pow', 'gmi'], y }) as AvailableVariable;

describe('wybór popularnych danych z biblioteki GUS', () => {
  it('odrzuca niszowe warianty szkół ze zgłoszenia właściciela', () => {
    const niche = [
      v('9001', 'licea ogólnokształcące ponadpodstawowe dla młodzieży bez specjalnych – pomieszczenia szkolne – prowadzone przez organizacje wyznaniowe', 'SZKOLNICTWO > SZKOLNICTWO OGÓLNOKSZTAŁCĄCE > Licea'),
      v('9002', 'oddziały – prowadzone przez jednostki administracji rządowej (centralnej)', 'SZKOLNICTWO > SZKOLNICTWO OGÓLNOKSZTAŁCĄCE > Licea'),
      v('9003', 'nauczyciele niepełnozatrudnieni – prowadzone przez jednostki administracji rządowej (centralnej)', 'SZKOLNICTWO > SZKOLNICTWO GIMNAZJALNE > Gimnazja dla dorosłych'),
      v('9004', 'sale lekcyjne – prowadzone przez samorząd powiatowy', 'SZKOLNICTWO > SZKOLNICTWO OGÓLNOKSZTAŁCĄCE > Licea'),
    ];
    expect(niche.filter(isPopular).map((x) => x.n)).toEqual([]);
  });

  it('odrzuca całe niszowe działy i grupy (spis rolny 1996, radni, nakłady inwestycyjne)', () => {
    expect(dropReason(v('9010', 'gospodarstwa ogółem', 'POWSZECHNE SPISY ROLNE > PSR 1996 - INDYWIDUALNE GOSPODARSTWA ROLNE > X'))).toBe('dział niszowy');
    expect(dropReason(v('9011', 'kobiety', 'SAMORZĄD TERYTORIALNY > ORGANY GMINY > Radni gminy wg płci'))).toBe('dział niszowy');
    expect(dropReason(v('9012', 'ogółem', 'STAN I OCHRONA ŚRODOWISKA > EMISJA ZANIECZYSZCZEŃ POWIETRZA Z ZAKŁADÓW SZCZEGÓLNIE UCIĄŻLIWYCH > X'))).toBe('grupa niszowa');
  });

  it('odrzuca dane, które skończyły się dawno temu, i jednostki techniczne', () => {
    expect(dropReason(v('9020', 'mieszkania na 1000 mieszkańców', 'GOSPODARKA MIESZKANIOWA > ZASOBY > X', '-', [2000, 2008]))).toBe('stare dane');
    expect(dropReason(v('9021', 'pobór wody ogółem', 'STAN I OCHRONA ŚRODOWISKA > ODPADY KOMUNALNE > X', 'dam3'))).toBe('jednostka techniczna');
  });

  it('odrzuca rozbicie na płeć, gdy jest wersja ogółem', () => {
    expect(isPopular(v('9030', 'przyrost naturalny – mężczyźni', 'LUDNOŚĆ > URODZENIA I ZGONY > Ruch naturalny'))).toBe(false);
  });

  it('zostawia proste wskaźniki i odpowiedniki wbudowanych (nawet z „wg płci” w nazwie)', () => {
    expect(isPopular(v('9040', 'wypadki drogowe na 1000 ludności', 'TRANSPORT I ŁĄCZNOŚĆ > WYPADKI DROGOWE > Wypadki', 'na 1000 ludności'))).toBe(true);
    expect(isPopular(v('9041', 'saldo migracji wewnętrznych na 1000 ludności', 'LUDNOŚĆ > MIGRACJE WEWNĘTRZNE I ZAGRANICZNE > X'))).toBe(true);
    expect(isPopular(v('60559', 'ludność wg płci', 'LUDNOŚĆ > STAN LUDNOŚCI > X', 'osoba', [2000]))).toBe(true);
  });

  it('wskaźniki z mylącą nazwą z przeglądu znikają (b404 = mieszkania zwrócone właścicielom)', () => {
    expect(dropReason(v('404', 'mieszkania', 'GOSPODARKA MIESZKANIOWA I KOMUNALNA > ZASOBY MIESZKANIOWE > X'))).toBe('odrzucony po przeglądzie');
  });

  it('popularOnly: null zostaje null, ten sam plik daje ten sam wynik', () => {
    expect(popularOnly(null)).toBeNull();
    const file = { version: 1, variables: [v('9040', 'wypadki drogowe na 1000 ludności', 'TRANSPORT > WYPADKI > X'), v('9010', 'x', 'POWSZECHNE SPISY ROLNE > A > B')] } as unknown as AvailableFile;
    const out = popularOnly(file);
    expect(out?.variables.map((x) => x.id)).toEqual(['9040']);
    expect(popularOnly(file)).toBe(out);
  });

  it('nagrany spis testowy przechodzi w całości (testy e2e dalej mają swoje wskaźniki)', () => {
    const fixture = JSON.parse(readFileSync('tests/fixtures/library/available.json', 'utf8')) as AvailableFile;
    expect(popularOnly(fixture)?.variables).toHaveLength(fixture.variables.length);
  });
});
