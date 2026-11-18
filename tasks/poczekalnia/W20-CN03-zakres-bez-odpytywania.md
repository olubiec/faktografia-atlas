# W20-CN03 – Zakres mapy z `useMapSelection`, bez odpytywania adresu co 100 ms
Prompt samowystarczalny. Kontekst: `docs/research/q-cienie-E-cofanie.md` (K2: podwójny start reveal).

## 1. Cel
Zakres (województwo/powiat) i start animacji reveal wynikają z jednego źródła – wybranej jednostki z `useMapSelection` – a nie z drugiego odczytu adresu co 100 ms, który powodował podwójny start reveal i skok przy cofaniu.

## 2. Decyzje
- `useChoropleth(view, units)` dostaje trzeci argument `selectedTeryt: string | null` (z `AtlasMap`); usuwasz `useState`/`setInterval`/nasłuch `popstate`/`hashchange` z `useChoropleth` (nie ma drugiego źródła).
- `AtlasMap.tsx`: wolno zmienić WYŁĄCZNIE wywołanie `useChoropleth(view, units)` (linia ~167) → `useChoropleth(view, units, selectedTeryt)`. Opisz w PR.
- Zachowanie reveal (900 ms, `scopeKey`) bez zmian, ale `scopeKey` zmienia się teraz raz na zmianę zakresu.

## 3. Pliki
- Zmieniaj: `src/view/map/hooks/useChoropleth.ts`, `src/view/map/AtlasMap.tsx` (jedna linia), `tests/unit/use-choropleth-scope.test.tsx` (nowy)
- Wymagane (istnieją, nie ruszać): `tests/unit/map-hooks.test.tsx`, `tests/e2e/reveal.spec.ts`
- Czytaj tylko: `useChoropleth.ts` całość; `tests/unit/map-hooks.test.tsx` (jak renderować hooki, jeśli używają `renderHook`); `AtlasMap.tsx` linie 100–170.

## 4. Kroki
1. Test najpierw `use-choropleth-scope.test.tsx` (`renderHook`, `vi.useFakeTimers`, `vi.spyOn(globalThis,'setInterval')`):
   a) po zamontowaniu hook nie wywołuje `setInterval` (liczba wywołań z interwałem 100 = 0);
   b) zmiana propsu `selectedTeryt` `null → '12' → '1201'` zmienia `activeScope` (`'12'`, `'1201'`) w zwróconych danych;
   c) reveal startuje dokładnie raz na zmianę zakresu (licz `requestAnimationFrame` przez spy: pierwsza klatka po zmianie tylko jedna pętla);
   d) zmiana samego `selectedTeryt` bez zmiany poziomu/zakresu nie restartuje reveal.
2. Kod: usuń stan i interwał, użyj argumentu; `activeWojTeryt`/`activePowTeryt` z `useMemo` na `selectedTeryt`.
3. Sprawdź `grep -rn "useChoropleth(" src tests` – wszystkie wywołania zaktualizuj (testy tylko jeśli wołają hook z 2 argumentami: trzeci jest opcjonalny z domyślnym `null`, więc istniejące testy nie wymagają zmian).

## 5. Gotowe, gdy
- Testy 4a–4d zielone; `map-hooks.test.tsx` i `reveal.spec.ts` bez zmian i zielone.
- Podgląd: zmiana wybranej jednostki (klik, „Wróć”, wstecz przeglądarki) daje jedną falę reveal, mapa nie „skacze” po zatrzymaniu.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN03 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN03] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
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
Po CN02. Dotyka `AtlasMap.tsx` (jedna linia) – uruchom dopiero po scaleniu FIX7 (#503) i gdy żadne zadanie Q2 nie rusza `AtlasMap.tsx`; przed edycją `git merge origin/main`.
