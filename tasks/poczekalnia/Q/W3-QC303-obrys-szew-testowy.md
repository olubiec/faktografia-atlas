# QC303 – `outlineOpacity` w szwie testowym i e2e „obrys gaśnie po oddaleniu”
Cel: Test e2e dowodzący, że obrys znika po oddaleniu i wraca po przybliżeniu (bez porównywania pikseli WebGL).
Zmieniaj: src/core/map/test-seam.ts, tests/e2e/q-outline.spec.ts
Wymagane: tests/e2e/q-outline.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-outline.spec.ts
Przeczytaj najpierw: src/core/map/test-seam.ts (`AtlasState`, `installAtlasSeam`), src/core/map/outline-visibility.ts, src/view/map/layers/choropleth.ts (po QC302), tests/unit/test-seam*.test.ts (jeśli są), tests/e2e/camera.spec.ts, tests/e2e/map-zoom-out.spec.ts, tests/e2e/helpers/

## Kontekst
AGENTS.md: mapę WebGL sprawdzasz przez stan w `window.__atlas` (tylko w trybie `?e2e`), nie przez piksele. Dodajemy pole `outlineOpacity`. `test-seam.ts` jest w `src/core` – to jedyny plik źródłowy do zmiany.

## Research
1. Sprawdź, **kto** wypełnia `AtlasState` (`getState` przekazywane do `installAtlasSeam` – prawdopodobnie `AtlasMap.tsx`). Jeśli aby `outlineOpacity` miało wartość, trzeba zmienić `AtlasMap.tsx` (plik ekranu) – **zatrzymaj się**, opisz w PR minimalną zmianę (1–3 linie) i poproś o zgodę. Jeśli da się policzyć w seamie z istniejących pól (`viewState`, `selected`, bbox z `camera`), policz tam.
2. Tryb testowy: szew aktywuje się tylko z `?e2e` – nie zmieniaj tego warunku.

## Zadanie
- Rozszerz `AtlasState` o opcjonalne `outlineOpacity?: number` (0–1), wystawiane razem z resztą; w trybie produkcyjnym (bez `?e2e`) nic nie jest instalowane (bez zmian).
- Napisz `tests/e2e/q-outline.spec.ts` (`@Q`).

## Testy
1. Wejście `/?e2e&u=<teryt gminy>` (gmina z fixture’ów) → po wczytaniu `__atlas.outlineOpacity === 1` (kamera dojechała do gminy).
2. Oddal do widoku kraju (kilka kroków klawiszem `-` albo kółkiem; poczekaj aż `__atlas.camera` zgłosi koniec ruchu) → `outlineOpacity === 0`; adres nadal ma `?u=` (wybór zostaje).
3. Przybliż z powrotem → `outlineOpacity === 1`.
4. Gdy nic nie wybrano → `outlineOpacity` jest `0` lub `undefined` (ustal i opisz w komentarzu testu).
5. `prefers-reduced-motion: reduce` – wartości końcowe takie same (bez animacji, `0`/`1` osiągnięte od razu).
6. Test jednostkowy typu (jeśli istnieje test seamu): `outlineOpacity` obecne w stanie, brak zmiany kształtu pozostałych pól.

## Gotowe, gdy
- E2E: wybór gminy → oddalenie do kraju → `outlineOpacity = 0`; przybliżenie → 1; istniejące testy seamu bez zmian.
Nie ruszaj: `AtlasMap.tsx` bez zgody, warstw, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
