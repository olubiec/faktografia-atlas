# D06 – Etykieta „Nowość” przy świeżych danych na stronie
Cel: przez kilka dni od pobrania nowego roku albo nowego wskaźnika użytkownik widzi przy nim krótką etykietę „Nowość”, bez żadnego dodatkowego pobierania danych. Etykieta pojawia się w trzech miejscach:
- na liście „Wybierz dane”;
- na kartach faktów (Odkrycie dnia, „3 rzeczy”);
- w nagłówku panelu mapy przy wybranym wskaźniku.
Zmieniaj: src/core/facts/fresh-label.ts, src/core/facts/codec.ts, src/core/facts/start.ts, scripts/data/library-available.mjs, src/core/indicators/load-available.ts, src/view/ui/NewBadge.tsx, src/view/data-menu/DataMenuList.tsx, src/view/start/FactCard.tsx, config/facts.json, tests/unit/w28-d06-new-badge.test.tsx
Wymagane: tests/unit/w28-d06-new-badge.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/PRODUKT.md §3 i §7, docs/STYL.md, src/core/facts/fresh.ts (z W27-D02), księga `library/calendar.json` (z W27-D05), src/core/facts/codec.ts, src/view/start/FactCard.tsx, src/view/data-menu/DataMenuList.tsx, scripts/data/library-available.mjs

Zadanie:
1. Jedna definicja „nowości” (`src/core/facts/fresh-label.ts`): wskaźnik albo zmienna ma etykietę, gdy jego najnowszy rok pojawił się najwyżej `fresh.labelDays` dni temu (w `config/facts.json`, start: 7). Źródła:
   - dla wskaźników głównych `public/data/facts/fresh.json` (W27-D02);
   - dla biblioteki `downloaded` z `library/calendar.json` (W27-D05) albo data dopisania zmiennej do `available.json`.
2. Bez nowych żądań (PRODUKT.md §7):
   - Karty faktów: flaga nowości trafia do zakodowanego faktu (`codec.ts`, opcjonalny ostatni element; stare pliki bez niego czytają się jak dziś). Dotyczy `facts/<WW>.json` i `facts-start.json`. `facts-start.json` ≤ 4 KB.
   - „Wybierz dane”: `library/available.json` dostaje pole `new` (lista id, także id wskaźników głównych). `library-available.mjs` czyta je z `public/data/facts/fresh.json` z checkoutu main i z `library/calendar.json`.
   - Panel mapy korzysta z tej samej listy, gdy jest już w pamięci. Jeśli nie jest, etykiety w panelu nie ma (bez dodatkowego żądania).
3. `src/view/ui/NewBadge.tsx`:
   - napis „Nowość”;
   - kolory, krój i odstępy wyłącznie z istniejących tokenów, bez zmiany `config/tokens.json` (jeśli brak pasującego tokenu, napisz w PR i zatrzymaj się);
   - bez animacji, `aria-label="Nowe dane"`;
   - napis nie wychodzi poza pole przy 320 px.
4. Panel mapy jest plikiem ekranu spoza listy. Jeśli etykiety nie da się tam wstawić bez zmiany `AtlasMap.tsx` lub hooków mapy, zrób tylko listę i karty, a w PR napisz, którą linię trzeba zmienić.

Gotowe, gdy:
- Test logiki: rok sprzed 3 dni → etykieta; sprzed 8 dni → brak; brak źródła → brak (nic się nie psuje).
- Test kodeka: fakt z flagą i bez flagi koduje się i dekoduje bez zmian w pozostałych polach, a stary zapis bez flagi jest czytany poprawnie.
- Test komponentu: wiersz „Wybierz dane” dla id z listy `new` ma etykietę z `aria-label="Nowe dane"`, a pozostałe wiersze jej nie mają. To samo dla `FactCard`.
- Test e2e `@S27` (na `tests/fixtures`): na stronie startowej karta z flagą pokazuje „Nowość”, a liczba żądań danych w pierwszych 3 s jest taka sama jak przed zmianą.
- `pnpm test` (w tym `no-hardcoded-colors`) przechodzi. W PR: trzeba odświeżyć zrzuty.

Nie ruszaj: `config/tokens.json`, `docs/STYL.md`, `src/view/map/AtlasMap.tsx`, `src/view/map/hooks/*`, `src/view/Home.tsx`.
Tytuł PR zaczyna się od `[W28-D06]`; opis ma „Po ludzku” (gdzie zobaczyć etykietę na podglądzie: przykładowe dane z flagą są w fiksturach, a na prawdziwych danych pojawi się po pierwszej premierze).
