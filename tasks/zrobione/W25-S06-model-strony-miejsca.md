# S06 – Treść strony miejsca z prawdziwych danych (logika)
Fala pliku: W25 (SEO). Fala budowy: S-2. Zależy od: S05.
Cel: Dla każdego miejsca powstaje model strony: tytuł, opis, H1, zdania z liczbami, tabela 20 wskaźników z miejscem w kraju i województwie, zmiana w czasie, linki do miejsc powiązanych i decyzja „indeksować / nie”.
Zmieniaj: src/core/seo/unit-page.ts, src/core/seo/sentences.ts, tests/unit/s06-unit-page.test.ts, tests/fixtures/seo/profile-12.json
Wymagane: tests/unit/s06-unit-page.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: docs/SEO.md (§2, D3, D8), scripts/data/build-profiles.mjs (kształt `public/data/profiles/<WW>.json`: `years`, `units[]` z `indicatorId`, `year`, `value`, `rankNational`, `rankVoivodeship`, `totalNational`, `totalVoivodeship`, `series`), config/indicators.json, public/data/explanations.json, src/core/format (formatowanie liczb pl-PL, jeśli jest)
Zadanie:
1. Fixture: wycinek `profiles/12.json` (województwo, 2 powiaty, 1 miasto na prawach powiatu, 4 gminy różnych typów, 1 gmina z małą liczbą danych) – opis wycięcia w PR.
2. `buildUnitPage(unit, profile, ctx)` → `{ path, title, description, h1, kind, lead: string[], rows: [...], links: {...}, indexable, lastmod }`:
   - tytuł ≤ 65 znaków, wzór: „Gmina Wieliczka – ludność, bezrobocie, dochody (2025)”; opis 120–160 znaków z 2–3 prawdziwymi liczbami i rokiem;
   - rodzaj z TERYT: województwo, powiat, miasto na prawach powiatu, gmina miejska/wiejska/miejsko-wiejska;
   - `lead`: 3–5 zdań ze **stałych szablonów** w `sentences.ts` (ludność + zmiana w 10 lat, miejsce w województwie, wskaźnik z najwyższym i najniższym miejscem w kraju); każde zdanie ma liczbę i rok; przy braku danych zdanie się pomija (nie „brak danych”);
   - `rows`: wskaźnik, wartość (pl-PL, jednostka), rok, miejsce „12. z 182 w województwie”, „… z 2479 w Polsce”, zmiana 5 i 10 lat (gdy seria pozwala); kolejność z config/indicators.json;
   - `links`: nadrzędne (powiat, województwo), podrzędne (gminy w powiecie, powiaty w województwie), 6 sąsiadów w rankingu ludności w województwie;
   - `indexable` = co najmniej 10 wskaźników z wartością z dwóch ostatnich lat; inaczej `false`;
   - `lastmod` = `generatedAt` z pliku profilu.
3. Zero tekstu z AI i zero liczb spoza danych (AGENTS.md).
Gotowe, gdy:
- Test: dla 4 gmin z fixture tytuły i opisy są unikalne i mieszczą się w limitach; opis zawiera liczbę ludności z danych.
- Test: zdania nie zawierają `undefined`, `NaN`, `null`; liczby w formacie pl-PL (spacja tysięcy, przecinek).
- Test: gmina z małą liczbą danych ma `indexable: false`; pozostałe `true`.
- Test: miasto na prawach powiatu ma rodzaj „miasto na prawach powiatu” i jeden model dla obu TERYT.
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku: przygotowujemy, co będzie napisane na stronie każdej gminy – tylko liczby GUS i proste zdania, bez tekstów pisanych przez AI.
Tytuł PR zaczyna się od `[W25-S06]`; gałąź `claude/W25-S06` od `origin/main`; nie scalaj.
