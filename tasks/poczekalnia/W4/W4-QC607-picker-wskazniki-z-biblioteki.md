# QC607 – Okno wyboru wskaźnika zawiera grupę „Z biblioteki GUS” (limit 50 + „Pokaż więcej”)
Cel: w oknie wyboru wskaźnika (mapa, rankingi) da się znaleźć i wybrać pobrany wskaźnik z biblioteki, bez renderowania wszystkich 1773 naraz.
Zależy od: QC602 (`buildRegistry`, na main), QC606 (mapa/rankingi dostają wskaźniki `b…` w `indicators`; do czasu QC606 picker bez wskaźników z biblioteki działa jak dotąd).
Kolizje plików: `IndicatorPicker.tsx` używają `IndicatorPanel.tsx` (QC506, W4 – tylko importuje), `RankingsFilters.tsx` (QC609, W5) i `SheetIndicatorPicker.tsx` (importuje `IndicatorPickerContent`). Nikt inny w W4 nie edytuje `IndicatorPicker.tsx`; QC609 (W5) idzie po QC607.
Zmieniaj: src/view/controls/IndicatorPicker.tsx, src/view/controls/LibraryGroup.tsx (nowy), tests/unit/indicator-picker-library.test.tsx (nowy)
Wymagane: tests/unit/indicator-picker-library.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/picker-scroll.spec.ts
Przeczytaj najpierw: src/view/controls/IndicatorPicker.tsx (302 linii, więc nowa logika w osobnym pliku; `filterIndicators`, `groupIndicators`, `IndicatorPickerContent`, `IndicatorPicker`), src/core/indicators/reachability.ts (`searchIndicators`), src/core/library/picker-results.ts (`LIBRARY_PICK_LIMIT` = 50), src/core/indicators/registry.ts (`isLibraryIndicatorId`, `buildRegistry`), tests/unit/indicator-picker.test.tsx, tests/unit/rankings-filters.test.tsx, tests/unit/sheet-indicator-picker.test.tsx, tests/e2e/picker-scroll.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4d i §7

## Kontekst
Po QC606 `indicators` w pickerze zawiera 20 głównych i do ok. 1773 wskaźników z biblioteki (`id` zaczyna się od `b`, `group` = dział główny). Picker jest używany przez `IndicatorPanel` (mapa), `RankingsFilters` (rankingi) i `SheetIndicatorPicker` (telefon, przez `IndicatorPickerContent`) – ich testy nie mogą się zmienić. Pełny `index.json` biblioteki jest tylko na `/biblioteka` (PRODUKT §7), więc picker pracuje wyłącznie na `Indicator[]` z rejestru.

## Zadanie (jedna wersja)
- Rozdziel wejściowe `indicators` na główne (`!isLibraryIndicatorId(id)`) i z biblioteki. Główne renderuj dokładnie jak dotąd.
- Wyszukiwanie: **usuń lokalne `filterIndicators`** z `IndicatorPicker.tsx` i użyj `searchIndicators(list, query)` z `@/core/indicators/reachability` (ta sama reguła: pusta fraza = cała lista) – zarówno w `IndicatorPickerContent`, jak i w `IndicatorPicker` (nawigacja klawiaturą).
- Nowy `LibraryGroup.tsx` (`LibraryGroup({ items, value, onSelect })`): nagłówek „Z biblioteki GUS”, pozycje pokazuje do `LIBRARY_PICK_LIMIT` (50); gdy jest ich więcej, przycisk „Pokaż więcej (jeszcze N)” (≥ 44 px) dodaje kolejne 50; licznik wraca do 50 po zmianie frazy. Pozycje wyglądają jak główne (nazwa, jednostka, ✓ przy wybranym), z dopiskiem działu (`group`). Wybór woła to samo `onSelect(id)` z id `b…`.
- Grupa biblioteki jest pod głównymi; pusta (po filtrze) = bez nagłówka. Komunikat „Brak wskaźnika o tej nazwie” tylko gdy puste są obie części.
- Nawigacja strzałkami (`handlePickerKeyDown`) obejmuje wyłącznie główne – zachowanie bez zmian; pozycje biblioteki są zwykłymi przyciskami (Tab/klik).
- Bez wskaźników z biblioteki na wejściu picker wygląda i działa **dokładnie jak dotąd**.
- Bez nowych pakietów (bez wirtualizacji). `libraryPickCategories` z `picker-results.ts` tu **nie** wchodzi: wymaga pełnego `LibraryIndex` (zakaz ładowania poza `/biblioteka`); filtr po dziale jest w oknie „Moje wskaźniki” (QC505).

## Testy (tests/unit/indicator-picker-library.test.tsx)
1. Lista mieszana (20 głównych + 5 z fixture `available.json` przez `buildRegistry`): jest nagłówek „Z biblioteki GUS” i 5 pozycji pod nim, a główne nad nim.
2. Fraza „bezrob” znajduje wskaźnik główny i wskaźnik z biblioteki (jedna ścieżka `searchIndicators`; test sprawdza też, że `IndicatorPicker.tsx` nie zawiera już `filterIndicators`).
3. Wybór pozycji biblioteki → `onSelect` dostaje jej id `b…`.
4. 120 wskaźników z biblioteki (wygenerowanych w teście): widać 50 + „Pokaż więcej (jeszcze 70)”; klik → 100; drugi klik → 120 i przycisk znika; zmiana frazy resetuje do 50.
5. Bez wskaźników z biblioteki: brak nagłówka „Z biblioteki GUS” i brak „Pokaż więcej”.
6. Fraza bez trafień w bibliotece ukrywa jej nagłówek; fraza bez trafień nigdzie → „Brak wskaźnika o tej nazwie”.
7. Strzałki i Enter wybierają wyłącznie główne (jak w istniejącym teście); `IndicatorPicker.tsx` ≤ 302 linii (nie rośnie), `LibraryGroup.tsx` ≤ 200.

## Gotowe, gdy
- Szukanie znajduje wskaźnik z biblioteki, wybór woła `onSelect('b…')` (testy 2, 3).
- Najwyżej 50 pozycji naraz, „Pokaż więcej” działa (test 4); bez biblioteki nic się nie zmienia (test 5).
- `tests/unit/indicator-picker.test.tsx`, `rankings-filters.test.tsx`, `sheet-indicator-picker.test.tsx` i `picker-scroll.spec.ts` zielone bez zmian.
Nie ruszaj: `registry.ts`, `reachability.ts`, `picker-results.ts`, `IndicatorPanel.tsx`, `RankingsFilters.tsx`, `SheetIndicatorPicker.tsx`, `CompareIndicatorPicker.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
