# W21 – Animacja koloru bez transitions GPU (iPhone/Safari): kolejność zadań

Research: `docs/research/q-cienie-2-analiza.md` (oraz `q-cienie-A-shader.md`, `-test-iphone.md`). Fala 21 jest osobna od Q2 i od W20 (nazwy `W21-*`), więc „start Q2” jej nie uruchomi.
Zadania AN01-AN06 opisują zakres już zaimplementowany na gałęzi `claude/q-cienie-research`; opisy służą do przeglądu i odtworzenia. AN07 i AN08 to zapasy.

## Plan
Przyczyna artefaktów (białe wielokąty, ciemne kliny, niebieskie odłamki) jest najpewniej w `transitions.getFillColor` (GPU transform feedback, `gpu-interpolation-transition.js`). Usuwamy transitions z warstw kolorów i animujemy kolor na CPU w `getFillColor`, symetrycznie w obie strony.

## Tabela
| ID | Plik | Co | Zależy od |
|---|---|---|---|
| AN01 | `W21-AN01-usuniecie-transitions-gpu.md` | brak `transitions` w `choropleth.ts`, `localities.ts` | – |
| AN02 | `W21-AN02-modul-fill-blend.md` | czysta logika mieszania koloru + testy | – |
| AN03 | `W21-AN03-wydzielenie-choropleth-color.md` | `choropleth-color.ts` (kolor jednostki) | AN02 |
| AN04 | `W21-AN04-naped-klatek-blend.md` | klatki blend w `useChoropleth` (33 ms) | AN01-AN03 |
| AN05 | `W21-AN05-symetryczny-reveal.md` | reveal w obie strony + testy | AN04 |
| AN06 | `W21-AN06-szew-atlas-i-e2e-s21.md` | `__atlas` + e2e `@S21` | AN05 |
| AN07 | `W21-AN07-ZAPAS-cross-dissolve.md` | ZAPAS: dwie warstwy, `opacity` jako uniform | test właściciela |
| AN08 | `W21-AN08-ZAPAS-natywne-warstwy-maplibre.md` | ZAPAS: wypełnienia MapLibre | test właściciela, AN07 nie pomogło |

## Kolejność
```
AN01 → AN02 → AN03 → AN04 → AN05 → AN06     (wszystkie ruszają choropleth.ts / useChoropleth.ts: po kolei)
AN07 tylko jeśli po AN06 artefakty zostają; AN08 tylko jeśli zostają mimo AN07
```
Prompt startowy: `Wykonaj dokładnie plik tasks/poczekalnia/W21-ANxx-….md, nic poza nim; nie czytaj innych dokumentów poza AGENTS.md i wskazanymi w zadaniu.`

## Sprawdzenie zależności jednym poleceniem
| Zadanie | Polecenie |
|---|---|
| AN04 | `test -f src/core/map/fill-blend.ts && test -f src/view/map/layers/choropleth-color.ts && echo OK` |
| AN05 | `grep -c "blend" src/view/map/hooks/useChoropleth.ts` (≥ 1) |
| AN06 | `grep -c "transitions" src/view/map/layers/choropleth.ts` (= 0) |

## Co sprawdza właściciel na iPhone
Safari, podgląd: https://faktografia-atlas-git-claude-q-cienie-research-olubiec.vercel.app (dopisz parametr na końcu adresu). Ścieżka: kraj → województwo → powiat → „Wróć” ×2, szczypanie, zmiana wskaźnika. Zgłoś dla każdego adresu: są / nie ma artefaktów (białe wielokąty, ciemne kliny, niebieskie odłamki, wachlarze) przy pierwszym wczytaniu, cofaniu i szczypaniu.
| Adres | Co oznacza wynik „artefaktów nie ma” | Co oznacza „są nadal” |
|---|---|---|
| (bez dopisku, wersja po AN06) | sukces; AN07/AN08 niepotrzebne | sprawdź trzy poniższe |
| `?diag=notrans` | winne przejścia koloru GPU (jeśli ta wersja ma jeszcze transitions) | przejścia nie są przyczyną |
| `?diag=nohatch` | winne kreskowanie „brak danych” → CN10 (zgoda na zmianę STYL §2) | kreskowanie nie jest przyczyną |
| `?diag=nooutline` | winna warstwa obrysu wybranej | obrys nie jest przyczyną |
| `?diag=notrans,nohatch,nooutline` | kombinacja; wyłączaj po jednym | problem w samej warstwie wypełnień: uruchom AN07, potem AN08 |
Wynik przesądza o uruchomieniu zapasów (AN07, AN08, CN10).
