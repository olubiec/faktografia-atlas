# B11 – Druga mapa (komputer): dwa wskaźniki obok siebie
Fala pliku: W23 (etap B budowy). Fala budowy: 5 z 8. Zależy od: B08. Równolegle z: B09, B10, B13.
Cel: Przycisk „+ Druga mapa” pokazuje dwa wskaźniki obok siebie, ze wspólną kamerą, rokiem i poziomem, a zaznaczone miejsce widać na obu mapach.
Zmieniaj: src/core/map/camera-sync.ts, src/view/map/ComparePanes.tsx, src/view/map/ViewSwitch.tsx, src/view/map/AtlasMap.tsx, src/core/url/state.ts, tests/unit/b11-camera-sync.test.ts, tests/unit/b11-compare-panes.test.tsx, tests/e2e/path-s5-druga-mapa.spec.ts
Wymagane: tests/unit/b11-camera-sync.test.ts, tests/unit/b11-compare-panes.test.tsx, tests/e2e/path-s5-druga-mapa.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U06.md (całość: pomiary, rekomendacja, UX), src/view/test/proto/dwie-mapy.tsx (wzór ok. 140 linii), src/view/map/AtlasMap.tsx, src/view/map/hooks/useCameraDriver.ts, src/core/map/camera-driver.ts, src/view/data-menu/DataMenu.tsx
Ten prompt wprost wymienia plik ekranu src/view/map/AtlasMap.tsx (dodajesz tylko osadzenie `ComparePanes`, przekazanie `i2` i przycisk; nic innego; hooków `map/hooks/*` NIE zmieniasz, korzystasz z nich). `src/core/url/state.ts` zmieniasz tylko, jeśli `i2` z B08 nie wystarcza (opisz w PR dlaczego).
Zadanie:
1. `camera-sync.ts` (czysta logika, test): synchronizacja kamery dwóch map (wspólny `viewState`; ruch jednej przenosi się na drugą bez pętli sprzężenia; przerwanie gestem; `prefers-reduced-motion`).
2. `ComparePanes`: dwie instancje mapy obok siebie ze wspólną kamerą, wspólnym rokiem i poziomem; każda mapa ma własny wskaźnik i własną legendę pod spodem; nagłówek mapy: przycisk wyboru wskaźnika (komponent `DataMenu` z B05, z `isDisabled` wyłączającym wskaźniki bez danych na bieżącym poziomie) i przycisk × zamykający drugą mapę; klik w miejsce zaznacza je na obu; pod mapami wartości A i B dla zaznaczonego miejsca.
3. `ViewSwitch`: przycisk „+ Druga mapa” (widoczny w widoku Mapa; ≥ 44 px); po jego kliknięciu `i2` w adresie (domyślnie inny wskaźnik niż `i`), po × `i2` znika. Widoki Wykres, Tabela i Ranking używają `i2` do dwóch wskaźników (po swoich zadaniach).
4. Wydajność: zmierz p95 klatki na SwiftShader ×4 CPU dla województw i powiatów (3 powtórzenia, mediana) i wpisz do PR; napisz wprost, że to liczby orientacyjne i werdykt daje telefon właściciela (U06 na powiatach: 1350 → 1950 ms). Telefon (układ jedna pod drugą) robi B12; tu tylko komputer (≥ 1024 px); poniżej tej szerokości przycisk „+ Druga mapa” jest ukryty do B12.
Gotowe, gdy:
- Test jednostkowy `camera-sync`: ruch A ustawia B tak samo; brak pętli (ruch przeniesiony nie wraca); gest przerywa; reduced-motion = bez animacji.
- Test komponentu `ComparePanes`: dwie legendy z różnymi wskaźnikami; wspólny rok i poziom; zaznaczenie widać w obu; × zamyka drugą mapę; pozycje bez danych na poziomie wyłączone w wyborze.
- Test e2e `@PATH-5` (1280 px): „+ Druga mapa” → inny wskaźnik → klik w miejsce → zaznaczone na obu → zamknij drugą; po zamknięciu wraca jedna mapa; `i2` w adresie pojawia się i znika; odświeżenie z `i2` odtwarza dwie mapy.
- Test e2e: zmiana poziomu (Woj → Pow) i roku zmienia obie mapy; kamera pozostaje wspólna (`window.__atlas` pokazuje ten sam widok dla obu).
- Pomiar klatek z PR nie przekracza 33 ms p95 na województwach; na powiatach wynik opisany (bez progu).
- Istniejące testy kamery i mapy przechodzą bez zmian.
Nie ruszaj: src/view/map/hooks/*, src/view/Home.tsx, src/view/profile/*, src/view/charts/*, src/view/data/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem drugą mapę na komputerze: dwa wskaźniki obok siebie, wspólny zoom i przesuwanie, wspólny rok i poziom, zaznaczone miejsce widać na obu.
- Co sprawdzić na podglądzie Vercel: Na podglądzie na komputerze wejdź na `/mapa`, kliknij „+ Druga mapa”, wybierz drugi wskaźnik, przybliżaj, kliknij miejsce, zamknij ×. Telefonu jeszcze nie ruszaj (B12).
- Czego nie zrobiłeś i dlaczego: Nie zrobiłem układu na telefon (B12) ani wykresu punktowego A × B (później). Płynność na słabszym sprzęcie ocenisz sam; pomiar w PR jest orientacyjny.
Tytuł PR zaczyna się od `[W23-B11]`; gałąź `claude/W23-B11` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B11] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B11-druga-mapa-komputer.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B08. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B11 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B11] Druga mapa (komputer): dwa wskaźniki obok siebie”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
