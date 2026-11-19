# QR06 – Dane karty A vs B i „Podziel tę stronę”
Stan: main 3ed628d, 19.11.2026. Tylko badanie, bez zmian w kodzie.

## Ustalenia
1. Karta A vs B jest gotowa po stronie rysowania (`VersusCardData`: wskaźnik, rok, `a`/`b` z nazwą i tekstem wartości, `diffText`), menu „+” ma pozycję „A vs B”, a CSV obsługuje `versus`. Brakuje tylko jednego: nikt nie wypełnia `ShareDialogData.versus`, więc karta i pozycja menu nigdy się nie pojawiają.
2. `useShareData` nie ma skąd wziąć A i B. Jego wejście to `view`, `choropleth`, `ranking`, `index`, `selectedTeryt` (jedno miejsce). Używają go tylko `IndicatorPanel` i `MobileIndicatorBar` (okno z mapy). Para A/B istnieje wyłącznie w zakładce Porównaj profilu (`ProfileCompare.tsx`, `shareData` w `useMemo`, ok. l. 230–330) – tam powstają `compare`, `compareRows`, `compareUnitA`, `compareUnitB`, ale bez `versus`.
3. Strona `/porownaj` (`ComparePage.tsx`) nie ma w ogóle okna udostępniania (brak `LazyShareDialog`). Ma za to profile A i B (`useComparedProfile`), listę wskaźników (`useMyIndicators`) i wiersze z biblioteki (`library.extraRows`).
4. Wniosek dla QS02 (opis: dane `versus` w `useShareData`, pliki: `useShareData.ts` + nowy test): przy takim zakresie dane nie dotrą do żadnego okna, bo `useShareData` nie jest używany tam, gdzie jest para. Najmniejsze poprawne rozwiązanie: czysta funkcja budująca `versus` z dwóch profili (core), a `useShareData` tylko opcjonalnie ją przyjmuje albo – prościej – wołają ją miejsca z parą. Zadanie QS02 należy zawęzić do czystej funkcji + testów (zadanie 1 niżej); wpięcie w widok to osobny krok (zadanie 2).
5. Wiersze: `compare(profileA, profileB).rows` (`CompareRow`: `indicatorId`, `a`, `b`, `diffText`). Dla A vs B (`PAGE_DATA_RULES.versus` = dokładnie 1 wskaźnik) bierzemy wiersz aktywnego wskaźnika: nazwa i jednostka z `Indicator`, wartości przez `formatValue`, `diffText` z wiersza, rok z widoku. CSV zestawu już działa: `pageInput` przy `versus` bierze `compareRows`, `compareUnitA/B` (dla `ProfileCompare` są ustawione).
6. Brak A lub B: `shareData` w `ProfileCompare` zwraca `{}` gdy brak `profileB`, a `ShareDialog` pokazuje „A vs B” tylko gdy `data.compare || data.versus` – więc wystarczy nie ustawiać `versus` bez pary. Wskaźnik bez wartości po którejś stronie: nie budować `versus` (zwrot `undefined`).
7. „Podziel tę stronę” jest dziś na stałe wyłączone: `ShareDialog.tsx:253` `onSplit={() => {}}`, `:256` `canSplitCurrent={false}`, `splitHint` nie jest przekazywany. Logiki podziału nie ma: `src/core/share/deck-split.ts` i `tests/unit/deck-split.test.ts` nie istnieją (zadanie `QC904` leży w `tasks/poczekalnia/Q/`, nie w `tasks/`). Kolejność: najpierw QC904 (czysty model), potem wpięcie.
8. Podział nie dotyczy A vs B (QC904: `versus` → `canSplit` false); dotyczy tabeli, profilu i porównania z wieloma wskaźnikami (`compare` ma max 20). Format karty (`selectedFormat`) jest stanem `ShareDialog`, więc wpięcie musi tam czytać limity z `deck-split`.
9. Kolizje plików: `ShareDialog.tsx` (335 l.) edytuje `W3-QC915` (wpięcie pasków/menu/CSV) – wpięcie podziału musi iść po QC915. `ProfileCompare.tsx` (473 l., już ponad limit ok. 200) nie jest w żadnym zadaniu W3; `ComparePage.tsx` też nie (ale `W3-QC612` zmienia wiersze Porównaj – sprawdzić przed startem). `useShareData.ts` jest w QC915 i QS02 – nie uruchamiać ich równolegle.

## Dowody
- `src/view/share/useShareData.ts:15-21` (`UseShareDataProps` bez pary), `:226-236` (zwracane `map`/`ranking`/`profile`, brak `versus`/`compare*`), `:193-200` i `:204-216` (`initialDeck`, `pageInput` już znają `versus`/`compare`).
- `rg "useShareData" src`: `IndicatorPanel.tsx:58`, `MobileIndicatorBar.tsx:70` – tylko okno z mapy.
- `rg "LazyShareDialog" src/view/pages`: brak trafień; `ProfileCompare.tsx:451-456` – okno z `defaultKind="compare"`.
- `src/view/profile/ProfileCompare.tsx` `shareData`: zwraca `compare`, `compareRows`, `compareUnitA/B`; `rg "versus" src/view/profile` – brak.
- `src/view/share/ShareDialog.tsx:34,66,255` (`versus?: VersusCardData`, `kinds.push('versus')`, `hasPair`), `:253-256` (wyłączony podział).
- `src/view/share/AddPageMenu.tsx:19` (wpis „A vs B”, `need: 'pair'`), `:56-66` (przycisk „Podziel tę stronę”, `aria-disabled`).
- `src/core/share/deck-page-data.ts:10` (`versus: {min:1,max:1}`), `deck-csv.ts:19` (`'compare' | 'versus'`).
- `ls src/core/share/deck-split.ts tests/unit/deck-split.test.ts` → „No such file”.
- `tests/unit/share-deck-wiring.test.tsx:16,71,80` – test karty i menu na stałych danych versus (działa bez widoku).
- Istniejące e2e: `tests/e2e/share-compare.spec.ts` (profil `?u=12&c=12,24`, karta compare) – nie wolno zmieniać; nowa pozycja menu nie może zmienić jego selektorów.

## Rekomendacja
Zrobić 3 małe zadania w tej kolejności: (1) czysta funkcja `versusCard` + testy (zastępuje zakres QS02 w `useShareData`), (2) wpięcie `versus` w `ProfileCompare` (miejsce, gdzie dziś jest para), (3) po scaleniu QC915 i QC904: włączenie „Podziel tę stronę” w `ShareDialog`. Okno udostępniania na `/porownaj` (ComparePage) odłożyć do osobnej decyzji po fali W3: to nowa funkcja, nie jest potrzebna, żeby karta A vs B działała. `useShareData` nie rozbudowywać o parę – dane A/B zostają tam, gdzie powstają.

## Proponowane zadania

### 1. QS02b – czysta funkcja danych karty A vs B
- Zmieniaj: src/core/share/versus-data.ts, tests/unit/versus-data.test.ts
- Cel: `versusCard(profileA, profileB, row, indicator, year)` zwraca `VersusCardData` z nazwami A i B, tekstami wartości (`formatValue`) i `diffText`; brak wartości po jednej stronie lub brak jednostki → `undefined`.
- Gotowe, gdy:
  - test: z dwóch profili i wiersza powstaje karta z oboma tytułami i `diffText` równym wierszowi
  - test: wartość `null` po jednej stronie → `undefined` (menu nie oferuje karty)
  - test: `deckCsvSections` dla zestawu z stroną `versus` i danymi `compareRows/compareUnitA/B` zawiera sekcję A vs B
  - test: nazwa jednostki jak w `unitTitle` (miasto/gmina z rodzajem), bez nowych żądań sieciowych
- Uwaga: nie wolno zmieniać `useShareData.ts` w tym zadaniu (to robi QS02 równolegle; po jego scaleniu uzgodnić, czy dane `versus` zostają tam, czy w nowym pliku).

### 2. QS02c – A vs B w oknie z zakładki Porównaj
- Zmieniaj: src/view/profile/ProfileCompare.tsx, tests/unit/profile-compare-versus.test.tsx
- Wymaga: zadanie 1 scalone.
- Cel: `shareData` w `ProfileCompare` dodaje `versus` (z `versusCard`) dla aktywnego wskaźnika, gdy są oba profile; pozycja „A vs B” pojawia się w menu „+”.
- Gotowe, gdy:
  - test: z A i B `shareData.versus` ma oba tytuły i wartości aktywnego wskaźnika
  - test: bez B `shareData` nie ma `versus`, `compare` i menu nie ma „A vs B”
  - test: istniejący `tests/e2e/share-compare.spec.ts` nie wymaga zmian (selektory karty compare bez zmian)
- Nie ruszaj: istniejących testów, wzorców zrzutów (odświeża właściciel workflowem „Update snapshots”).

### 3. QS05 – włączenie „Podziel tę stronę”
- Zmieniaj: src/view/share/ShareDialog.tsx, tests/unit/share-split-wiring.test.tsx
- Wymaga: QC915 i QC904 (`deck-split.ts`) scalone, żadne inne zadanie nie edytuje `ShareDialog.tsx`.
- Cel: `onSplit` woła `splitPage(deck, current.id, selectedFormat)`, `canSplitCurrent` = `canSplit(current, selectedFormat)`, `splitHint` = `splitHint(current, selectedFormat)`; po podziale bieżąca staje się pierwsza z nowych stron.
- Gotowe, gdy:
  - test: tabela z 10 wskaźnikami w formacie Post → po kliknięciu 2 strony (8 + 2), numeracja „1/N”
  - test: ten sam zestaw w Story → przycisk nieaktywny (`aria-disabled`), brak zmiany zestawu
  - test: strona A vs B, mapa, duża liczba → przycisk nieaktywny
  - test: pole podpowiedzi z liczbą wskaźników jest podpięte (`aria-describedby`)
