# W2-FIX6B – Czysty planer kamery (easing, czas, zoom log)
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
Czysty moduł planera kamery (bez Reacta i przeglądarki), z którego korzysta cały reszta zadań: łagodny easing, czas zależny od dystansu, zoom logarytmiczny z wagą środka. Na podglądzie: nic się nie zmienia (moduł niepodłączony).

## 2. Decyzje
Zgodnie z `docs/research/p-animacja-kamery.md` §4 pkt 2–5. Bez nowych pakietów. Czasy z `config/tokens.json` (`motion.cameraOut` = 400, `motion.cameraIn` = 600); stałe 130 ms/punkt i mnożnik 1,5 to nazwane stałe w module.

## 3. Pliki
- Zmieniaj: `src/core/map/camera-plan.ts` (nowy), `tests/unit/camera-plan.test.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/core/map/camera.ts`, `src/core/map/ease.ts`, `src/core/map/view.ts` (typ `ViewState`)
- Czytaj tylko: `src/core/map/camera.ts` (cała, 40 linii), `src/core/map/view.ts` linie 1–15 (typ `ViewState`), `config/tokens.json` sekcja `motion`.
- Nie czytaj: nic więcej. Nie zmieniaj `camera.ts` ani `ease.ts` (zostają w użyciu do czasu zadania H2).

## 4. Kroki
1. Test najpierw `tests/unit/camera-plan.test.ts`:
   - `easeInOutCubic(0)=0`, `(1)=1`, `(0.5)=0.5`, monotoniczna na 101 punktach; pochodna numeryczna w t=0 i t=1 ≈ 0 (`|f(0.001)−f(0)| < 1e-5`).
   - `planDuration(from,to,viewportPx)`: Δzoom 0 i brak przesunięcia → 400; Δzoom 4 → 900 (klamra); Δzoom 1 → między 400 i 900; reduced → 0; rośnie monotonicznie z dystansem.
   - `sampleCamera(plan, tMs)`: t=0 → dokładnie `from`; t≥duration → dokładnie `to` (toBe, bez błędu zaokrąglenia); zoom monotoniczny (w górę lub w dół) w 100 próbkach.
   - Skok zoomu na klatkę przy 60 fps, Δzoom 4, duration 900: `max|Δzoom| ≤ 0.25`; prędkość w ostatniej klatce ≤ 1% maksymalnej.
   - Waga van Wijk: dla z0=5, z1=9 środek w połowie czasu leży bliżej celu niż `from + (to−from)/2` w sensie `u(0.5) < 0.5`? (policz i zapisz wartość oczekiwaną w teście; `u` rośnie monotonicznie od 0 do 1); dla z0=z1 `u = easeInOutCubic(t)`.
   - Czas ujemny/NaN → traktuj jak 0 (brak wyjątku).
2. Kod (`camera-plan.ts`, ≤ 120 linii): `export function easeInOutCubic(t)`, `export type CameraPlan = { from: ViewState; to: ViewState; durationMs: number }`, `export function planCamera(from, to, opts: { viewportWidthPx: number; reducedMotion: boolean }): CameraPlan`, `export function sampleCamera(plan, elapsedMs): ViewState`. Środek w Mercatorze (x = lon, y = mercatorLat) z wagą `u` z `docs…§4.2`. Komentarze po polsku.
3. Nie zmieniaj niczego w `src/view`.

## 5. Gotowe, gdy
- Wszystkie asercje z kroku 1 zielone; plik ≤ 200 linii; `grep -rn "src/view" src/core/map/camera-plan.ts` puste (czysta logika).

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6B origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6B] `. Opis (po polsku, bez `Closes #`):
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
Brak (równolegle z A i I). Moduł jest wymagany przez H1, E, G: sprawdzenie `test -f src/core/map/camera-plan.ts && echo OK`.
