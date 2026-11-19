# QR04 – Zdrowie main po Q2 (stan na c5e4595, #523)

Data: 19.11.2026. Checkout czysty: `origin/main` (3ed628d, w którym kod = c5e4595 + dokumenty planu).

## Ustalenia
- Na main **nie ma czerwonego testu, który byłby błędem kodu**. CI main dla #523 (run 1021) zakończony `success`: lint, typecheck, test, build, e2e (4 shardy) i `bezpieczenstwo`.
- Lokalnie: lint, typecheck i build zielone. `pnpm test`: 1222 testów, w 3 z 4 przebiegów zielone; w jednym 3 padły (patrz niżej).
- Jedyna niestabilność jednostkowa: `tests/unit/library-query-perf.test.ts` (dwa testy „< 150 ms” na 64 000 zmiennych). Pada tylko, gdy 180 plików testowych biegnie równolegle (313 ms, 406 ms, 167 ms). Osobno: 4/4 zielone, ok. 1 s. Przyczyna: próg czasowy mierzony przy obciążonym procesorze, nie błąd filtra. W tym samym przebiegu padł też jeden plik czytający `public/data/units.json` (`tests/unit/units.test.ts`, odczyt w `beforeAll`) – w trzech kolejnych przebiegach i osobno zielony, więc to ta sama przyczyna (przeciążenie), nie brak danych.
- E2E (385 testów, 81 plików, Chrome 153 z `swiftshader`, bez śladów i bez wzorców zrzutów): przy 4 równoległych workerach 347 zielonych, 14 pominiętych, 24 czerwone. Po ponownym uruchomieniu tych 24 na 1 workerze: **24/24 zielone**. Przyczyna: timeouty i wyścigi przy programowym WebGL na 4 rdzeniach (mapa renderowana na CPU). Nie jest to błąd main; w CI (1 worker) przechodzi.
- Zrzuty pikselowe: tylko `tests/e2e/design.spec.ts` używa `toHaveScreenshot`. Ich wzorce są tworzone w CI, więc lokalnie je pominięto; żaden z 24 czerwonych nie padł na zrzucie.
- Test „pominięte” (14) to świadome `skip` z powodów środowiskowych, nie zmieniane.

## Dowody
- `pnpm install --frozen-lockfile` – OK. `pnpm lint` (oxlint --deny-warnings) – 0 uwag. `pnpm typecheck` – bez błędów. `pnpm build` – OK (tylko ostrzeżenie o chunkach > 500 kB i INEFFECTIVE_DYNAMIC_IMPORT dla react-dom w `src/view/profile/ProfileCompare.tsx`).
- `pnpm test` ×4: wynik `1222 passed` (×3) oraz `3 failed | 1219 passed` (×1). Padały: `tests/unit/library-query-perf.test.ts:55` (313 ms > 150), `:76` (406 ms > 150), plus plik czytający `public/data/units.json` (`tests/unit/units.test.ts:8`). `pnpm vitest run tests/unit/library-query-perf.test.ts` osobno: `4 passed`.
- Uwaga: goły `pnpm vitest run` (bez ścieżki) wciąga specyfikacje Playwrighta z `tests/e2e` i daje „Playwright Test did not expect test.describe()”. To błąd sposobu uruchomienia, nie main; skrypt `pnpm test` ma `tests/unit`.
- `pnpm exec playwright test` (konfiguracja tymczasowa poza repo: systemowy Chrome, `--trace off`, workers 4): `347 passed, 14 skipped, 24 failed (28.8m)`. Przykłady przyczyn: `fix6-wheel.spec.ts:12` (0,46 > 0,25 – płynność przy obciążeniu), `profile-mobile.spec.ts:114` (zoom 6,6873 vs 6,6868 – niedokładność animacji), `breadcrumbs.spec.ts:23`, `bottom-sheet-scroll.spec.ts:10`, `s19-share.spec.ts:113` (timeouty 60–120 s).
- Powtórka `--last-failed`, workers 1: `24 passed (9.9m)`.
- Pobranie przeglądarki Playwrighta było zablokowane przez proxy, dlatego użyto systemowego `/usr/bin/google-chrome` – to nie to samo środowisko co CI.
- CI: run 1021 (`c5e4595`, #523) – status `completed`, wniosek `success`; 4 shardy `testy-shard` + `bezpieczenstwo` zielone. Wcześniejsze runy z `cancelled` (1012–1014, 1020) to anulowania przez kolejne scalenia, nie błędy.
- Pliki z `toHaveScreenshot` w `tests/e2e`: `tests/e2e/design.spec.ts` (jedyny plik z `toHaveScreenshot`).

## Rekomendacja
Main jest zdrowy; nie wstrzymywać kolejnych fal i niczego nie cofać. Jedyne realne ryzyko to losowo czerwone CI z powodu progu 150 ms w `library-query-perf` na wolnym runnerze (dziś zielone). Poprawić to jednym małym zadaniem (QR04-A): zastąpić pomiar bezwzględny stabilniejszym (mediana z kilku przebiegów lub próg względem przebiegu odniesienia). Testy e2e lokalnie uruchamiać z `--workers=1`, bo na 4 rdzeniach z programowym WebGL dają fałszywe czerwone.

## Proponowane zadania
1. QR04-A: stabilizacja testów czasowych biblioteki
   - Zmieniaj: tests/unit/library-query-perf.test.ts
   - Cel: dwa testy „< 150 ms” nie padają przy równoległym uruchomieniu 180 plików; mierzą medianę z 5 przebiegów.
   - Gotowe, gdy: `pnpm test` zielone 5 razy z rzędu; test nadal wykrywa filtr O(n²) (sztuczny wolny filtr w teście kontrolnym przekracza próg); wymaga zgody właściciela, bo zmienia istniejący test (AGENTS.md).
2. QR04-B: skrót lokalnego e2e
   - Zmieniaj: docs/research/q2-zdrowie-main.md (dopisek) lub docs/STAN.md po fali (robi Claude)
   - Cel: zapis, że lokalne e2e uruchamia się z `--workers=1` i systemowym Chrome, gdy pobranie przeglądarki jest zablokowane.
   - Gotowe, gdy: jedna linia w STAN.md; bez zmian kodu.
