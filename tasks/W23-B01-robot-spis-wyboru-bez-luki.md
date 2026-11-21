# B01 – Robot: spis wyboru bez luki 375 i kontrola przebiegu
Fala pliku: W23 (etap B budowy). Fala budowy: 1 z 8. Zależy od: nic. Równolegle z: B02.
Cel: Lekki spis pobranych wskaźników (`available.json`) obejmuje wszystkie pobrane wskaźniki z danymi, a podsumowanie przebiegu w Actions pokazuje, ile jest pobranych i ile w spisie.
Zmieniaj: scripts/data/library-available.mjs, .github/workflows/fetch-library.yml, tests/unit/b01-library-available-gap.test.ts, tests/fixtures/library/b01-gap-index.json, tests/fixtures/library/b01-gap-values.json
Wymagane: tests/unit/b01-library-available-gap.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md, docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md; docs/research/u/U04.md (§Wyniki: luka 375), docs/research/u/U11.md, scripts/data/library-available.mjs, tests/unit/library-available-script.test.ts, tests/fixtures/library/available.json, config/library-priority.json
Zgoda właściciela (21.11.2026, P4 i plan §4): ten prompt wprost prosi o zmianę `scripts/data` i `.github/workflows/fetch-library.yml`. Istniejącego testu `library-available-script.test.ts` nie zmieniasz.
Zadanie:
1. Ustal przyczynę luki: dziś w `available.json` jest 2 061 z 2 436 pobranych wskaźników (różnica 375). Pobierz gałąź `git fetch origin data/library` (tylko do odczytu) i porównaj id z `library/values/*.json` z id w `available.json`. Jeśli gałąź jest niedostępna, zatrzymaj się i napisz to w PR.
2. Z prawdziwych danych zapisz mały przypadek luki w `tests/fixtures/library/b01-gap-*.json` (nagrane odpowiedzi, kilka wskaźników; nie pełne pliki).
3. Popraw `buildAvailable` w `scripts/data/library-available.mjs` tak, żeby każdy plik wartości z jakąkolwiek daną trafiał do spisu (np. wskaźnik bez wpisu w indeksie albo z danymi tylko na poziomie, którego dziś nie liczymy). Nie zmieniaj formatu pliku (`version: 1`, pola `id,n,u,s,c,lv,y`).
4. Dodaj i wyeksportuj czystą funkcję `countGap(indexFile, valuesFiles)` zwracającą `{fetched, listed, missing: string[]}`; w workflow wypisz w „Podsumowaniu” linię „Pobrane: N · w spisie wyboru: M · brakuje: K” (K ma być 0).
5. Przebiegi (2 × 3 000 zapytań na dobę) i wagi działów z `config/library-priority.json` zostają bez zmian; sprawdź tylko, że zmiana workflow nie zmienia harmonogramu ani budżetu.
Gotowe, gdy:
- Test jednostkowy na fixture z prawdziwej luki: przed poprawką czerwony, po poprawce `missing` jest puste i `listed === fetched`.
- Test: wskaźnik z danymi tylko na poziomie województw (lub bez wpisu w indeksie, zależnie od ustalonej przyczyny) trafia do spisu z poprawnym `lv` i `y`.
- Test: `countGap` zwraca listę brakujących id, gdy plik wartości nie ma odpowiednika w spisie.
- Test: format wyjścia bez zmian (`version`, klucze, sortowanie po id, JSON bez wcięć); istniejący `library-available-script.test.ts` przechodzi bez zmian.
- Test: w `.github/workflows/fetch-library.yml` nadal jest `cron` dwa razy dziennie i `LIBRARY_BUDGET` 3000 (kontrola tekstu pliku).
Nie ruszaj: src/*, config/*, innych workflow, docs/STAN.md, package.json, pnpm-lock.yaml.
Po ludzku (do opisu PR):
- Co zrobiłeś: Naprawiłem robota, który buduje spis wskaźników do wyboru danych: teraz obejmuje wszystkie pobrane wskaźniki (brakowało 375).
- Co sprawdzić na podglądzie Vercel: Strony nie zmieniasz. Po scaleniu i najbliższym przebiegu w GitHub → Actions → „Fetch library” → Summary jest linia „Pobrane … w spisie … brakuje 0”. W wyborze danych (po B05) będzie ok. 2 436 zamiast 2 061 wskaźników.
- Czego nie zrobiłeś i dlaczego: Nie zmieniałem kolejki pobierania ani limitów (to zrobiło W22-U11) i nie wbudowywałem ręcznych wskaźników (decyzja P4 A).
Tytuł PR zaczyna się od `[W23-B01]`; gałąź `claude/W23-B01` od `origin/main`; opis ma „Po ludzku”; nie scalaj.
## PROMPT startowy dla podagenta (wklej w całości)
```
Jesteś podagentem zadania [W23-B01] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W23-B01-robot-spis-wyboru-bez-luki.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/PRODUKT.md (v4), docs/PLAN-DOCELOWY.md (§1 ekrany, §4 plan budowy), docs/PLAN-FALE-B.md, docs/research/u/WYTYCZNE.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: brak. Sprawdź w git log origin/main, że ich PR-y są scalone. Jeśli nie, zatrzymaj się i napisz to w odpowiedzi (nic nie zmieniaj).
3. Gałąź: git fetch origin && git checkout -b claude/W23-B01 origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo niejasny jest warunek: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (tylko usunięcia wymienione w „Usuń”). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W23-B01] Robot: spis wyboru bez luki 375 i kontrola przebiegu”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
