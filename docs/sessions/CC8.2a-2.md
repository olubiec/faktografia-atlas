# Session CC8.2a-2 – mapa koloruje się wskaźnikiem z ?i= (i rokiem z ?y=)

Zadanie: CC8.2a-2 – mapa koloruje się wskaźnikiem z ?i= (i rokiem z ?y=)
Wymaga na main: src/view/map/hooks/useMapSelection.ts#useMapSelection, src/core/map/choropleth.ts#buildChoropleth, src/core/data/load-values.ts#loadIndicatorValues
Kontekst: logika kartogramu buildChoropleth (src/core/map/choropleth.ts), ładowanie loadIndicatorValues (src/core/data/load-values.ts), ?i=/?y= w readUrlState (src/core/url/state.ts), tokeny kolorów klas --seq-1…5, --div-1…5, --no-data w src/styles/tokens.css (nazwę zwraca classColorToken z src/core/map/classes.ts). Mapa po CC4.S: AtlasMap.tsx + hooki w src/view/map/hooks/, warstwy przez rejestr src/view/map/layers/registry.ts (wzór: layers/localities.ts).
Cel dla użytkownika: wejście na /?i=unemployment-rate koloruje widoczne jednostki (województwa, po wejściu w głąb powiaty, gminy) według stopy bezrobocia; bez ?i= mapa wygląda jak dotąd.
Zakres (tylko te pliki):

src/view/map/hooks/useChoropleth.ts (nowy): wczytuje wartości dla i, liczy buildChoropleth dla poziomu z drillState
src/view/map/layers/choropleth.ts (nowy; rejestracja registerLayerFactory w AtlasMap.tsx, jak localitiesLayerFactory)
src/view/map/layers/admin.ts (tylko: pole choropleth w LayerContext)
src/core/map/test-seam.ts (tylko: pole choropleth: { indicatorId, year, level, classes } | null)
src/view/map/AtlasMap.tsx (tylko: rejestracja warstwy, wywołanie hooka i przekazanie do warstw)
tests/e2e/choropleth.spec.ts (nowy; wartości syntetyczne zdefiniowane w samym pliku testu i podawane przez page.route('/data/values/*.json'))

Warunki odbioru:

/?e2e&i=unemployment-rate → window.__atlas.choropleth = { indicatorId: 'unemployment-rate', year: <ostatni rok z danych>, level: 'woj', classes: 5 }, a w layers jest choropleth-layer.
Wejście w województwo → level: 'pow'; brak ?i= → choropleth: null i brak choropleth-layer.
Kolory WYŁĄCZNIE z tokenów CSS przez getComputedStyle (nazwy z classColorToken), z zapasem z config/tokens.json → data; zmiana motywu przelicza kolory; aktualizacja koloru przez updateTriggers bez przebudowy geometrii.
Brak pliku wartości (404) → mapa jak bez ?i=, bez błędu w konsoli.
Istniejące e2e przechodzą bez zmian. Opis sesji: docs/sessions/CC8.2a-2.md.

Poza zakresem: legenda i wybór wskaźnika na mapie (CC8.W), kreskowanie braków (CC8.4).
