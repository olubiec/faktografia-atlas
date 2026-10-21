# Zasady dla agentów – Faktografia Atlas
Stan projektu: docs/STAN.md · Wygląd (zmiany UI): docs/STYL.md · Proces: docs/WORKFLOW.md · Co widzi użytkownik: docs/PRODUKT.md (pierwszeństwo) · Plan produktu: docs/MASTER_PLAN.md

## Projekt
Publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS.
Właściciel nie czyta kodu: ocenia zachowanie na podglądzie Vercel, często z telefonu.
Stos: Vite + React + TypeScript (strict), pnpm, Tailwind v4 (tokeny w @theme), Vitest, Playwright.

## Polecenia
- Instalacja: `pnpm install`
- Pełne sprawdzenie (uruchom przed otwarciem PR):
  `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`
  (skrót `pnpm verify` dodatkowo robi zrzuty `pnpm shots` – w CI robi to `verify` przez te same kroki)
- Szybkie testy jednostkowe: `pnpm test`

## Jak pracujesz
- Jedno zadanie = jeden PR. Tytuł PR: `Sx.y – <tytuł>` (albo `CCx.y – <tytuł>` dla zadań z poprzedniego planu). W opisie: `Closes #<nr Issue>` (GitHub rozumie tylko angielskie słowa: Closes / Fixes / Resolves).
- Zmieniasz tylko pliki z linii `Dotyczy:` (albo „Zakresu”). Musisz zmienić inny → napisz w PR dlaczego.
- Najpierw testy z warunków odbioru, potem kod. Każdy warunek = co najmniej jeden test, który sprawdza zachowanie (nie tylko „renderuje się”). Testy e2e sesji mają w nazwie `@S<n>`.
- Aktualizacja gałęzi: TYLKO `git merge origin/main`. Bez rebase, bez zakładania gałęzi od nowa, bez `--force`.
- Przed każdym pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste: nie usuwasz nic, co jest na main (chyba że zadanie wprost to nakazuje). Commit z nieaktualnej kopii kasuje cudze pliki – tak już się zdarzyło.
- Nie wyłączasz testów, reguł lintera ani typów, żeby przeszło. Nie osłabiasz asercji.
- Czerwone sprawdzenie `zgody` to nie błąd do naprawy – czeka na decyzję właściciela lub Audytora. Niczego nie zmieniaj z jego powodu.
- Wzorce zrzutów (`*-snapshots/`) powstają wyłącznie w CI przez workflow „Update snapshots” (etykieta `aktualizuj-zrzuty` na PR). Nie generuj ich ani nie edytuj u siebie; w PR napisz, że trzeba je odświeżyć.
- Uwagi CodeRabbit o błędach poprawiasz; z uwagą o stylu możesz się nie zgodzić – napisz dlaczego.
- Na końcu zapisz treść zadania jako `docs/sessions/<ID>.md`. Nie edytuj `docs/STAN.md` ani `package.json` / `pnpm-lock.yaml`, chyba że zadanie wprost na to pozwala.

## Najpierw zapytaj (napisz w PR i zatrzymaj się)
- Nowy pakiet: podaj nazwę, link do rejestru npm i do repozytorium, datę wydania, pobrania tygodniowo. Właściciel doda etykietę `nowa-zaleznosc`. Pakiet spoza `docs/MASTER_PLAN.md` §6 – tak samo.
- Zmiana pliku z `.github/krytyczne.txt`, jeśli zadanie o nią nie prosi.
- Zmiana config/tokens.json, docs/STYL.md, docs/MASTER_PLAN.md lub istniejących testów i wzorców zrzutów – chyba że zadanie wprost tego wymaga.
- Warunek odbioru niejasny lub sprzeczny. Zmiana architektury lub struktury danych. Usunięcie funkcji.

## Zawsze
- src/core = czysta logika testowana w Vitest; src/view = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii.
- Kolory, kroje, rozmiary tekstu, odstępy i czasy wyłącznie z tokenów (klasy Tailwind z @theme). Zero wartości wpisanych na sztywno (test `no-hardcoded-colors` to pilnuje). Logo tylko z `public/brand/`.
- Kody TERYT jako string. Liczby wyłącznie z `public/data` (generowane skryptami).
- Testy na danych z `tests/fixtures` (nagrane prawdziwe odpowiedzi), nigdy z sieci.
- Zrzuty pikselowe (`toHaveScreenshot`) tylko dla elementów DOM i SVG. Mapę WebGL sprawdzasz przez stan wystawiony w `window.__atlas` (tylko w trybie testowym), nie przez piksele.
- Napisy nie wychodzą poza pola. Animacje wyłączone przy `prefers-reduced-motion`. Pola dotykowe min. 44 px.
- Repozytoria referencyjne tylko w /tmp/ref; przy zaadaptowanym kodzie komentarz: źródło i licencja.
- Po `shadcn add` zamień ikony lucide na iconoir-react (Icon z src/view/ui) i usuń klasy shadow-*, rounded-*, backdrop-blur.

## Nigdy
- Zmian w plikach ekranu (`src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/profile/ProfileSheet*.tsx`, `src/view/map/hooks/*`), jeśli zadanie wprost ich nie wymienia.
- Importowania plików danych (`public/data/*.json`, `public/geo/*.json`) do kodu strony ani pobierania wielu plików danych naraz, gdy wystarczy jeden (progi: docs/PRODUKT.md §7).
- Sekretów w kodzie, commitach, logach ani w zmiennych `VITE_*` (są publiczne w przeglądarce).
- Wywołań API GUS z kodu strony. Dane GUS pobiera wyłącznie robot w GitHub Actions do `public/data`.
- Osłabiania testów: skip/only, `@ts-ignore`, `oxlint-disable`, usuwania asercji.
- Wstawiania danych jako HTML (`dangerouslySetInnerHTML`, HTML w tooltipach deck.gl).
- Pakietu, którego istnienia nie sprawdziłeś w rejestrze (modele AI wymyślają nazwy pakietów).
- Kodu generatora karuzel w tym repo (powstanie osobno, prywatnie).

## Błędy powtarzalne (dopisuje Architekt po sesji)
- 21.10.2026 · Jules wysyłał PR-y, które usuwały pliki z main (budowa gałęzi od nowa) → tylko `git merge origin/main` + kontrola `--diff-filter=D` (zasada wyżej).
