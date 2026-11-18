# Q-CIENIE 2: analiza zrzutu z podglądu PR #505 i decyzja (usuwamy transitions GPU)

Stan: 18.11.2026. deck.gl / luma.gl jak w `pnpm-lock.yaml` (9.4.x). Dokument opisuje analizę i decyzję; zadania: `tasks/poczekalnia/W21-KOLEJNOSC.md`.

## 1. Co widać na zrzucie właściciela
Pierwsze wczytanie widoku „Polska” na podglądzie PR #505 (po zmianach CN01/CN02, które przełączały `transitions.getFillColor` między 0 a 300 ms na tej samej warstwie): mapa prawie biała, a w niej białe wielokąty, ciemne kliny i niebieskie odłamki. Kształty to nie wachlarze z poprzedniej analizy (promieniste gradienty przy cofaniu), tylko **błędne kolory całych trójkątów/wielokątów od pierwszej klatki**. To zmienia obraz: problem nie jest tylko „parowanie po indeksie przy zmianie poziomu”, bo tu nie było jeszcze żadnego poprzedniego zestawu.

## 2. Mechanizm: transitions atrybutów na GPU (deck.gl 9.4)
Plik: `node_modules/@deck.gl/core/dist/transitions/gpu-interpolation-transition.js`.
- l.15-22 `start()`: `if (transitionSettings.duration <= 0) { this.transition.cancel(); return; }` – czas ≤ 0 anuluje przejście i nie dotyka buforów; przejście 0 ↔ 300 ms przełącza więc ścieżkę kodu na tej samej warstwie.
- l.27-36: `cycleBuffers(buffers)` i `padBuffer({ fromLength: prevLength, toLength, fromStartIndices: prevStartIndices, getData: enter })` – bufor startowy (stary) jest dopełniany/przycinany do nowej długości po indeksie, nie po TERYT.
- l.37-41: `matchBuffer` – drugi bufor kopiuje rozmiar pierwszego; `this.setBuffer(buffers[1])` podmienia bufor atrybutu na bufor docelowy transformacji.
- l.55-60: `model.setAttributes({ aFrom: buffers[0], aTo: attribute.getBuffer() })`, `transformFeedback.setBuffers({ vCurrent: buffers[1] })`.
- l.62-73 `onUpdate()`: co klatkę `time = t/duration`, `transform.run({ discard: true })`.
- l.99-102 shader: `vCurrent = mix(aFrom, aTo, interpolation.time);` – kolor wierzchołka jest zawsze mieszanką bufora „od” i „do”, liczoną w transform feedback.
Wniosek: wynik na ekranie zależy od poprawnego działania WebGL2 transform feedback + `padBuffer` (odczyt synchroniczny) + przełączania buforów. Jeśli któryś krok na iOS zwróci zły bufor (nie zainicjowany, zła długość, nie ta kolejność wierzchołków dla `startIndices`), `vCurrent` zawiera śmieci: białe (0), ciemne (nie zainicjowane) i niebieskie (przypadkowe bajty RGBA) trójkąty. To pasuje do zrzutu bardziej niż „parowanie po indeksie”, które daje płynne gradienty, nie losowe kolory.

## 3. Hipotezy
- **H1 (główna): GPU transition na iOS WebGL2 / indeksowe parowanie wierzchołków.** Przejście atrybutu przez transform feedback daje zły bufor `vCurrent` przy pierwszym wczytaniu (przełączenie 0 ↔ 300 ms CN01/CN02 uruchamia `start` z `cancel` i bez; po anulowaniu bufor atrybutu bywa niezainicjowany). Przewidywanie: znika z `?diag=notrans`.
- **H2: kreskowanie FillStyleExtension warstwy „brak danych”.** `fill_uv` liczone w wierzchołku, `fwidth` w fragmencie; błąd precyzji daje paski/schodki, nie kolorowe kliny, ale warstwa leży nad kolorami. Przewidywanie: znika z `?diag=nohatch`; wcześniejsza analiza (q-cienie-A) uznała to za mało prawdopodobne.
- **H3: churn CPU** – przebudowa danych/atrybutów co klatkę (reveal, odpytywanie zakresu) dokłada przerywane przejścia. Naprawione w CN03/CN04 na main; wpływ drugorzędny.
- **H4: wachlarze już na main** (sprzed CN01/CN02) – cofanie daje wachlarze niezależnie od zmian z #505. Przewidywanie: na main wersja bez żadnych diag też je ma; po usunięciu transitions znikają.

## 4. Macierz eksperymentów (iPhone, Safari, podgląd Vercel)
Podgląd: https://faktografia-atlas-git-claude-q-cienie-research-olubiec.vercel.app
| ID | Adres | Co wyłącza | Oczekiwany wynik, jeśli H1 | Wniosek przy zniknięciu artefaktów |
|---|---|---|---|---|
| E0 | `?diag=notrans` | przejścia koloru GPU (0 ms) | artefakty znikają | winne transitions GPU → AN01-AN06 |
| E1 | `?diag=nohatch` | kreskowanie „brak danych” | bez zmian | winne kreskowanie (H2) → CN10 |
| E2 | `?diag=nooutline` | obrys wybranej | bez zmian | winna warstwa obrysu |
| E3 | `?diag=notrans,nohatch,nooutline` | wszystkie trzy | znikają | jeśli artefakty zostają: sama warstwa wypełnień/MapLibre → AN08 |
| E4 | podgląd po fali 21 (bez transitions) | – | brak artefaktów, płynny reveal | sukces; ewentualnie AN07 |

Drzewo decyzji:
1. E0 czysto → H1 potwierdzone; wdrożyć falę 21 (AN01-AN06), E4 potwierdza.
2. E0 nadal źle, E1 czysto → H2; wdrożyć CN10 (jednolity kolor, zmiana STYL §2, zgoda właściciela).
3. E0 i E1 źle, E3 czysto → kombinacja; wyłączać po jednym, wdrożyć odpowiednie.
4. E3 nadal źle → problem poza naszymi przejściami; AN07 (cross-dissolve), a w ostateczności AN08 (natywne warstwy MapLibre).
5. E4 nadal źle mimo AN01-AN06 → AN07, potem AN08.

## 5. Uczciwie o niepewności
Nic z powyższego nie zostało zweryfikowane na iOS. SwiftShader (headless Chromium) nie odtwarza błędu, WebKit nie jest dostępny w sesji, a wyszukiwanie w sieci nie znalazło zgłoszenia o zepsutym `GPUInterpolationTransition` na iOS/Metal. H1 to wniosek z kodu i z wyglądu zrzutu, nie z pomiaru. Dlatego fala 21 usuwa całą klasę ryzyka (atrybuty GPU), zamiast łatać jeden przypadek, a E0-E3 dają właścicielowi jednoznaczne rozstrzygnięcie na telefonie.

## 6. Decyzja
Usuwamy **wszystkie** `transitions` GPU z warstw kolorów (`choropleth.ts`, `localities.ts`). Płynność kolorów robi jedna animacja CPU w `getFillColor`: czysta funkcja `fill-blend` (mieszanie koloru bieżącego z docelowym w funkcji czasu, symetryczna w obie strony: wejście i cofanie), napędzana klatkami w `useChoropleth` (throttle 33 ms). Bufor atrybutu jest zawsze zwykłym, w pełni liczonym przez deck buforem, bez transform feedback.
Zapasy (tylko po teście właściciela na iPhonie):
- **AN07** – cross-dissolve dwóch warstw (stara i nowa z `opacity` jako uniform).
- **AN08** – natywne warstwy wypełnień MapLibre zamiast warstwy deck.gl.
- **CN10** – jednolity kolor zamiast kreskowania „brak danych” (zmienia STYL §2, wymaga zgody właściciela).
