# W2-FIX6E – Miękkie lądowanie i Cofnij tym samym planerem
Prompt samowystarczalny: wykonaj dokładnie ten plik, nic poza nim. Kontekst całości: `docs/research/p-animacja-kamery.md` (czytasz tylko wskazane sekcje).

## 1. Cel
„Cofnij”/„Wróć”/oddalenie kończy się miękko i wraca dokładnie do widoku sprzed wejścia; zmiana celu w trakcie jazdy nie szarpie. Na podglądzie (telefon): wejdź w gminę → „Cofnij”: kamera zwalnia i staje, bez „strzału” na końcu.

## 2. Decyzje
„Cofnij” = ten sam planer co wejście (`planCamera`), `kind` tylko wybiera klamrę czasu (`out` ≥ `motion.cameraOut`). Zachowanie poprzedniego widoku: stos widoków w `useMapViewState` (`viewStackRef`, push przy wejściu w jednostkę, pop przy „Wróć”); gdy stos pusty → dopasowanie do bbox jak dziś. Zmiana celu w locie przez `driver.retarget` (H1), bez `animTargetRef`.

## 3. Pliki
- Zmieniaj: `src/core/map/camera-retarget.ts` (nowy, czysty: `blendRetarget(current, velocity, newTo)`; jeśli retarget z H1 już to pokrywa, plik może zawierać tylko stos widoków `pushView/popView`), `src/view/map/hooks/useMapViewState.ts`, `tests/unit/camera-retarget.test.ts` (nowy), `tests/e2e/fix6-undo.spec.ts` (nowy)
- Wymagane (istnieją, nie ruszać): `src/core/map/camera-plan.ts`, `src/core/map/camera-driver.ts`, `tests/e2e/camera.spec.ts`, `tests/e2e/breadcrumbs.spec.ts`
- Czytaj tylko: `useMapViewState.ts` funkcje `updateViewStateForBbox`, `animateToView` (po H2), `camera-driver.ts` sygnatury.
- Nie czytaj: reszty. `AtlasMap.tsx` NIE jest w tym zadaniu.

## 4. Kroki
1. Testy najpierw: `camera-retarget.test.ts` – push/pop stosu (LIFO, limit 20); `blendRetarget` nie robi skoku: dystans między ostatnim widokiem starego planu a pierwszą próbką nowego ≤ 0,25 zoomu i ≤ 8% szerokości; prędkość końcowa ≤ 1% maksymalnej. `fix6-undo.spec.ts` (`@FIX6E`): wejście w województwo → „Wróć”: końcowy `viewState` = początkowy (± 1e-3 zoom, ± 1e-4° dla środka); w ostatnich 5 klatkach kroki zoomu malejące (monotonicznie → 0); w trakcie jazdy drugi „Wróć”/zmiana jednostki: brak kroku zoomu > 0,25.
2. Kod: stos w `useMapViewState`; „Wróć” bierze widok ze stosu i woła `animateToView(…, 'out')`.

## 5. Gotowe, gdy
- Testy zielone; `PERF=1` „Wróć” (×4): max ≤ 100 ms, p95 ≤ 33 ms (liczby w PR); `camera.spec.ts`, `breadcrumbs.spec.ts` bez zmian i zielone.

## 6. Polecenia i git
- Start: `git fetch origin && git checkout -b claude/FIX6E origin/main`. Aktualizacja gałęzi tylko `git merge origin/main` (bez rebase, bez `--force`).
- Uruchom: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`; e2e wyłącznie własny plik z sekcji 3 (`pnpm exec playwright test <plik>`; lokalny port 4173 bywa współdzielony, rozstrzyga CI).
- Przed pushem: `git diff --name-only origin/main...HEAD` ma zawierać tylko pliki „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste. Nie commituj katalogu `.claude/`.
- Commit kończysz liniami atrybucji z system-remindera sesji (jeśli jest).

## 7. PR
Tytuł: `[W2-FIX6E] `. Opis (po polsku, bez `Closes #`):
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
Po scaleniu D: `test -f tests/e2e/fix6-touch-interrupt.spec.ts && echo OK`. Rusza `useMapViewState.ts` → po D, przed F.
