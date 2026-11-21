# B06 – Wybór danych na telefonie i koniec Biblioteki
Fala pliku: W23 (etap B budowy). Fala budowy: 3 z 8. Zależy od: B03, B05. Równolegle z: B07.
Cel: Na telefonie działa to samo menu wyboru danych co na komputerze, a strony Biblioteki znikają z przekierowaniem na mapę.
Zmieniaj: src/view/main/MobileIndicatorBar.tsx, src/view/main/SheetIndicatorPicker.tsx, src/App.tsx, src/core/url/legacy-links.ts, tests/e2e/path-redirects.spec.ts, tests/e2e/path-s2m-wybor-danych-telefon.spec.ts, tests/unit/b06-legacy-library-links.test.ts, tests/unit/b06-mobile-menu.test.tsx
Usuń (zgoda właściciela, tylko jeśli plik istnieje i po zmianie nie ma importera: sprawdź `rg -l`): src/view/pages/Library.tsx, src/view/pages/LibraryVariable.tsx, src/view/library/CategoryTiles.tsx, DownloadCsv.tsx, LibraryFilters.tsx, LibraryResults.tsx, LibrarySearchBar.tsx, OrderButton.tsx, OrderTopicButton.tsx, VariableStatsBar.tsx, MyIndicatorsSection.tsx, AddToMineButton.tsx, src/core/library/order.ts; testy Z3 (E1 i U4): tests/e2e/library-page.spec.ts, library-search.spec.ts, library-variable.spec.ts, s21-library.spec.ts, header-library.spec.ts (jeśli jeszcze jest) oraz tests/unit/category-tiles-fetched.test.tsx, library-categories.test.tsx, library-download-csv.test.tsx, library-filters.test.tsx, library-order-button.test.tsx, library-order.test.ts, library-page-fetched.test.tsx, library-page-tiles.test.tsx, library-results.test.tsx, library-search-bar.test.tsx, order-topic-button.test.tsx, variable-stats-bar-wrap.test.tsx, sheet-indicator-picker.test.tsx, library-add-to-mine.test.tsx, library-my-indicators.test.tsx, add-to-mine-status.test.tsx (tylko jeśli testują wyłącznie usuwany plik). Pliku `src/view/controls/IndicatorPicker.tsx` i `LibraryGroup.tsx` NIE usuwasz (używają go jeszcze Rankingi, Porównaj i profil; sprząta B14)
Wymagane: tests/e2e/path-s2m-wybor-danych-telefon.spec.ts, tests/unit/b06-legacy-library-links.test.ts, tests/unit/b06-mobile-menu.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U04.md (szkic telefonu), docs/research/u/U08.md (E1, U4, U6; R2), docs/research/u/U01.md (§6), src/view/data-menu/*, src/view/main/MobileIndicatorBar.tsx, src/App.tsx
Zgody właściciela (21.11.2026, odpowiedź P2 A): Z1 (adresy w testach e2e), Z2 (testy strony startowej i nazwy), Z3 (usunięcie testów Biblioteki, Rankingów, Porównaj i pickera razem z funkcją), Z4 (usunięcie testów „Moich wskaźników” i martwych sekcji). Zgody dotyczą wyłącznie plików wymienionych w tym zadaniu. Usuwasz testy tylko razem z usuwanym przez Ciebie plikiem; w PR wypisz każdy usunięty plik testowy i powód. Zgoda Z4 obejmuje tu usunięcie `MyIndicatorsSection`/`AddToMineButton` z ich testami.
Zadanie:
1. `MobileIndicatorBar`: pasek (nazwa wskaźnika, rok, legenda) otwiera `DataMenu` z `layout='stack'` (jeden widok naraz: szukajka u góry, okruszki „Wszystkie › Dział › Grupa”, lista) w arkuszu; zdejmij „Moje wskaźniki” (`MyIndicatorsManager`). Dodaj układ `stack` do `DataMenu` (to jedyna zmiana plików `data-menu`, dopisz je do „Zmieniaj” w PR, jeśli trzeba).
2. Przekierowania w `legacy-links.ts` (R2): `/biblioteka` → `/mapa?menu=dane`; `/biblioteka?k=…&q=fraza` → `/mapa?menu=dane&q=fraza`; `/biblioteka/101` → `/mapa?i=b101`; nieistniejące `/biblioteka/999` → `/mapa` (bez błędu). Przekierowania typu „replace”. Usuń trasy `/biblioteka` i `/biblioteka/:id` z `App.tsx`.
3. Usuń stronę Biblioteki, „Zamów”, „Pobierz CSV” i ich testy (lista „Usuń”). Zanim usuniesz plik, sprawdź `rg -l <nazwa>`; jeśli ma jeszcze importera spoza listy, zostaw go i napisz w PR.
4. Test ścieżki na telefonie: ta sama ścieżka S2 co na komputerze, ale 390×844.
Gotowe, gdy:
- Test e2e `@PATH-2m` (390×844 i 360×740): pasek → menu → dział → grupa → wskaźnik; adres ma `i=`; szukaj „bezrobocie” i wybierz wynik; zamknięcie arkusza przeciągnięciem i ×; brak przewijania w poziomie; pola dotykowe ≥ 44 px.
- Testy R2 w `path-redirects.spec.ts` (e2e): `/biblioteka`, `/biblioteka?k=1&q=ludnosc`, `/biblioteka/101`, `/biblioteka/999` kończą na właściwym adresie `/mapa…`, bez błędów w konsoli i bez pętli „Wstecz”.
- Test jednostkowy `legacyRedirect` dla czterech form `/biblioteka*` (nowy plik `b06-legacy-library-links.test.ts`).
- Test komponentu: `DataMenu layout='stack'` pokazuje jeden poziom naraz i okruszki; wybór wywołuje `onSelect`.
- Brak śladów: `rg -n "Zamów|Pobierz CSV|MyIndicatorsManager" src` nie zwraca wyników poza `src/view/share` i `src/core/my-indicators` (usuwa je B13/B14); wynik wklej do PR.
Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/Home.tsx, src/view/map/hooks/*, src/view/profile/*, src/core/my-indicators/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Na telefonie wybór danych działa tak samo jak na komputerze (jedno menu z kategoriami i szukajką). Strona Biblioteki zniknęła; stare linki do niej prowadzą na mapę.
- Co sprawdzić na podglądzie Vercel: Na telefonie dotknij paska wskaźnika, wejdź w dział i wskaźnik; sprawdź też na podglądzie adresy `/biblioteka`, `/biblioteka?q=ludnosc` i `/biblioteka/101` (mają przenieść na mapę).
- Czego nie zrobiłeś i dlaczego: Nie usunąłem starego okna wyboru (`IndicatorPicker`), bo używają go jeszcze Rankingi, Porównaj i profil; sprząta je B14. „Zamów wskaźnik” i „Pobierz CSV” znikły zgodnie z planem.
Tytuł PR zaczyna się od `[W23-B06]`; gałąź `claude/W23-B06` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B06] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B06-wybor-danych-telefon-koniec-biblioteki.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B03, B05. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B06 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B06] Wybór danych na telefonie i koniec Biblioteki”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
