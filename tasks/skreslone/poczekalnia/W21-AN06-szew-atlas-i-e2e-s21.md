# W21-AN06 – Szew __atlas i e2e @S21
Opis zakresu już zaimplementowanego.

## 1. Cel
Test sprawdza zachowanie animacji koloru przez stan wystawiony w `window.__atlas` (tylko tryb testowy), nie przez piksele WebGL.

## 2. Pliki
- Zmieniaj: `src/core/map/test-seam.ts` (pole `blend`: `{ active, progress, frames }`), `tests/e2e/blend-s21.spec.ts` (nowy, nazwy z `@S21`)
- Czytaj tylko: `src/core/map/fill-blend.ts`, `src/view/map/hooks/useChoropleth.ts`

## 3. Scenariusze e2e
1. Wczytanie „Polska”: `blend.progress` rośnie monotonicznie do 1, potem `active=false`, a `frames` przestaje rosnąć.
2. `?u=0201` → „Wróć”: animacja w obie strony kończy się na 1, bez resetu do 0.
3. Zmiana wskaźnika: ~0,3 s animacji, kolor końcowy = kolor klasy.
4. `prefers-reduced-motion`: `progress` od razu 1, `frames` = 0.
5. `grep transitions` w propsach warstw przez szew: brak.
Zrzutów pikselowych mapy WebGL nie robimy (AGENTS.md).

## 4. Gotowe, gdy
Wszystkie `@S21` zielone w CI (znane flaki: library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135 – rerun); `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e` zielone.
