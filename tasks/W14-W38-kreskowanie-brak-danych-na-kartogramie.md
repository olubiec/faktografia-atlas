# W3.8 – Kreskowanie „brak danych” na kartogramie
Cel: jednostki bez danych dostają deseń (kreski) zamiast jednolitej szarości, żeby nie myliły się z „niską wartością”; w legendzie pozycja „brak danych” ma ten sam deseń.
Zmieniaj: src/view/map/layers/no-data-pattern.ts, src/view/map/layers/choropleth.ts, src/view/legend/Legend.tsx, tests/unit/no-data-pattern.test.ts, tests/unit/legend-no-data-swatch.test.tsx
Wymagane: tests/unit/no-data-pattern.test.ts, tests/unit/legend-no-data-swatch.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Limity zmian w plikach wspólnych: src/view/map/layers/choropleth.ts – najwyżej 30 linii zmiany; src/view/legend/Legend.tsx – najwyżej 25 linii zmiany

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W3.8 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** jednostki bez danych dostają deseń (kreski) zamiast jednolitej szarości, żeby nie myliły się z „niską wartością”; w legendzie pozycja „brak danych” ma ten sam deseń.
- **Decyzja D5 (26.10.2026):** kreski + osobna pozycja „brak danych” w legendzie. `config/tokens.json` opisuje wzór jako kropki – D5 jest nowsza; tokenów nie zmieniasz. Kolory tylko z tokenów: kreski `--linia`, tło `--no-data`.
- **Co sprawdzono (R5, typy `@deck.gl/extensions` 9.4.0):** `new FillStyleExtension({ pattern: true, proceduralPattern: true })` oraz propsy warstwy `fillPatternMapping` (np. `{ 'no-data-hatch': { type: 'hatch', angle: 45, strokeWidth: 1, gap: 4 } }`), `getFillPattern`, `fillPatternMask`, `fillPatternSizeUnits: 'pixels'`, `getFillPatternScale`, `getFillPatternBackgroundColor`. Dziś `src` nie używa `FillStyleExtension`.
- **Przeczytaj najpierw:** `src/view/map/layers/choropleth.ts`, `src/core/map/classes.ts` (klasa `'no-data'`), `src/view/legend/Legend.tsx`, `src/core/legend/legend.ts`, `node_modules/@deck.gl/extensions/dist/fill-style/fill-style-extension.d.ts` i `procedural-pattern.d.ts`, `tests/unit/legend-view.test.tsx`.
- **Pliki:** `src/view/map/layers/no-data-pattern.ts` (nowy), `src/view/map/layers/choropleth.ts` (częściowy, do 30 linii), `src/view/legend/Legend.tsx` (częściowy, do 25 linii), `tests/unit/no-data-pattern.test.ts` (nowy), `tests/unit/legend-no-data-swatch.test.tsx` (nowy).
- **Zadanie:** (1) `no-data-pattern.ts`: nazwa wzoru, mapowanie wzoru (liczby w jednym miejscu) i funkcja zwracająca zestaw propsów warstwy (`extensions`, `fillPatternMapping`, `getFillPattern`: tylko dla klasy `'no-data'` nazwa wzoru, dla reszty pusty wzór; `getFillPatternBackgroundColor`: kolor `--no-data`; kreski w kolorze `--linia`). Bez sieci, bez WebGL w teście. (2) W `choroplethLayerFactory` rozlej te propsy na `GeoJsonLayer`; jednostki poza aktywnym zakresem zostają wyblakłe jak dziś (alfa 64); animacja „kafelek po kafelku” i przelewanie kolorów działają bez zmian. (3) `Legend.tsx`: próbka pozycji z tokenem `--no-data` rysowana jako kreski (`repeating-linear-gradient` z `var(--linia)` na `var(--no-data)`), pozostałe próbki bez zmian; bez wartości kolorów wpisanych na sztywno. Jeśli deck.gl nie pozwala na kolor kresek inny niż wypełnienie, opisz to w PR i zatrzymaj się.
- **Gotowe, gdy:** testy: funkcja zwraca wzór tylko dla `'no-data'`; mapowanie ma dokładnie jeden wzór typu `hatch`; propsy zawierają `FillStyleExtension` z `proceduralPattern`; próbka „brak danych” w legendzie ma tło-gradient kresek, pozostałe próbki mają jednolity kolor tokenu; istniejące testy (`legend*.test.ts*`, `choropleth*.test.ts`, `choropleth.spec.ts`) przechodzą **bez zmian**; test `no-hardcoded-colors` zielony.
- **Ty sprawdzasz:** na mapie jednostki bez danych (np. wskaźnik z lukami na poziomie gmin) są w kreski, a w legendzie „brak danych” ma ten sam deseń; kolory klas bez zmian.
- **Nie ruszaj:** `AtlasMap.tsx`, `config/tokens.json`, `src/core/legend/legend.ts`, `src/core/map/classes.ts`.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W14-W38). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W14-W38]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
