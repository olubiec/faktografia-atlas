# S04 – Dane strukturalne: WebSite, Organization, Dataset
Fala pliku: W25 (SEO). Fala budowy: S-1. Zależy od: nic.
Cel: Strona startowa ma JSON-LD `WebSite` + `Organization` (logo, nazwa, adres), strona „Skąd są dane” ma `Dataset` (źródło GUS BDL, licencja CC BY 4.0, zakres lat, zasięg: Polska), co pomaga Google i odpowiedziom AI zrozumieć, czym jest serwis.
Zmieniaj: src/core/seo/json-ld.ts, src/view/layout/JsonLd.tsx, src/view/start/StartPage.tsx, src/view/pages/Sources.tsx, tests/unit/s04-json-ld.test.tsx
Wymagane: tests/unit/s04-json-ld.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: schema.org/Dataset, wytyczne Google „Dataset structured data”, src/view/pages/Sources.tsx, config/indicators.json
Zadanie:
1. `json-ld.ts` (czyste funkcje): `websiteLd()`, `organizationLd()`, `datasetLd(indicators, years)`; `serializeLd(obj)` = JSON z `<`, `>`, `&` zamienionymi na `\u003c`, `\u003e`, `\u0026`.
2. `JsonLd.tsx`: `<script type="application/ld+json">{serializeLd(data)}</script>` – tekst jako dziecko, **bez** `dangerouslySetInnerHTML`.
3. Podłącz na StartPage i Sources (jedna linia w każdym pliku).
Gotowe, gdy:
- Test: `serializeLd({n:'</script>'})` nie zawiera `</script>`; wynik daje się sparsować `JSON.parse` do tego samego obiektu.
- Test: `datasetLd` ma `name`, `description` (50–5000 znaków), `license` = https://creativecommons.org/licenses/by/4.0/, `creator`, `spatialCoverage` = Polska, `temporalCoverage` z najstarszym i najnowszym rokiem z danych, `variableMeasured` = nazwy 20 wskaźników.
- Test: render StartPage zawiera dokładnie jeden skrypt `application/ld+json` z `@type` WebSite.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: Google dostaje „wizytówkę” serwisu i opis zbioru danych. Sprawdź podgląd w https://search.google.com/test/rich-results (adres `/zrodla`).
Tytuł PR zaczyna się od `[W25-S04]`; gałąź `claude/W25-S04` od `origin/main`; nie scalaj.
