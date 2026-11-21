# U11b – Zbieranie wyborów wskaźników do popularIds
Fala pliku: W23 (etap B budowy). Fala budowy: poza liczbą 15, po B13 i co najmniej 7 dni po starcie B01. Zależy od: B05, B13. Równolegle z: B14, B15 (osobne pliki).
Cel: Po zgodzie użytkownika zliczamy, jakie wskaźniki ludzie wybierają (bez miejsca i bez danych osobowych), a robot ma gotową funkcję, która z tych zliczeń wybiera `popularIds`.
Zmieniaj: src/core/consent/analytics.ts, src/view/data-menu/DataMenu.tsx, src/view/pages/Privacy.tsx, scripts/data/popular-ids.mjs, tests/unit/u11b-popular-event.test.ts, tests/unit/u11b-popular-ids.test.ts, tests/fixtures/popular/events-sample.json, docs/research/u/U11b.md
Wymagane: tests/unit/u11b-popular-event.test.ts, tests/unit/u11b-popular-ids.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U11.md (Rekomendacja, popularIds), config/library-priority.json, scripts/data/library-priority.mjs, src/core/consent/analytics.ts, src/core/consent/consent.ts, src/view/pages/Privacy.tsx, tests/unit/consent.test.ts
Zgoda właściciela (21.11.2026): ten prompt wprost prosi o zmianę `src/core/consent/analytics.ts` (nowe zdarzenie po zgodzie) i `scripts/data`. NIE zmieniasz logiki samej zgody (`consent.ts`, `src/view/consent`) ani istniejących testów zgody. Żadnych kluczy ani sekretów w kodzie; pobieranie liczb z PostHog (klucz prywatny) jest poza zakresem: robisz tylko funkcję czystą na pliku z eksportu i opis w raporcie.
Zadanie:
1. Zdarzenie `indicator_select` w `analytics.ts` wzorowane na istniejącym zdarzeniu `search`: wysyłane tylko po zgodzie, z jedną właściwością `id` (id wskaźnika; dla biblioteki `b<id>`), bez miejsca, bez adresu, bez żadnych danych osobowych; bez zgody nic nie jest wysyłane.
2. W `DataMenu.tsx` wywołaj zdarzenie przy wyborze wskaźnika (po kliknięciu w pozycję, nie przy każdym wpisaniu w szukajkę).
3. `scripts/data/popular-ids.mjs`: czysta funkcja `topIndicatorIds(events, {n, minCount})` zwracająca liczbowe id zmiennych biblioteki (bez wskaźników wbudowanych) wg liczby wyborów, malejąco, remisy po id; plus CLI czytające plik JSON z eksportu i wypisujące tablicę gotową do wklejenia w `config/library-priority.json` → `popularIds` (pliku konfiguracji NIE zmieniasz).
4. `Privacy.tsx`: jedno zdanie, że po zgodzie zliczamy, które wskaźniki są wybierane (bez miejsca i bez danych osobowych).
5. Raport `docs/research/u/U11b.md` (≤ 60 linii): jak właściciel eksportuje zliczenia z PostHog i uruchamia skrypt, kiedy ma sens (po ≥ 7 dniach od startu B01 i po obejrzeniu tabeli „wg działów” w Actions), jak wpisać wynik do `popularIds`.
Gotowe, gdy:
- Test jednostkowy zdarzenia: przy zgodzie wysyłane jest `indicator_select` z dokładnie jedną właściwością `id`; bez zgody nic nie jest wysyłane; id nie zawiera TERYT ani adresu.
- Test komponentu: wybór wskaźnika w `DataMenu` wywołuje zdarzenie raz; wpisywanie w szukajkę go nie wywołuje.
- Test `topIndicatorIds` na fixture: sortowanie po liczbie, remisy po id, odrzucenie wskaźników wbudowanych i wyborów poniżej `minCount`, brak wyjątku dla pustego wejścia.
- Test: `/prywatnosc` zawiera nowe zdanie; istniejące testy zgody i analityki przechodzą bez zmian.
Nie ruszaj: src/core/consent/consent.ts, src/view/consent/*, config/*, .github/workflows/*, docs/STAN.md, package.json.
Po ludzku (do opisu PR):
- Co zrobiłeś: Dodałem anonimowe zliczanie, jakie wskaźniki ludzie wybierają (tylko po zgodzie, bez miejsca i danych osobowych) oraz narzędzie, które z takiej listy wybiera najpopularniejsze dla robota.
- Co sprawdzić na podglądzie Vercel: Po scaleniu sprawdź `/prywatnosc` (nowe zdanie); po kilku dniach użyj instrukcji z `docs/research/u/U11b.md`, aby wpisać popularne wskaźniki do kolejki robota.
- Czego nie zrobiłeś i dlaczego: Nie pobieram liczb z PostHog automatycznie (wymagałoby klucza prywatnego, a tego nie wolno trzymać w kodzie).
Tytuł PR zaczyna się od `[W23-U11b]`; gałąź `claude/W23-U11b` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-U11b] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-U11b-zbieranie-wyborow-do-popularnych.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: B05, B13. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-U11b origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-U11b] Zbieranie wyborów wskaźników do popularIds”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
