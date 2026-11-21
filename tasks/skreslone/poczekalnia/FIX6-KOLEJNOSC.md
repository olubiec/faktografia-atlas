# FIX6 – kolejność zadań animacji kamery

Research i diagnoza: `docs/research/p-animacja-kamery.md`. Każde zadanie = jeden PR, 1–5 plików, jeden subagent. Zadania są w tym katalogu i **zostały wykonane i scalone 18.11.2026** (PR #493–#502, plan #492); plik zostaje jako zapis kolejności.

**Status: ✅ wszystkie 10 zadań scalone.** Pomiar (SwiftShader) nie spełnił progów, werdykt po telefonie właściciela (`docs/research/p-animacja-kamery-pomiar.md`). Dalsze prace nad startem mapy: FIX7 (#503, 🔶).

## Tabela
| ID | Plik zadania | Co | Zależy od | Rusza `AtlasMap.tsx` / `useMapViewState.ts` | Rozm. |
|---|---|---|---|---|---|
| ✅ A #494 | `W2-FIX6A-artefakty-warstwa.md` | wzór „brak danych” w osobnej warstwie (wachlarze) | – | tak: 1 linia w `AtlasMap.tsx` | S |
| ✅ B #493 | `W2-FIX6B-plan-kamery.md` | `camera-plan.ts`: easing, czas, zoom log | – | nie | S |
| ✅ I #495 | `W2-FIX6I-pomiar-klatek.md` | pomiar przed/po, progi | – | nie | S |
| ✅ H1 #496 | `W2-FIX6H1-sterownik-kamery.md` | sterownik rAF + `jumpTo` (niepodłączony) | B | nie | M |
| ✅ H2 #497 | `W2-FIX6H2-kamera-bez-reacta.md` | podłączenie, mapa niekontrolowana | H1 | tak (oba) | L |
| ✅ C #498 | `W2-FIX6C-kolko.md` | tempo kółka | H2 | tak (`AtlasMap`) | S |
| ✅ D #499 | `W2-FIX6D-dotyk-pinch.md` | pinch i przerwanie dotykiem | C | tak (oba) | S |
| ✅ E #500 | `W2-FIX6E-cofnij.md` | „Cofnij” tym samym planerem, retarget | D | tak (`useMapViewState`) | M |
| ✅ F #501 | `W2-FIX6F-koszyk-bez-pop.md` | koszyk zoomu 9 bez „pop” | E | tak (`AtlasMap`) | S |
| ✅ G #502 | `W2-FIX6G-reduced-motion.md` | reduced-motion + tabela „po” | F, I | nie | S |

## Kolejność
```
równolegle:  A (po FIX4, bez konfliktów)   B   I
potem:       H1 (po B) → H2 (po H1) → C → D → E → F → G (po F i I)
```
- Równolegle mogą iść tylko A, B, I (A tylko jeśli żadne z H2–F nie jest w trakcie – dotyka jednej linii `AtlasMap.tsx`; w razie wątpliwości A idzie pierwsze).
- Zadania ruszające `AtlasMap.tsx`/`useMapViewState.ts` (H2, C, D, E, F) idą **po kolei**, każde po scaleniu poprzedniego.
- Punkt kontrolny właściciela (telefon): po A (wachlarze), po H2 (płynność „Wróć”/wejście), po F (miejscowości bez „pop”), po G (reduced-motion + liczby przed/po).
- Kryteria liczbowe całości: `docs/research/p-animacja-kamery.md` §5.

## Jednolinijkowy prompt startowy dla subagenta
Podstaw literę/ID i nazwę pliku:

> Wykonaj dokładnie plik tasks/poczekalnia/W2-FIX6X-….md, nic poza nim; nie czytaj innych dokumentów poza AGENTS.md i wskazanymi w zadaniu.

Przykład: `Wykonaj dokładnie plik tasks/poczekalnia/W2-FIX6B-plan-kamery.md, nic poza nim; nie czytaj innych dokumentów poza AGENTS.md i wskazanymi w zadaniu.`

## Sprawdzenie zależności jednym poleceniem (przed startem)
| Zadanie | Polecenie |
|---|---|
| H1 | `test -f src/core/map/camera-plan.ts && echo OK` |
| H2 | `test -f src/view/map/hooks/useCameraDriver.ts && test -f src/core/map/camera-plan.ts && echo OK` |
| C | `grep -c initialViewState src/view/map/AtlasMap.tsx` (≥ 1) |
| D | `test -f src/core/map/camera-wheel.ts && echo OK` |
| E | `test -f tests/e2e/fix6-touch-interrupt.spec.ts && echo OK` |
| F | `test -f src/core/map/camera-retarget.ts && echo OK` |
| G | `ls tests/e2e/fix6-*.spec.ts \| wc -l` (≥ 6) i `test -f docs/research/p-animacja-kamery-pomiar.md && echo OK` |
