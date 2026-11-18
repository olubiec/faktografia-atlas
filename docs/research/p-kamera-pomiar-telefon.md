# P1 – Pomiar klatek kamery przy dławieniu procesora (raport wyjściowy)

Stan: 18.11.2026, gałąź `claude/PF01`, `origin/main` = 157d304. Zmiany tylko w narzędziu pomiarowym i testach; kod strony bez zmian.

## 1. Metoda
- Uruchomienie: `PERF=1 pnpm exec playwright test tests/e2e/perf-camera-frames.spec.ts --workers=1` na `pnpm build` + `vite preview`.
- Maszyna: Intel Xeon 2,1 GHz, 4 rdzenie, Linux x86_64 (kontener w chmurze). Playwright 1.64.1, Chromium headless (z `/opt/pw-browsers`), WebGL programowy: `--use-gl=swiftshader --enable-unsafe-swiftshader`.
- Widok 390×844, `hasTouch`, `deviceScaleFactor: 3`. Dławienie CPU ×4: CDP `Emulation.setCPUThrottlingRate { rate: 4 }` (`context.newCDPSession`). Pinch: CDP `Input.dispatchTouchEvent`.
- Próbnik: własny `requestAnimationFrame` zapisujący znaczniki czasu; długie zadania: `PerformanceObserver` (`longtask`). Statystyki: `src/core/map/frame-stats.ts` (`summarizeFrames`).
- Każdy scenariusz w świeżym kontekście, jedno uruchomienie (bez mediany). Baner zgody odrzucany. Arkusz wskaźnika na telefonie otwierany przed oknem pomiaru. Okno pomiaru: od akcji do 2,5 s po niej.
- Definicje: długa klatka = odstęp > 50 ms; zgubione = odstęp > 1,5 × 16,7 ms.

## 2. Wyniki (jedno uruchomienie, `PERF=1`, dławienie ×4)
| Scenariusz | klatki | czas ms | p50 | p95 | max | długie | zgubione | zadania >50 ms | zoom start → koniec |
|---|---|---|---|---|---|---|---|---|---|
| (a) wyszukiwarka → województwo | 27 | 1783 | 16,7 | 200 | 900 | 4 | 19% | 6 | 4,58 → 6,27 |
| (b) `+` | 144 | 4067 | 16,7 | 16,8 | 1517 | 3 | 2% | 3 | 4,58 → 5,08 |
| (c) kółko ×3 | 14 | 2883 | 83,3 | 1650 | 1650 | 9 | 64% | 10 | 4,58 → 4,91 |
| (d) pinch dwoma palcami | 161 | 21032* | 16,7 | 1117 | 1833 | 24 | 16% | 24 | 4,58 → 7,08 |
| (e) „Wróć” (strzałka w ścieżce) | 6 | 1467 | 16,7 | 767 | 767 | 2 | 33% | 6 | 6,69 → 4,62 |
| (f) zmiana wskaźnika | 6 | 833 | 16,7 | 750 | 750 | 1 | 17% | 4 | 4,58 → 4,58 |
| (g) przełączenie na „Powiaty” | 6 | 7933 | 16,7 | 4400 | 4400 | 2 | 33% | 4 | 4,58 → 4,58 |

*) czas (d) to głównie czas samej emulacji gestu (każde zdarzenie CDP czeka na zajęty wątek), nie czas animacji aplikacji.

Wnioski wprost z liczb: przy ×4 mediana klatki jest zwykle poprawna (16,7 ms), ale ogon jest bardzo zły: pojedyncze klatki trwają 0,75–4,4 s. Najgorzej wypadają kółko ×3 (64% zgubionych), przełączenie na Powiaty (jedna klatka 4,4 s) i pinch (24 długie klatki). `+` skacze o 0,5 zoomu (zob. QC401), a mimo to ma 144 klatek, bo ruch to jeden skok, a reszta okna to spoczynek.

## 3. Ograniczenia pomiaru
- WebGL jest programowy (SwiftShader), więc czasy rysowania są wyraźnie gorsze niż na GPU telefonu. Długie zadania i klatki są zawyżone; liczby służą do porównania przed/po, nie jako bezwzględna ocena telefonu.
- Dławienie ×4 dotyczy tylko głównego wątku strony, nie procesu GPU ani sieci.
- Jedno uruchomienie na scenariusz, bez mediany; rozrzut między uruchomieniami nie został zmierzony (w QC401 był duży).
- Okno 2,5 s po akcji zawiera także spoczynek, więc `p50` jest niemal zawsze 16,7 ms; ważne są `p95`, `max`, długie klatki i zgubione.
- Liczba klatek zależy od długości okna i wątku zajętego emulacją gestów (pinch, kółko).
- Zwykłe `pnpm test:e2e` nie uruchamia scenariuszy pomiarowych (wymagają `PERF=1`); jedyny test bez warunku sprawdza samo narzędzie na pustej stronie `about:blank`, bo mapa w headless nie daje stabilnej bezczynności.

## 4. Próg do dalszych zadań (propozycja, decyduje właściciel)
Przy dławieniu ×4 i tej samej metodzie:
- `p95` < 33 ms w ruchach (a)–(e),
- `droppedShare` < 10%,
- `max` < 100 ms (brak klatek zatrzymujących mapę),
- zero długich klatek (> 50 ms) podczas samego ruchu kamery.
Obecny stan nie spełnia żadnego z progów poza (b) dla `p95`/`droppedShare`.
