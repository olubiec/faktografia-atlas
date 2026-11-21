# W20-CN01 – Wyłącz przejście koloru, gdy zmienia się zestaw wielokątów
Prompt samowystarczalny: wykonaj dokładnie ten plik. Kontekst: `docs/research/q-cienie-A-shader.md` (§ wnioski) i `docs/research/q-cienie-E-cofanie.md` (K3).

## 1. Cel
Przy cofaniu (powiaty→województwa, województwa→kraj) i wejściu w głąb nie ma „wachlarzy” ani cieni: kolory nowego poziomu pojawiają się od razu (reveal robi swoją animację), a przejście 300 ms zostaje tylko przy zmianie wskaźnika/roku na tym samym poziomie.

## 2. Decyzje (nie do dyskusji)
- Przyczyna: `transitions.getFillColor` w deck.gl 9.4 paruje wierzchołki starego i nowego `data` po indeksie (padArray), nie po TERYT; gdy `data` zmienia się z 16 województw na 380 powiatów (i odwrotnie), kolory wierzchołków interpolują się między nie-związanymi kształtami → promieniste gradienty.
- Naprawa: gdy referencja `data` (zestaw cech) różni się od poprzedniego wywołania fabryki, `transitions.getFillColor = 0`; w pozostałych wywołaniach `transitions.getFillColor` jak dziś (token `motion.base`, 0 przy reduced-motion).
- NIE zmieniasz `id` warstwy (`'choropleth-layer'`) – istniejące testy go sprawdzają.
- Stan „ostatni zestaw cech” żyje w module `src/core/map/fill-transition.ts` (czysta funkcja + mały stan modułu, bez Reacta); fabryka tylko ją woła.

## 3. Pliki
- Zmieniaj: `src/core/map/fill-transition.ts` (nowy), `src/view/map/layers/choropleth.ts` (tylko `transitionDuration` i wywołanie), `tests/unit/fill-transition.test.ts` (nowy), `tests/unit/choropleth-transition.test.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `tests/unit/choropleth-layers-split.test.ts`, `tests/e2e/color-transition.spec.ts`
- Czytaj tylko: `choropleth.ts` (fabryka `choroplethLayerFactory`), `tests/unit/choropleth-layers-split.test.ts` (jak budować `ctx` i mockować `loadGeoData`).

## 4. Kroki
1. `fill-transition.ts`: `export function resolveFillTransition(dataKey: string, baseMs: number): { ms: number; changed: boolean }` – pamięta ostatni `dataKey` (moduł); pierwsze wywołanie i zmiana klucza → `{ ms: 0, changed: true }`, ten sam klucz → `{ ms: baseMs, changed: false }`. Dodaj `getFillTransitionState(): { ms: number; dataKey: string }` (do szwu testowego w CN06) i `resetFillTransition()` (do testów).
2. W `choropleth.ts` klucz = `choropleth.level` (poziom wyznacza zestaw cech; dla `gmi` dodaj `activePowTeryt ?? ''`, bo zestaw bywa zawężany – sprawdź w `resolveScope`, czy `features` zależy od zakresu; jeśli tak, klucz uwzględnia zakres). `transitions: { getFillColor: resolveFillTransition(key, transitionDuration).ms }`.
3. Testy najpierw (czerwone), potem kod:
   a) `fill-transition.test.ts`: pierwsze wywołanie → 0; ten sam klucz → baseMs; zmiana klucza → 0; po powrocie do ten sam klucz po zmianie → 0 tylko raz, następne wywołanie → baseMs; `baseMs = 0` → zawsze 0.
   b) `choropleth-transition.test.ts` (mock `loadGeoData` jak w `choropleth-layers-split.test.ts`, `resetFillTransition()` w `beforeEach`): kolejne wywołania fabryki: `level 'woj'` → `props.transitions.getFillColor === 0`; ten sam poziom, inny `classByTeryt` (zmiana wskaźnika) → `=== 300` (wartość z `tokensJson.motion.base`); `level 'pow'` → 0; z powrotem `'woj'` → 0; z `prefers-reduced-motion` (mock `matchMedia`) → zawsze 0.
   c) „żaden wielokąt nie ma więcej niż jednego koloru podczas przejścia” = w (b) pokazane przez `ms === 0` w chwili zmiany `data` (opisz to w nazwie testu).

## 5. Gotowe, gdy
- Testy 4a–4c zielone; `choropleth-layers-split.test.ts` i `color-transition.spec.ts` bez zmian (e2e uruchom lokalnie, jeśli się da, inaczej rozstrzyga CI).
- Na podglądzie (iPhone): cofnięcie powiat→województwo i województwo→kraj bez wachlarzy i cieni w trakcie ruchu; zmiana wskaźnika nadal płynnie przechodzi kolorem (~0,3 s).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN01 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN01] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
```
## Po ludzku
- Co zrobiłem: …
- Co sprawdzić na podglądzie Vercel (iPhone, Safari): … (gdzie na stronie i co powinno być widać)
- Czego nie zrobiłem i dlaczego: …
## Liczby
przed → po (z testów) …
```
Poczekaj na CI; znane flaki (library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135) – rerun, nie zmieniaj tych testów. Wzorce zrzutów odświeża właściciel.

## 8. Zakazy
Nie edytuj `docs/STAN.md`, `package.json`, `pnpm-lock.yaml`, istniejących testów ani snapshotów. Bez nowych pakietów. Nie scalaj PR. Musisz zmienić plik spoza listy „Zmieniaj” albo istniejący test przeszkadza → zatrzymaj się i opisz w PR. Kolory/czasy tylko z tokenów (`config/tokens.json`), pliki do ok. 200 linii, komentarze po polsku, nazwy po angielsku, TERYT jako string. Nie czytaj nic poza `AGENTS.md` i plikami wskazanymi w sekcji 3.

## 9. Zależności
Brak. Pierwsze w paczce (CN01→CN02→CN03→CN04→CN05→CN06). Dotyka tylko `choropleth.ts`; nie dotyka `AtlasMap.tsx`.
