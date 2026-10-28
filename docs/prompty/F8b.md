> **ZAMKNIĘTE (28.10.2026) – archiwum.** Fala wykonana (PR #356–#358). Nowe zadania piszemy jako pliki `tasks/` dla Jules Loop: `docs/AUTOMAT.md`.

# Fala F8b – prompty dla Julesa (26.10.2026)
Kolejność: najpierw scal **PR #350** (kontrakt spisu) i **PR #351** (formularz zgłoszeń). Potem wklej wszystkie trzy prompty naraz (pliki rozłączne). Bramka fali: zielone CI na `main` po scaleniu trzech PR. Potem: uruchom ręcznie „Fetch library” (workflow), a Claude pisze F9.
Kolizje: W1.25 → `scripts/data/library.mjs`, `scripts/data/library-index.mjs`, `tests/unit/library.test.ts`, `tests/unit/library-index.test.ts`, `tests/fixtures/library/*` · W1.26 → `src/core/library/query.ts`, `src/core/library/index-contract.ts`, `tests/unit/library-query-perf.test.ts` · W1.27 → `src/core/library/order.ts`, `tests/unit/library-order.test.ts`. Żaden plik się nie powtarza.

## PROMPT 1 – W1.25 Robot biblioteki: pełne nazwy zmiennych (n1–n5)
(po ludzku: co czwarta zmienna w bibliotece ma dziś taką samą nazwę jak inna; po poprawce każda będzie miała pełną)
Przeczytaj najpierw: docs/ARCHITEKTURA.md §3 zadanie W1.25 i §5.5, scripts/data/library.mjs, scripts/data/library-index.mjs, src/core/library/index-contract.ts, docs/research/haiku/R7.1-R7.4.md.
Zadanie: BDL zwraca dla zmiennej człony nazwy n1–n5, a robot zapisuje tylko n1–n3 (library.mjs, ok. linii 70) i tylko trzy składa w tytuł (library-index.mjs, ok. linii 35). (1) Zapisuj w katalogu n1–n5 (pola puste lub brakujące pomijaj). (2) buildIndex składa nazwę ze wszystkich niepustych członów n1–n5, w tej samej kolejności i z tym samym łącznikiem „ – ” co dotąd. (3) Stary katalog bez n4/n5 ma się nadal wczytywać (brak = pusty).
Pliki: scripts/data/library.mjs, scripts/data/library-index.mjs, tests/unit/library.test.ts (tylko dopisanie przypadków), tests/unit/library-index.test.ts (tylko dopisanie przypadków), tests/fixtures/library/ (nowy plik z nagraną odpowiedzią zawierającą n4, np. zmienna 60614 z n4 = „mężczyźni”).
Gotowe, gdy:
- zmienna z n4 ma w spisie nazwę z czterema członami (test);
- dwie zmienne różniące się tylko n4 mają różne nazwy (test);
- katalog bez n4/n5 daje te same nazwy co przed zmianą (test);
- rozmiar spisu dla fixture rośnie najwyżej o 15% (test);
- istniejące testy przechodzą bez zmian.
Nie ruszaj: .github/workflows/, src/view/, innych plików w scripts/data. Nie uruchamiaj robota i nie wywołuj API GUS.
Uruchom wszystkie testy i popraw błędy, zanim otworzysz PR. Tytuł PR zaczyna się od „W1.25 –”. W opisie PR dodaj sekcję „Po ludzku”: co zrobiłeś, co sprawdzić na podglądzie (nic – to robot), czego nie zrobiłeś (ponowne przejrzenie katalogu uruchamia właściciel).

## PROMPT 2 – W1.26 Wyszukiwanie w bibliotece: wydajność na 64 tys. zmiennych
(po ludzku: wyszukiwanie ma działać natychmiast także na prawdziwym, dużym spisie)
Przeczytaj najpierw: docs/ARCHITEKTURA.md §3 zadanie W1.26, src/core/library/query.ts, src/core/library/index-contract.ts, tests/unit/library-query.test.ts, tests/unit/library-contract.test.ts.
Zadanie: pomiar na prawdziwym spisie (63 960 zmiennych): filtr tekstowy 170–850 ms, filtr poziomu ok. 740 ms, countByCategory ok. 1,6 s. Policz raz przy przygotowaniu spisu (funkcja prepare w index-contract.ts) pola pomocnicze: znormalizowana nazwa (małe litery, bez polskich znaków) i indeksy kategorii, a filtry i countByCategory w query.ts niech z nich korzystają zamiast liczyć za każdym razem. Wyniki funkcji mają być identyczne jak przed zmianą.
Pliki: src/core/library/query.ts, src/core/library/index-contract.ts, tests/unit/library-query-perf.test.ts (nowy).
Gotowe, gdy:
- wszystkie istniejące testy, w tym library-query.test.ts i library-contract.test.ts, przechodzą bez zmian;
- test wydajności na wygenerowanych 64 000 zmiennych: filtr tekstowy, filtr poziomu i countByCategory każdy poniżej 150 ms (próg z zapasem na CI);
- test równoważności: te same zapytania na tych samych danych dają te same wyniki co wersja bez pól pomocniczych.
Nie ruszaj: src/view/, load-library.ts, istniejących testów.
Uruchom wszystkie testy i popraw błędy, zanim otworzysz PR. Tytuł PR zaczyna się od „W1.26 –”. W opisie PR dodaj sekcję „Po ludzku”.

## PROMPT 3 – W1.27 „Zamów wskaźnik”: adres przez formularz zgłoszeń
(po ludzku: przycisk otworzy gotowy, wypełniony formularz zamiast zwykłego pustego zgłoszenia)
**Zgoda właściciela (26.10.2026):** wolno zmienić istniejący test tests/unit/library-order.test.ts – tylko w zakresie wymienionym niżej (parametr `labels` zastępujemy `template` i polami). Żadnego innego istniejącego testu nie zmieniaj.
Przeczytaj najpierw: docs/ARCHITEKTURA.md §3 zadanie W1.27, src/core/library/order.ts, tests/unit/library-order.test.ts, .github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml.
Zadanie: orderIssueUrl buduje https://github.com/olubiec/faktografia-atlas/issues/new?template=zamowienie-wskaznika.yml&title=…&id=…&nazwa=…&dzial=…&poziom=… (id pól jak w pliku formularza; tylko pola typu input; bez parametru labels, bo osoby bez uprawnień dostają wtedy błąd 404). Parametr title: „Zamówienie wskaźnika: <nazwa> (<id>)”. Długość całego adresu najwyżej 1800 znaków: długą nazwę skracaj znakiem „…”. Polskie znaki kodowane poprawnie. Nie dołączaj danych osobowych.
Pliki: src/core/library/order.ts, tests/unit/library-order.test.ts.
Gotowe, gdy:
- adres zaczyna się od https://github.com/olubiec/faktografia-atlas/issues/new?template=zamowienie-wskaznika.yml& (test);
- w adresie nie ma „labels=” (test);
- po zdekodowaniu title, id i nazwa zgadzają się (test);
- 400-znakowa nazwa mieści adres w 1800 znakach i kończy się „…” (test);
- polskie znaki zachowane (test).
Nie ruszaj: src/view/, .github/.
Uruchom wszystkie testy i popraw błędy, zanim otworzysz PR. Tytuł PR zaczyna się od „W1.27 –”. W opisie PR dodaj sekcję „Po ludzku”, w niej wymień, który istniejący test zmieniłeś i dlaczego.
