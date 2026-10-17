# Faktografia Atlas — zasady dla agentów

## Projekt
Publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS.
Właściciel nie czyta kodu: ocenia zachowanie na podglądzie Vercel, często z telefonu.
Plan: docs/MASTER_PLAN.md. Styl: docs/STYL.md + config/tokens.json. Stan: STAN_PROJEKTU.md.

## Polecenia
- `pnpm install`
- `pnpm verify` — pełna weryfikacja, musi przejść przed PR
- `pnpm test` — szybkie testy jednostkowe

## Definicja „gotowe”
1. Najpierw testy dla warunków odbioru z zadania; pokaż, że nie przechodzą.
2. Potem implementacja, aż `pnpm verify` przejdzie.
3. Opis PR po polsku, prosto: co zmieniło się dla użytkownika; tabela „warunek odbioru → test lub zrzut”;
   lista zmienionych plików; czego nie zrobiłeś i dlaczego. Przy zmianach w UI: lista kontrolna z docs/STYL.md §12.
4. Na koniec zapisz treść zadania jako docs/sessions/<ID>.md. NIE edytuj STAN_PROJEKTU.md, package.json ani pnpm-lock.yaml (chyba że zadanie wprost na to pozwala) — STAN aktualizuje przegląd końca sesji.

## Gałąź i PR
- Jedna gałąź od aktualnego `main`. Aktualizacja do main: TYLKO `git merge origin/main`. Bez rebase, bez zakładania gałęzi od nowa, bez `--force`.
- Przed każdym pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste: nie usuwasz niczego, co jest na main (chyba że zadanie wprost to nakazuje).
- Zmieniasz tylko pliki z „Zakresu” zadania.
- Wzorce zrzutów (`*-snapshots/`) powstają wyłącznie w CI: dodaj do PR etykietę `aktualizuj-zrzuty` (robi to właściciel), nie generuj ich u siebie.

## Zawsze
- Stos: Vite + React + TypeScript strict, pnpm. Biblioteki z docs/MASTER_PLAN.md §6.
  Przed użyciem biblioteki przeczytaj jej typy w node_modules.
- src/core = czysta logika testowana w Vitest; src/view = React. Nazwy po angielsku, komentarze po polsku,
  pliki do ok. 200 linii.
- Kolory, kroje, rozmiary tekstu, odstępy i czasy wyłącznie z tokenów (klasy Tailwind z @theme).
  Zero wartości wpisanych na sztywno. Logo tylko z public/brand/.
- Kody TERYT jako string. Liczby wyłącznie z public/data (generowane skryptami).
- Testy na danych z tests/fixtures (nagrane prawdziwe odpowiedzi), nigdy z sieci.
- Zrzuty pikselowe (toHaveScreenshot) tylko dla elementów DOM i SVG. Mapę WebGL sprawdzaj przez stan
  wystawiony w `window.__atlas` (tylko w trybie testowym), nie przez piksele.
- Napisy nie wychodzą poza pola. Animacje wyłączone przy prefers-reduced-motion. Pola dotykowe min. 44 px.
- Repozytoria referencyjne tylko w /tmp/ref; przy zaadaptowanym kodzie komentarz: źródło i licencja.
- Zmieniaj tylko pliki potrzebne do zadania.
- Po `shadcn add` zamień wszystkie ikony lucide na iconoir-react (Icon z src/view/ui) i usuń klasy shadow-*, rounded-*, backdrop-blur.

## Najpierw zapytaj (napisz w PR i zatrzymaj się)
- Nowa zależność spoza docs/MASTER_PLAN.md §6. Zmiana package.json lub pnpm-lock.yaml.
- Zmiana config/tokens.json, docs/STYL.md, docs/MASTER_PLAN.md, .github/, istniejących testów
  lub wzorców zrzutów — chyba że zadanie wprost tego wymaga.
- Warunek odbioru niejasny lub sprzeczny.

## Nigdy
- Sekretów w kodzie, commitach, logach ani w zmiennych `VITE_*` (są publiczne w przeglądarce).
- Wywołań API GUS z kodu strony. Dane GUS pobiera wyłącznie robot w GitHub Actions do public/data.
- Osłabiania testów: skip/only, @ts-ignore, oxlint-disable, usuwania asercji.
- Wstawiania danych jako HTML (dangerouslySetInnerHTML, HTML w tooltipach deck.gl).
- Kodu generatora karuzel w tym repo (powstanie osobno, prywatnie).
