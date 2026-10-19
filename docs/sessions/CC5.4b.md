# CC5.4b – miejscowości na mapie, punkty od zoomu 9

Zadanie: CC5.4b – wybór miejscowości zbliża mapę, punkty od zoomu 9
Kontekst: CC5.4a dodało miejscowości do Ctrl+K. Mapa ma przechodzenie w głąb i ?u= (CC4.2, CC4.3) oraz rejestr warstw i moduł stanu adresu (CC4.R). public/data/localities.json jest już na main.

Zakres (tylko te pliki):
- `src/core/map/localities-layer.ts` (nowy): filtr widocznych punktów i dane warstwy
- `src/view/map/layers/localities.ts` (nowy) + jedna linia w `src/view/map/layers/registry.ts` (rejestr z CC4.R)
- `src/view/map/AtlasMap.tsx` (tylko obsługa wyboru miejscowości, jeśli CC4.R nie dało do tego punktu podpięcia)
- `tests/unit/localities-layer.test.ts`, `tests/e2e/localities-map.spec.ts` (nowe)
- `src/core/search/types.ts` (tylko typ Locality: pole simc zamień na id, bo localities.json ma {id, name, gminaTeryt, lon, lat, kind?, approx?}; dostosuj użycia i testy CC5.4a, jeśli trzeba)
- `docs/sessions/CC5.4b.md`

Warunki odbioru:
1. Wybór miejscowości w Ctrl+K ustawia ?u= na TERYT jej gminy i zbliża widok do punktu (test na window.__atlas: selected, viewState.zoom ≥ 11).
2. Warstwa loc-layer jest w window.__atlas.layers tylko przy zoomie ≥ 9.
3. Dymek miejscowości tylko tekstem (istniejący test zakazu HTML przechodzi).
4. Punkty z approx: true mają inny, opisany w PR wygląd z tokenów.
5. Istniejące testy drill.spec.ts, breadcrumbs.spec.ts, map.spec.ts przechodzą bez zmian.
