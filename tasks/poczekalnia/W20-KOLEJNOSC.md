# W20 – Cienie i wachlarze przy ruchu mapy (iPhone/Safari): kolejność zadań

Research: `docs/research/q-cienie-A-shader.md`, `-C-zamiennik.md`, `-E-cofanie.md`, `-F-gotowce.md`. Protokół sprawdzenia na telefonie: `docs/research/q-cienie-test-iphone.md`.
Fala 20 jest osobna od Q2 (nazwy `W20-*`), więc „start Q2” jej nie uruchomi.

## Hipoteza i plan
Najbardziej prawdopodobna przyczyna: `transitions.getFillColor` w deck.gl paruje wierzchołki starego i nowego zestawu cech po indeksie (nie po TERYT) przy zmianie poziomu (woj↔pow↔gmi) → promieniste gradienty. Dokładają: restart przejścia co klatkę reveal (CN02), podwójny start reveal z odpytywania adresu (CN03), przebudowa geometrii warstw co klatkę (CN04). Nie zostało to potwierdzone na urządzeniu (SwiftShader tego nie odtwarza), więc CN05 daje przełączniki do diagnozy na jednym podglądzie.

## Tabela (jedna paczka, jeden podgląd Vercel po CN06)
| ID | Plik | Co | Zależy od | Rusza `AtlasMap.tsx` |
|---|---|---|---|---|
| CN01 | `W20-CN01-przejscie-koloru-miedzy-poziomami.md` | przejście koloru = 0 przy zmianie zestawu cech | – | nie |
| CN02 | `W20-CN02-bez-przejscia-podczas-reveal.md` | przejście = 0 w trakcie reveal | CN01 | nie |
| CN03 | `W20-CN03-zakres-bez-odpytywania.md` | zakres z `useMapSelection`, bez `setInterval` 100 ms | CN02 | tak (1 linia) |
| CN04 | `W20-CN04-stabilne-dane-warstw.md` | stabilne referencje `data` (nodata, obrys) | CN03 | nie |
| CN05 | `W20-CN05-przelaczniki-diagnostyczne.md` | `?diag=notrans,nohatch,nooutline` | CN04 | nie |
| CN06 | `W20-CN06-szew-testowy-i-e2e-cofania.md` | `__atlas.fill` + e2e `@S20` | CN01–CN05 | nie |
| CN10 | `W20-CN10-ZAPAS-jednolity-kolor-brak-danych.md` | ZAPAS: jednolity kolor zamiast kreskowania (zmienia STYL §2) | decyzja właściciela | tak (1 linia) |

## Kolejność
```
CN01 → CN02 → CN03 → CN04 → CN05 → CN06     (po kolei: wszystkie ruszają choropleth.ts; CN03 dodatkowo AtlasMap.tsx)
CN10 tylko po decyzji właściciela, jeśli po CN06 cienie zostają
```
Pozostałe warunki: CN03 po scaleniu FIX7 (#503) i gdy żadne zadanie Q2 nie rusza `AtlasMap.tsx`.
Poziom 4 (ostateczność, decyzja architektoniczna, bez zadania): fade między poziomami albo warstwy wypełnień MapLibre (`q-cienie-F-gotowce.md`).

## Jednolinijkowy prompt startowy dla subagenta
> Wykonaj dokładnie plik tasks/poczekalnia/W20-CNxx-….md, nic poza nim; nie czytaj innych dokumentów poza AGENTS.md i wskazanymi w zadaniu.

## Sprawdzenie zależności jednym poleceniem
| Zadanie | Polecenie |
|---|---|
| CN02 | `test -f src/core/map/fill-transition.ts && echo OK` |
| CN03 | `grep -c revealRunning src/core/map/fill-transition.ts` (≥ 1) |
| CN04 | `grep -c "selectedTeryt" src/view/map/hooks/useChoropleth.ts` (≥ 2) i `! grep -q setInterval src/view/map/hooks/useChoropleth.ts && echo OK` |
| CN05 | `test -f src/core/map/memo-last.ts && echo OK` |
| CN06 | `test -f src/core/map/diag.ts && grep -c getFillTransitionState src/core/map/fill-transition.ts` (≥ 1) |

## Co sprawdza właściciel (po CN06, iPhone, Safari, podgląd Vercel)
Zob. `docs/research/q-cienie-test-iphone.md`.
