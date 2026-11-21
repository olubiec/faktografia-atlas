# W21-AN04 – Napęd klatek blend w useChoropleth
Opis zakresu już zaimplementowanego.

## 1. Cel
Animację koloru (zmiana wskaźnika/roku, reveal) napędzają klatki `requestAnimationFrame` w `useChoropleth`, ale warstwa jest przebudowywana co najwyżej co 33 ms (throttle), żeby nie zalewać GPU.

## 2. Pliki
- Zmieniaj: `src/view/map/hooks/useChoropleth.ts`, `src/core/map/blend-clock.ts` (nowy, czysta logika throttlingu i końca animacji), `tests/unit/blend-clock.test.ts` (nowy)
- Czytaj tylko: `src/core/map/fill-blend.ts`, `src/view/map/hooks/useReducedMotion.ts`
- Nie ruszaj `AtlasMap.tsx`.

## 3. Zasady
Klatka co ≥ 33 ms; po `progress >= 1` zegar się zatrzymuje (brak pracy w spoczynku); nowa zmiana w trakcie animacji startuje od koloru bieżącego, nie od starego celu (brak skoku); przy `prefers-reduced-motion` brak klatek, kolor od razu docelowy; `useEffect` sprząta `cancelAnimationFrame`.

## 4. Testy
Z fałszywym zegarem: klatki rzadziej niż 33 ms są pomijane; po końcu brak kolejnych; restart w połowie startuje od bieżącego koloru; reduced-motion → 0 klatek.

## 5. Gotowe, gdy
Testy zielone; w spoczynku zero `requestAnimationFrame` z hooka; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
