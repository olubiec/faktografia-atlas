# W2-FIX6I – Pomiar klatek przed/po z progami FIX6
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Powtarzalny pomiar „przed/po” dla ruchu kamery z progami liczbowymi FIX6, bez zmiany kodu strony. Na podglądzie: nic.

## 2. Decyzje
- Metoda i narzędzia z PF01 (`tests/e2e/perf-camera-frames.spec.ts`, `src/core/map/frame-stats.ts`): dławienie ×4, SwiftShader, 390×844. Nie modyfikujesz ich; nowy plik je importuje.
- Scenariusze: `wheel×3`, `pinch`, `cofnij` (przycisk „Wróć” w ścieżce po wejściu w województwo), `powrot_z_powiatow` (`?l=pow` → przełącz na Województwa i wróć), `zoom_do_gminy` (kółko ×15). Każdy w świeżym kontekście, 3 uruchomienia, mediana p95.
- Progi (§5 research): p95 ≤ 33, droppedShare < 0,10, max ≤ 100, zoom skok ≤ 0,25/klatkę. Asercje progów tylko gdy `PERF=1` i `FIX6_GATE=1`; domyślnie test tylko zbiera i drukuje (w CI pomijany).

## 3. Pliki
- Zmieniaj: `tests/e2e/fix6-camera-metrics.spec.ts` (nowy), `docs/research/p-animacja-kamery-pomiar.md` (nowy)
- Wymagane (istnieją, nie ruszać): `tests/e2e/perf-camera-frames.spec.ts`, `src/core/map/frame-stats.ts`
- Czytaj tylko: `tests/e2e/perf-camera-frames.spec.ts` (całość; helpery `installProbe`, `openPage`, `pinch` skopiuj do własnego pliku w stylu repo – nie importuj ze spec), `src/core/map/frame-stats.ts` (sygnatura `summarizeFrames`).
- Nie czytaj: reszty.

## 4. Kroki
1. Test najpierw (ten sam plik): jeden test bez `PERF` – funkcja pomocnicza `medianOf([3,1,2])` = 2 i `skokZoomu([5,5.1,5.4])` = 0,3 (eksportowane z pliku testu lub zdefiniowane lokalnie i sprawdzone) – by plik miał test działający w CI. Reszta: `test.skip(!process.env.PERF, …)`.
2. Scenariusze jak w sekcji 2; zoom na klatkę odczytuj z `window.__atlas.viewState.zoom` próbkowanego w tym samym rAF co znaczniki klatek (dopisz do próbnika drugą tablicę).
3. Uruchom `PERF=1` na `main` (stan „przed”) i wpisz tabelę (3 uruchomienia, mediana) do `docs/research/p-animacja-kamery-pomiar.md`: maszyna, wersje, kolumna „przed”, pusta kolumna „po” (uzupełnia zadanie G).
4. Nie zmieniaj niczego w `src/`.

## 5. Gotowe, gdy
- `pnpm exec playwright test tests/e2e/fix6-camera-metrics.spec.ts` bez `PERF` jest zielony (testy pomocnicze przechodzą, pomiary pominięte z komentarzem).
- `PERF=1 …` drukuje 5 scenariuszy; plik pomiaru zawiera liczby „przed” i próg z §5.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6I origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6I] `. Opis (po polsku, bez `Closes #`):
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
Brak (równolegle z A i B). Kolumnę „po” uzupełnia W2-FIX6G.
