CC4.1a – logika widoku mapy, szew testowy i test zakazu HTML w dymkach (bez komponentu mapy)

Kontekst: przeczytaj AGENTS.md („Gałąź i PR”, „Zawsze”), docs/STYL.md, docs/MASTER_PLAN.md §3 (mapa) i docs/design/README.md. Dane: public/data/units.json (pola teryt, level, parent, bbox, centroid). Logika jednostek: src/core/units/.
To jest pierwsza z dwóch części CC4.1 (poprzednia próba, PR #52, była pusta). Ta część nie dodaje mapy na stronę: dostarcza czystą logikę widoku, szew testowy i test pilnujący zasad. Komponent mapy (MapLibre + deck.gl) przyjdzie w CC4.1b po scaleniu tej części.
Zakres (tylko te pliki):

src/core/map/view.ts (nowy)
src/core/map/test-seam.ts (nowy: typ i funkcje szwu window.__atlas)
tests/unit/map-view.test.ts (nowy)
tests/unit/map-seam.test.ts (nowy)
tests/unit/no-html-tooltip.test.ts (nowy)
docs/sessions/CC4.1a.md (nowy)

Nie zmieniaj: src/App.tsx, src/view/, package.json, public/, scripts/, config/, .github/, istniejących testów, docs/shots/.
Warunki odbioru (najpierw testy, potem kod):

countryBounds(units) zwraca prostokąt Polski [zachód, południe, wschód, północ] z bbox województw (poziom 1) w units.json. Test na prawdziwym units.json: prostokąt zawiera centroidy wszystkich 16 województw.
initialViewState(bounds, width, height) zwraca { longitude, latitude, zoom }, przy którym cały kraj mieści się w kontenerze (rzutowanie Web Mercator, 512 px kafelka). Testy dla 800×600, 1440×900 i 390×400: po zastosowaniu widoku prostokąt kraju mieści się w kontenerze i wypełnia co najmniej 80% mniejszego wymiaru.
mapLimits(bounds) zwraca { maxBounds, minZoomOffset, maxZoom }: maxBounds = prostokąt kraju powiększony o 10% z każdej strony, maxZoom = 12. Test na wartościach.
Szew: window.__atlas istnieje tylko, gdy adres zawiera ?e2e. Funkcja installAtlasSeam(win, getState) zwraca undefined, gdy brak ?e2e, a w przeciwnym razie ustawia obiekt tylko do odczytu z polami: ready: boolean, layers: string[], selected: string | null, viewState: { longitude, latitude, zoom }, theme: 'light' | 'dark'. Testy na atrapie window (bez przeglądarki): brak ?e2e → brak __atlas; z ?e2e → pola zgodne z getState; obiekt jest tylko do odczytu (próba zapisu nie zmienia wartości).
no-html-tooltip.test.ts przeszukuje pliki w src/ i zawodzi, jeśli znajdzie getTooltip zwracający obiekt z polem html. Test sam musi przechodzić na obecnym kodzie i wykrywać naruszenie na przykładowym ciągu znaków w teście.

Weryfikacja: w opisie PR tabela „warunek → test”. Bez zrzutów (nic nie zmienia wyglądu).
Zasady gałęzi (obowiązkowe):

Tylko git merge origin/main, bez rebase, bez nowej gałęzi, bez --force.
Przed pushem git diff --name-status --diff-filter=D origin/main...HEAD musi być puste.
Przed pushem osobno: pnpm lint, pnpm typecheck, pnpm test, pnpm build, pnpm test:e2e – wszystko zielone. Nie uruchamiaj pnpm shots ani pnpm verify i nie commituj docs/shots/.
Nie osłabiaj reguł lint ani testów.
Uwagi z przeglądu w PR wprowadzaj prawdziwymi zmianami w plikach, nie pustymi commitami.
Zakres ma być mały: jeśli coś się nie mieści w sesji, dostarcz mniejszą część jako PR i opisz resztę.
