# B08 – Przełącznik widoków i widok Ranking
Fala pliku: W23 (etap B budowy). Fala budowy: 4 z 8. Zależy od: B06. Równolegle z: nic (sama w fali).
Cel: Nad mapą są zakładki widoków (na razie Mapa i Ranking), widok Ranking zastępuje stronę Rankingi (także w obrębie województwa), a stary link `/rankingi` prowadzi na mapę z rankingiem.
Zmieniaj: src/core/url/state.ts, src/core/url/legacy-links.ts, src/view/map/ViewSwitch.tsx, src/view/map/ViewHost.tsx, src/view/data/RankingView.tsx, src/view/data/TableView.tsx, src/view/data/table-ready.ts, src/view/charts/ChartView.tsx, src/view/charts/ready.ts, src/view/map/AtlasMap.tsx, src/App.tsx, tests/unit/b08-url-view.test.ts, tests/unit/b08-ranking-view.test.tsx, tests/e2e/path-s4a-mapa-ranking.spec.ts, tests/e2e/path-redirects.spec.ts
Usuń (zgoda właściciela, tylko jeśli plik istnieje i po zmianie nie ma importera: sprawdź `rg -l`): src/view/pages/Rankings.tsx, src/view/pages/RankingsShare.tsx, src/view/ranking/RankingsFilters.tsx, src/core/ranking/rankings-url.ts, src/core/ranking/rankings-summary.ts; testy Z3 (E3, U1): tests/e2e/navigation-and-budgets.spec.ts i tests/e2e/rankings-and-compare-pages.spec.ts (jeśli jeszcze istnieją), tests/unit/rankings-filters.test.tsx, rankings-median.test.tsx, rankings-page-filters.test.tsx, rankings-share.test.tsx, rankings-summary.test.ts, rankings-url.test.ts. NIE usuwasz: src/core/ranking/ranking.ts, rankings-filter.ts, src/view/ranking/RankingBars.tsx, RankingsList.tsx i ich testów (grupa U2 zostaje; sprząta B14)
Wymagane: tests/unit/b08-url-view.test.ts, tests/unit/b08-ranking-view.test.tsx, tests/e2e/path-s4a-mapa-ranking.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U05.md (model adresu, widoki), docs/research/u/U08.md (E3, U1; R1; S4), docs/research/u/U02.md (zadanie b: ranking w województwie), src/core/url/state.ts, src/view/pages/Rankings.tsx, src/view/ranking/RankingBars.tsx, src/view/map/AtlasMap.tsx
Zgody właściciela (21.11.2026, odpowiedź P2 A): Z1 (adresy w testach e2e), Z2 (testy strony startowej i nazwy), Z3 (usunięcie testów Biblioteki, Rankingów, Porównaj i pickera razem z funkcją), Z4 (usunięcie testów „Moich wskaźników” i martwych sekcji). Zgody dotyczą wyłącznie plików wymienionych w tym zadaniu. Ten prompt wprost wymienia plik ekranu src/view/map/AtlasMap.tsx (wstawiasz tylko ViewSwitch/ViewHost i przekazanie stanu `v`, nic innego). Odpowiedź U02 P3: ranking także w obrębie województwa.
Zadanie:
1. Adres: `v=mapa|wykres|tabela|ranking` (domyślnie `mapa`, pomijany w adresie) i `i2` (drugi wskaźnik, na razie tylko czytany i zapisywany; używają go B09–B11); `w=<TERYT województwa>` dla filtra rankingu. Zmiana widoku NIE czyści `i`, `y`, `l`, `u`, `c`. Zapis i odczyt w `state.ts` z testem (nieznane `v` ignorowane).
2. `ViewSwitch` (zakładki w jednym rzędzie, 4 × ≥ 90 px, pola ≥ 44 px, `role=tablist`, klawiatura strzałkami) pokazuje tylko widoki gotowe: gotowość czytana z małych plików `src/view/charts/ready.ts` (`CHART_READY = false`) i `src/view/data/table-ready.ts` (`TABLE_READY = false`), które B09 i B10 przestawią każde w swoim pliku. `ViewHost` ładuje widoki leniwie (`ChartView`, `TableView` to na razie puste atrapy zwracające null, nie ma ich w menu).
3. `RankingView`: poziome słupki poziomu i roku (użyj `RankingBars` bez zmian); filtr „Województwo ▾” (ranking w obrębie województwa, np. gminy małopolskie wg ludności); wybrane miejsce wyróżnione i zawsze widoczne (przewijanie do niego); klik słupka ustawia `u` i zostaje w widoku Ranking; dwa wskaźniki (`i2`) = dwa rankingi pod sobą; wspólne `i`, `y`, `l`, `u` z `useMainView`/`useMapSelection` (drugiego stanu nie tworzysz).
4. Przekierowanie R1 w `legacy-links.ts`: `/rankingi?i=…&l=…` → `/mapa?i=…&l=…&v=ranking` (parametry zachowane; `y`, `w`, `q` przeniesione, jeśli są). Usuń trasę `/rankingi` z `App.tsx` i stronę Rankingów (lista „Usuń”).
Gotowe, gdy:
- Test jednostkowy adresu: `v` i `i2` zapisują się i odczytują; domyślne `mapa` nie pojawia się w adresie; zmiana `v` zachowuje `i`, `y`, `l`, `u`, `c`; `w` tylko z poprawnym TERYT (tekst).
- Test komponentu: `ViewSwitch` pokazuje tylko widoki z flagą gotowości; dostępność klawiaturą; pola ≥ 44 px.
- Test komponentu `RankingView`: wybrane miejsce wyróżnione i widoczne; filtr województwa zawęża listę do jednostek tego województwa; klik słupka ustawia `u`; przy `i2` dwa rankingi.
- Test e2e `@PATH-4a` (390 i 1280 px): Mapa → Ranking → Mapa; `v=` w adresie; wybrane miejsce ma tę samą wartość na mapie (dymek) i w rankingu; widok przeżywa odświeżenie; „Wstecz” wraca do poprzedniego widoku.
- Test e2e R1: `/rankingi?i=unemployment-rate&l=pow` → `/mapa?i=unemployment-rate&l=pow&v=ranking`, widok Ranking aktywny, parametry zachowane, 0 błędów.
- Test e2e: ranking „w obrębie województwa” dla gmin małopolskich pokazuje tylko gminy z TERYT zaczynającym się od `12`.
Nie ruszaj: src/view/Home.tsx, src/view/map/hooks/*, src/view/profile/*, docs/STAN.md, package.json, `*-snapshots/` (napisz w PR, że trzeba „Update snapshots”).
Po ludzku (do opisu PR):
- Co zrobiłeś: Nad mapą pojawiły się zakładki widoków (na razie Mapa i Ranking). Ranking pokazuje poziome słupki, da się go zawęzić do jednego województwa, a wybrane miejsce jest zawsze widoczne. Strona „Rankingi” zniknęła, stary link przenosi na mapę z rankingiem.
- Co sprawdzić na podglądzie Vercel: Na podglądzie na `/mapa` kliknij „Ranking”, wybierz województwo w filtrze, kliknij słupek; sprawdź stary adres `/rankingi?i=unemployment-rate&l=pow` na telefonie i komputerze.
- Czego nie zrobiłeś i dlaczego: Zakładki Wykres i Tabela jeszcze nie ma w menu (B09, B10). Wzorce zrzutów wymagają „Update snapshots”.
Tytuł PR zaczyna się od `[W23-B08]`; gałąź `claude/W23-B08` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B08] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B08-przelacznik-widokow-i-ranking.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B06. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B08 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B08] Przełącznik widoków i widok Ranking”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
