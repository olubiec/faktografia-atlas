# QC402 – Płynne przybliżanie i oddalanie kółkiem myszy i gestem dwóch palców
> **KOREKTA 18.11.2026 (docs/PLAN-POPRAWEK.md): NIE PUSZCZAĆ.** Treść (naprawa `onMove`, test kółka i palców w trakcie animacji) wchodzi do zadania `W3-PM10-kamera-bez-stanu-reacta.md`, bo oba zadania zmieniają te same pliki ekranu.
Cel: Jeden ruch kółkiem lub gestem pinch daje wiele pośrednich klatek zoomu (bez skoków).
Zmieniaj: src/view/map/AtlasMap.tsx, src/view/map/hooks/useMapViewState.ts, tests/e2e/q-zoom-smooth.spec.ts
Wymagane: tests/e2e/q-zoom-smooth.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-zoom-smooth.spec.ts tests/e2e/camera.spec.ts tests/e2e/map-zoom-out.spec.ts
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (RAPORT z QC401 – **nadrzędny**: jego rekomendacje wykonujesz), src/view/map/AtlasMap.tsx (`onMove`), src/view/map/hooks/useMapViewState.ts (`animateToView`, ResizeObserver, klawiatura), src/core/map/camera.ts, tests/e2e/camera.spec.ts, tests/e2e/map-zoom-out.spec.ts, docs/PRODUKT.md §5a, docs/INSPIRACJE.md (wpis MapLibre – kamera)

## Zgoda na pliki ekranu
Ten prompt **wprost** pozwala zmienić `AtlasMap.tsx` i `hooks/useMapViewState.ts` (AGENTS.md: pliki ekranu). Nie zmieniaj innych plików ekranu.

## Kontekst
Właściciel: brak płynnych przybliżeń i oddaleń. Hipoteza (do potwierdzenia raportem QC401): mapa jest sterowana (`{...currentViewState}` + `onMove`), `onMove` ignoruje ruchy niebędące przeciąganiem w czasie animacji, a stan ustawiany bezpośrednio przerywa łagodne przybliżanie MapLibre (`scrollZoom` ma własne wygładzanie).

## Research
1. **Zacznij od raportu QC401** – zastosuj jego tabelę przyczyn (plik:linia). Jeśli raport nie istnieje albo jest niejednoznaczny – zatrzymaj się i opisz w PR.
2. Zweryfikuj w dokumentacji MapLibre (wersja z `package.json`): `scrollZoom` (`smooth`, `zoomRate`, `wheelZoomRate`), `touchZoomRotate`, `easeTo`; jak `react-map-gl` zachowuje się przy kontrolowanym `viewState` (zdarzenia `onMove` z `originalEvent`).
3. Rozważ przejście z w pełni kontrolowanego `viewState` na **półkontrolowany**: `initialViewState` + `ref.easeTo`/`flyTo` dla ruchów programowych, a `onMove` tylko synchronizuje stan do szwu testowego i adresu. Jeśli to zbyt inwazyjne – wariant minimalny: w `onMove` **nie odrzucaj** zdarzeń z `originalEvent` pochodzącego z kółka/pinch (gest użytkownika zawsze wygrywa i przerywa animację programową, PRODUKT §5a).

## Zadanie
- Wprowadź minimalną zmianę z raportu tak, by kółko i pinch korzystały z łagodnego przybliżania MapLibre; gest użytkownika przerywa trwającą animację programową (`stop()`), a nie jest odrzucany.
- Zachowaj: wybór miejsca/„Wróć”/okruszki animują się jak dotąd (testy `camera.spec.ts`, `map-zoom-out.spec.ts` zielone bez zmian); `prefers-reduced-motion` → brak animacji programowych (gest użytkownika pozostaje natywny).
- Nie ustawiaj `essential: true` bez potrzeby (przy reduced-motion MapLibre ma wtedy ucinać ruch – zgodnie z wpisem w INSPIRACJE).
- Stan zoomu w `window.__atlas.viewState` ma się aktualizować w trakcie ruchu (nie tylko na końcu).

## Testy (`tests/e2e/q-zoom-smooth.spec.ts`, `@Q`, `?e2e`)
1. Jedno `page.mouse.wheel` (jeden notch, ujemny deltaY = przybliż): próbkowanie `__atlas.viewState.zoom` co ~16 ms przez 800 ms → **co najmniej 5 różnych pośrednich wartości** między zoomem początkowym a końcowym; końcowy ≠ początkowy.
2. Kółko w drugą stronę (oddalenie) – to samo.
3. Gest użytkownika w trakcie animacji kamery (np. kółko w czasie dojazdu do województwa) przerywa animację: końcowy zoom nie wraca do celu animacji.
4. Pinch: jeśli Playwright pozwala wiarygodnie wysłać dwa punkty dotyku (CDP `Input.dispatchTouchEvent`), asercja jak w 1.; jeśli nie – test jednostkowy obsługi `onMove` z `originalEvent` typu `touchmove` (zamockuj) i wpis w opisie PR, dlaczego pinch nie ma e2e.
5. Z `page.emulateMedia({ reducedMotion: 'reduce' })`: ruch programowy kończy się natychmiast (1 wartość pośrednia lub 0).
6. Istniejące `camera.spec.ts` i `map-zoom-out.spec.ts` zielone bez edycji.

## Gotowe, gdy
- Jedno kółko = co najmniej 5 pośrednich wartości zoomu w `window.__atlas`; istniejące testy kamery zielone bez zmian.
Nie ruszaj: `Home.tsx`, `ProfileSheet*.tsx`, pozostałych `map/hooks/*`, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
