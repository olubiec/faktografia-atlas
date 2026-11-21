# P2-G – PostHog: konfiguracja przyjazna prywatności i testy
Cel: analityka po zgodzie nie zapisuje trwałego identyfikatora, nie nagrywa sesji i wysyła tylko zdarzenie „search”; zachowanie jest przykryte testami.
Zmieniaj: src/core/consent/analytics.ts, tests/unit/analytics.test.ts, docs/ELEMENTY.md
Wymagane: tests/unit/analytics.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: AGENTS.md, src/core/consent/analytics.ts, src/core/consent/consent.ts, tests/unit/consent.test.ts, tests/unit/consent-bar.test.tsx, docs/ELEMENTY.md
Zgoda wprost: to zadanie MA zmienić src/core/consent/analytics.ts (wyjątek od reguły „najpierw zapytaj”). Nie zmieniaj consent.ts ani src/view/consent.

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-G`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów (posthog-js już jest).
4. Komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` (zielone). Jeden commit `[P2-G] PostHog: konfiguracja przyjazna prywatności`, `git push -u origin task/P2-G`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki komend, co ma sprawdzić Mateusz w panelu PostHog.

## Zadanie
Stan obecny: `posthog.init(key, { api_host: 'https://eu.i.posthog.com', autocapture: false, capture_pageview: false })`; jedyne zdarzenie to `capture('search', { query })` w `trackSearch`.
1. W `init` dodaj opcje (sprawdź nazwy w typach `node_modules/posthog-js` – nie zgaduj; jeśli któraś nie istnieje w zainstalowanej wersji, pomiń ją i napisz w raporcie):
   - `persistence: 'memory'` (brak ph_* w localStorage/cookie; identyfikator żyje do odświeżenia karty),
   - `disable_session_recording: true`,
   - `capture_pageleave: false`,
   - `person_profiles: 'identified_only'`,
   - `ip: false` jeśli opcja istnieje w tej wersji, inaczej pomiń,
   - `disable_surveys: true`, `advanced_disable_decide: true` (lub odpowiednik w tej wersji), by nie pobierać zbędnych skryptów.
2. Wyeksportuj stałą `POSTHOG_CONFIG` (obiekt opcji), żeby test i polityka prywatności (P2-B) mogły ją odczytać.
3. `trackSearch`: wysyłaj frazę przyciętą do 100 znaków; frazy wyglądające na adres e-mail (zawierają „@”) lub numer (≥ 9 cyfr pod rząd) pomijaj (nie wysyłaj nic).
4. Dodaj `stopAnalytics()`: gdy zgoda cofnięta, wywołuje `posthog.opt_out_capturing()` i `posthog.reset()` (jeśli instancja istnieje) oraz zeruje stan. Nie podpinaj jej w UI (to osobna zmiana w src/view/consent, której tu nie robisz) – opisz w raporcie, gdzie ją podpiąć.
5. Wpis w `docs/ELEMENTY.md` dla posthog-js (wersja z package.json, licencja z node_modules/posthog-js/package.json, host UE, zakres danych: tylko „search”), o ile wpisu nie ma; jeśli jest, uzupełnij.
6. Test `tests/unit/analytics.test.ts` z mockiem `posthog-js` (vi.mock), bez sieci.

## Gotowe, gdy
- test: bez zgody (`denied`/brak) `startAnalytics` zwraca false i nie importuje posthog-js
- test: ze zgodą i kluczem `init` dostaje `POSTHOG_CONFIG` z `persistence: 'memory'`, `autocapture: false`, `disable_session_recording: true`, `api_host` zaczynającym się od `https://eu.`
- test: `trackSearch` przycina do 100 znaków, pomija pustą frazę, frazę z „@” i frazę z 9 cyframi
- test: `stopAnalytics` wywołuje opt_out_capturing i reset, a potem `trackSearch` nic nie wysyła
- `pnpm build` zielony

## Nie ruszaj
consent.ts, src/view/consent/*, package.json, lockfile, istniejących testów.

## Po zadaniu (robi Mateusz, nie agent)
1. Vercel → Project → Settings → Environment Variables: dodaj `VITE_POSTHOG_KEY` (publiczny klucz projektu z PostHog, region EU) dla Production i Preview, zrób Redeploy.
2. PostHog → Project settings: włącz „Discard client IP data”, wyłącz Session replay, ustaw retencję danych.
3. Na podglądzie: w narzędziach przeglądarki (Application → Local Storage) po zgodzie nie ma kluczy `ph_*`; w Network jest wywołanie do `eu.i.posthog.com` dopiero po „Akceptuję” i po wpisaniu frazy w wyszukiwarce.
