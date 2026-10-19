# Sesja CC6.4a – zamiana odpowiedzi BDL na pliki wartości (czysta logika)

Zadanie: CC6.4a – zamiana odpowiedzi BDL na pliki wartości (czysta logika)
Kontekst: strona czyta liczby tylko z public/data/values/<indicatorId>.json (kontrakt IndicatorValues, docs/MASTER_PLAN.md §4.5). Nagrane odpowiedzi /data/by-variable/<id>?unit-level=… są w tests/fixtures/bdl/recorded/. Tu powstaje tylko przekształcenie, bez sieci i bez CLI.
Zakres (tylko te pliki):

scripts/data/values.mjs (nowy): toIndicatorValues(indicator, pages, units) i nextPageUrl(page)
tests/unit/values.test.ts (nowy)
docs/sessions/CC6.4a.md

Warunki odbioru:

Wynik ma klucze TERYT (string) z units.json, przypisane przez bdlId; rekordy spoza units.json są pomijane i liczone w polu raportu skipped.
Brak wartości w roku = null, nigdy 0 (test na fixturze z brakami). years rosnąco, tablice wartości tej samej długości co years.
Rekordy ze wszystkich stron są łączone (test na fixturze wielostronicowej); nextPageUrl zwraca null na ostatniej stronie.
Wartości liczbowe bez zaokrąglania; liczby tylko z fixtur.
Nie zmieniasz config/indicators.json.

Zasady (obowiązują zawsze)

Przeczytaj AGENTS.md. Najpierw testy do warunków odbioru (pokaż, że nie przechodzą), potem kod.
Zmieniasz WYŁĄCZNIE pliki z listy „Zakres”. Nie zmieniasz istniejących testów, package.json, pnpm-lock.yaml, .github/, config/tokens.json, docs/STYL.md.
Bez sieci: testy i kod działają na plikach z repo (public/data, public/geo, tests/fixtures). Nie wywołuj API GUS, PRNG ani innych serwerów. Jeśli czegoś brakuje w danych, zatrzymaj się i napisz komentarz.
Gałąź: tylko git merge origin/main, bez rebase i bez --force. git diff --name-status --diff-filter=D origin/main...HEAD musi być puste.
Kolory, kroje, odstępy i czasy tylko z tokenów. Zero hexów i liczb wpisanych na sztywno w UI. Brak HTML w dymkach. Pola dotykowe min. 44 px. Animacje wyłączone przy prefers-reduced-motion.
Przed pushem osobno: pnpm lint, pnpm typecheck, pnpm test, pnpm build, pnpm test:e2e – wszystkie zielone. Nie uruchamiaj pnpm shots ani pnpm verify, nie commituj docs/shots/ ani wzorców zrzutów.
ZAKAZ PUSTYCH COMMITÓW: przed pushem git diff --stat origin/main...HEAD nie może być puste. Gdy odpowiadasz na uwagę, commit musi zmieniać pliki. Jeśli nie umiesz czegoś zrobić, NIE pushuj – napisz komentarz, co blokuje, i dostarcz mniejszą część.
Opis PR po polsku: co zmieniło się dla użytkownika; tabela „warunek → test”; lista plików; rozmiar paczki głównej (gzip) przed i po, jeśli zmieniasz src/; czego nie zrobiłeś i dlaczego. Na koniec zapisz treść zadania jako docs/sessions/.md.

Źródło: docs/PROMPTY.md (sekcja 6). Nagrania BDL są na main (PR #89).
