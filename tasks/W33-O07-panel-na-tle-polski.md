# O07 – Nowy panel „Maszewo na tle Polski” na starcie
Cel: po wyborze miejsca strona startowa pokazuje 5 kart ról z paskiem rozkładu i przyciskiem „Ranking gmin”, a od karty do mapy z rankingiem prowadzi jedno stuknięcie.
Zmieniaj: src/view/start/PlaceFacts.tsx, src/view/start/RoleCard.tsx, src/view/start/NeighbourCard.tsx, src/view/start/SimilarPlace.tsx, src/core/start/discoveries.ts, docs/PRODUKT.md, tests/unit/w33-o07-place-panel.test.tsx, tests/e2e/w33-o07-place-panel.spec.ts
Wymagane: tests/unit/w33-o07-place-panel.test.tsx, tests/e2e/w33-o07-place-panel.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (całość), docs/PRODUKT.md §3.1 i §7, docs/STYL.md, src/view/start/PlaceFacts.tsx, src/view/start/FactCard.tsx, src/core/facts/roles.ts, src/core/facts/neighbour-compare.ts, src/view/start/YouAreHere.tsx

Zadanie:
1. Nadtytuł „Gmina w liczbach”, nagłówek „{Nazwa} na tle Polski”, podtytuł „Co wyróżnia gminę w danych GUS za {rok} rok.”, link „Zmień miejsce” zostaje.
2. `RoleCard`: etykieta roli (ikona iconoir przez `Icon`), zdanie główne z `humanScale`, `YouAreHere`, linia źródła, przycisk „Ranking gmin” (link do mapy z wskaźnikiem, rokiem i zaznaczonym miejscem, bez nowych żądań). Jedna karta (1) z zakreśleniem `korekta`.
3. `NeighbourCard` (zwykła jasna karta, przełącznik „Porównaj z: …”, „Pełne porównanie”) i `SimilarPlace` („Najbardziej podobna gmina” + największa różnica) pod kartami; „Losowa gmina” i „Gminy sąsiednie” jako zwykłe linki.
4. Stan `none` z O04 wyświetla zdanie wprost. Stare „3 rzeczy, których mogłeś nie wiedzieć” znika z interfejsu.
5. `docs/PRODUKT.md` §3.1 (stan B) opisuje nowy panel; budżet danych bez zmian (jeden plik `facts/<WW>.json`).
6. Telefon 390 px: karty jedna pod drugą, pola ≥ 44 px, zdanie główne ≤ 3 linii.

Gotowe, gdy:
- Test: panel dla fixture Maszewo pokazuje 5 kart w kolejności ról i dokładnie jedno zakreślenie `korekta`.
- Test: żaden widoczny tekst nie narusza słownika tonu (`findViolations`).
- E2E `@PATH`: od karty do mapy z rankingiem tego wskaźnika w 1 kliknięciu, z zachowanym miejscem.
- E2E: przy `prefers-reduced-motion` brak animacji; na 390 px brak poziomego przewijania.
- Test: zero dodatkowych żądań danych względem dziś.
Nie ruszaj: `Home.tsx`, `AtlasMap.tsx`, `ProfileSheet*.tsx`. Zrzuty wzorców odświeża właściciel (workflow „Update snapshots”) – napisz w PR.
Tytuł PR zaczyna się od `[W33-O07]`; opis ma „Po ludzku”, listę 50 gmin do przeglądu przez właściciela (z O04) i zrzut telefonu.
