# W20-CN02 – Bez przejścia koloru w trakcie animacji „reveal”
Prompt samowystarczalny. Kontekst: `docs/research/q-cienie-E-cofanie.md` (K1/K6).

## 1. Cel
Podczas 900 ms animacji pojawiania się jednostek kolor nie jest dodatkowo wygładzany drugą animacją 300 ms, restartowaną co klatkę (rozjazd dwóch animacji = „dziwne animacje” przy zatrzymaniu).

## 2. Decyzje
- `useChoropleth` zmienia `reveal.progress` co klatkę rAF, a `updateTriggers.getFillColor` zawiera `reveal.progress`; każda klatka restartuje 300 ms przejście. Gdy `reveal.running === true` → `transitions.getFillColor = 0`.
- Po zakończeniu reveal (`running === false`) przejście wraca (zmiana wskaźnika/roku nadal płynna).
- Reveal sam w sobie (kolejność, opóźnienia, 900 ms) bez zmian.

## 3. Pliki
- Zmieniaj: `src/core/map/fill-transition.ts` (z CN01), `src/view/map/layers/choropleth.ts` (tylko wyliczenie ms), `tests/unit/fill-transition.test.ts` (dopisz przypadki; to plik z CN01, nie „istniejący test” – dopisujesz, nie zmieniasz asercji), `tests/unit/choropleth-transition.test.ts` (j.w.)
- Wymagane: `tests/e2e/reveal.spec.ts` (istnieje, nie ruszać)
- Czytaj tylko: `fill-transition.ts`, `choropleth.ts` fabryka (linie z `reveal`).

## 4. Kroki
1. Testy najpierw: `resolveFillTransition(key, baseMs, { revealRunning: true })` → `ms 0` (także gdy klucz bez zmian); `revealRunning: false` → jak w CN01. W teście fabryki: `choropleth.reveal = { running: true, progress: 0.4 }` → `transitions.getFillColor === 0`; `{ running: false, progress: 1 }` → 300.
2. Kod: trzeci parametr opcji `{ revealRunning?: boolean }`; fabryka przekazuje `choropleth.reveal?.running ?? false`.

## 5. Gotowe, gdy
- Testy z kroku 1 zielone, `reveal.spec.ts` bez zmian.
- Podgląd: po wejściu/cofnięciu jednostki pojawiają się falą raz, bez „drugiego” przygasania po zatrzymaniu ruchu.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN02 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN02] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
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
Po CN01 (ten sam plik `fill-transition.ts` i `choropleth.ts`). Sprawdzenie startu: `test -f src/core/map/fill-transition.ts && echo OK`.
