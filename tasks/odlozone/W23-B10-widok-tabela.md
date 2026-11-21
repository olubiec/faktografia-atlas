# B10 – Widok Tabela (szukanie, sortowanie, klik wybiera miejsce)
Fala pliku: W23 (etap B budowy). Fala budowy: 5 z 8. Zależy od: B08. Równolegle z: B09, B11, B13.
Cel: Zakładka Tabela pokazuje wszystkie miejsca poziomu z wartością i miejscem w rankingu, da się je szukać i sortować, a klik w wiersz wybiera miejsce bez opuszczania tabeli.
Zmieniaj: src/core/data/table-rows.ts, src/view/data/DataTable.tsx, src/view/data/TableView.tsx, src/view/data/table-ready.ts, tests/unit/b10-table-rows.test.ts, tests/unit/b10-data-table.test.tsx, tests/e2e/path-s4c-tabela.spec.ts
Wymagane: tests/unit/b10-table-rows.test.ts, tests/unit/b10-data-table.test.tsx, tests/e2e/path-s4c-tabela.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U05.md (szkic widoku Tabela), src/core/ranking/ranking.ts, src/view/ranking/RankingBars.tsx, src/core/search/normalize.ts, src/view/ui/SearchField.tsx
Odpowiedź U01 P2 A: pobieranie CSV nie wraca (wróci z „Pobierz i udostępnij” za `?share=1`); w Tabeli NIE ma przycisku CSV.
Zadanie:
1. `table-rows.ts` (czysta logika): z wartości wskaźnika i listy jednostek poziomu buduje wiersze `{teryt, name (z rodzajem gminy), value, rank}`; sortowanie po nazwie (polska kolejność, `localeCompare('pl')`) i po wartości (rosnąco/malejąco; brak danych zawsze na końcu); filtr po nazwie bez względu na polskie znaki i wielkość liter (`normalize`); dwa wskaźniki (`i2`) = dwie kolumny wartości (i dwa miejsca w rankingu).
2. `DataTable` (HTML `<table>` z nagłówkami `scope`, przyciski sortowania z `aria-sort`, szukajka nad tabelą; lista długa: 50 wierszy + „Pokaż więcej”): kolumny Miejsce | Wartość (rok) | Miejsce w rankingu; wybrane miejsce wyróżnione i widoczne; klik wiersza ustawia `u` i zostaje w widoku Tabela; wartości z jednostką; kolory, kroje i odstępy tylko z tokenów; telefon: bez poziomego przewijania przy 360 i 390 px (kolumny zwężają się, nazwy zawijają), pola dotykowe ≥ 44 px.
3. `TableView` + `table-ready.ts`: przestaw `TABLE_READY = true` (zakładka Tabela pojawia się w `ViewSwitch`). Rok, poziom, miejsce i wskaźnik wspólne z mapą (`useMainView`/`useMapSelection`, bez drugiego stanu).
Gotowe, gdy:
- Test jednostkowy `table-rows` na fixture: sortowanie po nazwie (polskie znaki) i po wartości; brak danych na końcu; filtr „krakow” znajduje „Kraków”; ranking zgodny z `ranking.ts`; dwa wskaźniki dają dwie kolumny.
- Test komponentu: klik nagłówka przełącza sortowanie i `aria-sort`; wpisanie frazy filtruje; klik wiersza wywołuje wybór miejsca; wybrany wiersz wyróżniony; „Pokaż więcej” dokłada 50.
- Test e2e `@PATH-4c` (390 i 1280 px): Mapa → Tabela; `v=tabela` w adresie; klik wiersza ustawia `u` (adres) i zostaje w Tabeli; widok przeżywa odświeżenie; brak przewijania w poziomie; pola dotykowe ≥ 44 px.
- Test e2e: liczba w wierszu wybranego miejsca jest taka sama jak w dymku mapy dla tego miejsca.
Nie ruszaj: src/view/map/ViewSwitch.tsx, ViewHost.tsx, AtlasMap.tsx, src/view/charts/*, docs/STAN.md, package.json.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem zakładkę Tabela: lista miejsc z wartością i miejscem w rankingu, z szukaniem i sortowaniem; klik w wiersz wybiera miejsce.
- Co sprawdzić na podglądzie Vercel: Na podglądzie `/mapa` kliknij „Tabela”, wpisz nazwę (np. „Wadowice”), posortuj po wartości, kliknij wiersz; sprawdź na telefonie, czy nic nie wychodzi poza ekran.
- Czego nie zrobiłeś i dlaczego: Nie dodałem pobierania CSV (wraca razem z „Pobierz i udostępnij”).
Tytuł PR zaczyna się od `[W23-B10]`; gałąź `claude/W23-B10` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B10] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B10-widok-tabela.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B08. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B10 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B10] Widok Tabela (szukanie, sortowanie, klik wybiera miejsce)”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
