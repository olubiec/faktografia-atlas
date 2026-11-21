# U03b – Przegląd serwisów z danymi na żywo (powtórka U03)
Fala pliku: W23 (etap B budowy). Fala budowy: poza liczbą 15, w dowolnym momencie po dopuszczeniu hostów. Zależy od: nic. Równolegle z: dowolne zadanie B (nie dzieli plików).
Cel: Dostajemy raport z oglądu sześciu serwisów z danymi na żywo: 3 wzorce do przejęcia i 3 błędy do uniknięcia, z opisem lub zrzutami.
Zmieniaj: docs/research/u/U03b.md, docs/research/u/u03b/*
Wymagane: docs/research/u/U03b.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: AGENTS.md, docs/research/u/WYTYCZNE.md, docs/research/u/U03.md (co było niemożliwe do sprawdzenia), docs/INSPIRACJE.md, docs/PLAN-UPROSZCZENIE.md (§0, §4 wiersz U03), docs/PLAN-DOCELOWY.md
Start dopiero, gdy właściciel dopuści w środowisku hosty: ourworldindata.org, datawrapper.de, ec.europa.eu, gapminder.org, stat.gov.pl, usafacts.org (zadanie „Do zrobienia przez Ciebie” w docs/PLAN-FALE-B.md). Jeśli któryś host nadal jest zablokowany (odmowa proxy), nie obchodzisz tego: oznacz ten serwis `[?]` i opisz w raporcie. Bez zmian w kodzie.
Zadanie:
1. Dla każdego z sześciu serwisów otwórz stronę z mapą/wykresem/tabelą i opisz (link, data odczytu, licencja): przełącznik widoków, wybór danych, układ na telefonie, jak pokazują dwa wskaźniki, co robi pierwsza wizyta bez wiedzy. Cudzego kodu nie kopiujesz; repozytoria czytasz tylko z wpisem `zweryfikowane` w `docs/INSPIRACJE.md`.
2. Zrzuty (JPG, razem do ok. 3 MB) do `docs/research/u/u03b/`; tam, gdzie zrzutu nie da się zrobić, opis słowny.
3. Raport wg WYTYCZNE §3 (≤ 250 linii): 3 wzorce do przejęcia i 3 błędy do uniknięcia; co z tego zmienia plan (które zadania B, jeśli jakieś); porównanie z decyzjami z PLAN-DOCELOWY (widoki, wybór danych, dwie mapy, strona startowa). Najwyżej 3 „Pytania do właściciela” w formacie A/B z rekomendacją.
Gotowe, gdy:
- Raport ma sekcje: Streszczenie, Metoda, Wyniki (tabela 6 serwisów), Rekomendacja, Co to zmienia w planie, Pytania do właściciela (≤ 3).
- Każdy z sześciu serwisów ma link, datę odczytu i licencję albo oznaczenie `[?]` z powodem.
- Dokładnie 3 wzorce do przejęcia i 3 błędy do uniknięcia.
- Zrzuty ≤ 3 MB razem, w `docs/research/u/u03b/`.
Nie ruszaj: src/*, tests/*, config/*, docs/STAN.md, package.json, innych raportów.
Po ludzku (do opisu PR):
- Co zrobiłeś: Obejrzałem na żywo sześć serwisów z danymi i spisałem, co warto od nich wziąć, a czego unikać.
- Co sprawdzić na podglądzie Vercel: Przeczytaj raport `docs/research/u/U03b.md` od sekcji „Pytania do właściciela”; na podglądzie nic nie widać.
- Czego nie zrobiłeś i dlaczego: Nie zmieniam strony ani planu; ewentualne zmiany zadań B proponuję w raporcie.
Tytuł PR zaczyna się od `[W23-U03b]`; gałąź `claude/W23-U03b` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-U03b] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-U03b-przeglad-serwisow-na-zywo.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: brak. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-U03b origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-U03b] Przegląd serwisów z danymi na żywo (powtórka U03)”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
