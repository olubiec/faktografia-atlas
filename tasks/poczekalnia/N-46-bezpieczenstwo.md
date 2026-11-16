# N-46 – Bezpieczeństwo: trasy testowe, przypięcie akcji, CSP bez unsafe-eval (plan, z audytu AUDYT-3)
Źródło: tasks/poczekalnia/AUDYT-BEZPIECZENSTWO.md (P1-1, P2-1, P2-2). Plan podzielony na trzy osobne zadania (jedno zadanie = jeden PR). Kolejność: A, potem C, B robi właściciel.

## Ustalenia z analizy (stan na 2026-11-16)
- Trasy `/design` i `/__test/ui|annotation|interactive` są zarejestrowane bezwarunkowo: `src/App.tsx:99-102` (komponenty lazy: `src/App.tsx:22-30`). `src/App.tsx` nie ma żadnego odwołania do `DEV`/`PROD`/`MODE`.
- UWAGA: istniejący test `tests/unit/app-routes.test.tsx:25-29` ("w trybie produkcyjnym /__test/x renderuje NotFound") stubuje `DEV=false`, `PROD=true`. Dziś przechodzi tylko dlatego, że `/__test/x` nie istnieje (trafia w `path="*"`), więc nie dowodzi niczego o realnych trasach. Nie zmieniać go (zasada: istniejących testów nie ruszamy); dodać obok nowy.
- Tryb testowy w repo to NIE zmienna środowiska, tylko parametr URL `?e2e`: `src/core/map/test-seam.ts:51-57` (szew `window.__atlas`) i `src/view/map/hooks/useMapViewState.ts:96-99` (`isTestMode`). Strony `/__test/*` same go nie wymagają: testy e2e wchodzą na nie bez `?e2e` (`tests/e2e/ui.spec.ts:6`, `annotation.spec.ts:5`, `interactive.spec.ts:7`, `bottom-sheet.spec.ts:6`, `a11y-matrix.spec.ts:240`; `/design`: `tests/e2e/design.spec.ts`).
- Kluczowe: e2e działa na zbudowanej paczce produkcyjnej: `playwright.config.ts:23-29` (`pnpm run build && vite preview --port 4173`, w CI samo `vite preview`). Czyli `import.meta.env.PROD === true` także w e2e; warunek na `PROD`/`MODE` PSUŁBY e2e. Nie wolno używać `import.meta.env.PROD` jako bramki.
- Istniejące zabezpieczenia wokół tras: `public/robots.txt:3` (`Disallow: /__test/`), wykluczenia w `scripts/seo/sitemap.mjs:15` i `tests/unit/meta.test.ts:42,79-87`, `tests/unit/route-chunks.test.ts:30`.

## Zadanie A – ukrycie /__test/* i /design na produkcji
Nazwa pliku docelowego po zatwierdzeniu: `tasks/W<fala>-<id>-ukryj-trasy-testowe.md`
Cel: na domenie produkcyjnej `/__test/*` i `/design` dają 404 (komponent NotFound), a e2e na buildzie z `vite preview` nadal działają.
Zmieniaj: src/App.tsx, src/core/env/internal-routes.ts, tests/unit/internal-routes.test.ts, tests/unit/app-routes.test.tsx (tylko DODANIE nowych `it`, istniejących nie zmieniać), docs/ELEMENTY.md (bez zmian, jeśli brak nowych elementów)
Wymagane: src/core/env/internal-routes.ts, tests/unit/internal-routes.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AUDYT-BEZPIECZENSTWO.md P2-2, src/App.tsx, playwright.config.ts, src/core/map/test-seam.ts
Decyzja właściciela potrzebna (prompt ją zakłada, wybrano wariant 1): wariant 1 = bramka po nazwie hosta (poniżej); wariant 2 = zmienna `VITE_INTERNAL_ROUTES=1` ustawiana w Vercel tylko dla Preview (wymaga zmiany w panelu Vercel i `playwright.config.ts`, czyli pliku konfiguracyjnego – osobna zgoda).
Zadanie:
1. Nowy czysty moduł `src/core/env/internal-routes.ts`: `export function internalRoutesEnabled(hostname: string, isDev: boolean): boolean`. Zwraca `true`, gdy `isDev`, albo hostname to `localhost`, `127.0.0.1` lub `[::1]` (lokalny `vite preview` w e2e/CI, port 4173), albo kończy się na `.vercel.app` (podglądy PR; właściciel ocenia na telefonie). Zwraca `false` dla każdego innego hosta, w tym domeny produkcyjnej. Lista dozwolonych hostów jako stała w tym pliku; domeny produkcyjnej nie wpisywać (zasada: dozwolone tylko to, co jawnie wyliczone).
   - Dlaczego host, a nie `?e2e`/`PROD`: e2e wchodzi na `/__test/*` bez `?e2e` i na buildzie PROD (patrz wyżej), a host `localhost` jest stały w `playwright.config.ts:27`.
2. W `src/App.tsx`: wyliczyć raz `const internal = internalRoutesEnabled(window.location.hostname, import.meta.env.DEV)` (z ochroną `typeof window === 'undefined'` → `import.meta.env.DEV`, bo `renderToString` w testach nie ma `window`) i rejestrować wiersze 99-102 warunkowo: `{internal && (<> ... </>)}` (Routes w React Router 7 akceptuje fragmenty z `Route`; jeśli nie, użyć tablicy z `key`). Gdy `false`, ścieżki trafiają w `path="*"` i pokazują `NotFoundRoute` (z noindex).
3. Importy lazy (`src/App.tsx:22-30`) zostawić. Nie importować ich warunkowo, by nie zmieniać podziału paczek; same chunki dla testów zostają na produkcji, ale nieosiągalne (akceptowalne; opcjonalnie osobne zadanie na usunięcie z paczki przez `import.meta.env.DEV`, ale to złamałoby e2e na buildzie, więc NIE robić).
Gotowe, gdy (każdy warunek = test):
- [ ] `internalRoutesEnabled('localhost', false)`, `('127.0.0.1', false)`, `('abc-git-x.vercel.app', false)` → `true`; `('faktografia.pl', false)`, `('www.faktografia.pl', false)`, `('evil-vercel.app', false)`, `('localhost.evil.com', false)` → `false`; `('faktografia.pl', true)` → `true` (tryb dev). Test na końcówkę `.vercel.app` z kropką i na `localhost.evil.com` jest obowiązkowy (podatność na podszycie).
- [ ] W `tests/unit/app-routes.test.tsx` NOWY test: z `vi.stubGlobal('window', { location: { hostname: 'faktografia.pl' } })` i `DEV=false` ścieżki `/__test/ui` i `/design` renderują `Błąd 404`; dla `localhost` renderują `data-testid="page-fallback"` (lazy), nie 404. Istniejący test z linii 25-29 pozostaje bez zmian.
- [ ] Pełne `pnpm test:e2e` zielone bez zmian w `tests/e2e/*` (dowód, że e2e na `localhost:4173` nie jest dotknięte).
- [ ] `public/robots.txt`, sitemapa i `tests/unit/meta.test.ts` bez zmian.
Ryzyka: (1) SSR/prerender – sprawdzić, czy `scripts/seo` nie renderuje `App` po stronie serwera z innym hostem (grep `AppRoutes` w `scripts/`); (2) niestandardowy host podglądu (np. Vercel z własną domeną podglądu) – wtedy ukryte; właściciel sprawdza.
Właściciel sprawdza: na adresie produkcyjnym `/__test/ui` i `/design` pokazują 404; na podglądzie PR (`*.vercel.app`) nadal się otwierają.

## Zadanie B – przypięcie akcji GitHub do SHA (TYLKO OPIS; workflowów nie rusza agent)
Powód: `.github/workflows/` jest poza zakresem agentów (AGENTS.md, „Nigdy”); zmianę wykonuje właściciel ręcznie albo wydaje osobne, wyraźne zadanie z linią „Zmieniaj: .github/workflows/*.yml”.
Stan: 25 użyć `uses:` w `.github/workflows/*.yml`. Unikalne akcje: actions/checkout (8), actions/setup-node (8), pnpm/action-setup (5), actions/cache/restore (1), actions/cache/save (1), actions/upload-artifact (1), gitleaks/gitleaks-action (1). Najwrażliwsze: `gitleaks/gitleaks-action@v3` (`ci.yml:82`) i workflowy z `contents: write` + sekretami (`jules-loop.yml`, `fetch-*.yml`, `bdl-record.yml`). `jules-loop.yml:61,65` jest na `@v4`, reszta na `@v7` – ujednolicić.
Kroki dla właściciela (lub osobnego zadania):
1. Wypisać wszystkie użycia: `grep -rn "uses:" .github/workflows`.
2. Dla każdej akcji i wersji znaleźć pełny SHA 40-znakowy commitu tagu: `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha` (dla tagów adnotowanych: `gh api repos/<owner>/<repo>/git/ref/tags/<tag>` i, jeśli `type=tag`, kolejne zapytanie `git/tags/<sha>` po `.object.sha`). Nie wpisywać SHA z pamięci ani z cudzych blogów; tylko z `gh api`.
3. Zamienić `uses: actions/checkout@v7` na `uses: actions/checkout@<40-znakowy-sha> # v7` we wszystkich plikach; `jules-loop.yml:61,65` jednocześnie podnieść z v4 do v7 (sprawdzić w CI, że zielone). Zachować komentarz z wersją, bo Dependabot (`.github/dependabot.yml`, ekosystem `github-actions`) czyta go i podbija SHA.
4. Sprawdzić `.github/dependabot.yml`: ekosystem `github-actions` musi być obecny (audyt: jest).
5. Dopiero po zielonym CI na main: Settings → Actions → General → „Require actions to be pinned to a full-length commit SHA”. Przed przypięciem nie włączać, bo zablokuje workflowy.
6. Opcjonalnie w tym samym kroku (P2-3): `permissions: {}` na poziomie pliku i uprawnienia per job.
Gotowe, gdy: `grep -rnE "uses: [^ ]+@(v[0-9]|main|master)" .github/workflows` nic nie zwraca; wszystkie workflowy zielone; opcja w ustawieniach włączona.
Test: istniejący `ci.yml:95` (`pnpm audit`) nie dotyczy; sprawdzenie ręczne grepem jak wyżej (można dodać mały test Vitest `tests/unit/workflows-pinned.test.ts`, czytający pliki workflow i wymagający `@[0-9a-f]{40}`; to osobne zadanie po przypięciu, bo przed nim byłby czerwony).

## Zadanie C – zdjęcie 'unsafe-eval' z CSP
Gdzie: `vercel.json:8` (jedna linia z całą polityką): `script-src 'self' 'unsafe-inline' 'unsafe-eval'`.
Ocena, czy biblioteki wymagają `unsafe-eval` (analiza statyczna, bez uruchamiania przeglądarki – NIE potwierdzona dynamicznie):
- Zależności: `@deck.gl/core|extensions|layers|mapbox ^9.4.0`, `maplibre-gl ^6.15.0`, `posthog-js ^1.438.13` (`package.json:31-45`).
- Przeszukano zainstalowane paczki (`maplibre-gl/dist`, `@deck.gl/core|layers/dist`, `@luma.gl/core|webgl|engine/dist`, `@loaders.gl/core/dist`) pod kątem `eval(` i `new Function(`: brak trafień poza plikami `*-dev*`. Wniosek wstępny: deck.gl 9 / luma.gl 9 nie kompilują szablonów przez eval (shadery to ciągi GLSL/WGSL przekazywane do WebGL, to nie jest eval JS), a MapLibre od wersji 3+ ma wyrażenia stylu bez `new Function` (wcześniej wersja `-csp` to osobna paczka). Czyli najpewniej `unsafe-eval` nie jest potrzebny.
- Do potwierdzenia: (a) kod własny i inne paczki (`grep -rnE "new Function|[^a-zA-Z.]eval\(" src/`); (b) `posthog-js` ładuje się dynamicznie po zgodzie (`src/core/consent/analytics.ts:49`) i może dociągać dodatkowe skrypty z `eu-assets.i.posthog.com` – to wymaga `script-src` z tym hostem, nie `unsafe-eval`; PostHog nagrań/ankiet nie używamy, więc teoretycznie nic z eval; (c) Vite w buildzie produkcyjnym nie używa eval (w trybie dev używa, ale CSP z `vercel.json` obowiązuje tylko na Vercel).
- `'unsafe-inline'` w `script-src` osobno: jeśli `index.html` ma inline `<script>` (np. skrypt motywu przeciw miganiu), usunięcie wymaga hasha SHA-256 albo przeniesienia do pliku; sprawdzić `grep -n "<script" index.html`. To odrębny krok, nie mieszać z `unsafe-eval`.
Kroki (zmiana w `vercel.json` wymaga zgody właściciela – plik konfiguracyjny, AGENTS.md „Najpierw zapytaj”):
1. Dodać nagłówek `Content-Security-Policy-Report-Only` z docelową polityką (obok istniejącego `Content-Security-Policy`), bez `'unsafe-eval'`: `default-src 'self'; script-src 'self' 'unsafe-inline' https://eu-assets.i.posthog.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: ; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`. Zwężanie `connect-src`/`img-src` z `https:` do listy hostów (P2-1) – osobny, późniejszy krok, bo wymaga spisu hostów kafelków i `VITE_LIBRARY_BASE`.
2. Wdrożyć na podgląd Vercel, wejść na telefonie/komputerze: mapa (przesuwanie, zoom, przełączanie warstw i motywu), wyszukiwarka, otwarcie profilu, ranking, porównanie, biblioteka, baner zgody → zaakceptować → PostHog. W konsoli szukać `Refused to evaluate a string as JavaScript` / `Report-Only` naruszeń `script-src`.
3. Brak naruszeń przez min. kilka dni ruchu (Report-Only nie blokuje) → usunąć `'unsafe-eval'` z właściwego nagłówka w `vercel.json:8`, a Report-Only usunąć lub zostawić do następnych zawężeń.
4. Jeśli mapa przestaje działać (naruszenie wskazuje konkretny plik): zanotować URL/linię z konsoli, przywrócić `'unsafe-eval'` i otworzyć zadanie z tą biblioteką.
Gotowe, gdy: nagłówek `Content-Security-Policy` w `vercel.json` nie zawiera `unsafe-eval`; test Vitest `tests/unit/vercel-headers.test.ts` (czytający `vercel.json`) sprawdza brak `'unsafe-eval'` w `script-src` oraz obecność `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`; e2e `pnpm test:e2e` zielone (e2e ładuje stronę z `vite preview`, które NIE stosuje nagłówków z `vercel.json`, więc nie wyłapie regresji CSP – dlatego obowiązkowa jest ręczna kontrola na podglądzie Vercel).
Właściciel sprawdza: na podglądzie na telefonie mapa się rysuje i reaguje, profil otwiera, baner zgody działa, w konsoli (Remote Debugging lub komputer) brak czerwonych błędów CSP.

## Czego plan nie obejmuje
P1-2 (cofnięcie zgody a `stopAnalytics`, to `src/core/consent`, osobna zgoda), P2-3, P2-4, P3-*. Brak weryfikacji dynamicznej CSP i brak uruchomienia testów w tej analizie.
