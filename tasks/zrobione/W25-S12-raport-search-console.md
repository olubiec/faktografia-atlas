# S12 – Tygodniowy raport z Google Search Console jako zgłoszenie na GitHubie
Fala pliku: W25 (SEO). Fala budowy: S-4. Warunek startu: właściciel dodał sekret `GSC_SERVICE_ACCOUNT` (docs/SEO.md §7).
Cel: Co poniedziałek powstaje zgłoszenie „SEO – tydzień <data>” z liczbami i czerwonymi flagami, które właściciel czyta w 5 minut na telefonie.
Zmieniaj: scripts/seo/gsc-report.mjs, src/core/seo/gsc-report.ts, .github/workflows/seo-weekly.yml, tests/unit/s12-gsc-report.test.ts, tests/fixtures/seo/gsc-*.json
Wymagane: tests/unit/s12-gsc-report.test.ts
Zgoda właściciela: nowy workflow – dana przez start tej fali. Bez nowych pakietów: token OAuth z konta usługi przez podpis JWT w `node:crypto`.
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: dokumentacja Search Console API (`searchanalytics.query`, `sitemaps.list`, `urlInspection.index.inspect`), docs/SEO.md §8 (mierniki i czerwone flagi)
Zadanie:
1. `gsc-report.ts` (czyste funkcje): porównanie 7 dni z poprzednimi 7 (kliknięcia, wyświetlenia, średnia pozycja), 20 zapytań i 20 stron, strony ze spadkiem kliknięć > 50 %, nowe zapytania; stan map stron (wysłane / zaindeksowane); próbka 40 losowych adresów z mapy strony przez inspekcję URL (stan indeksowania); czerwone flagi wg §8; wynik jako Markdown (tabele, po polsku, najpierw „Co wymaga działania”).
2. `gsc-report.mjs`: usługa `sc-domain:faktografia.eu`; dane Search Console mają 2–3 dni opóźnienia – okno kończy się 3 dni temu; tworzy Issue z etykietą `seo` przez `GITHUB_TOKEN`.
3. Workflow: cron w poniedziałek rano + ręczne uruchomienie; `permissions: issues: write, contents: read`; sekret tylko w zmiennej środowiska kroku, nigdy w logu.
4. Fixture: odpowiedzi API nagrane przy pierwszym ręcznym uruchomieniu (zanonimizowane nie trzeba – to dane strony); do tego czasu przykład z dokumentacji Google, opisany w PR jako tymczasowy.
Gotowe, gdy:
- Testy: spadek o 60 % na stronie → flaga; brak danych z poprzedniego tygodnia → „za mało danych”, nie błąd; Markdown zaczyna się od sekcji „Co wymaga działania”; brak sekretu → czytelny komunikat i kod 0 (bez czerwonego CI).
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: co poniedziałek na GitHubie pojawia się krótki raport: ile osób przyszło z Google, na jakie hasła i czy coś się zepsuło. Wystarczy przeczytać sekcję „Co wymaga działania”.
Tytuł PR zaczyna się od `[W25-S12]`; gałąź `claude/W25-S12` od `origin/main`; nie scalaj.
