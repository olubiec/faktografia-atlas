# QU25 – Badanie: menu kategorii i Biblioteka, wspólny wykres z kursorem, klik miejsca otwiera mapę z danymi wskaźnika
Cel: jeden raport dla uwag 10, 16, 17 i 18 (połączone QU25+QU26+QU27); bez zmiany kodu strony.
Zmieniaj: docs/research/QU25-menu-wykres-klik-miejsca.md
Wymagane: docs/research/QU25-menu-wykres-klik-miejsca.md
Weryfikacja: pnpm lint
Zależy od: raportów QU03, QU05, QU06, QU07 (docs/research/QU0*) – przeczytaj je, jeśli już są; nie powtarzaj ich, tylko je scal i wskaż sprzeczności. Wdrożenia: QU11, QU12, QU13 (ta sama numeracja W5).
Kolizje plików: brak (nowy plik w docs/research). Wdrożenia z raportu zahaczą o `Library.tsx`, `IndicatorPicker.tsx`, `TrendChart.tsx` oraz zadania QC509, QC606, QC608, QC609 – raport podaje kolejność.
Przeczytaj najpierw: docs/PLAN-UWAGI-19-11.md (uwagi 10, 11, 13, 16, 17, 18), docs/PRODUKT.md (menu, Biblioteka, §7 progi), src/view/Header.tsx, src/view/pages/Library.tsx, src/view/pages/LibraryVariable.tsx, src/view/library/CategoryTiles.tsx, src/view/library/LibraryFilters.tsx, src/view/library/LibraryResults.tsx, src/view/profile/AddIndicatorWindow.tsx, src/view/controls/IndicatorPicker.tsx, src/view/main/SheetIndicatorPicker.tsx, src/view/compare/CompareIndicatorPicker.tsx, src/core/library/query.ts, src/core/library/picker-results.ts, src/view/profile/TrendChart.tsx, src/view/profile/TrendAxis.tsx, src/view/profile/TrendPoints.tsx, src/view/ranking/RankingBars.tsx, src/view/pages/Rankings.tsx, src/view/pages/ComparePage.tsx, src/view/search/SearchDialog.tsx, docs/ELEMENTY.md, src/core/map/main-view.ts (tylko czytanie: jak adres wybiera wskaźnik `?i=`)

## Kontekst
Decyzje właściciela: wykresy lat = własny SVG, bez nowego pakietu; QU03 → wariant A (Biblioteka = katalog prowadzący na mapę, stare adresy z przekierowaniem). Uwagi: menu „zawalone” (16), jedno wspólne menu „Dodaj wskaźnik” z kategoriami i szukajką wszędzie (10), wykres „zobacz wykres” z kursorem pokazującym dokładne dane w Bibliotece, rankingach, porównaniu i listach miast (17, 11), klik miejsca ma otwierać mapę z danymi wskaźnika, nie sam profil (18).

## Zadanie
1. Menu: inwentarz wszystkich miejsc, gdzie dodaje się/wybiera wskaźnik lub otwiera listę (tabela: komponent, plik, co pokazuje na starcie, czy ma kategorie i szukajkę). Szkic jednego wspólnego menu (kategorie rozwijane, szukajka, „Moje” na górze, lista dopiero po wyborze) i jak ma wejść w nie Biblioteka; filtr poziomu Województwa · Powiaty · Gminy · Wszystkie (uwaga 13) zgodnie z poziomami w `public/data`.
2. Wykres: inwentarz istniejących wykresów lat (`Trend*`, rozkład, ranking); wymagania dla jednego komponentu SVG (oś czasu, wiele serii, kursor z tooltipem jako tekst – nie HTML z danych, dotyk, klawiatura strzałkami, `prefers-reduced-motion`, tokeny kolorów); jak wiele jednostek zestawia się na jednym wykresie; rozmiar kodu (szacunek linii) i podział na pliki ≤200 linii. Pakietu nie dodajemy; jeśli własny SVG coś wyklucza, opisz to w pytaniach do właściciela.
3. Klik miejsca: lista wszystkich miejsc, gdzie klik jednostki dziś otwiera profil lub stronę (Biblioteka, Rankingi, Porównaj, wyszukiwarka); jedna zasada „wskaźnik + jednostka → mapa `/?u=…&i=b<id>`” z użyciem istniejących parametrów adresu; sprawdź, czy wskaźnik biblioteki (niepodstawowy) działa w `?i=` i co z nim robi `useMainView`.
4. Struktura raportu (≤120 linii): Fakty (plik:linia) · Wnioski · Warianty z kosztem · Rekomendacja · Pytania do właściciela. Warianty z kosztem (pliki, linie, ryzyko dla testów) po min. 2 na każdą z trzech części oraz kolejność wdrożeń względem QU11/QU12/QU13 i QC509/QC606/QC608/QC609.
Gotowe, gdy:
- raport ma tabelę wszystkich miejsc wyboru wskaźnika (min. 5 pozycji, z plikami)
- raport ma specyfikację wspólnego wykresu: lista propsów, zachowania kursora/dotyku/klawiatury i szacunek podziału na pliki
- raport ma tabelę „gdzie klik jednostki → dokąd dziś → dokąd po zmianie” z plikami i wskazuje testy do dopisania
- raport kończy się listą zadań wdrożeniowych z plikami, kolejnością i sekcją „Pytania do właściciela”
- `pnpm lint` przechodzi
Nie ruszaj: kod strony (src/, tests/), config/, public/data, package.json, wzorce zrzutów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
