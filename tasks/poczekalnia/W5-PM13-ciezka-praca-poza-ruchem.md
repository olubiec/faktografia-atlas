# PM13 – Ciężka praca poza ruchem: miejscowości doczytują się po zatrzymaniu kamery
Cel: Pobranie i budowa warstwy miejscowości nie rusza w trakcie animacji kamery, tylko tuż po jej zakończeniu.
Zmieniaj: src/view/map/hooks/useMapViewState.ts, tests/unit/map-defer-localities.test.tsx
Wymagane: tests/unit/map-defer-localities.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/localities-map.spec.ts tests/e2e/localities-search.spec.ts tests/e2e/camera.spec.ts
Przeczytaj najpierw: src/core/map/defer-queue.ts (PM01), src/core/map/frame-stats.ts, docs/research/p-kamera-pomiar-telefon.md (PF01) i raport „po” z PM20 (jeśli już jest), src/view/map/hooks/useMapViewState.ts (po PM10 i QC404: efekt `if (currentViewState.zoom >= 8.5) loadLocalities()`; sterownik kamery), src/core/search/load-localities.ts (rozmiar pliku `localities.json`, pamięć), tests/e2e/localities-map.spec.ts, docs/PRODUKT.md §7

## Kontekst
W `useMapViewState` pobranie `localities.json` (duży plik) startuje, gdy zoom przekroczy 8,5 — czyli **w środku** animacji przybliżania, w klatkach, które i tak są najdroższe na telefonie. Kolejka odroczeń z PM01 pozwala wstrzymać taką pracę na czas ruchu. To zadanie jest w fali 5, bo `useMapViewState.ts` należy wcześniej do PM10 (fala 3) i QC404 (fala 4).

## Research (10 min)
1. Zmierz (PF01) czas głównego wątku: ile trwa `loadLocalities().then(setLocalities)` (parsowanie + `setLocalities` + przebudowa warstwy). Liczby do opisu PR.
2. Sprawdź, czy wejście przez link z `?u=` miejscowością (`localityTargetRef`) nadal ładuje miejscowości od razu (bez czekania na ruch, którego nie ma).

## Zadanie
W `useMapViewState.ts`: utwórz `createDeferQueue` (jedna na hook); informuj ją o ruchu (`setMoving(true)` przy starcie animacji lub gestu użytkownika, `setMoving(false)` przy `onSettled`/końcu gestu); ładowanie miejscowości zgłaszaj przez `queue.run('localities', …)`. Brak ruchu → ładowanie natychmiast (zachowanie jak dziś). `prefers-reduced-motion` → natychmiast.

## Testy (`tests/unit/map-defer-localities.test.tsx`, atrapa `loadLocalities` i sztuczny zegar)
1. Zoom przekracza 8,5 w trakcie ruchu → `loadLocalities` **nie** jest wołane, dopóki ruch trwa.
2. Po zakończeniu ruchu i `settleMs` → wołane dokładnie raz.
3. Zoom przekracza 8,5 bez ruchu (ustawienie z adresu) → wołane od razu.
4. Wielokrotne przekroczenie progu w jednym ruchu → jedno wywołanie.
5. Istniejące e2e z linii „Weryfikacja” zielone; miejscowości pojawiają się na mapie po przybliżeniu (jak dotąd).

## Gotowe, gdy
- Testy zielone; w opisie PR liczba klatek > 33 ms w dojeździe do zoomu ≥ 9 „przed/po” (z narzędzia PF01).
Nie ruszaj: `AtlasMap.tsx`, `defer-queue.ts`, `load-localities.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
