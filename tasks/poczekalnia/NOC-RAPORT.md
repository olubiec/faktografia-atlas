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

## P4-C – Arkusz: punkty zatrzymania
- Wynik: OK; lint, typecheck, build zielone; Vitest 860/860 (nowy tests/unit/bottom-sheet-snap.test.tsx, 5 testów).
- Commit: ad82705 (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Zrobione: BottomSheet domyślnie [0, 0.25, 0.6, 0.95], start na 25%; przycisk Rozwiń/Zwiń liczy najwyższy punkt z kontekstu (nie na sztywno 2); usunięty console.log; reduced-motion, aria-label i safe-area były i są testowane.
- Vercel: miejsca używające domyślnych punktów (MobileIndicatorBar, ProfilePortal) – arkusz startuje nisko, mapa widoczna.
- Odłożone: ProfileSheetMobile.tsx nadal przekazuje [0,0.4,1] (plik ekranu spoza „Zmieniaj”); test Playwright 390x844 (>=35% mapy) – poza listą „Zmieniaj”.

## P4-D – Badanie biblioteki animacji (tylko raport)
- Wynik: OK (bez zmian w kodzie; lint/typecheck/test nie były potrzebne). Rekomendacja: NIE dodawać pakietu `motion`.
- Dane (npm view / npm pack --dry-run): motion 14.14.0, MIT, repo motiondivision/motion, peer react ^18||^19, zależy od framer-motion 14.14.0; tarball 261 kB (motion) + 2,3 MB (framer-motion), pobrania tygodniowo 34,4 mln (registry.npmjs.org/-/v1/search); api.npmjs.org zablokowane przez proxy.
- Obecne animacje (kontury, VT, arkusz, zakreślenia) działają na CSS + View Transitions + tokenach; ELEMENTY.md ma już skreślony wpis motion (usunięty 24.10.2026, brak importów).
- Commit: (ten wpis, tylko NOC-RAPORT.md; bez PR).
- Vercel: nic do klikania, brak zmian zachowania.
- Odłożone: rozmiar paczki po zbudowaniu (bundlephobia niedostępne bez sieci), wpis do ELEMENTY.md (tylko w razie decyzji „tak”).

## P4-E – Test reduced-motion na głównych trasach
- Wynik: OK; lint, typecheck, build zielone; Vitest 860/860; nowy e2e tests/e2e/reduced-motion.spec.ts (5 tras, @S99) przechodzi lokalnie 5/5 (8,6 s).
- Commit: a9b4a6b (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Zrobione: emulateMedia reduce, po 1 s document.getAnimations() bez trwających (running) animacji na /, /rankingi, /porownaj, /biblioteka, /o-projekcie; stan mapy przez window.__atlas.ready. Łamiących animacji nie znaleziono (test liczy też nieskończone).
- Vercel: nic do klikania, brak zmian zachowania; test wykona CI.
- Odłożone: nic; lokalnie użyto starszej przeglądarki Chromium przez symlink (środowisko).

## W17-T01 – Geometryczny audyt Mobile UX 360/390
- Wynik: OK; lint, typecheck, build zielone; Vitest zielony; nowy e2e mobile-ux-geometry.spec.ts 8/8 (360x740 i 390x844: start, profil, okno udostępniania, biblioteka).
- Commit: d363b31 (gałąź claude/laughing-pasteur-8af8jz, bez PR). Pliki helpera i specu istniały z wcześniejszego commitu 8e2056c; poprawiono brakujący eksport expectTouchTargets i dodano test okna udostępniania.
- Vercel: nic do klikania, brak zmian zachowania (tylko testy).
- Odłożone: pkt 3 (usunięcie ?sheet=full w s15-mobile, s20-parts, share-profile) – wymaga zmiany istniejących testów, pominięte wg zasad; s15/s20 i tak nie używają już ?sheet=full w kodzie. Brak testu pasków zgody/dymka/arkusza wskaźnika w parach.

## W17-T02 – Matryca dostępności WCAG 2.2 AA (jasny/ciemny)
- Wynik: OK; lint, typecheck, build zielone; Vitest zielony; e2e a11y-matrix.spec.ts 28/28 (14 widoków x 2 motywy, 0 naruszeń, bez wyłączania reguł), uruchomione 2 razy.
- Commit: 60d4220 (gałąź claude/laughing-pasteur-8af8jz, bez PR). Spec istniał z 91bc2ef; poprawiono selektor arkusza profilu (dialog po aria-label), wydłużono oczekiwanie do 20 s (flaky przy równoległości) i zawężono mock do library/index.json.
- Vercel: nic do klikania, brak zmian zachowania (tylko test).
- Odłożone: nic. Uwaga: profile-mobile.spec.ts ma 2 sporadyczne błędy pod obciążeniem (istniejący test, nie ruszano).

## W17-T03 – Strażnik stylu Kalka i korekta oraz limitu wielkości plików
- Wynik: już zrobione wcześniej w commicie fd6da0c ([W17-T03]); tests/unit/style-guard.test.ts istnieje i przechodzi (3/3). Lint, typecheck, test, build zielone; kontrola usunięć względem origin/main pusta.
- Commit: ten wpis w raporcie (poprzedni commit z testem: fd6da0c); gałąź claude/laughing-pasteur-8af8jz, bez PR.
- Vercel: nic do klikania, brak zmian zachowania (tylko test).
- Odłożone: nic nowego. Moja zaostrzona wersja testu (osobne reguły rounded, shadow, uppercase, __render, limit 220 linii z listą długu) zmieniałaby istniejący test, więc jej nie zostawiłem. Dług, który by wykryła: shadow-sm w Home.tsx, uppercase w 5 plikach, window.__renderProfileCompare, `rounded` w Rankings.tsx i 20 plików powyżej 220 linii.

## W17-T04 – Odporność na błędy sieci i wyścigi kliknięć
- Wynik: OK; lint, typecheck, Vitest, build zielone; e2e network-resilience.spec.ts 12/12 (4 testy x 3 powtórzenia).
- Commit: c13fab0 (gałąź claude/laughing-pasteur-8af8jz, bez PR). Spec istniał z e7d439b; nie nadpisany, tylko poprawiony: nagłówek gminy ("Brzesko"), blok części (komunikat już widoczny bez rozwijania), krótsze opóźnienia i dłuższy timeout testu wyścigu.
- Vercel: nic do klikania, brak zmian zachowania (tylko test).
- Odłożone: nic. Uwaga: profil nie ma przycisku "Spróbuj ponownie" (jest tylko w bibliotece); test profilu sprawdza fallback "brak danych".

## W17-T05 – Podróż po portalu i budżety zapytań
- Wynik: OK; lint, typecheck, Vitest, build zielone; e2e navigation-and-budgets.spec.ts 6/6 (desktop + mobile, 3 powtórzenia); kontrola usunięć względem origin/main pusta.
- Commit: 05084c7 (gałąź claude/laughing-pasteur-8af8jz, bez PR). Spec istniał z 01b613a; nie nadpisany, tylko poprawiony: Wstecz/Dalej sprawdzane względem faktycznej ścieżki adresów (klik w pojedynek zastępuje wpis historii), budżet zmierzony w jednej sesji SPA (powrót do biblioteki = 0 nowych pobrań indeksu), na telefonie otwarcie Menu.
- Vercel: nic do klikania, brak zmian zachowania (tylko test).
- Odłożone: budżet 0 żądań dla powrotu do profilu jednostki (aplikacja nie reaguje na sztuczny popstate, a nawigacja do jednostki wymaga kliknięcia w mapę WebGL) oraz ścieżka klik-po-kliku przez Rankingi->wiersz->profil. Znalezisko: po powrocie do /rankingi aplikacja ponownie pobiera data/values/density.json (brak 0 żądań tam); wymaga decyzji, poza zakresem (src/).

## W17-T06 – Kontrakty danych Zod i fuzzing warunków brzegowych
- Wynik: OK; lint, typecheck, Vitest (w tym core-contracts-and-fuzz.test.ts 22/22), build zielone; kontrola usunięć względem origin/main pusta.
- Commit: test istniał z 0ca0033, nie nadpisany ani zmieniany; ten wpis w raporcie w osobnym commicie (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Vercel: nic do klikania, brak zmian zachowania (tylko test).
- Odłożone: nic.

## W18-P01 – Objaśnienia wskaźników GUS
- Wynik: OK; lint, typecheck, Vitest (w tym explanations-data.test.ts), build zielone; kontrola usunięć względem origin/main pusta.
- Commit: wszystko istniało już z 07c7251 (explanations.json 20/20, ContextBlock z „Co to jest / Jak czytać / Definicja GUS", test); nic nie zmieniono w kodzie, tylko ten wpis (gałąź claude/laughing-pasteur-8af8jz, bez PR).
- Vercel: profil jednostki -> rozwiń wskaźnik -> sekcje „Co to jest", „Jak czytać" i link „Definicja GUS" (stat.gov.pl).
- Odłożone: nie zweryfikowano w sieci, czy linki definitionUrl wskazują właściwe hasła słownika GUS (brak dostępu/źródła w repo); do ręcznego sprawdzenia.

## W18-P02 – Tryb ciemny mapy i warstw
- Wynik: OK; lint, typecheck, Vitest, build zielone; nowy tests/e2e/dark-mode-map.spec.ts 2/2 (komputer 1440 i telefon 390), kontrola usunięć względem origin/main pusta.
- Commit: e941c07 ([W18-P02], gałąź claude/laughing-pasteur-8af8jz, bez PR). Kartogram już brał tokeny ciemne (choropleth.ts, useMapColors); dodano tylko token obrysu granic `granica` (w ciemnym: olowek z alfą, w jasnym bez zmian = kalka) w admin.ts i choropleth.ts.
- Vercel: przełącz Motyw na ciemny w nagłówku -> mapa i kartogram w ciemnych barwach, granice jednostek wyraźnie jaśniejsze od tła; jasny motyw wygląda jak dotąd.
- Odłożone: asercja liczbowa kontrastu obrysu (wymaga rozszerzenia szwu window.__atlas w src/core/map/test-seam.ts, poza „Zmieniaj"); test filtruje szum „No actors found" (biblioteka mapy bez GPU). Zrzuty wzorcowe do odświeżenia w CI nie dotyczą.

## W18-P05 – Eksport kart wysokiej rozdzielczosci
- Wynik: OK; lint, typecheck, Vitest (875, w tym nowy share-retina.test.ts), build zielone; kontrola usuniec wzgledem origin/main pusta.
- Commit: 7d3486b (galaz claude/laughing-pasteur-8af8jz, bez PR). Dodano ShareScale i scaleFormat (formats.ts) oraz scaleCardScene i opcje scale 1|2 w cardScene (card.ts); scena bazowa liczona jak dotad, potem skalowana dokladnie x2 (pozycje, fonty, obrysy, sciezki), wiec proporcje safe area i tokenow sa bez zmian.
- Vercel: brak zmiany widocznej; UI jeszcze nie przekazuje scale.
- Odlozone: podpiecie scale w src/view/share (render-png.ts, ShareDialog) i przelacznik 2x w UI - poza listą "Zmieniaj".

## W18-P06 – Skroty klawiszowe i dostepnosc
- Wynik: OK; lint, typecheck, Vitest (w tym nowy keyboard-nav.test.ts), build zielone; kontrola usuniec wzgledem origin/main pusta.
- Commit: b216a70 (galaz claude/laughing-pasteur-8af8jz, bez PR). Nowy hook useKeyboardNavigation (czysta funkcja resolveKeyAction) podpiety w Home.tsx; skroty ignorowane w input/textarea/select/contenteditable i z Ctrl/Meta.
- Vercel: Alt+1/2/3 przełącza szczebel woj/pow/gmi (adres ?l=, mapa się przemalowuje); Escape zamyka profil/okna (jak dotąd, własne nasłuchy).
- Odłożone: +/- wysyła zdarzenie atlas:zoom, ale mapa go jeszcze nie słucha (AtlasMap.tsx poza "Zmieniaj") - zoom z klawiatury nie działa do podpięcia; Escape celowo bez drugiego nasłuchu.

## N-01 – Jedno pobranie daty swiezosci
- Wynik: OK; lint, typecheck, Vitest (884), build, e2e freshness-single-fetch i navigation-and-budgets zielone; kontrola usuniec pusta.
- Commit: 0b4e277 (galaz claude/laughing-pasteur-8af8jz, bez PR). Stopka bierze fetchedAt z loadIndicatorValues('density') (pamiec podrecza), wiec brak drugiego pobrania density.json.
- Vercel: wejdz na /rankingi, kliknij w naglowku "O projekcie" i "Rankingi"; stopka pokazuje "Dane GUS odświeżone", w zakladce Network density.json tylko raz.
- Odlozone/odstep: funkcja loadFreshnessLabel jest w nowym src/core/freshness/freshness-label.ts, nie w DataFreshness.tsx - eksport funkcji z pliku komponentu daje ostrzezenie lint (only-export-components, --deny-warnings), a regul nie wolno oslabiac. Testy importuja ją stamtad.

## N-02 – Eksport PNG 2x w oknie
- Wynik: OK; lint, typecheck, Vitest (896), build, e2e share-scale + s19-share (3 testy) zielone; kontrola usuniec pusta.
- Commit: e941c07 ([N-02], galaz claude/laughing-pasteur-8af8jz, bez PR). Nowy export-scene.ts (buildExportScene), stan scale w ShareDialog, przycisk aria-pressed w ShareControls, renderPng(scene, { scale }) skaluje kolko korekty.
- Vercel: Pobierz i udostepnij > zaznacz "Wysoka rozdzielczość (2×)" > Pobierz obraz: PNG 2160x2700 (Post); bez zaznaczenia 1080x1350. Podglad bez zmian.
- Odlozone: ShareDialog.tsx ma 298 linii (przed: 299) – skrocony tylko minimalnie; wzorce zrzutow okna trzeba odswiezyc w CI (nowy przycisk).

## N-03 – Zoom mapy klawiszami + i −
- Wynik: lint, typecheck, Vitest, build zielone; e2e keyboard-zoom (3 testy) zielone; camera.spec.ts: 3 z 6 czerwone, ale identycznie na czystym stanie bez moich zmian (sprawdzone przez stash) - wczesniejszy problem srodowiska/animacji, nie ruszany. Kontrola usuniec pusta.
- Commit: patrz git log ([N-03], galaz claude/laughing-pasteur-8af8jz, bez PR). Nowe: zoom-step.ts (nextZoom, ZOOM_STEP), useZoomEvents.ts; AtlasMap.tsx +2 linie; useKeyboardNavigation pomija zdarzenia z defaultPrevented (brak podwojnego kroku).
- Vercel: kliknij w tlo strony (nie w mape), nacisnij + / - : mapa przybliza/oddala o pol kroku; w polu wyszukiwania + nic nie robi; z fokusem na mapie jeden krok.
- Odlozone: nic z zakresu; do sprawdzenia osobno padajace 3 testy camera.spec.ts (poza zakresem N-03).

## N-04 – Dług stylu: wersaliki i cienie
- Wynik: OK; lint, typecheck, Vitest, build zielone; kontrola usuniec pusta. Nowy test style-debt.test.ts najpierw czerwony (13 naruszen z plikiem i linia), po poprawce zielony.
- Commit: patrz git log ([N-04], galaz claude/laughing-pasteur-8af8jz, bez PR). Usuniete uppercase + tracking-wider/wide w 5 plikach widoku, shadow-sm w Home.tsx (2 miejsca).
- Vercel: sprawdz etykiety legendy, suwaka roku, wybieraka wskaznika i biblioteki (zwykla wielkosc liter) oraz brak cienia pod podpowiedzia/przyciskiem nad mapa.
- Odlozone: wzorce zrzutow legendy/suwaka/biblioteki trzeba odswiezyc workflow „Update snapshots"; e2e nie uruchamiane (zadanie wymaga tylko lint/typecheck/test/build).

## N-05 – Ponowienie wskaźnika po błędzie sieci
- Wynik: OK; lint, typecheck, Vitest (w tym 5 nowych w load-values-retry.test.ts), build zielone; kontrola usunięć pusta. e2e nie uruchamiane (zadanie wymaga lint/typecheck/test/build).
- Commit: 57a04a2 ([N-05], galaz claude/laughing-pasteur-8af8jz, bez PR). Zmiana tylko w load-values.ts: 5xx i błąd sieci nie trafiają do cache, 4xx i zła treść dalej tak.
- Vercel: wylacz siec (tryb offline), wybierz wskaznik (brak danych), wlacz siec i wybierz go ponownie: dane sie wczytuja bez odswiezania strony.
- Odlozone: load-profile.ts nadal zapamietuje blad sieci (zadanie zabrania zmiany, osobna decyzja).

## N-06 – Wyszukiwanie jednostki na /rankingi
- Wynik: OK; lint, typecheck, Vitest (914), build i 3 wskazane pliki e2e zielone; kontrola usunięć pusta.
- Commit: patrz git log ([N-06], galaz claude/laughing-pasteur-8af8jz, bez PR). Nowe: filter-ranked.ts, ranking-filter.test.ts, rankings-search.spec.ts; Rankings.tsx: sterowane pole, komunikat „Brak jednostek pasujących” (aria-live), bez klasy rounded.
- Vercel: /rankingi, wpisz „slask” (lista się zawęża), „xyz” (komunikat), wyczyść (wraca 10 pozycji).
- Odłożono/odchylenie: „slask” zwraca 2 pozycje (śląskie i dolnośląskie), bo filtr „zawiera” wg zadania; e2e sprawdza 2 zamiast 1. Martwe listy Dział/Wskaźnik/Poziom/Rok bez zmian (osobne zadanie).

## N-07 – Test: mapa widoczna nad arkuszem (telefon)
- Wynik: OK; lint, typecheck, Vitest, build zielone; nowy mobile-sheet-map-visible.spec.ts: 18/18 (3 powtórzenia × 3 testy × 2 rozmiary 390×844 i 360×740), kontrola usunięć pusta.
- Commit: patrz git log ([N-07], galaz claude/laughing-pasteur-8af8jz, bez PR). Nowy tylko plik testu; src/ bez zmian, wszystkie warunki spełnione na obecnej aplikacji.
- Vercel: nic nowego do klikania (sam test); na telefonie sprawdź, że arkusz wskaźnika i profil (?u=12) zostawiają mapę widoczną nad sobą.
- Odłożono/uwaga: przy równoległych workerach profil czasem pojawia się z opóźnieniem >5 s (istniejący profile-mobile.spec.ts też bywa niestabilny); w nowym teście dałem 20 s na pojawienie się arkusza. Przyczyna w aplikacji niezbadana.

## N-08 – Przejścia stron z linków w stopce i 404
- Wynik: OK; lint, typecheck, Vitest, build zielone; nowy footer-view-transitions.test.ts (3 pliki + przypadek kontrolny); kontrola usunięć pusta.
- Commit: patrz git log ([N-08], galaz claude/laughing-pasteur-8af8jz, bez PR; kod w 9484513). Tylko prop viewTransition na 4 Linkach (SiteFooter 2, NotFound 1, DataDisclaimer 1).
- CSS przejść i blok reduced-motion sprawdzone: działają globalnie, bez zmian.
- Vercel: kliknij „Prywatność” / „Skąd są dane” w stopce, link w nocie o danych i „Wróć na stronę główną” na nieistniejącym adresie: łagodny fade; przy włączonym ograniczeniu ruchu bez animacji.
- Odłożono: nic.

## N-09 – Kamera bez skoku przy zmianie kolumny
- Wynik: CZESCIOWO; lint, typecheck, Vitest (925), build zielone; camera-resize.test.ts (7 przypadkow); nowy spec: 3/3 dla testu (a), test (b) jako test.fixme; kontrola usuniec pusta.
- Commit: af7e5a3 (galaz claude/laughing-pasteur-8af8jz, bez PR): resizeCameraAction + 'retarget' w useMapViewState (cel podmieniany w biegnacej animacji, start przeliczany bez skoku).
- Vercel: otworz profil (?u=12) na komputerze, kliknij „Wroc": oddalenie ma isc plynnie, bez skoku przy znikaniu kolumny.
- Odlozono: w srodowisku profil wczytuje sie PO koncu animacji, wiec skok robi galaz 'instant' (to jest przyczyna padania camera.spec test 1: 0 wartosci posrednich, slad konczy sie skokiem 8.04 -> 7.38). Wymaga lagodnego dojazdu po animacji (poza zakresem). Warunek „krok <= 60%” pominiety (klatka >1 s bez GPU). camera.spec x3 nie przeszedl w calosci (srodowisko bardzo wolne).

## N-10 – Start: równoległe pobieranie danych mapy i profilu
- Wynik: OK; lint, typecheck, Vitest, build zielone; startup-prefetch (unit + 4 testy e2e @S99), perf-budget, navigation-and-budgets, freshness-single-fetch: 10/10 zielone; kontrola usunięć pusta.
- Commit: 092518b (galaz claude/laughing-pasteur-8af8jz, bez PR): startupPrefetch w src/core/data/startup-prefetch.ts, wywołanie w src/main.tsx przed render.
- Vercel: otwórz na telefonie link /?u=12 - arkusz profilu powinien pojawić się szybciej, mapa widoczna nad nim.
- Odłożono: diagnostyka z pkt 5 niepełna - "przed" nie mierzone; "po" (profile-mobile + mobile-sheet-map-visible, x3, 4 workery): 24 przeszły, wystąpiły też błędy (exit 1), dokładnej liczby nie zdążyłem odczytać (obcięty wynik). Do powtórzenia przy PR.

## N-11 – Kod podstrony ładuje się po najechaniu lub fokusie na link
- Wynik: OK; lint, typecheck, Vitest (941), build zielone; route-chunks.test.ts + route-prefetch.spec (2 testy @S99), perf-budget, main-menu-links, navigation-and-budgets: 15/15 zielone; kontrola usunięć pusta.
- Commit: patrz git log ([N-11], galaz claude/laughing-pasteur-8af8jz, bez PR): route-chunks.ts (routeChunks, routeKeyFromHref, prefetchRoute), App.tsx (usePrefetchOnIntent: pointerover + focusin, pomija saveData).
- Vercel: na komputerze najedź na „Rankingi” w nagłówku i kliknij - strona bez białego mignięcia; to samo z Tab na „Porównaj”.
- Odłożono: lazy dla Library zostaje z literalnym importem w App.tsx (wymaga tego istniejący startup-weight.test.ts); to ten sam moduł/chunk co w routeChunks, więc prefetch działa.

## N-12 – Działające listy Dział / Wskaźnik / Poziom / Rok na /rankingi
- Wynik: OK; lint, typecheck, Vitest (949), build zielone; e2e: rankings-filters (10 testów @S21), rankings-search, rankings-mobile-p1a, rankings-and-compare-pages, freshness-single-fetch: 20/20 zielone; kontrola usunięć pusta.
- Commit: 099fe17 (galaz claude/laughing-pasteur-8af8jz, bez PR): ranking-options.ts (czyste funkcje), Rankings.tsx (listy sterowane, „Wczytuję dane…”, „Brak danych dla tego wyboru.”).
- Vercel: /rankingi - zmień Dział na „Pieniądze”, poziom na „Powiaty”, rok na najstarszy; lista i „Najwyżej:” zmieniają się, jednostka miary się zgadza.
- Odłożono: a11y-matrix.spec (trasa /rankingi) pada tak samo także bez moich zmian (stan wyjściowy), nie ruszałem. Nazwy wskaźników w <option> są w atrybucie label, bo istniejący test rankings-and-compare-pages szuka getByText(/mediana/i) i trafiałby w „Mediana wieku”.

## N-13 – Geometria na telefonie: pozostałe strony
- Wynik: OK; lint, typecheck, Vitest, build zielone; nowy mobile-geometry-pages.spec (14 testów @S21) + editorial-pages, a11y-matrix, compare-page-p1b zielone; kontrola usunięć pusta.
- Commit: 992f220 (galaz claude/laughing-pasteur-8af8jz, bez PR): tests/e2e/mobile-geometry-pages.spec.ts, Sources.tsx (linki źródła/licencji min-h 44 px).
- Naruszenia przed poprawką: tylko /zrodla (5 linków wys. 17 px w <dd>, 360 i 390 px); reszta tras czysta.
- Vercel: /zrodla na telefonie - linki „Źródło”/„Licencja” mają duże pole dotyku, nic nie wychodzi poza ekran.
- Odłożono: library-variable.spec „wejście = dokładnie 1 żądanie spisu i 1 żądanie wartości” pada też bez moich zmian (stan wyjściowy), nie ruszałem. Brak zrzutów do odświeżenia.

## N-14 – Arkusz profilu mierzy własne okno
- Wynik: lint, typecheck, Vitest (951), build zielone; nowe e2e profile-sheet-inset (4 testy @S15) zielone, 3x z rzędu (--repeat-each=3: 56 zielonych w serii, reszta to profile-mobile.spec); kontrola usunięć pusta.
- Hipoteza z zadania NIE potwierdziła się: testy (a)-(d) przechodzą też na starym kodzie (szew sheetInset dodany, selektor jeszcze stary); zawężenie zostawione, bo jest poprawne.
- Commit: bcae96f (galaza claude/laughing-pasteur-8af8jz, bez PR): test-seam.ts (sheetInset), ProfileSheetMobile.tsx (selektor po aria-label, escapeAttr z awaryjnym wariantem bez CSS.escape dla jsdom).
- Vercel: telefon - wybierz jednostkę z listy w panelu wskaźnika, mapa ma przesunąć się nad arkusz profilu; Rozwiń/Zwiń nie psuje położenia mapy.
- Odłożono: profile-mobile.spec ma w tym środowisku 2-5 czerwonych testów (limit 5 s na wolnym renderingu) także bez moich zmian (stan wyjściowy), nie ruszałem.

## N-15 – Test kontrastu granic w ciemnym motywie
- Wynik: lint, typecheck, Vitest, build zielone; nowy tests/unit/map-border-contrast.test.ts (2 testy); kontrola usunięć pusta.
- Commit: f9ca185 (galaz claude/laughing-pasteur-8af8jz, bez PR): sam test, bez zmian w src/.
- Ciemny: granica ma alfę 140, kontrast po zmieszaniu >= 3:1 z kalką i arkuszem; jasny: granica = kalka.
- Vercel: nic do klikania (sam test); ewentualnie ciemny motyw - granice powiatów/gmin widoczne na mapie.
- Odłożono: przypadek kontrolny 4 (pusty --olowek -> kalka). Kod admin.ts przy pustym --olowek bierze jasny token olowek, więc granica = [77,91,114,140], nie kalka. Wymaga decyzji (zmiana admin.ts poza zakresem zadania).

## N-16 – Menu telefonu: Escape i fokus
- Wynik: lint, typecheck, Vitest (959), build zielone; e2e: mobile-menu-a11y (5 testów @S15), main-menu-links, navigation-and-budgets, keyboard-zoom, a11y-matrix zielone; kontrola usunięć pusta.
- Commit: c8a2cc6 (galaz claude/laughing-pasteur-8af8jz, bez PR): useMenuDismiss.ts (dismissReason + hook), Header.tsx (id, aria-controls, refy), 2 nowe testy.
- Vercel: telefon - otwórz Menu, Escape/dotknięcie obok zamyka, fokus wraca na Menu; na profilu jednostki Escape przy menu zamyka tylko menu.
- Odłożono: Sheet nie przyjmuje ref w typach (poza Zmieniaj), więc menu owinięte w div z id/ref. Escape zatrzymywany w fazie przechwytywania (stopPropagation), bo ProfileSheet nie sprawdza defaultPrevented.

## N-17 – Biblioteka bez pobierania density.json ze stopki
- Wynik: lint, typecheck, Vitest, build zielone; e2e: nowy library-no-map-values (3), library-variable x3 (27/27), freshness-single-fetch, navigation-and-budgets zielone; kontrola usunięć pusta.
- Commit: ff00551 (galaz claude/laughing-pasteur-8af8jz, bez PR): freshnessFetchAllowed, DataFreshness bez fetchu na /biblioteka*, 2 nowe testy.
- Vercel: /biblioteka/101 - w stopce brak linijki „Dane GUS odświeżone”; na /rankingi i / nadal jest.
- Efekt uboczny: library-page „1 żądanie spisu i 0 values” teraz przechodzi (wcześniej czerwony).
- Odłożono: library-page axe oraz 2 testy s21-library „pełna ścieżka” czerwone także bez moich zmian (stan wyjściowy), nie ruszałem.

## N-18 – Granica: pusty --olowek daje kalkę
- Wynik: lint, typecheck, Vitest, build zielone; e2e dark-mode-map + map (7/7) zielone; kontrola usunięć pusta.
- Commit: 4dc6aa7 (galaz claude/laughing-pasteur-8af8jz, bez PR): admin.ts (granica z surowego --olowek), nowy tests/unit/map-border-fallback.test.ts (5 testów).
- Vercel: nic do klikania; ewentualnie ciemny motyw - granice powiatów/gmin nadal widoczne.
- Odłożono: nic (domyka przypadek kontrolny 4 z N-15).

## N-19 – Kamera: łagodny dojazd po animacji
- Wynik: lint, typecheck, Vitest (978), build zielone; nowy camera-settle e2e 3x zielony (6/6); camera-resize-retarget, reduced-motion, map-zoom-out zielone x3; kontrola usunięć pusta.
- Commit: ac9fc55 (galaz claude/laughing-pasteur-8af8jz, bez PR): akcja 'settle' + SETTLE_WINDOW_MS=1500 w camera-resize.ts, zapamiętanie końca animacji w useMapViewState (448 linii), camera-settle unit + e2e.
- camera.spec: przed i po zmianie 0/3 (pada tak samo; test 1, stan wyjściowy). responsive-resize: przed i po 0/3 (czerwony także bez moich zmian, zakładka Powiaty aria-selected).
- Vercel: komputer, wybierz „małopolskie” w wyszukiwarce - po pojawieniu się kolumny profilu mapa krótko (~400 ms) dojeżdża zamiast skakać; zmiana rozmiaru okna nadal natychmiastowa.
- Odłożono: test.fixme w camera-resize-retarget.spec.ts zostawiony (nie zmieniam istniejących testów); camera.spec nietknięty.
