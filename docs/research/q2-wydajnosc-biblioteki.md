# Q2 – QR07: wydajność biblioteki (DOM, czas wejścia, rozmiary)

Pomiar z 19.11.2026, Chromium (Playwright 1.x, bez dławienia sieci i CPU), `vite preview` na buildzie z `origin/main` (3ed628d), 5 wejść na stronę, podane mediany. Dane: syntetyczny `index.json` w kształcie prawdziwego (40 działów, 800 podgrup, 63 960 zmiennych, z czego 1773 z `has: 1`), podstawiony przez `page.route` (nic z sieci). Skrypt pomiarowy nie jest częścią PR (zadanie: tylko ten plik).

## Ustalenia
1. Strona `/biblioteka` nie czyta `available.json`, tylko `index.json` (całe 63 960 zmiennych); 1773 pozycji to ta część spisu, która ma pobrane wartości (`has: 1`, filtr „tylko pobrane”, `?p=1`). Założenie zadania („1773 pozycji na stronie”) jest więc zawyżone dla widoku domyślnego i zaniżone dla spisu.
2. Lista wyników jest już stronicowana po 50 („Pokaż więcej” dodaje kolejne 50, `LibraryResults.tsx`). Na starcie jest 50 kart bez względu na liczbę trafień: 709 elementów DOM na `/biblioteka` (strona główna: 157), 728 przy wyszukiwaniu.
3. DOM rośnie liniowo (ok. 9 elementów na pozycję): po rozwinięciu wszystkich 1773 pobranych (36 kliknięć) jest 16 214 elementów. To krańcowy scenariusz, nikt go nie wykona na telefonie; przy typowych 2–3 kliknięciach to ok. 1 500–2 500 elementów.
4. Koszt wejścia nie leży w DOM, tylko w pobraniu i parsowaniu spisu: `index.json` ma 7,29 MB, po gzip 639 kB (prawdziwy z 26.10: 7,9 MB / 593 kB). `available.json` dla 1773 pozycji: 325 kB, po gzip 17 kB (nie jest ładowany przez stronę).
5. Czas do pierwszych wyników (lokalnie, 7 MB podane z pamięci, więc bez sieci): `/biblioteka` 2,2 s (min 1,5 s, maks 3,5 s); `/biblioteka?p=1` 2,1 s; strona główna 0,5 s; `/porownaj` 0,4 s; `/rankingi` 0,3 s. `DOMContentLoaded` na `/biblioteka` to 0,4 s, więc ok. 1,8 s to pobranie, `JSON.parse` i przygotowanie spisu (`getPreparedIndex`), a nie render. Sterta JS 50 MB (strona główna 10 MB).
6. `/porownaj` (115 elementów) i `/rankingi` (140 elementów) nie ładują spisu biblioteki i mają małe DOM-y; nie ma tu problemu.
7. Paczka JS: `index-*.js` 1,76 MB / 536 kB gzip, `AtlasMap-*.js` 1,33 MB / 364 kB gzip. `/biblioteka` ładuje ten sam pakiet główny co mapa (21 zasobów, 2,15 MB po zdekodowaniu).
8. Na realnej sieci komórkowej (np. 1,6 Mb/s) 639 kB to ok. 3,2 s samego pobrania, więc to jest najdroższy element biblioteki (liczba orientacyjna, nie zmierzona).

## Dowody
- `src/view/library/LibraryResults.tsx:42` `useState(50)`, `:53` `filtered.slice(0, limit)`, `:123` przycisk „Pokaż więcej” (`+50`).
- `src/core/library/load-library.ts:99` `fetch(<base>/index.json)`; `available.json` nie występuje w `src/` (polecenie: `grep -rn "available.json" src` – brak trafień).
- Generowanie spisu: syntetyczny `index.json` 63 960 zmiennych = 7 288 100 B, gzip 638 804 B; `available.json` 1773 pozycji = 325 336 B, gzip 17 324 B.
- Pomiar (mediana z 5 wejść, `document.querySelectorAll('*').length` po pojawieniu się pierwszej karty): `/biblioteka` 709 · `?p=1` 709 · `?q=wskaznik` 728 · `/porownaj` 115 · `/rankingi` 140 · `/` 157 · `?p=1` po 36× „Pokaż więcej” 16 214.
- Czasy do pierwszej karty / treści: 2231 · 2129 ms · /porownaj 380 · /rankingi 327 · / 496 ms.
- Build: `pnpm build` → `dist/assets/index-CsUJ3hAb.js` 1 759 996 B (gzip 535 677 B).
- Ograniczenia pomiaru: jeden komputer, bez dławienia, syntetyczne nazwy (prawdziwe są dłuższe i bardziej zróżnicowane, więc parsowanie może być nieco wolniejsze), `/porownaj` i `/rankingi` mierzone bez wybranych par i danych profilu.

## Rekomendacja
Wirtualizacji nie wprowadzać (nie). Powody: lista ma twardy limit 50 kart na start (709 elementów), a przy ciągłym rozwijaniu rośnie powoli i tylko na żądanie; dodatkowa biblioteka (nowy pakiet, osobne reguły dostępności, kłopoty z czytnikami ekranu, „wstecz” z zachowaniem przewinięcia) kosztowałaby więcej niż zysk. PLAN-POPRAWEK („nie, wyniki ≤ 50”) potwierdza się dla DOM.

Prawdziwy koszt to rozmiar i parsowanie `index.json` (639 kB gzip, ok. 1,8 s na komputerze). To jest temat następnej poprawki, ale dopiero po sprawdzeniu na prawdziwym urządzeniu i sieci; bez tego nie zmieniamy architektury spisu. Do zrobienia teraz: tani test pilnujący, żeby DOM przy starcie biblioteki nie urósł niepostrzeżenie (próg 1 000 elementów, ok. 40 % zapasu nad 709).

## Proponowane zadania
1. **QR07a – próg DOM na /biblioteka**
   - Zmieniaj: tests/e2e/library-dom-budget.spec.ts (nowy plik)
   - Cel: test @S21 z syntetycznym spisem 5 000 zmiennych (`page.route`) sprawdza, że po wejściu na `/biblioteka` jest ≤ 1 000 elementów DOM i dokładnie 50 kart, a po jednym „Pokaż więcej” 100 kart.
   - Gotowe, gdy: test przechodzi lokalnie i w CI; nie zmienia istniejących testów; w PR liczby z biegu.
2. **QR07b – pomiar na prawdziwym urządzeniu i sieci**
   - Zmieniaj: docs/research/q2-wydajnosc-biblioteki-urzadzenie.md (nowy plik)
   - Cel: zmierzyć czas do pierwszych wyników `/biblioteka` na telefonie właściciela (Slow 4G, procesor 4× wolniejszy w DevTools) z prawdziwym `index.json` z gałęzi `data/library`.
   - Gotowe, gdy: raport ma czas medianowy z 5 wejść i jednoznaczną decyzję: czas ≤ 3 s → nic nie robimy; > 3 s → zadanie QR07c.
3. **QR07c (warunkowe) – odchudzenie spisu**
   - Zmieniaj: wskazane w osobnym prompcie (robot spisu `scripts/data`, wymaga zgody właściciela) 
   - Cel: dzielić `index.json` na część lekką (id, nazwa, dział, `has`) i resztę ładowaną na żądanie, jeśli QR07b wykaże > 3 s.
   - Gotowe, gdy: rozmiar części startowej po gzip ≤ 300 kB i wszystkie istniejące testy biblioteki przechodzą bez zmian.
