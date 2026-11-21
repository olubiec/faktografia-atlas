# B09 – Widok Wykres (lata dla miejsca, mediana, dwie skale)
Fala pliku: W23 (etap B budowy). Fala budowy: 5 z 8. Zależy od: B08. Równolegle z: B10, B11, B13.
Cel: Zakładka Wykres pokazuje linię lat wskaźnika dla wybranego miejsca z przerywaną medianą poziomu; przy dwóch wskaźnikach jest jeden wykres z dwiema skalami.
Zmieniaj: src/core/charts/year-series.ts, src/view/charts/YearLineChart.tsx, src/view/charts/ChartView.tsx, src/view/charts/ready.ts, tests/unit/b09-year-series.test.ts, tests/unit/b09-year-line-chart.test.tsx, tests/e2e/path-s4b-wykres.spec.ts
Wymagane: tests/unit/b09-year-series.test.ts, tests/unit/b09-year-line-chart.test.tsx, tests/e2e/path-s4b-wykres.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U05.md (§Wyniki, Rekomendacja: własny SVG), src/view/profile/TrendChart.tsx, TrendAxis.tsx, TrendPoints.tsx, src/core/profile/trend-geometry.ts, src/core/profile/trend.ts, docs/STYL.md, config/tokens.json (tylko odczyt)
Odpowiedź właściciela: własny SVG, bez nowego pakietu (Observable Plot do usunięcia w B14). Dwa wskaźniki = JEDEN wykres z dwiema skalami (decyzja właściciela, wbrew rekomendacji U05 „dwa wykresy pod sobą”): ostrzeżenie o ryzyku mylnego odczytu jest częścią zadania (pkt 4). Nie zmieniasz `config/tokens.json`: jeśli brakuje dwóch rozróżnialnych tokenów kolorów, zatrzymaj się i opisz w PR.
Zadanie:
1. `year-series.ts` (czysta logika, test na fixture): z wartości wskaźnika buduje serię lat dla miejsca i medianę poziomu dla każdego roku; brak roku = przerwa w linii (nie zero); skale osi z „ładnymi” wartościami; dla dwóch wskaźników osobna skala lewa (A) i prawa (B).
2. `YearLineChart` (własny SVG; kolory, odstępy, kroje tylko z tokenów): linia miejsca (token `tusz`), przerywana mediana poziomu (token `olowek`), podpisy osi z jednostką i nazwą wskaźnika, wartość i rok po najechaniu/dotknięciu (tekst, nie HTML), wykres czytelny dla czytnika ekranu (`role=img` z opisem i tabela ukryta wizualnie z wartościami), pola dotykowe ≥ 44 px, napisy nie wychodzą poza pola także dla długich nazw.
3. `ChartView` + `ready.ts`: przestaw `CHART_READY = true` (zakładka Wykres pojawia się w `ViewSwitch`). Bez wybranego miejsca wykres pokazuje jednostkę o NAJWYŻSZEJ wartości wskaźnika na wybranym poziomie w wybranym roku (nie pobiera dodatkowych plików; interpretacja „największej jednostki poziomu”, opisz ją w PR) z napisem „Pokazano: <nazwa>. Wybierz miejsce na mapie.”. Wybrany rok, poziom i miejsce są wspólne z mapą (`useMainView`/`useMapSelection`, drugiego stanu nie tworzysz).
4. Dwa wskaźniki (`i` i `i2`): jeden wykres, lewa oś A i prawa oś B, RÓŻNE kolory (tokeny `tusz` i `ochra`) ORAZ różny styl linii (ciągła i z punktami), osie podpisane nazwą i jednostką wskaźnika, legenda nad wykresem. Napisz w PR ostrzeżenie: dwie skale na jednym wykresie można odczytać błędnie (przecięcie linii nic nie znaczy); dlatego test czytelności z pkt Gotowe.
5. Opisz w PR, że zakładka Wykres pojawia się na podglądzie po scaleniu tego zadania.
Gotowe, gdy:
- Test jednostkowy `year-series` na fixture: brak roku = przerwa; mediana poziomu liczona z właściwych jednostek; dwie skale mają niezależne zakresy; dla miejsca bez danych zwraca pustą serię (bez wyjątku).
- Test komponentu: wykres ma podpisy obu osi (nazwa + jednostka), legendę z dwoma wpisami przy dwóch wskaźnikach, `role=img` z opisem; brak wartości wpisanych na sztywno (test `no-hardcoded-colors` przechodzi).
- Test e2e `@PATH-4b` (390 i 1280 px): Mapa → Wykres; wybrane miejsce ma linię lat; po zmianie `i` wykres się zmienia; `v=wykres` w adresie, widok przeżywa odświeżenie; bez miejsca widać napis „Pokazano: …”.
- Test e2e czytelności (390 px, `i` + `i2`): podpisy osi lewej i prawej nie nakładają się (porównanie prostokątów), rozmiar tekstu ≥ tokenowy `xs`, dwie linie mają różne kolory i różny styl; brak przewijania w poziomie.
- Test e2e reduced-motion: wykres bez animacji rysowania.
Nie ruszaj: src/view/map/ViewSwitch.tsx, ViewHost.tsx, AtlasMap.tsx, src/view/profile/* (wykresy profilu zostają jak są), config/tokens.json, package.json, docs/STAN.md.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem zakładkę Wykres: linia zmian wskaźnika w latach dla wybranego miejsca i przerywana linia mediany (typowa wartość) dla poziomu. Przy dwóch wskaźnikach jest jeden wykres z dwiema skalami (lewa i prawa).
- Co sprawdzić na podglądzie Vercel: Na podglądzie `/mapa` wybierz miejsce, kliknij „Wykres”; spróbuj z dwoma wskaźnikami na telefonie (przycisk drugiego wskaźnika pojawi się po B11, wcześniej testuj adresem `?i=population&i2=unemployment-rate&v=wykres`). Oceń, czy łatwo odróżnić, która linia jest której.
- Czego nie zrobiłeś i dlaczego: Nie dodałem pakietu wykresów (własny SVG). Ryzyko mylnego odczytu dwóch skal jest opisane i pilnowane testem czytelności.
Tytuł PR zaczyna się od `[W23-B09]`; gałąź `claude/W23-B09` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B09] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B09-widok-wykres.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B08. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B09 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B09] Widok Wykres (lata dla miejsca, mediana, dwie skale)”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
