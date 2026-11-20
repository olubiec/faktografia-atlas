# QC404 – Wejście w głąb (≈ 600 ms) i „Wróć” (≈ 400 ms) naprawdę widać
> **KOREKTA 18.11.2026:** zadanie przeniesione z fali 3 do fali 4 (po `W3-PM10`). Numery linii z raportu QC401 są nieaktualne – czytaj kod po PM10. **[CZEKA NA ZGODĘ D4]**
Cel: Klik w województwo i „Wróć” kończą się płynnym ruchem kamery, a nie skokiem.
Zmieniaj: src/view/map/hooks/useMapViewState.ts, src/core/map/camera.ts, tests/e2e/q-drill-motion.spec.ts
Wymagane: tests/e2e/q-drill-motion.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-drill-motion.spec.ts tests/e2e/camera.spec.ts tests/e2e/drill.spec.ts tests/e2e/breadcrumbs.spec.ts
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (QC401: ruchy (a), (e), (f), (g)), src/view/map/hooks/useMapViewState.ts, src/core/map/camera.ts (`cameraTransition`), tests/unit/camera.test.ts, tests/e2e/camera.spec.ts, tests/e2e/drill.spec.ts, docs/PRODUKT.md §5a

## Zgoda na plik ekranu
Ten prompt **wprost** pozwala zmienić `src/view/map/hooks/useMapViewState.ts`. Innych plików ekranu (`AtlasMap.tsx` po QC402/QC403, `Home.tsx`) nie ruszaj.

## Kontekst
PRODUKT §5a: wejście ≈ 600 ms, „Wróć”/okruszki ≈ 400 ms, gest użytkownika przerywa ruch, link z `?u=` i zmiana rozmiaru okna – bez animacji. Raport QC401 wskazuje, które z tych ruchów dziś skaczą i dlaczego.

## Research
1. Zastosuj tabelę przyczyn z raportu (plik:linia). Jeśli ruch działa już poprawnie – nie ruszaj go, dopisz tylko test regresyjny.
2. `camera.ts`: sprawdź `cameraTransition(kind, reducedMotion)` – wartości 'in' 600, 'out' 400, 'instant' 0 mają odpowiadać §5a; test `camera.test.ts` już je zna (nie zmieniaj testu; jeśli wartości są inne, **zatrzymaj się**).
3. Sprawdź, czy ruch przy wyborze miejsca z wyszukiwarki (g) jest 'in', a okruszki/„Wróć” 'out'.

## Zadanie
- Napraw wskazane przez raport miejsca w `useMapViewState.ts`/`camera.ts` tak, by (a) klik województwa/powiatu = ruch 'in' ≈ 600 ms, (e)(f) okruszki i „Wróć” = 'out' ≈ 400 ms, (g) wybór z wyszukiwarki = 'in'; wszystkie z `easing`, nie liniowo.
- Wejście z linku `?u=` i resize pozostają `instant`.
- Gest użytkownika w trakcie ruchu przerywa go (`stop`).
- reduced-motion → wszystko `instant`.

## Testy (`tests/e2e/q-drill-motion.spec.ts`, `@Q`, `?e2e`)
1. Klik województwa: `__atlas.viewState.zoom` próbkowany co ~16 ms; czas od pierwszej zmiany do stabilizacji 450–900 ms; **≥ 10** różnych pośrednich wartości zoomu/pozycji.
2. „Wróć”: czas 250–650 ms, ≥ 6 pośrednich wartości; krótszy niż wejście (medianę policz z 3 prób).
3. Kliknięcie okruszka „Polska” = jak „Wróć”.
4. Wybór miejsca z wyszukiwarki (komputer): ruch jak przy 1.
5. Wejście `/?e2e&u=<teryt>`: kamera od razu w docelowym miejscu (≤ 2 różne wartości), bez animacji.
6. Zmiana rozmiaru okna (`page.setViewportSize`) nie uruchamia animacji kamery.
7. Istniejące `camera.spec.ts`, `drill.spec.ts`, `breadcrumbs.spec.ts` zielone bez edycji.

## Gotowe, gdy
- E2E: klik województwa ≈ 600 ms ruchu (≥ 10 klatek), „Wróć” ≈ 400 ms; istniejące testy bez zmian.
Nie ruszaj: `AtlasMap.tsx`, `Home.tsx`, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
