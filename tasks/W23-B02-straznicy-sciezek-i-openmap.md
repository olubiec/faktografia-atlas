# B02 – Strażnicy ścieżek i openMap() (zgoda Z1)
Fala pliku: W23 (etap B budowy). Fala budowy: 1 z 8. Zależy od: nic. Równolegle z: B01.
Cel: Wszystkie testy e2e wchodzą na mapę przez jedną funkcję `openMap()`, a trzy testy ścieżek (S3, S6, R4) pilnują dzisiejszego zachowania przed zmianą tras.
Zmieniaj: tests/e2e/helpers/open-map.ts, tests/e2e/*.spec.ts (WYŁĄCZNIE adres w wywołaniach goto na `/` lub `/?…` i import openMap; ok. 71 plików, z wyjątkiem plików Z2 z listy niżej), tests/e2e/path-s3-od-kraju-do-gminy.spec.ts, tests/e2e/path-s6-porownanie-dwoch-miejsc.spec.ts, tests/e2e/path-r4-stare-linki.spec.ts
Wymagane: tests/e2e/helpers/open-map.ts, tests/e2e/path-s3-od-kraju-do-gminy.spec.ts, tests/e2e/path-s6-porownanie-dwoch-miejsc.spec.ts, tests/e2e/path-r4-stare-linki.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U08.md (§3.2, §4, §5), docs/research/u/U07.md (§3.4), tests/e2e/map-tap.ts, tests/e2e/mobile-audit.ts, tests/e2e/helpers/
Zgoda właściciela Z1 (21.11.2026, P2 A): wolno zmienić w istniejących testach e2e WYŁĄCZNIE adres w `goto` (przez `openMap`). Asercji nie zmieniasz, testów nie pomijasz. Plików Z2 NIE ruszasz (przepisze je B03): tests/e2e/home.spec.ts, a11y-matrix.spec.ts, fix3-owner-feedback.spec.ts, library-search.spec.ts, library-variable.spec.ts.
Zadanie:
1. Utwórz `tests/e2e/helpers/open-map.ts`: stała `MAP_BASE = '/'` (dziś mapa jest pod `/`) i funkcja `openMap(page, query = '')`, która robi `page.goto(MAP_BASE + query)`. Jedna stała = B03 przestawi ją na `/mapa` jedną linią.
2. Znajdź je poleceniem `grep -rnE "goto\([^)]*['"]/(\?[^'"]*)?['"]" tests/e2e` (21.11.2026: 255 wywołań w 71 plikach). Zamień mechanicznie wywołania `goto('/')` i `goto('/?…')` na `openMap(page, '?…')`. 11 wywołań z adresem składanym zmienną przepisz ręcznie, tak by adres był taki sam. Wywołania na inne trasy (`/biblioteka`, `/rankingi`, `/porownaj`, `/o-projekcie` itd.) zostają.
3. Napisz trzy nowe testy ścieżek (znacznik w nazwie bloku: `@PATH-3`, `@PATH-6`, `@PATH-R4`), na dzisiejszych trasach, z nagranych danych, bez sieci: S3 „od kraju do gminy”, S6 „porównanie dwóch miejsc w profilu”, R4 „stary link z parametrami zachowuje wszystkie parametry” (u, i, y, l, c, sheet, e2e, logo, tune). Kroki i asercje: docs/research/u/U08.md §4.
4. S3 i S6 uruchamiaj na 390 i 1280 px; użyj istniejących pomocników `map-tap.ts`, `mobile-audit.ts`. R4 sprawdza adres po wejściu przez `openMap` (nie zakłada, że przekierowanie istnieje), żeby test zadziałał także po B03.
Gotowe, gdy:
- Skrypt kontrolny w PR: `git diff -U0 origin/main...HEAD -- 'tests/e2e/*.spec.ts' | grep '^[-+]' | grep -vE 'goto|openMap|^(\+\+\+|---)'` zwraca tylko linie importu `openMap` (żadna asercja nie zmieniona); wynik wklej do PR.
- To samo polecenie `grep` co w pkt 2 zwraca wyłącznie pliki Z2 i helper.
- S3 (`@PATH-3`): `u=` to TERYT jako tekst; profil pokazuje wartość z mapy; „Wstecz” przeglądarki cofa o jeden poziom; okruszki zgodne z adresem.
- S6 (`@PATH-6`): `c=A,B` w adresie; dwa zarysy i tabela; skopiowany link po świeżym wejściu otwiera to samo.
- R4 (`@PATH-R4`): wszystkie parametry z adresu przeżywają wejście na mapę; `/?u=invalid999` otwiera mapę bez błędu w konsoli.
- Cały `pnpm test:e2e` zielony przed i po zmianie (ta sama liczba przechodzących testów + nowe).
Nie ruszaj: src/*, tests/unit/*, plików Z2 (wyżej), `*-snapshots/`, docs/STAN.md, package.json, playwright.config.ts.
Po ludzku (do opisu PR):
- Co zrobiłeś: Przygotowałem testy do przebudowy tras: wszystkie wchodzą na mapę jedną funkcją, a trzy nowe testy sprawdzają całe ścieżki (od kraju do gminy, porównanie, stare linki).
- Co sprawdzić na podglądzie Vercel: Na stronie nic się nie zmienia; to ma wyglądać dokładnie jak wcześniej. Sprawdź tylko, że CI jest zielone.
- Czego nie zrobiłeś i dlaczego: Nie ruszałem sześciu testów, które mają się zmienić razem ze stroną startową (to zadanie B03).
Tytuł PR zaczyna się od `[W23-B02]`; gałąź `claude/W23-B02` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B02] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B02-straznicy-sciezek-i-openmap.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: brak. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B02 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B02] Strażnicy ścieżek i openMap() (zgoda Z1)”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
