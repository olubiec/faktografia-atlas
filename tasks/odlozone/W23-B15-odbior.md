# B15 – Odbiór: testy ścieżek S4/S7/S8, pomiar kliknięć przed/po, PRODUKT v4 uzupełnienia
Fala pliku: W23 (etap B budowy). Fala budowy: 8 z 8. Zależy od: B14. Równolegle z: nic (sama w fali).
Cel: Cała przebudowa jest odebrana liczbami: testy ścieżek S4, S7, S8 przechodzą, a liczba kliknięć sześciu typowych zadań mieści się w limitach z badania U02.
Zmieniaj: tests/e2e/path-s4-cztery-widoki.spec.ts, tests/e2e/path-s7-menu-szukajka-wstecz.spec.ts, tests/e2e/path-s8-telefon.spec.ts, tests/e2e/b15-clicks.spec.ts, tests/e2e/b15-map-budget.spec.ts, docs/research/u/B15-odbior.md, docs/PRODUKT.md
Wymagane: tests/e2e/path-s4-cztery-widoki.spec.ts, tests/e2e/path-s7-menu-szukajka-wstecz.spec.ts, tests/e2e/path-s8-telefon.spec.ts, tests/e2e/b15-clicks.spec.ts, tests/e2e/b15-map-budget.spec.ts, docs/research/u/B15-odbior.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U02.md (tabela „przed”, limity), docs/research/u/U02-test-z-ludzmi.md, docs/research/u/U08.md (§4: S4, S7, S8), docs/research/u/U07.md (budżety), tasks/poczekalnia/Q/W6-QC611-budzety-szybkosci-biblioteki.md (budżet „wejście = granice + jednostki + 1 plik” przejmujesz)
Zmieniasz `docs/PRODUKT.md` wyłącznie w sekcjach „Gdzie jesteśmy”/uzupełnienia (liczby, nazwy testów ścieżek, wynik odbioru); nie zmieniasz opisów ekranów bez wyraźnego powodu z pomiaru (wtedy opisz w PR).
Zadanie:
1. Testy ścieżek (znacznik `@PATH-n`, dane z nagrań, bez sieci): S4 „cztery widoki” (ten sam wskaźnik: Mapa → Wykres → Tabela → Ranking; `v=` w adresie; wybrane miejsce ma tę samą liczbę we wszystkich 4 widokach; widok przeżywa odświeżenie; „Wstecz” wraca do poprzedniego widoku), S7 „menu, szukajka, wstecz/dalej” (menu ma tylko Start i Mapa; szukajka „Kraków” → wynik prowadzi na `/mapa?u=…` z profilem; Wstecz → Dalej; bez zbędnych żądań), S8 „cały przebieg na telefonie” (S1 → S2 → S3 na 390×844 i 360×740: brak przewijania w poziomie, pola dotykowe ≥ 44 px, axe bez błędów w obu motywach, przy `prefers-reduced-motion` brak animacji). Kroki i asercje: docs/research/u/U08.md §4.
2. Pomiar kliknięć `b15-clicks.spec.ts` (na bazie skryptu z U02) dla sześciu zadań z kartki: a) Wadowice w bezrobociu ≤ 3, b) najludniejsza gmina w województwie ≤ 3, c) powiat krakowski vs wielicki ≤ 4, d) dane o szkołach ≤ 3 (przez wybór danych; jeśli robot nie pobrał jeszcze zdrowia/szkół, test akceptuje „Nie mamy jeszcze tych danych” jako poprawny wynik i zapisuje to w raporcie), e) zmiana ludności w czasie ≤ 3, f) wysłanie linku = 1 kliknięcie widoczne zawsze. Liczysz kliknięcia, wpisywanie osobno; okno zgody pomijasz jak w U02.
3. Budżet wejścia na mapę (`b15-map-budget.spec.ts`, przejmuje QC611): wejście na `/mapa` = granice + lista jednostek + `available.json` (jeśli menu otwarte) + jeden plik wartości domyślnego wskaźnika; żadnego `profiles/*` i `index.json`.
4. Raport `docs/research/u/B15-odbior.md` (≤ 120 linii, wzór z WYTYCZNE §3): tabela „przed (U02) / po” dla zadań a–f, wyniki ścieżek, rozmiar JS wejścia `/` i `/mapa`, pomiar klatek strony startowej i drugiej mapy (SwiftShader ×4, orientacyjnie), lista rzeczy do sprawdzenia na telefonie właściciela (test nr 0 „po”) i lista tego, co się nie udało.
5. Dopisz w `docs/PRODUKT.md` krótką sekcję „Odbiór przebudowy (data)” z liczbami i nazwami testów ścieżek.
6. W PR napisz, że wzorce zrzutów trzeba odświeżyć workflow „Update snapshots” (po B03, B08 i B15) i że test nr 0 „po” robi właściciel na telefonie.
Gotowe, gdy:
- S4: wybrane miejsce ma tę samą wartość w widokach Mapa, Wykres, Tabela, Ranking; `v=` w adresie; odświeżenie zachowuje widok; „Wstecz” cofa o jeden widok.
- S7: w menu dokładnie dwie pozycje; wynik szukajki „Kraków” otwiera `/mapa?u=…` z profilem; Wstecz i Dalej działają; żądania nie przekraczają budżetu.
- S8: 390×844 i 360×740: brak przewijania w poziomie, pola dotykowe ≥ 44 px, axe 0 błędów w motywie jasnym i ciemnym, `prefers-reduced-motion` = brak animacji.
- Pomiar kliknięć: a ≤ 3, b ≤ 3, c ≤ 4, d ≤ 3, e ≤ 3, f = 1 (limity z U02); wynik zapisany w raporcie; przekroczenie limitu = czerwony test z nazwą zadania.
- Budżet wejścia `/mapa` przechodzi (żadnego `profiles/*` ani `index.json`).
- Raport B15 ma tabelę „przed/po”, listę dla telefonu właściciela i listę niepowodzeń.
Nie ruszaj: src/*, config/*, innych dokumentów poza docs/PRODUKT.md i raportem, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Sprawdziłem całość przebudowy liczbami: testy ścieżek (cztery widoki, menu i szukajka, cały przebieg na telefonie) i liczbę kliknięć w sześciu typowych zadaniach, porównane z tym, co było przed przebudową.
- Co sprawdzić na podglądzie Vercel: Przeczytaj raport `docs/research/u/B15-odbior.md` (tabela „przed/po”). Potem zrób test nr 0 „po” na telefonie z kartki `docs/research/u/U02-test-z-ludzmi.md` i porównaj. Uruchom „Update snapshots” w GitHub Actions.
- Czego nie zrobiłeś i dlaczego: Nie poprawiam tu błędów znalezionych w odbiorze: spisuję je w raporcie, a poprawki to osobne zadania.
Tytuł PR zaczyna się od `[W23-B15]`; gałąź `claude/W23-B15` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B15] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B15-odbior.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B14. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B15 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B15] Odbiór: testy ścieżek S4/S7/S8, pomiar kliknięć przed/po, PRODUKT v4 uzupełnienia”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
