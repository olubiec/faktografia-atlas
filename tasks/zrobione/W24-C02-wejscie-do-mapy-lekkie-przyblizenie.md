# C02 – Wejście z `/` do mapy: lekkie przybliżenie zamiast „zamknij i otwórz”
Fala pliku: W24 (etap C). Fala budowy: 1 z 4. Zależy od: nic. Równolegle z: C01, C03.
Cel: Po „Otwórz mapę” ekran startowy płynnie, lekko przybliża się w kierunku mapy i przechodzi w nią bez pustej klatki i bez osobnej animacji zamykania poprzedzającej otwarcie.
Zmieniaj: src/view/start/StartPage.tsx, src/view/start/StartBackground.tsx, src/styles/global.css, tests/unit/c02-enter-map.test.tsx, tests/e2e/c02-enter-map.spec.ts
Wymagane: tests/unit/c02-enter-map.test.tsx, tests/e2e/c02-enter-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§8 Ruch, §12 „jedna animacja wejścia”), docs/research/p-animacja-kamery.md (§1 objawy), src/view/start/StartPage.tsx, StartBackground.tsx (prop `leaving`), config/tokens.json (`motion`), dokumentacja React Router `viewTransition` (zainstalowany `react-router` ^8.5)
Diagnoza (21.11.2026): dziś `openMap` ustawia `leaving`, obrys powiększa się 2,4× i znika przez `motion.cameraIn` (600 ms), dopiero wtedy `navigate('/mapa')`, a prawdziwa mapa dopiero się ładuje. Efekt: najpierw zamyka się animowana mapa z ekranu startowego, potem otwiera się właściwa.
Zadanie:
1. `StartPage.openMap`: usuń `setTimeout`/stan `leaving`; nawiguj od razu `navigate(to('/mapa'), { viewTransition: true })` (Link: prop `viewTransition`). Klawisze modyfikujące, środkowy przycisk i `prefers-reduced-motion`: zwykła nawigacja bez animacji (jak dziś).
2. `global.css`: przejście widoku tylko dla trasy `/` → `/mapa`: stary widok (ekran startowy) powiększa się najwyżej do 1,06 i zanika, nowy (mapa) zanika z 0 do 1 z początkowym 0,97 (łagodnie, lekko „do mapy”); czas i krzywa z tokenów `motion` (`cameraIn`, `easing`); żadnego innego przejścia na innych trasach. Przy `prefers-reduced-motion: reduce` brak animacji.
3. `StartBackground`: usuń prop `leaving` i skalę 2,4× (obrys nie ma własnej animacji wyjścia; robi to przejście widoku). Przeglądarka bez View Transitions API: nawigacja natychmiast, bez animacji.
4. Jeśli mapa po przejściu pokazuje pusty/biały kadr (dane i kafle jeszcze się ładują), zatrzymaj się i opisz w PR dokładnie, który plik ekranu (`Home.tsx`, `AtlasMap.tsx`, `src/view/map/hooks/*`) trzeba zmienić; właściciel poda zgodę. Nie zmieniaj ich bez niej.
Gotowe, gdy:
- Test jednostkowy/komponentu: kliknięcie „Otwórz mapę” wywołuje `navigate` natychmiast (bez timera) z `viewTransition: true`; z klawiszem modyfikującym i przy reduced-motion: zwykły link bez opcji.
- Test jednostkowy: żaden styl w `StartBackground` nie ma skali > 1,1; w `global.css` skala przejścia ≤ 1,06 i czas pochodzi z tokenu (test odczytuje plik).
- Test e2e (390 i 1280 px): po kliknięciu „Otwórz mapę” adres to `/mapa` w czasie < 300 ms (bez czekania 600 ms) i mapa się rysuje (`window.__atlas` gotowe); w trybie `reducedMotion` natychmiast.
- Test e2e: w trakcie przejścia nie istnieje element `[data-slot="start-background"]` o skali > 1,1 (zrzut stanu kilku klatek przez `getComputedStyle`).
- Na podglądzie Vercel (właściciel, telefon): płynne, lekkie przybliżenie bez „zamknięcia” obrysu; zapisz w PR wynik oglądu na telefonie lub że nie zdążono.
Nie ruszaj: src/view/Home.tsx, src/view/map/*, src/core/start/*, config/tokens.json, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: „Otwórz mapę” nie zamyka już animowanego obrysu, żeby potem otworzyć mapę. Ekran lekko się przybliża i od razu przechodzi w mapę.
- Co sprawdzić na podglądzie Vercel: `/` na telefonie: „Otwórz mapę” (czy przejście jest płynne i nie ma pustego ekranu); na komputerze to samo; z włączonym „ogranicz ruch” bez animacji.
- Czego nie zrobiłeś i dlaczego: Nie zmieniałem samej mapy; jeśli puste kadry wynikają z ładowania mapy, opisałem to w PR.
Tytuł PR zaczyna się od `[W24-C02]`; gałąź `claude/W24-C02` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C02.
