# D01 – Pięć do siedmiu nowych wskaźników głównych (urodzenia, zgony, seniorzy na 100 dzieci, apteki, drogi rowerowe)
Cel: nowe, szeroko interesujące tematy (kryzys urodzeń, starzenie się, dostęp do aptek, rowery) są na mapie, w profilu miejsca i w silniku faktów jak 20 dotychczasowych wskaźników, z liczbami pobranymi przez robota.
Zmieniaj: config/indicators.json, public/data/explanations.json, public/data/values/*, public/data/profiles/*, public/data/parts/*, public/data/facts/*, public/data/facts-start.json, public/data/start.json, tests/unit/s04-json-ld.test.tsx, tests/unit/explanations-data.test.ts, tests/unit/indicator-registry.test.ts, tests/unit/w27-d01-new-indicators.test.ts
Wymagane: tests/unit/w27-d01-new-indicators.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/PRODUKT.md §1 i §7, docs/ARCHITEKTURA.md (dane), .github/workflows/fetch-data.yml, config/library-curation.json, src/core/indicators/registry.ts, tests/unit/data-contract.test.ts

Zadanie:
1. Dopisz do `config/indicators.json` (ten sam format co istniejące wpisy, `minLevel: "gmi"`). ID zmiennych sprawdzone 25.11.2026 w spisie robota biblioteki (`origin/data/library:library/available.json`): wszystkie mają gminy i dane do 2025.

   | id | bdlVarId | name | unit | group | higherIsBetter | poziomy w BDL |
   |---|---|---|---|---|---|---|
   | births-per-1000 | 450540 | Urodzenia żywe na 1000 ludności | na 1000 | Ludność | null | woj/pow/gmi, 2002–2025 |
   | deaths-per-1000 | 450541 | Zgony na 1000 ludności | na 1000 | Ludność | null | woj/pow/gmi, 2002–2025 |
   | old-per-100-young | 60564 | Osoby w wieku poprodukcyjnym na 100 osób w wieku przedprodukcyjnym | na 100 | Ludność | null | woj/pow/gmi, 2002–2025 |
   | people-per-pharmacy | 60583 | Ludność na aptekę ogólnodostępną | osoba | Życie | false | woj/pow/gmi, 2002–2025 |
   | bike-paths-per-10k | 288082 | Drogi dla rowerów na 10 tys. ludności (km) | km | Transport | true | woj/pow/gmi, 2011–2025 |
   | marriages-per-1000 * | 450543 | Małżeństwa na 1000 ludności | na 1000 | Życie | null | pow/gmi, 2002–2025 |
   | nursery-per-1000-under3 * | 1649859 | Dzieci w żłobkach i klubach dziecięcych na 1000 dzieci do lat 3 | na 1000 | Życie | true | pow/gmi, 2022–2025 |

   \* Warunkowo. Wpis zostaje tylko wtedy, gdy mapa województw pokazuje dla niego dane albo spójny stan „Nie mamy jeszcze tych danych”, tak jak dziś dla wskaźnika bez województw. Inaczej usuń go z `config/indicators.json` i napisz w PR dlaczego.

   **Zasada „nie niszowe”** (sprawdź dla każdego wpisu po pobraniu i wpisz wynik w PR):
   - wartości dla ≥ 95% gmin w ostatnim roku;
   - ostatni rok ≥ 2024;
   - seria ≥ 4 lata;
   - wskaźnik względny (na 1000, na 100, %, na osobę), nie liczba bezwzględna.

   Wpis, który nie spełnia zasady, wypada.
2. Dla każdego nowego wskaźnika dopisz objaśnienie w `public/data/explanations.json`, w tym samym układzie i tonie co istniejące (tekst, nie liczby). `old-per-100-young` musi wyjaśniać grupy wieku według GUS: przedprodukcyjny 0–17 lat, poprodukcyjny 60+ kobiety i 65+ mężczyźni. `deaths-per-1000` musi mówić, że wysoki wynik to głównie skutek starszej ludności, a nie „gorsze miejsce”.
3. Dane pobiera wyłącznie robot:
   - wypchnij gałąź z konfiguracją;
   - uruchom workflow „Fetch data” (`fetch-data.yml`, Run workflow) na ref `claude/D01` z wejściami `branch = claude/D01` i `only = <nowe id po przecinku>`. Jeśli nie możesz uruchomić go sam, napisz w PR, o co prosisz właściciela, i zatrzymaj się do czasu przebiegu;
   - po przebiegu zrób `git pull` (merge) gałęzi i dopiero wtedy testy.

   Sesja nie wpisuje ani nie liczy żadnych wartości ręcznie. Pliki `public/data/*` (poza `explanations.json`) zmienia wyłącznie robot; sesja ich nie edytuje.
4. Wybór danych nie może pokazać dwa razy tej samej zmiennej, na przykład `births-per-1000` z wskaźników głównych i `b450540` z biblioteki. Jeśli rejestr (`src/core/indicators/registry.ts`) tego nie odfiltrowuje, napisz w PR i zatrzymaj się (to plik spoza zakresu).
5. Istniejące testy z liczbą „20” (`s04-json-ld`, `explanations-data`, `indicator-registry`): **wolno zmienić wyłącznie liczbę** na nową liczbę wskaźników oraz liczbę w nazwie testu. Żadnej asercji nie usuwasz. `tests/unit/discover.test.ts` i `scripts/data/discover.mjs` zostają bez zmian.

Gotowe, gdy:
- `w27-d01-new-indicators.test.ts` sprawdza dla każdego nowego wskaźnika:
  - wpis w `config/indicators.json` z podanym `bdlVarId`;
  - plik `public/data/values/<id>.json` zgodny z kontraktem (`checkValuesFile`), z ostatnim rokiem ≥ 2024 i wartościami dla ≥ 95% gmin;
  - objaśnienie w `explanations.json`.
- Ten sam test sprawdza, że rejestr wskaźników nie ma dwóch pozycji z tym samym `bdlVarId`.
- Profil dowolnej gminy (z `public/data/profiles/<WW>.json`) zawiera wartości nowych wskaźników, a test `build-profiles` przechodzi.
- `public/data/facts/*.json` zbudowane przez robota zawiera fakty z co najmniej trzech nowych wskaźników (test liczy wystąpienia `indicatorId`).
- Progi z PRODUKT.md §7 i istniejące testy rozmiarów plików przechodzą. Jeśli `profiles/<WW>.json` przekroczy limit, napisz w PR i zatrzymaj się.

Nie ruszaj: `scripts/data/*`, `.github/workflows/*`, `config/facts.json` (wagi i Odkrycia robi W27-D02), plików ekranu.
W PR: lista wskaźników z wynikiem zasady „nie niszowe”, 3 przykładowe liczby do sprawdzenia w bdl.stat.gov.pl i informacja, że zrzuty (profil z nowymi wierszami) trzeba odświeżyć workflowem „Update snapshots”.
Tytuł PR zaczyna się od `[W27-D01]`; opis ma „Po ludzku”.
