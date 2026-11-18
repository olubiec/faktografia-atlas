# PM14 – [WARUNKOWE: tylko jeśli PM20 tego wymaga] Tryb oszczędny mapy na słabych telefonach
Cel: Gdy telefon nie wyrabia z klatkami, mapa upraszcza dekoracje (przejścia kolorów, obrysy hover) i wraca do pełnej jakości, gdy wydajność się poprawi.
STATUS: **Puszczać tylko, gdy raport `docs/research/p-kamera-pomiar-po.md` (PM20) zaleca PM14** (p95 dojazdu z dławieniem ×4 nadal > 33 ms) **i właściciel potwierdzi (D6)**. Inaczej plik zostaje w poczekalni.
Zmieniaj: src/view/map/layers/choropleth.ts, src/view/map/AtlasMap.tsx, tests/unit/choropleth-lite.test.ts, tests/e2e/p-lite-mode.spec.ts
Wymagane: tests/unit/choropleth-lite.test.ts, tests/e2e/p-lite-mode.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/choropleth.spec.ts tests/e2e/color-transition.spec.ts tests/e2e/p-lite-mode.spec.ts
Przeczytaj najpierw: docs/research/p-kamera-pomiar-po.md (PM20 – rekomendacja), src/core/map/frame-budget.ts (PM01: `createFrameBudget`, `QualityLevel`), src/view/map/layers/choropleth.ts (`transitions`, `updateTriggers`, `selected-outline-layer` po QC302), src/view/map/AtlasMap.tsx (po PM10/QC403: gdzie jest pętla klatek), tests/unit/choropleth.test.ts, tests/unit/layer-registry.test.ts, tests/e2e/color-transition.spec.ts, docs/PRODUKT.md §5a

## Kontekst
Nawet po PM10 najsłabsze telefony mogą nie nadążać (deck.gl + 3 tys. gmin). Mechanizm zadziała tylko, jeśli pomiar to potwierdzi — dlatego zadanie jest warunkowe. Tryb oszczędny **nie zmienia wyglądu statycznego** (te same kolory, legenda, dane), tylko wyłącza animacje przejść koloru i obrys hover na czas, gdy `frame-budget` zgłasza `lite`.

## Research (10 min)
Zmierz na PF01 pod dławieniem ×4 koszt klatki z włączonymi i wyłączonymi `transitions` (eksperyment lokalny). Jeśli różnica < 10%, zatrzymaj się: tryb oszczędny nie pomoże — opisz w PR i nie wdrażaj.

## Zadanie
1. `choropleth.ts`: fabryka warstwy przyjmuje opcję `lite?: boolean`; przy `lite` `transitions` wyłączone (zmiana koloru natychmiast), bez zmiany `getFillColor`/legendy. Domyślnie `false` (zachowanie dzisiejsze).
2. `AtlasMap.tsx`: `createFrameBudget`, zasilany odstępami rAF **tylko w trakcie ruchu kamery**; poziom `lite` przekazywany do warstw; w trybie testowym `window.__atlas` nie jest zmieniany (poziom sprawdza się przez asercję na warstwach w teście jednostkowym).
3. Brak widocznego migotania: przełączenie `full ↔ lite` jest dozwolone tylko po zakończeniu ruchu.

## Testy
`choropleth-lite.test.ts`:
1. `lite: true` → warstwa nie ma `transitions.getFillColor`; `lite: false`/brak → ma, 300 ms jak dziś.
2. Kolory i klasy legendy identyczne w obu trybach dla tych samych danych.
`p-lite-mode.spec.ts` (`@P6`):
3. Przy dławieniu CPU ×6 i serii szybkich zmian wskaźnika/poziomu tryb przechodzi w `lite`, a po zatrzymaniu i bezczynności wraca do `full`.
4. Istniejące `choropleth.spec`, `color-transition.spec` zielone bez zmian (tryb `full` w CI).

## Gotowe, gdy
- Testy zielone; w opisie PR liczby p95 „przed/po” z PF01 dla scenariusza zmiany wskaźnika.
Nie ruszaj: `useMapViewState.ts`, `useChoropleth.ts`, `test-seam.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
