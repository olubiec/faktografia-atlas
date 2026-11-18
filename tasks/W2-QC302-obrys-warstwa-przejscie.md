# QC302 – Warstwa czerwonego obrysu gaśnie płynnie (300 ms)
Cel: `selected-outline-layer` używa reguły z QC301 – po oddaleniu obrys znika, po przybliżeniu wraca.
Zmieniaj: src/view/map/layers/choropleth.ts, tests/unit/outline-layer.test.ts
Wymagane: tests/unit/outline-layer.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/map/layers/choropleth.ts (`selected-outline-layer`), src/core/map/outline-visibility.ts (QC301), src/view/map/layers/registry.ts, tests/unit/layer-registry.test.ts, tests/unit/choropleth.test.ts, src/core/motion/ (reduced-motion helpers), docs/STYL.md (czasy z tokenów)

## Kontekst
Obrys wybranej jednostki jest dziś zawsze w pełni czerwony (kolor tokenu `korekta`). Dodajemy zależność od przybliżenia. Plik `choropleth.ts` jest współdzielony – zmieniasz **tylko** `selected-outline-layer` (reszta pliku, w tym `no-hardcoded-colors`, bez zmian).

## Research (obowiązkowy)
1. deck.gl `GeoJsonLayer`: przejścia (`transitions`) dla `getLineColor` działają przy zmianie wartości akcesora; sprawdź w kodzie `node_modules/@deck.gl/layers` i w dokumentacji (zweryfikowana wersja z `package.json`), czy `transitions: { getLineColor: 300 }` wymaga `updateTriggers`. Zapisz wniosek w komentarzu nad warstwą (po polsku, 2 zdania).
2. Sprawdź, skąd warstwa dostaje `zoom` i szerokość mapy (propsy/fabryka). Jeśli ich nie ma, dodaj **parametry fabryki** (nie czytaj `window`). Zmiana sygnatury fabryki = sprawdź wszystkich wywołujących (`rg "selectedOutlineLayer|selected-outline-layer"`) i zaktualizuj; jeśli wywołanie jest w pliku ekranu (`AtlasMap.tsx`, `map/hooks/*`) – **zatrzymaj się i opisz w PR**, zamiast go zmieniać.
3. Skąd bbox jednostki? Sprawdź, czy warstwa dostaje geometrię (`feature`) – bbox policz z niej (funkcja pomocnicza w pliku, ≤ 15 linii) albo użyj istniejącej.

## Zadanie
- Fabryka obrysu przyjmuje `zoom`, `mapWidthPx`, `reducedMotion` (z istniejących źródeł) i liczy `opacity = outlineOpacityFor(bboxWidthDeg, zoom, mapWidthPx)`.
- Kolor linii = token `korekta` z kanałem alfa `Math.round(opacity * 255)`; dla `opacity === 0` zwróć warstwę z `visible: false` **albo** alfa 0 (wybierz to, co lepiej współgra z testem rejestru warstw – nie zmieniaj istniejących testów rejestru).
- `transitions: { getLineColor: reducedMotion ? 0 : 300 }`; wartość 300 z tokenu czasu, jeśli taki jest w `config/tokens.json` (nie zmieniaj tokenów – jeśli brak, użyj stałej `DURATION_NORMAL` z `core/motion`; brak również → zatrzymaj się i opisz).
- Liczba warstw w rejestrze i ich identyfikatory bez zmian.

## Testy (`tests/unit/outline-layer.test.ts`)
1. Przy małej skali (gmina, zoom kraju) alfa koloru obrysu = 0.
2. Przy dużej skali alfa = 255.
3. Pośrednia skala → alfa pomiędzy.
4. `reducedMotion=true` → `transitions.getLineColor === 0`; `false` → 300.
5. Id warstwy nadal `selected-outline-layer`; kolejność w rejestrze bez zmian (istniejący `layer-registry.test.ts` zielony).
6. Brak zaznaczonej jednostki → warstwa pusta jak dotąd.

## Gotowe, gdy
- Test fabryki: przy małej skali kolor obrysu ma alfa 0; istniejące testy warstw bez zmian i zielone.
Nie ruszaj: pozostałych warstw w `choropleth.ts`, `admin.ts`, plików ekranu.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
