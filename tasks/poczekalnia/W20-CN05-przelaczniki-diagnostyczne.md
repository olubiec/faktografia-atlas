# W20-CN05 – Przełączniki diagnostyczne `?diag=` do sprawdzenia na iPhonie
Prompt samowystarczalny. Kontekst: `docs/research/q-cienie-C-zamiennik.md`, `docs/research/q-cienie-test-iphone.md` (protokół właściciela).

## 1. Cel
Właściciel może na jednym podglądzie Vercel w Safari ustalić, co powoduje cienie, bez kolejnych PR-ów: dopisując do adresu `?diag=…` wyłącza po kolei przejście koloru, warstwę kreskowania albo obrys wybranej jednostki.

## 2. Decyzje
- Wartości (można łączyć przecinkiem): `notrans` (przejście koloru zawsze 0), `nohatch` (nie rysuj `choropleth-nodata-layer`; „brak danych” widać wtedy jako jednolity `--linia` z warstwy kolorów = wygląd docelowy z CN10), `nooutline` (nie rysuj `selected-outline-layer`).
- Domyślnie (brak `diag`) zachowanie bez zmian. Parametr czytany przez `new URLSearchParams(window.location.search)`, bez dotykania `readUrlState` ani `writeUrlState` (nie jest częścią adresu aplikacji). Brak wpływu na `?e2e`.
- Przy aktywnym `diag` w konsoli jeden `console.info('[diag] …')` na zmianę wartości.
- Tymczasowe: PR opisuje, że przełączniki zostaną usunięte po ustaleniu przyczyny (osobne zadanie, nie teraz).

## 3. Pliki
- Zmieniaj: `src/core/map/diag.ts` (nowy), `src/view/map/layers/choropleth.ts`, `tests/unit/diag.test.ts` (nowy), `tests/unit/choropleth-diag.test.ts` (nowy)
- Wymagane: `tests/unit/choropleth-layers-split.test.ts` (nie ruszać)
- Czytaj tylko: `choropleth.ts` (trzy fabryki).

## 4. Kroki
1. `diag.ts`: `parseDiag(search: string): { notrans: boolean; nohatch: boolean; nooutline: boolean }` (nieznane wartości ignorowane, wielkość liter bez znaczenia, puste = same `false`).
2. Testy najpierw: `diag.test.ts` (puste, pojedyncze, kilka po przecinku, śmieci, wielkie litery); `choropleth-diag.test.ts` (`vi.stubGlobal('location', …)` lub `window.history.replaceState`): `notrans` → `transitions.getFillColor === 0` mimo ten sam klucz; `nohatch` → `choroplethNoDataLayerFactory.create` zwraca `null`, a warstwa kolorów nadal koloruje `no-data` na `resolveTokenColor('--linia')`; `nooutline` → `selectedOutlineLayerFactory.create` zwraca `null`; bez `diag` – zachowanie jak w istniejących testach.
3. Kod: odczyt `diag` raz na wywołanie fabryki (tanio) przez `parseDiag(window.location.search)`; w SSR/bez `window` → wszystko `false`.

## 5. Gotowe, gdy
- Testy 4.2 zielone; `choropleth-layers-split.test.ts` bez zmian zielony.
- Podgląd: `…?diag=notrans`, `…?diag=nohatch`, `…?diag=nooutline` zmieniają odpowiednie elementy; bez parametru mapa wygląda jak po CN04.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN05 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN05] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
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
Po CN04 (`choropleth.ts`). Nie potrzebuje `AtlasMap.tsx`.
