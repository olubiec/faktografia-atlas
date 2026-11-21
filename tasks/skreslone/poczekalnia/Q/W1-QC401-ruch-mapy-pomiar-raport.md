# QC401 – Pomiar ruchu mapy (RAPORT, bez zmian w kodzie aplikacji)
Cel: Ustalić dowodami, które ruchy mapy są płynne, które skaczą i dlaczego – zanim ktokolwiek zmieni AtlasMap.
Zmieniaj: docs/research/q-c401-ruch-mapy.md
Wymagane: docs/research/q-c401-ruch-mapy.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm build
Przeczytaj najpierw: src/view/map/AtlasMap.tsx, src/view/map/hooks/useMapViewState.ts, src/view/map/hooks/useChoropleth.ts, src/core/map/camera.ts, src/core/map/test-seam.ts, src/core/map/reveal.ts, tests/e2e/camera.spec.ts, tests/e2e/map-zoom-out.spec.ts, tests/e2e/color-transition.spec.ts, docs/PRODUKT.md §5a

## Kontekst
Właściciel: „Powolnych przybliżeń i oddaleń brak, tak samo animacji”. Hipoteza: mapa jest sterowana (`{...currentViewState}` + `onMove`), animacja kamery działa tylko przy wyborze miejsca, a `onMove` ignoruje ruchy bez przeciągania podczas animacji, więc kółko/pinch skaczą. Zadania QC402–QC406 naprawiają to **według tego raportu** – raport ma wskazać konkretne linie i mechanizmy.

## Research / metoda (cała praca w tym zadaniu)
1. Zbuduj aplikację (`pnpm build`) i uruchom podgląd (`pnpm preview`), wejdź z `?e2e` (szew `window.__atlas`: `viewState`, `camera`, `reveal`, `choropleth`).
2. Napisz **jednorazowy skrypt Playwright poza repozytorium** (w katalogu scratchpad; nie commituj go, a jego treść wklej do raportu jako dodatek). Chromium i Playwright są wstępnie zainstalowane (`require('playwright')`; bez `playwright install`). Skrypt co ~16 ms próbkuje `window.__atlas.viewState.zoom/longitude/latitude` i zapisuje listę (czas, zoom, lon, lat).
3. Zmierz dla **każdego** ruchu liczbę unikalnych pośrednich wartości zoomu/pozycji i czas trwania: (a) kliknięcie w województwo, (b) kółko myszy ×3 notchy (`page.mouse.wheel`), (c) pinch (emulacja dwoma `touch` – CDP `Input.dispatchTouchEvent` lub `page.touchscreen` + dwa punkty; jeśli nie da się wiarygodnie, opisz ograniczenie), (d) klawisze `+`/`-`, (e) okruszki, (f) „Wróć”, (g) wybór miejsca z wyszukiwarki, (h) zmiana wskaźnika (kolory – próbkuj `__atlas.reveal.progress` i `choropleth`), (i) wejście w powiat (kafelki – `reveal`).
4. Każdy pomiar powtórz 3 razy; podaj medianę. Zmierz też z `prefers-reduced-motion: reduce` (`page.emulateMedia`).
5. Dla każdego ruchu, który **nie** jest płynny, znajdź w kodzie przyczynę (plik:linia) – np. `onMove` odrzuca zdarzenia, brak `easing`, stan ustawiany bez animacji, `essential:false`. Sprawdź w dokumentacji MapLibre (`AnimationOptions`, `easeTo`, `scrollZoom`, `touchZoomRotate`) co jest domyślne i czy kontrolowany `viewState` je nadpisuje. Źródła: `docs/INSPIRACJE.md` zawiera zweryfikowany wpis MapLibre (kamera) – cytuj go.
6. Sprawdź też, czy w CI/podglądzie WebGL działa programowo (SwiftShader) – jeśli klatki w headless są sztucznie rzadkie, zaznacz to w raporcie (pomiar względny, nie bezwzględny).

## Zadanie – plik `docs/research/q-c401-ruch-mapy.md`
Struktura (po polsku):
1. **Metoda** (jak mierzono, wersje, ograniczenia).
2. **Tabela wyników:** ruch · liczba pośrednich klatek · czas ms · reduced-motion · werdykt (działa / nie działa) · przyczyna (plik:linia).
3. **Rekomendacje dla QC402 (kółko/pinch), QC403 (+/−), QC404 (wejście w głąb/powrót), QC405 (kafelki i kolory)** – konkretne zmiany, kolejność, ryzyka (np. „nie ignoruj `onMove` bez przeciągania”).
4. **Dodatek:** pełny skrypt pomiarowy.
Plik < 250 linii. Bez zmian w `src/`.

## Gotowe, gdy
- Raport zawiera tabelę dla co najmniej 8 ruchów z liczbami i przyczynami z numerami linii; rekomendacje do QC402–QC405; `git diff --name-only` pokazuje wyłącznie ten plik.
Nie ruszaj: żadnych plików w `src/` ani `tests/`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
