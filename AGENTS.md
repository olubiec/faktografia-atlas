# Zasady dla agentów – Faktografia Atlas
Co budujemy: docs/PRODUKT.md (przy ekranach ma pierwszeństwo) · Gdzie jesteśmy: docs/STAN.md · Wygląd: docs/STYL.md · Katalog paczek i dane: docs/MASTER_PLAN.md

Publiczna strona z interaktywną mapą Polski (województwo > powiat > gmina > miejscowość) i danymi GUS.
Właściciel nie czyta kodu: ocenia zachowanie na podglądzie Vercel, często z telefonu.
Stos: Vite + React + TypeScript (strict), pnpm, Tailwind v4 (tokeny w @theme), Vitest, Playwright.

## Polecenia
- Instalacja: `pnpm install`
- Przed PR uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`
- Szybkie testy jednostkowe: `pnpm test`. Skrót `pnpm verify` robi to samo i dodatkowo zrzuty (`pnpm shots`).

## Jak pracujesz
- Jedno zadanie = jeden PR. Zmieniaj tylko pliki z linii „Pliki:” z promptu. Musisz zmienić inny → napisz w PR dlaczego.
- Najpierw testy z warunków „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”).
  Nie wyłączaj testów, reguł lintera ani typów, żeby przeszło (wyjątek: test pomijany z powodu środowiska – z komentarzem dlaczego).
- Czerwone testy na GitHubie – popraw sam.
- Aktualizacja gałęzi: TYLKO `git merge origin/main`. Bez rebase, bez zakładania gałęzi od nowa, bez `--force`.
- Przed każdym pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste: nie usuwasz nic, co jest na main (chyba że prompt wprost to nakazuje).
- Nowy pakiet: napisz w PR nazwę, link do npm i do repozytorium, datę wydania, pobrania tygodniowo i po co. Nie wymyślaj nazw – sprawdź w rejestrze. Pakiet spoza `docs/MASTER_PLAN.md` §6 → opisz w PR i zatrzymaj się na decyzję właściciela.
- Wzorce zrzutów (`*-snapshots/`) powstają wyłącznie w CI przez workflow „Update snapshots” (uruchamia go właściciel). Nie generuj ich u siebie; w PR napisz, że trzeba je odświeżyć.
- Uwagi CodeRabbit o błędach poprawiasz; z uwagą o stylu możesz się nie zgodzić – napisz dlaczego.
- Nie edytuj `docs/STAN.md`, `package.json` ani `pnpm-lock.yaml`, chyba że prompt wprost na to pozwala (STAN.md zmienia ostatni prompt sesji).
- Opis PR zawsze z sekcją „Po ludzku” (dla osoby, która nie programuje): co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego.

## Nigdy
- Tajnych kluczy i haseł w kodzie, testach, commitach, logach. Zmienne `VITE_*` są publiczne w przeglądarce – dozwolone tylko klucze publiczne z założenia (np. klucz projektu PostHog).
- Wstawiania danych jako HTML (`dangerouslySetInnerHTML`, HTML w tooltipach deck.gl).
- Zmian w `.github/workflows/` bez prośby w zadaniu.
- Osłabiania testów: `skip`/`only` bez powodu środowiskowego, `@ts-ignore`, `oxlint-disable`, usuwania asercji.
- Pakietu, którego istnienia nie sprawdziłeś w rejestrze (modele AI wymyślają nazwy pakietów).

## Zasady projektu
Najpierw zapytaj (napisz w PR i zatrzymaj się):
- Zmiana `config/tokens.json`, `docs/STYL.md`, `docs/MASTER_PLAN.md` albo istniejących testów i wzorców zrzutów – chyba że prompt wprost tego wymaga.
- Zmiana konfiguracji (`vercel.json`, `.gitleaks.toml`, `.oxlintrc.json`, `vite/vitest/playwright.config.ts`), `src/core/consent`, `src/view/consent`, `scripts/data`, `config/*` – jeśli prompt o to nie prosi.
- Warunek niejasny lub sprzeczny. Zmiana architektury lub struktury danych. Usunięcie funkcji.

Zawsze:
- src/core = czysta logika testowana w Vitest; src/view = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii.
- Kolory, kroje, rozmiary tekstu, odstępy i czasy wyłącznie z tokenów (klasy Tailwind z @theme). Zero wartości wpisanych na sztywno (test `no-hardcoded-colors` to pilnuje). Logo tylko z `public/brand/`.
- Kody TERYT jako string. Liczby wyłącznie z `public/data` (generowane skryptami).
- Testy na danych z `tests/fixtures` (nagrane prawdziwe odpowiedzi), nigdy z sieci. Testy e2e danej sesji mają w nazwie `@S<n>`.
- Zrzuty pikselowe (`toHaveScreenshot`) tylko dla elementów DOM i SVG. Mapę WebGL sprawdzasz przez stan wystawiony w `window.__atlas` (tylko w trybie testowym), nie przez piksele.
- Napisy nie wychodzą poza pola. Animacje wyłączone przy `prefers-reduced-motion`. Pola dotykowe min. 44 px.
- Repozytoria referencyjne tylko w /tmp/ref; przy zaadaptowanym kodzie komentarz: źródło i licencja.
- Po `shadcn add` zamień ikony lucide na iconoir-react (Icon z src/view/ui) i usuń klasy shadow-*, rounded-*, backdrop-blur.

Nigdy:
- Zmian w plikach ekranu (`src/view/Home.tsx`, `src/view/map/AtlasMap.tsx`, `src/view/profile/ProfileSheet*.tsx`, `src/view/map/hooks/*`), jeśli prompt wprost ich nie wymienia.
- Importowania plików danych (`public/data/*.json`, `public/geo/*.json`) do kodu strony ani pobierania wielu plików danych naraz, gdy wystarczy jeden (progi: docs/PRODUKT.md §7).
- Wywołań API GUS z kodu strony. Dane GUS pobiera wyłącznie robot w GitHub Actions do `public/data`.
- Kodu generatora karuzel w tym repo (powstanie osobno, prywatnie).

## Błędy powtarzalne (dopisywane po sesjach)
- Jules wysyłał PR-y, które usuwały pliki z main (budowa gałęzi od nowa) → tylko `git merge origin/main` + kontrola `--diff-filter=D` (zasada wyżej).
- Profil czytał adres po swojemu (własny `popstate`) i wybierał jednostkę sztucznym zdarzeniem → stan wskaźnika, roku i wybranej jednostki bierzesz z `useMainView` / `useMapSelection` (przekazany propsami z `AtlasMap`), nie tworzysz drugiego.
- Zmieniano istniejące testy, żeby przeszły (np. „1 zakreślenie” → „2”) → istniejącego testu nie zmieniasz; jeśli przeszkadza, opisz w PR i zatrzymaj się.
