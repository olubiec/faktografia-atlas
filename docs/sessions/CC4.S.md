# Session CC4.S – Rozbicie AtlasMap na hooki bez zmiany działania

## Treść zadania
Wymaga na main: `src/view/map/AtlasMap.tsx`, `src/core/url/state.ts#readUrlState`, `src/view/map/layers/registry.ts#createMapLayers`
Kontekst: `src/view/map/AtlasMap.tsx` ma ok. 340 linii i jest plikiem zapalnym: każde zadanie mapy go zmienia, co powodowało konflikty i zapętlenia. Kolejne zadania (kartogram, profil) dopiszą do mapy nowe dane, więc najpierw dzielimy komponent na hooki o stałych nazwach.
Cel dla użytkownika: brak widocznej zmiany. Mapa, przechodzenie w głąb, okruszki, `?u=`, miejscowości i wyszukiwarka działają jak dotąd.

Zakres (tylko te pliki):
- `src/view/map/AtlasMap.tsx` (tylko przeniesienie logiki do hooków; JSX bez zmian)
- `src/view/map/hooks/useMapSelection.ts` (nowy): stan `selectedTeryt`, `drillState`, obsługa `?u=`, `popstate`, zdarzenia `atlas:select-locality`, funkcje `selectUnit(teryt)`, `goBack()`
- `src/view/map/hooks/useMapViewState.ts` (nowy): `viewState`, `setViewState`, wymiary kontenera, dopasowanie do bbox, limity zoomu
- `src/view/map/hooks/useMapColors.ts` (nowy): kolory z CSS i motyw (theme) z obserwacją zmiany motywu
- `tests/unit/map-hooks.test.tsx` (nowy)
- `docs/sessions/CC4.S.md`

Warunki odbioru:
- `AtlasMap.tsx` ma najwyżej 200 linii; trzy hooki eksportują dokładnie nazwy `useMapSelection`, `useMapViewState`, `useMapColors`.
- Wszystkie istniejące testy e2e przechodzą BEZ ŻADNEJ zmiany w plikach testów (`map.spec.ts`, `drill.spec.ts`, `breadcrumbs.spec.ts`, `localities-map.spec.ts`, `localities-search.spec.ts`).
- `window.__atlas` zwraca te same pola i wartości co przed zmianą.
- Test jednostkowy `useMapSelection` (`renderHook` / server test): `selectUnit('12')` ustawia `selectedTeryt` i `?u=12`; `goBack()` wraca do rodzica.
- Zapasowy kolor `'rgb(238, 241, 239)'` w `mapStyle` zastąpiony wartością z `config/tokens.json` (jak w `layers/admin.ts`).
