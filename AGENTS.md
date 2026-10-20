# Faktografia Atlas — zasady dla agentów

## Projekt
Publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS.
Właściciel nie czyta kodu: ocenia zachowanie na podglądzie Vercel, często z telefonu.
Plan: docs/MASTER_PLAN.md. **Co ma widzieć użytkownik, makiety i progi szybkości: docs/PRODUKT.md (pierwszeństwo).** Styl: docs/STYL.md + config/tokens.json. Stan: STAN_PROJEKTU.md.

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
- Wzorce zrzutów (`*-snapshots/`) powstają wyłącznie w CI (workflow „Update snapshots”, uruchamiany etykietą `aktualizuj-zrzuty` na PR), nie generuj ich ani nie edytuj u siebie. W PR napisz, że trzeba je odświeżyć.
- Pierwsza linia opisu PR: `Fixes #<numer zgłoszenia zadania>`, druga: `Zadanie: CCx.y`. Czerwone sprawdzenie `zasady-pr` czytaj dosłownie: komunikat mówi, co poprawić (brak ID, plik poza zakresem, plik zapalny bez przeglądu, nowa zależność).
- Pliki z `.github/zapalne.txt` zmieniaj tylko, gdy zadanie wprost tego wymaga; taki PR przejdzie dopiero po przeglądzie Sonneta (etykieta `sprawdzone`).
- Ostatni commit przed oddaniem musi zawierać aktualne pliki z `main`: zrób `git merge origin/main` i sprawdź, że `git diff --name-status --diff-filter=D origin/main...HEAD` jest puste (commit z nieaktualnej kopii roboczej kasuje cudze pliki).

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
- Nowa zależność spoza docs/MASTER_PLAN.md §6. Zmiana package.json lub pnpm-lock.yaml (nowy pakiet wymaga etykiety `nowa-zaleznosc` i uzasadnienia w PR).
- Zmiana config/tokens.json, docs/STYL.md, docs/MASTER_PLAN.md, .github/, istniejących testów
  lub wzorców zrzutów — chyba że zadanie wprost tego wymaga.
- Warunek odbioru niejasny lub sprzeczny.

## Nigdy
- Zmian w plikach ekranu (`src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/profile/ProfileSheet*.tsx`, `src/view/map/hooks/*`), jeśli zadanie wprost ich nie wymienia – ekran składa Sonnet.
- Importowania plików danych (`public/data/*.json`, `public/geo/*.json`) do kodu strony i pobierania wielu plików danych naraz, gdy wystarczy jeden (progi: docs/PRODUKT.md §7).
- Sekretów w kodzie, commitach, logach ani w zmiennych `VITE_*` (są publiczne w przeglądarce).
- Wywołań API GUS z kodu strony. Dane GUS pobiera wyłącznie robot w GitHub Actions do public/data.
- Osłabiania testów: skip/only, @ts-ignore, oxlint-disable, usuwania asercji.
- Wstawiania danych jako HTML (dangerouslySetInnerHTML, HTML w tooltipach deck.gl).
- Kodu generatora karuzel w tym repo (powstanie osobno, prywatnie).
