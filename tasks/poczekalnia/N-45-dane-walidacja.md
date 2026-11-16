# N-45 – Walidacja danych w warstwie prezentacji (przedszkola >100 %, mediana wieku bez danych, świeżość stopki)
Cel: Trzy poprawki wynikające z `tasks/poczekalnia/AUDYT-DANYCH.md` (P1.1, P1.2, P1.3), wyłącznie w kodzie prezentacji i `src/core`. Plików w `public/data` NIE zmieniamy.
Zmieniaj: src/core/format/value-flags.ts (nowy), src/core/freshness/freshness-label.ts, src/core/data/load-values.ts, src/view/profile/ProfileIndicatorRow.tsx, src/view/ranking/RankingBars.tsx, tests/unit/value-flags.test.ts (nowy), tests/unit/freshness-oldest.test.ts (nowy)
Wymagane: src/core/format/value-flags.ts, tests/unit/value-flags.test.ts, tests/unit/freshness-oldest.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §7 (progi pobierania plików), tasks/poczekalnia/AUDYT-DANYCH.md, src/core/format/number.ts

## Gdzie to dzieje się dziś (stan z 16.11.2026)
- Formatowanie wartości: `src/core/format/number.ts:37-43` – `formatValue` zwraca „brak danych” dla null/undefined/NaN. Dla 203,6 % po prostu pisze „203,6 %” (brak flagi).
- Miejsca wyświetlania liczb ze wskaźnika (wszystkie wołają `formatValue`, tu trzeba dodać flagę):
  - `src/view/profile/ProfileIndicatorRow.tsx:52` (wiersz profilu),
  - `src/view/ranking/RankingBars.tsx:67` (ranking, „najwyżej”),
  - `src/view/profile/ProfileOverview.tsx:65, 171, 182, 195` (duża liczba, porównania) – plik ekranu profilu: NIE ruszać bez zgody, flagę dać w komponentach wyżej, a w opisie PR wskazać, że Overview wymaga osobnego zadania.
- Przypisy: `src/core/profile/footnotes.ts` (`collectFootnotes`, używane w `src/view/profile/ProfileSheet.tsx:125`) – istnieją tylko dla `fromParent`; przypis wskaźnika (`footnote` w `config/indicators.json`) mają tylko `avg-wage` i `cars-per-1000`. Zmiana `config/indicators.json` wymaga zgody właściciela, więc tekst przypisu dla przedszkoli trzymamy w `value-flags.ts`.
- Świeżość: `src/core/freshness/freshness-label.ts:10-16` (`loadFreshnessLabel` czyta tylko `DEFAULT_INDICATOR_ID` = density, komentarz w liniach 5-9 sam to przyznaje); równoległy, nieużywany przez stopkę `loadFreshness` w `src/core/freshness/freshness.ts:44-56` i stała `FRESHNESS_URL` (linia 7, density). Stopka: `src/view/layout/DataFreshness.tsx:12-27`. Etykieta: `freshness.ts:36-41` (próg `STALE_AFTER_DAYS = 60`, linia 3). Pamięć podręczna plików wartości: `src/core/data/load-values.ts:3-4` (`valuesCache`).
- `median-age`: seria 2023-2026, 6 gmin z `null` w 2026 (`1412142`, `1416052`, `1419142` i trzy inne z audytu); wyświetlenie przechodzi przez `formatValue` (linia 41), więc „brak danych” już się pojawia w wierszu profilu – brakuje tylko pewności, że wszystkie ścieżki (ranking, legenda, tooltip, karta PNG) tego nie omijają.

## Zadanie
1. Nowy moduł `src/core/format/value-flags.ts` (czysta logika):
   - `exceedsPercentCap(indicatorId, unit, value): boolean` – true, gdy `unit === '%'`, wskaźnik jest na liście `CAPPED_AT_100 = ['preschool-3-6']` (jawna lista, nie wszystkie %), a `value > 100`.
   - `valueFlagNote(indicatorId, value): string | null` – dla przekroczenia zwraca krótki tekst po polsku: „Wartość powyżej 100 % wynika z liczenia dzieci z sąsiednich gmin; traktuj jako przybliżenie.” Bez zmiany samej liczby (dane zostają jak w pliku).
   - `displayValue(value, unit, indicatorId): { text: string; flagged: boolean }` – opakowanie `formatValue`: null/NaN -> `{ text: 'brak danych', flagged: false }`, `>100 %` -> tekst liczby + `flagged: true`.
2. W `ProfileIndicatorRow.tsx` i `RankingBars.tsx` użyj `displayValue`; przy `flagged` pokaż obok liczby znak „*” (tekst, nie kolor; kolory wyłącznie z tokenów) z przypisem tekstowym pod listą (`valueFlagNote`). Pole dotykowe/element nie mniejszy niż 44 px, napis nie wychodzi poza pole na telefonie.
3. „Brak danych” dla `median-age` null: ta sama ścieżka `displayValue` w wierszu profilu i rankingu; w rankingu jednostki z null NIE trafiają do „najwyżej/najniżej” (sprawdź filtr w `RankingBars.tsx`; jeśli filtr jest wyżej w `src/core/ranking`, nie zmieniaj – opisz w PR).
4. Świeżość ze wszystkich wskaźników BEZ pobierania 20 plików (PRODUKT §7 zabrania pobierania wielu plików naraz):
   - w `load-values.ts` dodaj `oldestFetchedAt(): string | null` – najstarsze `fetchedAt` z plików już załadowanych w `valuesCache` (zero nowych żądań);
   - `loadFreshnessLabel` bierze najstarszą datę spośród `density` (zawsze ładowany) i załadowanych wskaźników; nadal zwraca null przy braku daty;
   - jeśli właściciel woli datę ze wszystkich 20 plików: osobne zadanie z jednym plikiem manifestu generowanym w `scripts/data` (wymaga zgody, bo to zmiana `scripts/data`). Nie rób tego w tym PR.
5. Nie zmieniaj istniejących testów (`freshness.test.ts`, `freshness-route.test.ts`, `data-freshness-cache.test.ts`, `format-number.test.ts`); nowe testy w nowych plikach.

## Gotowe, gdy
- Test: `displayValue(203.6, '%', 'preschool-3-6')` -> `flagged: true`, tekst „203,6 %” (liczba bez zmian); `displayValue(100, '%', 'preschool-3-6')` i `displayValue(99.9, ...)` -> `flagged: false`; `displayValue(150, '%', 'forest-share')` -> `flagged: false` (lista jawna, inne wskaźniki nietknięte).
- Test: `valueFlagNote('preschool-3-6', 102.5)` zwraca niepusty tekst, a dla 80 zwraca null.
- Test: `displayValue(null, '', 'median-age')` i `displayValue(Number.NaN, '', 'median-age')` -> tekst dokładnie „brak danych”, `flagged: false`.
- Test na prawdziwej serii z `tests/fixtures` (lub małym fixture w teście, nie z sieci): jednostka z `null` w ostatnim roku `median-age` pokazuje „brak danych”, a wiersz z 2025 pokazuje liczbę.
- Test komponentu: wiersz profilu `preschool-3-6` z wartością 102,5 pokazuje „*” i tekst przypisu; wiersz z 80 – bez „*”.
- Test: `oldestFetchedAt()` po załadowaniu dwóch plików z różnymi `fetchedAt` (przez wstrzyknięty `fetchImpl`) zwraca starszą datę; bez załadowanych plików zwraca null; `loadFreshnessLabel` z wstrzykniętym `load` pokazuje starszą datę i dopisek „(dane mogą być nieaktualne)” przy wieku >60 dni (próg bez zmian).
- Test: liczba wywołań `fetchImpl` w teście świeżości nie rośnie (brak nowych żądań – pilnuje PRODUKT §7).
- `git diff --name-only` nie zawiera `public/data`, `config/indicators.json`, `src/view/Home.tsx`, `src/view/profile/ProfileSheet*.tsx`, `src/view/map/AtlasMap.tsx`.

## Nie ruszaj
public/data/*, config/*, scripts/data/*, src/view/profile/ProfileSheet*.tsx, src/view/profile/ProfileOverview.tsx, src/view/map/*, istniejących testów i wzorców zrzutów.

## Po ludzku (do opisu PR)
Co sprawdzić na podglądzie: Mapa -> „Wychowanie przedszkolne” -> „Najwyżej”: wartości powyżej 100 % mają gwiazdkę i wyjaśnienie; profil gminy `2417052` (2014 = 203,6 %). „Mediana wieku” -> gminy Stanisławów, Małkinia Górna, Staroźreby -> „brak danych”. Stopka -> data to najstarsza z załadowanych wskaźników.
Czego nie robimy: nie poprawiamy samych danych GUS ani nie odcinamy roku 2026 (to Z2 z audytu).
