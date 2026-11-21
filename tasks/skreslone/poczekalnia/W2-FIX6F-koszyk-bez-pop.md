# W2-FIX6F – Koszyk zoomu 9 bez pop (zanikanie miejscowości)
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Przekroczenie zoomu 9 nie powoduje „pop”: miejscowości pojawiają się płynnie, a przebudowa warstw nie robi długiej klatki. Na podglądzie (telefon): powoli zbliżaj mapę przez zoom ok. 9 – kropki miejscowości wchodzą stopniowo (300 ms), mapa się nie zacina.

## 2. Decyzje
Histereza: warstwa miejscowości jest budowana od zoomu 8,5 w dół do 8,0 (włącz przy ≥ 8,5, wyłącz przy < 8,0); widoczność przez alfa (`getFillColor`/`getLineColor` z alfa 0→255, `transitions` = `tokens.motion.base`, 0 przy reduced-motion). `layersZoomBucket` zostaje bez zmiany sygnatury (istniejący test), dochodzi nowa `localitiesVisibleWithHysteresis(prev, zoom)` i `localitiesAlphaTarget(zoom)` (smoothstep 8,8→9,2).

## 3. Pliki
- Zmieniaj: `src/core/map/localities-layer.ts`, `src/view/map/layers/localities.ts`, `src/view/map/AtlasMap.tsx` (tylko wyliczenie `layersZoom`/flagi widoczności, ok. linie 232–235), `tests/unit/localities-fade.test.ts` (nowy), `tests/e2e/fix6-bucket-pop.spec.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `tests/unit/layers-view-state.test.ts`, `src/view/map/layers/admin.ts` (typ `LayerContext`)
- Czytaj tylko: `localities-layer.ts` całość (32 linie), `layers/localities.ts` całość, `AtlasMap.tsx` linie 223–247, `tests/unit/layers-view-state.test.ts` (żeby go nie złamać).
- Nie czytaj: reszty.

## 4. Kroki
1. Testy najpierw `localities-fade.test.ts`: histereza – `visible(false, 8.4)=false`, `(false, 8.5)=true`, `(true, 8.2)=true`, `(true, 7.99)=false`; `alphaTarget(8.7)=0`, `(9.3)=1`, monotoniczne, ciągłe (max skok na 0,01 zoomu ≤ 0,15); `layersZoomBucket` – istniejący test przechodzi bez zmian. `fix6-bucket-pop.spec.ts` (`@FIX6F`): zoom 8,6 → 9,4 kółkiem w 20 krokach: warstwa `loc-layer` w `__atlas.layers` pojawia się ≤ zoom 8,6 (przed progiem widoczności) i żadna klatka rAF > 50 ms w oknie przejścia (próbnik jak w PF01).
2. Kod: przejście alfa przez `transitions: { getFillColor: duration, getLineColor: duration }` i `getFillColor` zależne od flagi `visibleTarget` w `updateTriggers`.

## 5. Gotowe, gdy
- Testy zielone; `layers-view-state.test.ts` bez zmian i zielony; zmiana alfa trwa ≥ 10 klatek (300 ms) i brak klatki > 50 ms w oknie 8,5–9,5 (SwiftShader; liczby w PR).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6F origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6F] `. Opis (po polsku, bez `Closes #`):
```
## Po ludzku
- Co zrobiłem: …
- Co sprawdzić na podglądzie Vercel (telefon): … (gdzie na stronie i co powinno być widać)
- Czego nie zrobiłem i dlaczego: …
## Liczby
przed → po (z testów/pomiaru) …
```
Dopisz: wzorce zrzutów (`*-snapshots/`) odświeża właściciel, jeśli zmienił się wygląd. Poczekaj na CI (shardy 1–4); znane flaki (library-only-fetched:103, library-search:99, picker-scroll:25, network-resilience:135) – zrób rerun, nie zmieniaj tych testów.

## 8. Zakazy
Nie edytuj `docs/STAN.md`, `package.json`, `pnpm-lock.yaml`, istniejących testów ani snapshotów. Bez nowych pakietów. Nie scalaj PR. Musisz zmienić plik spoza listy „Zmieniaj” → zatrzymaj się i opisz w PR dlaczego. Kolory/czasy/odstępy tylko z tokenów (`config/tokens.json`), pliki do ok. 200 linii, komentarze po polsku, nazwy po angielsku, kody TERYT jako string. Nie czytaj nic poza `AGENTS.md` i plikami/fragmentami wskazanymi w sekcji 3.

## 9. Zależności
Po scaleniu E: `test -f src/core/map/camera-retarget.ts && echo OK`. Rusza `AtlasMap.tsx` → po E, przed G. (Technicznie niezależne od kamery, ale ten sam plik ekranu – kolejno.)
