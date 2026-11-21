# W20-CN10 – ZAPAS: jednolity kolor „brak danych” zamiast kreskowania
**NIE URUCHAMIAĆ bez zgody właściciela.** Zmienia `docs/STYL.md` §2 (kreskowanie → jednolity kolor) – wymaga decyzji; uruchamiamy tylko, jeśli po CN01–CN05 cienie nadal są na iPhonie i `?diag=nohatch` je usuwa (protokół: `docs/research/q-cienie-test-iphone.md`). Kontekst: `docs/research/q-cienie-C-zamiennik.md` (rekomendacja: jednolity `--linia` + obrys).

## 1. Cel
„Brak danych” to jednolity kolor tokenu z cienką linią granicy; bez `FillStyleExtension` i bez drugiej warstwy.

## 2. Decyzje
- Usuń `choroplethNoDataLayerFactory`, `no-data-pattern.ts` i ich rejestrację w `AtlasMap.tsx` (jedna linia); legenda „brak danych” w `docs/STYL.md` §2 opisana jako jednolity kolor `--linia` (zgoda właściciela w PR).
- Istniejące testy kreskowania (`no-data-pattern.test.ts`, `choropleth-layers-split.test.ts`) zostają zastąpione: jeśli przeszkadzają, **zatrzymaj się** i opisz w PR (reguła „nie zmieniasz istniejących testów”) – właściciel zdecyduje, czy je usunąć.
- Brak nowych pakietów (alternatywa awaryjna z C: `PathLayer` + `MaskExtension` – tylko osobnym zadaniem).

## 3. Pliki
- Zmieniaj: `src/view/map/layers/choropleth.ts`, `src/view/map/layers/no-data-pattern.ts` (usunięcie), `src/view/map/AtlasMap.tsx` (jedna linia), `docs/STYL.md` (§2, po zgodzie), `tests/unit/choropleth-flat-nodata.test.ts` (nowy)
- Czytaj tylko: te pliki oraz `docs/STYL.md` §2.

## 4. Kroki
1. Test: warstwa kolorów dla klasy `no-data` ma kolor `resolveTokenColor('--linia')`; brak `choropleth-nodata-layer` w liście fabryk; brak `FillStyleExtension` w `src/`.
2. Usuń kod, zaktualizuj STYL §2, opisz zmianę wyglądu w PR „Po ludzku”.

## 5. Gotowe, gdy
- Testy zielone; podgląd: obszary bez danych jednolite, bez cieni w ruchu.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/CN10 origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (jeśli jest): `pnpm exec playwright test <plik> --trace off`.
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W20-CN10] <krótko>`. Opis po polsku, bez `Closes #`, z sekcjami:
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
Czeka na decyzję właściciela. Dotyka `AtlasMap.tsx` (jedna linia) i `STYL.md`.
