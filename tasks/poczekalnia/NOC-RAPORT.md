# Raport nocnej zmiany (koniec pracy: 05:00 czasu PL = 04:00 UTC)

Kolejność: P2-G → P2-A → P2-C → P2-B → P2-D → P2-F → P2-E → P3-A..E → P4-A..E → koncepty (lepszy model).
Każdy wpis: ID · wynik testów · commit · co sprawdzić na Vercel · co odłożone.


## P2-G – PostHog: konfiguracja przyjazna prywatności
- Testy: lint, typecheck, test (793/793), build zielone; e2e nie uruchamiane.
- Zrobione: `POSTHOG_CONFIG` (memory, bez nagrań/ankiet/pageleave, identified_only, ip:false, EU), `trackSearch` przycina do 100 znaków i pomija e-mail/9+ cyfr, nowe `stopAnalytics()`, wpis w ELEMENTY.md.
- Odstępstwo: zamiast `advanced_disable_decide` użyto `advanced_disable_flags` (w posthog-js 1.438.13 decide jest przestarzałe).
- Do podpięcia (osobne zadanie): `stopAnalytics()` w src/view/consent przy zmianie zgody na „denied”.
- Vercel: ustaw `VITE_POSTHOG_KEY` (Production+Preview), Redeploy; kliknij „Akceptuję” – w Local Storage nie ma kluczy `ph_*`, a w Network po wpisaniu frazy jest wywołanie do `eu.i.posthog.com`.
- PostHog: włącz „Discard client IP data”, wyłącz Session replay.

## P2-A – Meta, SEO, manifest, robots, sitemap
- Wynik: lint, typecheck, test (805 zielone) i build przechodzą; e2e nie uruchamiano. Brak usuniętych plików względem main.
- Zrobione: tagi w index.html (opis, canonical, OG, twitter, theme-color, manifest), domyślne meta w PageMeta, robots.txt, sitemap.xml (7 tras), site.webmanifest, tests/unit/meta.test.ts.
- Vercel: wklej link strony do komunikatora (Messenger/Slack) – powinien pokazać tytuł i opis; otwórz /robots.txt, /sitemap.xml i /site.webmanifest – powinny się wyświetlić.
- Odłożone: w public/brand są tylko SVG. og:image wskazuje SVG logo, a większość komunikatorów go nie pokaże. Brakuje PNG 1200x630 (og:image) oraz ikon PNG 192 i 512 (manifest, instalacja na telefonie). Trzeba dodać te pliki.
- theme-color i kolor tła w manifeście = #F8FAF9 (token --arkusz); manifest nie ma wariantu ciemnego.

## P2-C – Strony Kontakt i Zastrzeżenie o danych
- Testy: lint, typecheck, test (809/809), build zielone; e2e nie uruchamiane. Brak usuniętych plików względem main.
- Zrobione: `src/view/pages/Contact.tsx` (autor, mailto, link do zgłoszeń GitHub) i `DataDisclaimer.tsx` (GUS BDL, CC BY 4.0, brak gwarancji, link do /kontakt), testy w `tests/unit/info-pages.test.tsx`.
- Vercel: stron jeszcze nie widać, bo trasy dopisuje P2-D (App.tsx); po P2-D otwórz /kontakt i sprawdź mailto oraz link do zgłoszeń.
- Odłożone: w stopce nie ma wskaźnika daty odświeżenia danych, a zastrzeżenie się do niego odwołuje; trzeba go dodać osobnym zadaniem. Trasa /kontakt jest założona w linku (P2-D).

## P2-B – Polityka prywatności zgodna z RODO
- Wynik: lint, typecheck, test (815 zielone) i build przechodzą; e2e nie uruchamiano. Brak usuniętych plików względem main.
- Zrobione: Privacy.tsx z 8 sekcjami h2 (administrator, dane, podstawa prawna, okres, odbiorcy, prawa/UODO, linki, zmiany + data), klucze localStorage zgodne z kodem, opis PostHog z `persistence: memory` (brak ph_*); przycisk „Cofnij zgodę” bez zmian; tests/unit/privacy-page.test.tsx.
- Vercel: otwórz /prywatnosc – 8 numerowanych sekcji, mail kontaktowy, „Cofnij zgodę” działa.
- Do sprawdzenia w panelach: okres przechowywania zdarzeń w PostHog i logów w Vercel (w polityce: „zgodnie z ustawieniami usługi”); w PostHog włącz „Discard client IP data”.
- Odłożone: lokalizacja przetwarzania logów Vercel opisana ogólnie („także poza UE”); do potwierdzenia z ustawieniami regionu projektu.

## P2-D – Trasy, 404, ErrorBoundary, lazy loading
- Wynik: ZABLOKOWANE, nic nie zmieniono w kodzie (testy nie uruchamiane, brak usuniętych plików).
- Powód: pkt 3 zadania (trasy /__test/* tylko przy DEV lub VITE_E2E=true) psuje istniejące e2e. Testy e2e (ui, annotation, interactive, a11y-matrix, bottom-sheet) wchodzą na /__test/* w buildzie produkcyjnym przez `vite preview`; `pnpm build` w playwright.config.ts (webServer), w .github/workflows/ci.yml i update-snapshots.yml nie ustawia VITE_E2E.
- Potrzebna decyzja: zgoda na zmianę jednego z: playwright.config.ts (build z VITE_E2E=true), ci.yml/update-snapshots.yml, package.json (np. skrypt build:e2e) – wszystko poza listą „Zmieniaj”.
- Ponadto: NotFound jest dziś w src/view/NotFound.tsx (używany w tests/unit/site-layout.test.tsx), zadanie wskazuje src/view/pages/NotFound.tsx; trzeba zdecydować, czy przenieść (re-export), bo istniejącego testu nie wolno zmieniać.
- Vercel: nic do klikania. Odłożone całe zadanie (trasy /kontakt, /zastrzezenie, 404 z noindex, ErrorBoundary, lazy loading, rozmiar chunku).

## P2-D (ponowne, zawężone) – Trasy, 404, ErrorBoundary, lazy loading
- Testy: lint, typecheck, test (820/820), build zielone; e2e nie uruchamiane. Brak usuniętych plików względem main.
- Zrobione: trasy /kontakt i /zastrzezenie, 404 z `noindex` (NotFound zostaje w src/view/NotFound.tsx), ErrorBoundary z przyciskiem „Wczytaj ponownie” (44 px, console.error), React.lazy + Suspense dla stron poza Home, testy w tests/unit/app-routes.test.tsx. Główny chunk: 1 729 554 B (~1,73 MB) -> 579,94 kB (gzip 207 kB).
- Poza listą „Zmieniaj”: dopisałem /kontakt i /zastrzezenie do public/sitemap.xml (wymaga tego istniejący meta.test.ts).
- Odłożone: ograniczenie tras /__test/* oraz /design do DEV/VITE_E2E (e2e wchodzą na nie w buildzie produkcyjnym; wymaga zmiany playwright.config.ts/CI). Wskaźnika daty odświeżenia danych w stopce nie dodano.
- Vercel: otwórz /kontakt, /zastrzezenie oraz losowy adres (404 z linkiem do strony głównej); strony ładują się z krótkim pustym polem.

## P2-F – vercel.json: prawdziwy 404
- Wynik: ZABLOKOWANE, vercel.json i testy bez zmian (komend nie uruchamiano, brak usuniętych plików).
- Powód: rewrites w vercel.json nie mają pola statusu, więc „index.html z kodem 404” się nie da. Status ma tylko legacy `routes`, ale nie łączy się z `headers`/`rewrites` (a CSP musi zostać). Zadanie każe w takim razie opisać alternatywę i stanąć.
- Alternatywy: (a) rewrites tylko dla znanych tras (+ /design, /__test/*, /biblioteka/:id) bez catch-all: nieznany adres daje prawdziwe 404, ale ze zwykłą stroną Vercel; (b) to samo plus public/404.html (Vercel serwuje go ze statusem 404), wymaga pliku spoza listy „Zmieniaj” i osobnej strony bez SPA; (c) zostawić SPA-fallback (200) i polegać na `noindex` z P2-D.
- Potrzebna decyzja: wybór (a), (b) lub (c). Test vercel-routes.test.ts (trasy z App.tsx pasują, „/nie-ma” nie) pasuje do (a)/(b).
- Vercel: nic do klikania.

## P2-E – Linki Kontakt i Zastrzeżenie w stopce i menu
- Wynik: ZABLOKOWANE, kod i testy bez zmian (lint/typecheck/test/build nie uruchamiane, brak usuniętych plików).
- Powód: dopisanie linków łamie istniejące testy, których nie wolno zmieniać: tests/unit/site-footer-mobile.test.tsx (dokładna lista 17 hrefów w stopce, toHaveLength(17)) oraz tests/unit/main-menu-links.test.tsx (dokładnie 6 linków w menu, test „nie zawiera linku Kontakt”). Zadanie każe jednocześnie zachować zielone testy P1-F i P1-G.
- Potrzebna decyzja: zgoda na aktualizację tych dwóch testów (lista hrefów 17 -> 19, menu 6 -> 8 z Kontakt i Zastrzeżeniem po „Prywatność”, usunięcie testu „nie zawiera Kontakt”); wtedy zmiany to SiteFooter.tsx (grupa Dokumentacja), MOBILE_MENU_LINKS w Header.tsx i nowy tests/unit/footer-menu-new-links.test.tsx.
- Trasy /kontakt i /zastrzezenie istnieją (P2-C/P2-D), więc test „href to trasa z App.tsx” przejdzie.
- Vercel: nic do klikania.

## P3-A – Nocny pobór: PR i auto-merge
- Wynik: OK, commit 794518c (tylko .github/workflows/fetch-data.yml); lint/typecheck/test/build zielone, brak usuniętych plików. actionlint niedostępny, YAML sprawdzony parserem.
- Było już: permissions, concurrency, odrzucanie zmian samego fetchedAt (revert-noise), kontrakt przed PR. Dodano: tytuł „Dane GUS: odświeżenie RRRR-MM-DD”, gh pr merge --auto --squash, issue z linkiem do przebiegu przy błędzie tworzenia PR.
- Scenariusze: brak zmian = koniec bez commitu/PR; zmiana = PR + auto-merge; błąd kontraktu = brak push/PR, issue nocne; błąd sieci = fetch pada, issue nocne.
- Vercel/GitHub: Actions → Fetch data → Run workflow (workflow_dispatch) po scaleniu; sprawdź PR „Dane GUS: odświeżenie…” z włączonym auto-merge.
- Odłożone: auto-merge wymaga włączonego „Allow auto-merge” w Settings repo i reguł gałęzi; nie dodano testu workflow (plik spoza listy).

## P3-B – Audyt stanu gałęzi danych (tylko odczyt)
- Wynik: OK, zero zmian w kodzie. Stan na 2026-11-15 (źródło: GitHub MCP).
- data/nightly: ostatni commit beb15ac (2026-11-15 09:01, „wartości wskaźników BDL”); Fetch data przebieg #28 (43691613048) success, harmonogram dzienny, 5 ostatnich zielone (#24-#28). Otwarty PR #451 z data/nightly (od 15.11, jeszcze niescalony); poza tym PR #450 i #431 to Dependabot.
- data/library: ostatni commit a369749 (2026-11-15 14:34, „kolejna porcja”), wcześniej 0210ee6 (14.11 22:39) i 195459b (14.11 13:34). Fetch library: #44 (43712778084) success 15.11 14:34, #45 (43762548456) w toku; #41-#44 zielone; brak otwartych PR z tej gałęzi (zapis wprost na gałąź).
- library/index.json (ścieżka na gałęzi to library/, nie public/data/library/): 7 942 528 B (~7,6 MB); catalog.json 26 547 004 B; state.json 38 384 B, kolejka pusta (queue/pending/leafDone = []).
- Wniosek: pobór działa, ostatni udany przebieg: Fetch data 15.11 09:01, Fetch library 15.11 14:34. Do rozstrzygnięcia: PR #451 czeka na scalenie (sprawdź auto-merge/reguły).
- Vercel: nic do klikania; na GitHubie: PR #451 – scal lub sprawdź, czemu auto-merge nie zadziałał.
- Odłożone: niczego (zadanie tylko-do-odczytu; tabela ma 5 pozycji, mniej niż limit 20 wierszy).

## P3-C – Biblioteka: domyślnie to, co działa
- Wynik: OK, commit 7315fb1; lint/typecheck/test/build zielone, brak usuniętych plików. Nowy test tests/unit/library-view.test.tsx (7 testów).
- Zrobione: domyślnie filtr „tylko z danymi” (brak p w adresie; p=0 = wszystkie), przycisk „Pokaż wszystkie (N)” w pl-PL, strona po 20 kart + „Pokaż więcej” 44 px, tytuł line-clamp-2, okruszki 2 ostatnie poziomy (pełne w title/aria-label), znacznik „dane gotowe”, podpowiedź przy pustym wyniku, opis „jeszcze niepobrane”. Nowy plik src/view/library/library-params.ts.
- Vercel: /biblioteka (pierwsze 20 kart, same gotowe; „Pokaż wszystkie (N)”), /biblioteka?q=ludnosc, na 390 px bez poziomego przewijania.
- Odłożone: test Playwright 390 px (wysokość <= 6000, scrollWidth <= 390) – nie ma go w liście „Zmieniaj”; „Wyczyść filtry” (LibraryFilters, istniejące testy) ustawia onlyReady=false, więc pokazuje wszystkie; tekst przy „Zamów ten wskaźnik” (OrderButton) bez zmian.

## P3-D – Wskaźnik świeżości danych
- Wynik: lint, typecheck, build zielone; Vitest 837/837 (w tym nowy tests/unit/freshness.test.ts).
- Commit: ba36c80 (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Vercel: stopka na dole dowolnej strony, pod linijką CC BY 4.0 ma być „Dane GUS odświeżone: 19.10.2026”; po 60 dniach dopisek „(dane mogą być nieaktualne)”.
- Źródło daty: public/data/values/density.json (fetchedAt), pobierane fetchem w runtime.
- Odłożone: test komponentu z mockiem fetch dla efektu React (brak jsdom w środowisku node) – pokryte testem loadFreshness z mockiem + render tekstu; e2e nie dodawano.

## P3-E – Mniejsza waga startowa
- Wynik: OK; lint, typecheck, build zielone; Vitest 842/842 (nowy tests/unit/startup-weight.test.ts, 5 testów).
- Ustalenie: kod już spełniał wymóg, więc bez zmian w src. tweakpane tylko przez import() w main.tsx przy ?tune (chunk TunePanel 154 kB, 32 kB gzip, poza głównym index 581 kB); index.json biblioteki ładuje wyłącznie loadLibraryIndex z leniwych stron Library*; Home go nie dotyka. Test to pilnuje (analiza importów).
- Vercel: otwórz stronę główną (bez ?tune) – brak żądania index.json w zakładce Sieć; /biblioteka – jedno żądanie index.json; /?tune – panel działa.
- Odłożone: pomiar żądań i bajtów na Home przez Playwright (page.on('response')) – wymaga testu e2e spoza listy „Zmieniaj”; pomiar „przed/po” trywialny, bo zmian w kodzie nie było. Commit: 8a63d7c.

## P4-A – Przejścia między stronami
- Wynik: OK; lint, typecheck, build zielone; Vitest zielony (nowy tests/unit/view-transitions.test.ts, 5 testów).
- Commit: 3db8f47 (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Zrobione: src/styles/view-transitions.css (fade old/new z var(--motion-base), blok reduced-motion z animation: none), import w global.css, prop viewTransition na wszystkich <Link> w Header.tsx (react-router 8.5).
- Vercel: klikaj Mapa/Rankingi/Biblioteka w nagłówku i w menu telefonu – lekki fade zamiast skoku; z systemowym „ograniczeniem ruchu” bez animacji.
- Odłożone: test Playwright reducedMotion (document.getAnimations()) – poza listą „Zmieniaj”; krzywa easingu – brak tokenu, użyto domyślnej; linki w stopce i na podstronach bez zmian.

## P4-B – Intro mapy: krótkie i pomijalne
- Wynik: OK; lint, typecheck, build zielone; Vitest 855/855 (nowy tests/unit/intro-session.test.tsx, 7 testów; timeline.test.ts bez zmian).
- Commit: 9244fd8 (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Zrobione: timeline.ts – opcja compact, stała PHONE_DURATION_RATIO=0,6, helpery sessionStorage (try/catch); IntroOverlay – raz na sesję, telefon (<768 px) krócej, dotknięcie kończy intro.
- Vercel: pierwsze wejście na telefonie – krótsze rysowanie, dotknięcie ekranu je przerywa; odświeżenie/powrót w tej samej karcie – mapa od razu; nowa karta pokazuje intro znów.
- Odłożone: test dotyku (onPointerDown) w DOM – brak jsdom/e2e w liście „Zmieniaj”; sprawdzono tylko klasę pointer-events-auto. Etapy fill/annotate nie są renderowane przez overlay, skrócone tylko w logice.
