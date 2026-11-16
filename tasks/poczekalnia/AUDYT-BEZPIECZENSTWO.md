# Audyt bezpieczeństwa (AUDYT-3)

Data: 2026-11-16. Zakres: przegląd statyczny, bez zmian w kodzie (w tym `src/core/consent`, `src/view/consent`). `pnpm audit --prod`: brak znanych podatności (CI też to robi: `.github/workflows/ci.yml:95`). Dependabot jest włączony (`.github/dependabot.yml`).

## P1 (zrób najpierw)

### P1-1. Akcje GitHub przypięte do tagów, nie do SHA; część na starych wersjach
- Gdzie: `.github/workflows/*.yml` (np. `ci.yml:38,40,42,82`; `jules-loop.yml:61,65` używa `checkout@v4`/`setup-node@v4`, reszta `@v7`).
- Ryzyko: ruchomy tag może zostać nadpisany (atak łańcucha dostaw). Najbardziej wrażliwe: `gitleaks/gitleaks-action@v3` (`ci.yml:82`) i workflowy z `contents: write` plus sekretami (`jules-loop.yml`, `fetch-*.yml`, `bdl-record.yml`).
- Poprawka: przypiąć do pełnego SHA z komentarzem wersji (`uses: actions/checkout@<sha> # v7`); Dependabot (ekosystem `github-actions`) sam będzie je podbijał. Ujednolicić wersje w `jules-loop.yml`.
- Właściciel sprawdza: GitHub, Settings, Actions, General: włączyć „Require actions to be pinned to a full-length commit SHA” (po przypięciu).

### P1-2. Analityka: cofnięcie zgody nie zatrzymuje PostHog w żywej sesji, a `trackSearch` nigdzie nie jest podpięty
- Gdzie: `src/core/consent/analytics.ts:87` (`stopAnalytics`) i `:65` (`trackSearch`); w `src/` nie ma żadnego wywołania poza definicją (`ConsentBar.tsx:15,25` wywołuje tylko `startAnalytics`).
- Skutek: (a) po cofnięciu zgody `stopAnalytics()` nie jest wywoływane, więc wysyłanie trwa do przeładowania karty (komentarz w pliku sam mówi „do podpięcia”); (b) polityka prywatności (`src/view/pages/Privacy.tsx:44`) opisuje zdarzenie „search”, którego dziś nikt nie wysyła, czyli opis nie zgadza się ze stanem faktycznym (mniejsze ryzyko, ale do uzgodnienia).
- Poprawka (osobne zadanie, bo to `src/view/consent`, wymaga zgody na ruszanie consent): wywołać `stopAnalytics()` przy zmianie zgody na „denied”; podpiąć `trackSearch` w wyszukiwarce albo usunąć z polityki zdanie o zdarzeniu.
- Właściciel sprawdza: na podglądzie wejść, zaakceptować zgodę, cofnąć ją (stopka/ustawienia) i w zakładce Network (DevTools) sprawdzić, czy po cofnięciu nie idą żądania do `eu.i.posthog.com`.

## P2

### P2-1. CSP zbyt luźna
- Gdzie: `vercel.json:7`.
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: `unsafe-eval` zwykle bierze się z deck.gl/luma.gl lub bibliotek szablonów; `unsafe-inline` osłabia ochronę przed XSS. Ponieważ nigdzie nie ma `dangerouslySetInnerHTML` (patrz niżej), ryzyko jest pośrednie, ale CSP traci wartość jako druga linia obrony.
- `connect-src 'self' https:` i `img-src ... https:` pozwalają na wyciek danych na dowolny host HTTPS. Poprawka: wypisać hosty: `'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com` oraz hosty kafelków/danych (biblioteka: `VITE_LIBRARY_BASE`, `src/core/library/config.ts:12`).
- Brak `frame-ancestors 'none'` (jest tylko `X-Frame-Options: DENY`, `vercel.json:15`; nowoczesne przeglądarki wolą CSP), brak `form-action 'self'`, brak `upgrade-insecure-requests`.
- Poprawka: najpierw wdrożyć `Content-Security-Policy-Report-Only` z docelową polityką, sprawdzić konsolę na podglądzie (mapa, wyszukiwarka, zgoda+PostHog), potem przełączyć. Spróbować usunąć `unsafe-eval` (sprawdzić, czy mapa działa).
- Właściciel sprawdza: po zmianie otworzyć podgląd na telefonie: mapa się rysuje, profil otwiera, baner zgody działa, brak czerwonych błędów CSP w konsoli.

### P2-2. Trasy testowe `/__test/*` i `/design` dostępne w produkcji
- Gdzie: `src/App.tsx:99-102` (trasy zawsze zarejestrowane, bez warunku na tryb); komponenty ładowane leniwie (`:22-30`).
- Skutek: publicznie widać strony testowe i kartę stylu; bez wycieku danych, ale to powierzchnia ataku, zaśmiecanie indeksu wyszukiwarek i ujawnianie wewnętrznych narzędzi. Testy e2e (`tests/e2e/design.spec.ts`, `ui.spec.ts`, `annotation.spec.ts`, `interactive.spec.ts`) zakładają ich obecność na buildzie, więc nie wolno ich po prostu wyciąć.
- Poprawka: rejestrować `/__test/*` tylko gdy `import.meta.env.MODE !== 'production'` lub w trybie testowym (tak jak `window.__atlas`), a `/design` tylko na podglądach; alternatywnie dodać `noindex` i wpis w `robots.txt`. Zmiana dotyczy `App.tsx` i konfiguracji e2e, więc wymaga decyzji właściciela.
- Właściciel sprawdza: na adresie produkcyjnym wejść na `/__test/ui` i `/design`; docelowo ma być strona 404.

### P2-3. Zbyt szerokie uprawnienia workflowów
- `jules-loop.yml:30-34`: `contents/issues/pull-requests/actions: write`, uruchamiany co 30 minut i po CI; używa `JULES_API_KEY` i `LOOP_TOKEN` (`:52,73,75`). Zapis jest uzasadniony (stan, scalanie), ale to najcenniejszy cel: kompromitacja skryptów w `scripts/jules-loop/` = zapis do repo.
- `update-snapshots.yml:7-19,52`: wyzwalacz `pull_request: labeled` i checkout gałęzi PR z `contents: write`. Jest bramka na repo z forka (`:30`), co dobrze; upewnić się, że etykietować mogą tylko zaufani (etykietowanie wymaga uprawnień do zapisu). Wejście `branch` z `workflow_dispatch` trafia do `ref:` i zmiennej środowiskowej (nie bezpośrednio do `run:`), co jest bezpieczne.
- `fetch-data.yml:31-35`: `actions: write` i `issues: write`; sprawdzić, czy oba są naprawdę potrzebne.
- Poprawka: dodać `permissions: {}` na poziomie pliku i nadawać uprawnienia per job; usunąć niepotrzebne `actions: write`. `ci.yml:19` (`contents: read`) jest wzorcowe.
- Właściciel sprawdza: Settings, Actions, General: „Workflow permissions” = Read; „Fork pull request workflows” = wymagaj zatwierdzenia; ochrona gałęzi `main` (wymagane testy).

### P2-4. Allowlista w `.gitleaks.toml` obejmuje cały regex i dwa commity
- Gdzie: `.gitleaks.toml:6-10`. Regex `SECRET_KLUCZ_API_99999` jest bardzo wąski (OK), a dwa commity z historii są wyłączone ze skanu; jeżeli któryś zawierał cokolwiek poza fałszywym kluczem, zostanie to przeoczone.
- Poprawka: potwierdzić jednorazowo `git show 631f01c eeca2c2` (czy tylko fałszywy klucz); skan lokalny `gitleaks detect --no-git=false` bez allowlisty commitów.
- Właściciel sprawdza: Settings, Code security: włączyć „Secret scanning” i „Push protection”.

## P3

### P3-1. HSTS z `preload`
- `vercel.json:34-37`: `max-age=63072000; includeSubDomains; preload`. To poprawne, ale `preload` + `includeSubDomains` jest trudne do cofnięcia, jeśli któraś subdomena nie obsługuje HTTPS. Właściciel: zgłoszenie na hstspreload.org tylko świadomie.

### P3-2. Permissions-Policy niepełna
- `vercel.json:30-31`: `camera=(), microphone=(), geolocation=()`. Dodać: `payment=(), usb=(), interest-cohort=(), browsing-topics=()` (reszta domyślnie wyłączona w nowoczesnych przeglądarkach, ale jawny zapis nic nie kosztuje).

### P3-3. Brakujące nagłówki dodatkowe
- Rozważyć `Cross-Origin-Opener-Policy: same-origin`. `X-XSS-Protection` niepotrzebny. Nagłówki `source: "/(.*)"` obejmują też `/data` i `/geo`; dla statycznych JSON warto dodać `Cache-Control` (poza zakresem bezpieczeństwa).

### P3-4. PostHog: konfiguracja dobra, drobne uwagi
- `src/core/consent/analytics.ts:11-22`: `autocapture:false`, `persistence:'memory'`, brak nagrań, ankiet i flag, host UE, `person_profiles:'identified_only'`; fraza z `@` lub 9+ cyframi jest odrzucana (`:76`), maks. 100 znaków (`:5`). Zgoda sprawdzana przed załadowaniem (`:36-41`), biblioteka ładowana dynamicznie dopiero po zgodzie (`:49`). Klucz to `VITE_POSTHOG_KEY` (publiczny z założenia, `:37`).
- Uwagi: (1) filtr PII jest prosty: nazwisko lub adres wpisany w wyszukiwarkę wyjdzie (w mapie miejscowości to zwykle nazwy własne, ryzyko małe); (2) opcja `ip:false` nie jest potwierdzona w typach bieżącej wersji `posthog-js`, więc anonimizację IP trzeba włączyć też po stronie projektu PostHog (ustawienie „Discard client IP data”). Politykę (`Privacy.tsx:44`) dostosować do tego, co realnie wysyłamy.
- Właściciel sprawdza: w PostHog (projekt UE) włączyć „Discard client IP data” i sprawdzić, że klucz w Vercel jest kluczem projektu (`phc_...`), a nie osobistym kluczem API (`phx_...`).

### P3-5. Zmienne `VITE_*`
- Użycia tylko `VITE_POSTHOG_KEY` i `VITE_LIBRARY_BASE` (`src/core/library/config.ts:12`): obie publiczne z założenia, nic tajnego. Właściciel: w Vercel, Environment Variables, nie dodawać innych `VITE_*` z wartościami poufnymi.

## Wyniki pozytywne (bez zmian)
- `dangerouslySetInnerHTML` i `innerHTML`: 0 użyć w `src/`.
- Nagłówki: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `object-src 'none'`, `base-uri 'self'`, HSTS 2 lata: obecne (`vercel.json:6-38`).
- Sekrety w workflowach tylko przez `secrets.*`; `GITHUB_TOKEN` jawnie przekazany tylko do gitleaks.
- Zależności produkcyjne: `pnpm audit --prod` czysto (stan na dziś).
- Nie uruchamiano: skanu historii gitleaks (brak binarki), testów dynamicznych na podglądzie Vercel.
