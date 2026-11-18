# QC403 – Przyciski „+ / −” na mapie (płynne przybliżenie ok. 300 ms)
> **KOREKTA 18.11.2026:** zadanie przeniesione z fali 3 do fali 4 (po `W3-PM10`, które przepisuje te same pliki ekranu). Użyj `useImperativeCamera` (PM02) i `zoomStepTarget` zamiast własnej animacji; numery linii z raportu QC401 są nieaktualne – czytaj kod po PM10. **[CZEKA NA ZGODĘ D4]**
Cel: Widoczne przyciski przybliż/oddal, które działają płynnie, mają 44 px i etykiety.
Zmieniaj: src/view/map/ZoomButtons.tsx, src/view/map/AtlasMap.tsx, tests/unit/zoom-buttons.test.tsx
Wymagane: tests/unit/zoom-buttons.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/map/AtlasMap.tsx (jak wywoływane `animateToView`; po QC402), src/view/map/hooks/useMapViewState.ts (obsługa klawiszy `+`/`-`, `cameraTransition`), src/core/map/camera.ts, src/view/map/BackButton.tsx (styl istniejącego przycisku na mapie), src/view/ui/Icon.tsx, docs/STYL.md

## Zgoda na plik ekranu
Ten prompt **wprost** pozwala dodać w `AtlasMap.tsx` **jedną linię wpięcia** `<ZoomButtons … />` (i ewentualnie jeden prop/ref potrzebny do zoomu). Innych zmian w `AtlasMap.tsx` nie rób.

## Kontekst
Poza kółkiem i gestami potrzebne są przyciski (telefon, dostępność). Ruch ma być taki jak reszta kamery: ok. 300 ms, a przy `prefers-reduced-motion` natychmiast.

## Research
1. Sprawdź, czy mapa ma już kontrolki nawigacji MapLibre (`NavigationControl`) – jeśli tak, **nie dubluj**: własny komponent zastępuje je tylko, gdy da się je wyłączyć bez zmian w innych miejscach (opisz decyzję w PR).
2. `useMapViewState`: znajdź funkcję zmiany zoomu z klawiatury i **użyj tej samej drogi** (żeby `__atlas.viewState` i animacje były spójne).
3. Pozycja przycisków: nie może zasłaniać legendy ani przycisku „Wróć”/arkusza na telefonie – sprawdź `sheetInset.ts` (odsunięcie od arkusza).

## Zadanie
`src/view/map/ZoomButtons.tsx`:
- Props: `{ onZoom: (delta: 1 | -1) => void; canZoomIn?: boolean; canZoomOut?: boolean }`.
- Dwa przyciski „Przybliż” (+) i „Oddal” (−): `aria-label`, `title`, ≥ 44×44 px, ikony `Icon`, tokeny, grupa `role="group"` z nazwą „Powiększenie mapy”.
- Wyłączone (`disabled`), gdy `canZoomIn/Out === false` (granice zoomu).
- Wpięcie w `AtlasMap.tsx` jedną linią; `onZoom` → istniejąca funkcja zoomu z `useMapViewState` (zmiana o 1 poziom, ok. 300 ms, `easing` jak w kamerze, reduced-motion → 0 ms).

## Testy (`tests/unit/zoom-buttons.test.tsx`, plus 1 e2e jeśli prosty – opcjonalnie w `tests/e2e/q-zoom-smooth.spec.ts` NIE edytuj; ewentualny nowy test dopisz w pliku jednostkowym)
1. Klik „Przybliż” woła `onZoom(1)`, „Oddal” → `onZoom(-1)`.
2. `canZoomIn={false}` → przycisk `disabled`, klik nic nie woła.
3. Oba przyciski mają nazwy dostępne i rozmiar ≥ 44 px.
4. Grupa ma `aria-label="Powiększenie mapy"`.
5. Obsługa klawiatury: Enter/Spację uruchamiają przycisk (natywny `button`).
6. Test integracyjny (jeśli ścieżka zoomu wydzielona jako czysta funkcja): wywołanie zoomu o 1 daje `cameraTransition` z `duration ≈ 300` i `0` przy reduced-motion – użyj istniejącego `tests/unit/camera.test.ts` jako wzoru, **nie zmieniaj** go.

## Gotowe, gdy
- Klik zmienia zoom o 1 przez kilka klatek (e2e z `__atlas.viewState` jeśli da się lekko; inaczej wynik jednostkowy + opis w PR); reduced-motion od razu; ≥ 44 px.
Nie ruszaj: `Home.tsx`, `ProfileSheet*.tsx`, innych `map/hooks/*`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
