# W20-CN06 – Szew testowy przejścia koloru i test e2e cofania (@S20)
Prompt samowystarczalny. Kontekst: `docs/research/q-cienie-E-cofanie.md` (plan pomiaru); PF01: `docs/research/p-animacja-kamery-pomiar.md` (jak mierzyć). Uwaga: SwiftShader nie odtwarza cieni z iOS – test sprawdza decyzję (przejście 0 przy zmianie poziomu), nie piksele.

## 1. Cel
Test regresyjny w CI pilnuje, że przy każdej zmianie poziomu (wejście, „Wróć”, wstecz przeglądarki) warstwa kolorów nie ma aktywnego przejścia koloru, a po ustabilizowaniu wraca ono do 300 ms.

## 2. Decyzje
- `window.__atlas.fill = { ms: number; dataKey: string }` czytane z `getFillTransitionState()` (CN01), tak jak `reveal` z `getRevealState()`.
- Test e2e ma `@S20` w nazwie; pliku tylko własny: `tests/e2e/s20-fill-transition.spec.ts`.
- Pokrycie: kraj→województwo→powiat→(Wróć)→województwo→(Wróć)→kraj oraz wstecz przeglądarki (`page.goBack()`); próbkowanie `__atlas.fill` co ~50 ms przez 1,5 s po każdym kroku.

## 3. Pliki
- Zmieniaj: `src/core/map/test-seam.ts`, `tests/e2e/s20-fill-transition.spec.ts` (nowy), `tests/unit/seam-fill.test.ts` (nowy)
- Wymagane: `tests/unit/map-seam.test.ts` (istnieje, nie ruszać; jeśli dodanie pola `fill` łamie jego asercję `toEqual` → zatrzymaj się i opisz, nie zmieniaj testu – wtedy pole dodaj jako opcjonalne `fill?:` w typie i w obiekcie tylko gdy funkcja istnieje, jak `reveal`/`camera`)
- Czytaj tylko: `test-seam.ts`, `tests/unit/map-seam.test.ts`, `tests/e2e/fix6-undo.spec.ts` (wzorzec nawigacji „Wróć” i czekania na `__atlas.ready`).

## 4. Kroki
1. Testy najpierw: `seam-fill.test.ts` (`installAtlasSeam` z `?e2e` zwraca `fill` o kształcie `{ms, dataKey}`; bez `?e2e` brak `__atlas`).
2. e2e `s20-fill-transition.spec.ts`: dla każdej zmiany poziomu: tuż po zmianie `__atlas.fill.ms === 0` w pierwszej próbce; w żadnej próbce przy zmienionym `dataKey` `ms > 0`; po 1,5 s `ms === 300` (lub 0 przy reduced-motion – drugi test z `emulateMedia({ reducedMotion: 'reduce' })` oczekuje 0 zawsze); zmiana wskaźnika (`?i=` + `popstate`) na tym samym poziomie → `ms === 300` w trakcie (przejście działa).
3. Kod: dopisz pole do `AtlasState` jako opcjonalne i do obiektu seam.

## 5. Gotowe, gdy
- Testy zielone w CI (shard e2e); `map-seam.test.ts` i `color-transition.spec.ts` bez zmian.
- W PR: tabela przed/po z próbek (liczba próbek z `ms>0` przy zmianie `dataKey`: oczekiwane 0).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN06 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN06] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
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
Po CN01–CN05. Sprawdzenie startu: `grep -c getFillTransitionState src/core/map/fill-transition.ts` (≥ 1). Nie dotyka `AtlasMap.tsx`.
