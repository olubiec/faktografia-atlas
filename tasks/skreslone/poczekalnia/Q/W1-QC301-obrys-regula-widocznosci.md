# QC301 – Reguła widoczności czerwonego obrysu (gaśnie po oddaleniu)
Cel: Czysta funkcja, która z szerokości jednostki na ekranie wylicza przezroczystość obrysu 0–1.
Zmieniaj: src/core/map/outline-visibility.ts, tests/unit/outline-visibility.test.ts
Wymagane: tests/unit/outline-visibility.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md §5a, src/core/map/camera.ts, src/core/map/view.ts, src/core/map/test-seam.ts, src/view/map/layers/choropleth.ts (`selected-outline-layer`)

## Kontekst
Czerwone obrysy wybranych jednostek nie znikają po oddaleniu mapy (np. gmina jako kropka na widoku kraju). `selected-outline-layer` zależy tylko od adresu (`?u=`), nie od przybliżenia. Decyzja D6: obrys gaśnie, gdy jednostka zajmuje < ~2% szerokości mapy. Tu powstaje sama reguła (bez mapy).

## Research
1. Ustal, w jakiej projekcji liczy mapa (Web Mercator; `view.ts`). Szerokość jednostki w pikselach na ekranie = (szerokość bboxu w stopniach długości / 360) · 512 · 2^zoom (kafel 512 px w MapLibre ≥ 2; **sprawdź w `view.ts`/dokumentacji MapLibre, jakiego rozmiaru kafla używa projekt** i podaj źródło w komentarzu).
2. Bbox jednostki: sprawdź, skąd bierze go `camera.ts` (np. `fitBounds` jednostki) – użyj tego samego źródła w QC302, tu tylko przyjmij liczby.

## Zadanie
`src/core/map/outline-visibility.ts`:
- `export const OUTLINE_FADE_START = 0.02` (2% szerokości mapy – próg, przy którym obrys zaczyna być w pełni widoczny) i `OUTLINE_FADE_END = 0.01` (poniżej 1% = całkowicie niewidoczny). Między nimi liniowo.
- `export function unitScreenFraction(bboxWidthDeg: number, zoom: number, mapWidthPx: number): number` – ułamek szerokości mapy zajmowany przez jednostkę (może być > 1).
- `export function outlineOpacity(fraction: number): number` – `≥ START → 1`; `≤ END → 0`; między liniowo; wynik zawsze w [0,1]; `NaN`/ujemne → 0.
- `export function outlineOpacityFor(bboxWidthDeg, zoom, mapWidthPx)` – złożenie obu.
- Funkcje czyste, bez `window`, bez zależności od deck.gl.

## Testy
1. Gmina (bbox ~0,2°) przy widoku kraju (zoom ~5,5, mapa 1200 px): `outlineOpacityFor(...) === 0`.
2. Ta sama gmina przy zoom 10: `=== 1`.
3. Punkty graniczne: `fraction = 0.02` → 1; `0.01` → 0; `0.015` → 0.5 (±0.001).
4. Monotoniczność: dla rosnącego zoomu przezroczystość nigdy nie maleje (pętla po zoomie 3…12).
5. Szersza mapa (2000 px) → ta sama jednostka wypada mniejszym ułamkiem (sprawdź kierunek).
6. `NaN`, `-1`, `Infinity` – nie rzucają, wynik w [0,1].
7. Województwo (bbox ~4°) przy widoku kraju → 1 (nie znika, bo duże).

## Gotowe, gdy
- Gmina przy widoku kraju = 0; ta sama przybliżona = 1; testy zielone.
Nie ruszaj: `choropleth.ts`, `camera.ts` (wpięcie w QC302).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
