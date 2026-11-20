# Stan – 20.11.2026

## Stan na 20.11.2026 (fala W4 scalona; wcześniejsze sekcje niżej są starsze – tam, gdzie się różnią, obowiązuje ta sekcja)
Fala W4 (15 zadań QC + poprawka #571) scalona do `main` przez właściciela-zlecenie 20.11, **bez czekania na zielone testy** (testy `testy-shard` na PR-ach były w kolejce lub w toku w chwili scalania). Stan CI na `main` po scaleniu: **do sprawdzenia**.

| Status | Praca | PR | Co dało |
|---|---|---|---|
| ✅ scalone | W4-QC802 pasek udostępniania na Rankingach | #556 | `RankingsShare.tsx` |
| ✅ scalone | W4-QC505 okno dodawania wskaźnika: zakładki Szukaj / Kategorie, okruszki | #557 | `LibrarySearchPanel.tsx` |
| ✅ scalone | W4-QC916 cztery nowe rodzaje kart udostępniania (logika) | #558 | `card.ts`, `deck-scene.ts` |
| ✅ scalone | W4-QC508 komunikat „Dodano” przy „Dodaj do moich” (3 s) | #559 | `AddToMineButton.tsx` |
| ✅ scalone | W4-QC903 domyślny zestaw kart (logika, niepodłączona) | #560 | `deck-defaults.ts` |
| ✅ scalone | W4-QC904 podział talii na strony (logika, niepodłączona) | #561 | `deck-split.ts` |
| ✅ scalone | W4-QC912 reducer i loader wartości talii (niepodłączone) | #562 | `deckReducer.ts`, `valueLoader.ts` |
| ✅ scalone | W4-QC204 testy e2e porównania na telefonie (390 i 360 px) | #563 | tylko testy |
| ✅ scalone | W4-QC803 strona udostępniania porównania, `?c=A,B`, karta „compare” | #564 | `CompareShare.tsx` |
| ✅ scalone | W4-QC403 przyciski +/− zoomu (wycofane w #571) | #565 | `zoom-by.ts`, logika zostaje |
| ✅ scalone | W4-QC404 lot kamery do miejscowości nie przerywany panelem profilu | #566 | `isSameView` w `camera-plan.ts` |
| ✅ scalone | W4-QC504 strzałki poprzedni/następny w „Moich wskaźnikach”, fokus | #567 | `myIndicatorsFocus.ts` |
| ✅ scalone | W4-QC506 aktywny wskaźnik wyróżniony w pasku na telefonie | #568 | `MobileIndicatorBar.tsx` |
| ✅ scalone | W4-QC606 wspólny hook rejestru wskaźników, stan ładowania | #569 | `useIndicatorRegistry.ts` |
| ✅ scalone | W4-QC607 grupa „Z biblioteki GUS” w wyborze wskaźników (50 + „Pokaż więcej”) | #570 | `LibraryGroup.tsx` |
| ✅ scalone | Usunięcie paska +/− zoomu z mapy (na prośbę właściciela) | #571 | usunięto `ZoomButtons.tsx` i jego test |

**Usunięte z `main` w W4:** `src/view/map/ZoomButtons.tsx`, `tests/unit/zoom-buttons.test.tsx` (#571, na prośbę właściciela).

**Do sprawdzenia przez właściciela na faktografia.eu** (lista z uwagami w sekcji „Co działa”, ta wiadomość zastępuje ją dla W4):
- Rankingi: pasek udostępniania, bez przewijania w bok na telefonie.
- Dodaj wskaźnik: zakładki Szukaj/Kategorie, okruszki.
- Biblioteka: „Dodano” po „Dodaj do moich”, znika po ok. 3 s.
- Porównanie: `?c=A,B`, karta „compare”, telefon 390 i 360 px.
- Mapa: lot kamery do miejscowości przy zoomie 8–9 dochodzi do końca.
- Moje wskaźniki: strzałki, fokus klawiaturą; na telefonie wyróżniony aktywny wskaźnik.
- Wybór wskaźnika: „Z biblioteki GUS”, „Pokaż więcej”.
- Mapa: brak paska +/− (zoom palcem i scrollem).

**Znane ograniczenia W4:** kliknięcia nie są testowane automatycznie (Vitest bez DOM); trzy specyfikacje e2e z QC403 (`drill`, `fix6-camera-driver`, `localities-map`) mogą być czerwone na CI; zrzuty pikselowe do odświeżenia workflowem „Update snapshots” (uruchamia właściciel); testy czasowe (`library-query-perf` i inne) nie były sprawdzone na czystym `main`.

## Stan na 18.11.2026 (aktualizacja D10; reszta pliku niżej to opis z 28.10 – tam, gdzie się różni, obowiązuje ta sekcja)
`main` = commit f22ee8c ([W2-FIX6G] #502). Pełny wykaz prac przerwanych i otwartych: `docs/STATUS-PRZERWANE.md`; plan fal: `docs/PLAN-POPRAWEK.md`; kolejność animacji kamery: `tasks/poczekalnia/FIX6-KOLEJNOSC.md`. Liczby i odczyt na telefonie: „do weryfikacji” przez właściciela.

### Co zostało scalone od 28.10 (✅)
| Status | Praca | PR | Co dało |
|---|---|---|---|
| ✅ | Fala Q1 = W1-QC* (22 zadania z `tasks/`, wszystkie scalone) | #453–#472, #474–#476 | logika Rankingów (adres, filtr, podsumowanie, lista), stan pary Porównaj i PlacePicker, reguła obrysu, model „Moich wskaźników”, wspólny rejestr wskaźników i jeden loader wartości, spis pobranych biblioteki, karty eksportu (tabela, duża liczba, rozkład, wykres lat, numer strony), pasek udostępniania, „Zamów dane na temat…”, adres `?i=b60614`, raport ruchu mapy. Dodatkowo robot spisu pobranych `available.json` (QC601, #459) |
| ✅ | Naprawa helpera e2e | #473 | brakujący eksport `expectTouchTargets` |
| ✅ | [FIX], [FIX2] | #477, #478 | czerwone testy e2e na main (dostępność, podwójne logo, reszta) |
| ✅ | [FIX3] uwagi właściciela | #479 | logo w eksporcie, płynniejsza kamera, logo = strona główna, wybór wskaźników |
| ✅ | [PLAN] plan poprawek | #480 | `docs/PLAN-POPRAWEK.md`, zadania W2–W7 i W19 w poczekalni |
| ✅ | [FIX5] audyt automatu danych | #481 | audyt pokrycia i robotów (`docs/AUDYT-DANYCH.md`) |
| ✅ | [FIX4] okno dodawania wskaźników po kategoriach (także z biblioteki), mniej przebudów warstw przy zoomie | #485 | picker/okno dodawania |
| ✅ | Fala P1 = W19-PF01–PF09 (9/9) | #482–#491 | PF04 #482 · PF05 #483 · PF06 #484 · PF07 #486 · PF02 #487 · PF03 #488 · PF01 #489 · PF08 #490 · PF09 #491 (pomiar klatek, strażnicy osiągalności i workflowów, świeżość danych, stabilizacja testów) |
| ✅ | Dane wartości BDL | #451 | `data: wartości wskaźników BDL (public/data/values)` jest już na main (commit 40c3f27); czerwony gitleaks i wynik „Fetch data” #31 – do weryfikacji, patrz „Do zrobienia” |
| ✅ | FIX6 – płynna kamera, całość (A–I, 10 PR) | #492–#502 | opis niżej |

**FIX6 szczegółowo** (research: `docs/research/p-animacja-kamery.md`; pomiar: `p-animacja-kamery-pomiar.md`):
- A #494 wachlarze w wielokątach (wzór tylko dla braku danych) · B #493 czysty planer kamery (`camera-plan.ts`: easing, czas, zoom log) · I #495 pomiar klatek przed/po z progami · H1 #496 sterownik rAF + `jumpTo` (niepodłączony) · H2 #497 mapa niekontrolowana, kamera bez `setState` na klatkę.
- C #498 płynne kółko (tempo `scrollZoom` ze stałych) · D #499 dotyk i pinch przerywają animację · E #500 „Cofnij”/„Wróć” tym samym planerem (stos widoków, miękkie lądowanie) · F #501 warstwa miejscowości bez „pop” (od zoomu 8,5, znika poniżej 8,0) · G #502 reduced motion (plan o czasie 0 = jedno `jumpTo`) i tabela „po”.
- **Pomiary:** środowisko to SwiftShader (programowy WebGL, dławienie CPU ×4), nie telefon. Progi (p95 ≤ 33 ms, zgubione < 10%, max ≤ 100 ms, skok zoomu ≤ 0,25) **nie zostały spełnione w żadnym z 5 scenariuszy**. Poprawa widoczna w pinch (p95 1833→567 ms), „cofnij” (3700→983 ms), zoom do gminy (1717→733 ms); `wheel×3` wyszło gorzej (367→717 ms, duży rozrzut). Liczby są orientacyjne; **werdykt wymaga telefonu właściciela**.

### W toku (🔶)
- ✅ **[W2-FIX7] PR #503** (stan 20.11 – U00: `fitViewState` i `__atlas.mapView` są na main, FIX7 scalone; zob. `docs/research/u/U00.md`) – opis z 18.11: mapa startuje za blisko na telefonie (widać tylko środek Polski). Przyczyna: pusta referencja mapy w `onLoad`, więc `syncMap` nic nie ustawiał i zoom zostawał 5,5. Na gałęzi: `fitViewState` w `src/core/map/fit.ts` (margines 48 px, 64 px u góry na pasek „Polska”; „Wróć” używa tej samej funkcji), `pixelRatio` MapLibre i `useDevicePixels` deck.gl ≤ 2, `__atlas.mapView`, testy `fix7-fit-view.test.ts` i `fix7-start-view.spec.ts`. **CI czerwone:** stały punkt kliknięcia w testach trafia teraz w pustkę – `s15-mobile.spec.ts` poprawiony (zgoda właściciela, tylko miejsce kliknięcia), `mobile-tooltip.spec.ts` (6 testów) w połowie zmiany (WIP, niesprawdzone), `profile-mobile.spec.ts:114` nieruszony. Uwaga: `playwright.config.ts` ma `reuseExistingServer` poza CI – przed testami lokalnymi `pkill -f "vite preview"` i `pnpm build`.

### Do zrobienia (⬜)
- ✅ (20.11, U00) Dokończyć FIX7 (testy dotykowe, zielone CI, scalenie squashem; zrzuty – workflow „Update snapshots”, jeśli się zmienią).
- ⬜ Fala Q2 = W2 (19 zadań w `tasks/poczekalnia/`: 6 nowych PD01, PM01, PM02, PU01, PX01, PX02 + 13 z `Q/`): tylko na „start Q2”, po sprawdzeniu kolizji plików z FIX4/FIX6/FIX7 (`AtlasMap.tsx`, `useMapViewState.ts`, `ProfileIndicatorList.tsx`, `AddIndicatorWindow.tsx`, `localities-layer.ts`, `picker-results.ts`). PX02 (decyzja D3) dopiero po sprawdzeniu przyczyny na kodzie po FIX4.
- ⬜ Fale Q3–Q7 (W3–W7, PLAN-POPRAWEK §3).
- ⬜ Reduced motion: bezwładność `scrollZoom`/`dragPan` nie jest wyłączona (konfiguracja w `AtlasMap.tsx`).
- ⬜ Wskaźniki biblioteki (1773 w `available.json`) niepodpięte do UI mapy (QC603, QC606, QC607 w W2–W4).
- ⬜ Skrypt GUS (host wewnętrzny) – do weryfikacji; 155 nieudanych pobrań + 375 wskaźników poza `available.json` – do weryfikacji (patrz `docs/AUDYT-DANYCH.md`).
- ⬜ Czerwony gitleaks w PR #451 i wynik „Fetch data” #31 – do weryfikacji.
- ⬜ Odświeżenie reszty STAN.md (D10): sekcje niżej opisują stan z 28.10.
- ⬜ Nie scalać Dependabot #450 w trakcie W3–W5.
- ⬜ Stare gałęzie `claude/FIX6A` i `claude/FIX6I` (obce commity, nieszkodliwe) – usunąć (Claude nie może: proxy blokuje usuwanie gałęzi).
- ⬜ **Do sprawdzenia przez właściciela na telefonie (FIX6):** płynny zoom kółkiem i pinchem · „Cofnij”/„Wróć” (miękkie lądowanie) · warstwa miejscowości bez skoku (pojawia się od 8,5, znika poniżej 8,0) · wachlarze przy zoomie 11–12 · przerwanie animacji dotykiem · tryb ograniczonego ruchu · po FIX7: start mapy pokazuje całą Polskę.

- Starsze sekcje (Co działa, Sesja teraz, Plan, Przypomnienia, Znane problemy / dług – stan z 28.10) przeniesione do `docs/STAN-ARCHIWUM.md` 20.11.2026 (U00).

## Decyzje (najnowsze na górze, 1 linia, kto)
- 20.11.2026 · **W4 scalona do `main` (#556–#570) mimo nieukończonego CI** (na polecenie właściciela „scalaj”); pasek +/− zoomu usunięty (#571, na polecenie właściciela); `.gitignore` dla `.claude/worktrees/` nadal czeka na decyzję (Claude, z polecenia właściciela)
- 18.11.2026 · **D1–D10 z `docs/PLAN-POPRAWEK.md` zatwierdzone** (decyzja oddana Claude przez właściciela); zgoda na zmianę **tylko miejsca kliknięcia** w testach mobilnych dla FIX7 (`s15-mobile`, `mobile-tooltip`, `profile-mobile`), bez zmiany asercji; scalanie dokumentacji bez sprawdzania kodu (Ty)
- 28.10.2026 · **F13: cztery zadania tylko-testowe** (T13.1–T13.4, `docs/prompty/F13.md`, PR #409): zgoda na zmianę wyłącznie czterech niestabilnych testów i tylko w zakresie „czekaj na warunek zamiast sprawdzać od razu”; liczba asercji bez zmian, bez `skip`/`fixme`/`only`/`ts-ignore`; scalone #414–#417 po zielonym CI (Claude, na polecenie „puszczaj kolejne prompty testowe”)
- 28.10.2026 · **CI na `main` czerwone po F12 – przyczyna i naprawa:** test W2.37 (`s21-library.spec.ts`) liczył żądania `index.json` w chwili zmiany adresu, zanim strona je wysłała (`Expected: 1, Received: 0`); naprawa tylko w teście (PR #408, lokalnie 18 z 18 testów w 3 powtórzeniach). **PR Julesa #407 zamknięty bez scalenia** (zmieniał kod aplikacji: `useMapViewState.ts`, `Header.tsx`, `Library.tsx`, `ProfileParts.tsx`, m.in. plik z listy zakazanej w AGENTS.md) i issue #406 zamknięte (Claude, na polecenie „poprawiaj błędy automatycznie”)
- 28.10.2026 · **Nadzór nad scalaniem F11–F13 przez skrypt Claude** (poza repo): scala PR-y Julesa po zielonym `testy` + `bezpieczenstwo`, najpierw ponawia niestabilne CI (rerun failed jobs), potem zwraca błąd Julesowi komentarzem; nie scala usunięć plików, plików spoza zakresu zadania, osłabionych testów ani PR-ów z konfliktem (Claude, na polecenie „ustaw automaty”)
- 27.10.2026 · **F9 zamknięta** (7 PR scalonych po zielonym CI: #373–#379). **Research rundy 3 sprawdzony; dodane zadanie W2.38** (poprawa dolnego arkusza na telefonie, F10); cztery raporty z sesji bez dostępu do sieci odrzucone (Claude, na polecenie „zmień plan”). Plan: F10–F12 = 12 zadań
- 26.10.2026 · **CI na `main` zielone**: runner przypięty do ubuntu-24.04 (#362), naprawa share-profile + timeouty (#363); #348 scalony; PR Julesa #361 zamknięty bez scalenia (Claude, na polecenie „doprowadź do czystego”)
- 26.10.2026 · **F8b zamknięta, plan po researchu w repo** (Claude, ze stanu `main`): scalone #349 (plan), #350 (kontrakt spisu), #351 (formularz zgłoszeń), #352 (kolejka F8b), #356–#358 (W1.27, W1.26, W1.25); `pnpm test` zielony (93 pliki, 620 testów); **CI na `main` czerwone od 12:10 z powodu mobilnego testu share-profile, niezwiązanego z F8b – naprawa przed F9**; „Fetch library” ponownie uruchomiony; runda 2 researchu i PR #348 (R12) niezałatwione
- 26.10.2026 · **D1–D8 rozstrzygnięte** (Claude, z Twojego polecenia „podejmij wszystkie decyzje”): D1 zostajemy na pnpm 10.30.3, W0.2 tylko `trustPolicy`, zmiana na 11/12 dopiero po F12; D2 lista płaska „Dział – wymiary”; D3 PR kontraktu otwarty (#350); D4 naprawa robota n4/n5 = W1.25 + ponowny „Fetch library”; D5 kreski + osobna pozycja „brak danych” w legendzie (W3.8); D6 konto i domena R2 dopiero gdy `data/library` > ~1 GB; D7 zgoda na zmianę `library-order.test.ts` (tylko W1.27); D8 W1.26 przed F10. Prompty F8b: `docs/prompty/F8b.md`; formularz zgłoszeń: PR #351
- 26.10.2026 · **Po weryfikacji R2, R5, R7–R12** (`docs/research/haiku/`; Claude): R8 – link „Zamów” przez `template=` + pola `id`, bez `labels=` (obcy dostają 404), potrzebny formularz `.yml` i etykieta (W1.27); R7 – lista płaska „dział: wymiary”, ale robot gubi `n4`/`n5` (25% zmiennych ma zdublowane tytuły) → W1.25 i ponowny przegląd katalogu; spis ma 63 960 zmiennych (nie 51 tys.), 593 KB gzip; wyszukiwanie za wolne na tylu zmiennych → W1.26
- 26.10.2026 · **R9** (Claude): objaśnienia pisane własnymi słowami + `definitionUrl` do hasła GUS (GUS: kopiowanie z podaniem źródła, brak nazwanej licencji; część haseł to cytaty osób trzecich); **R10**: `trustPolicy: no-downgrade` działa na pnpm 10.30.3, akcja `@v6` już jest → W0.2; **R11**: darmowy plan R2 wystarcza, `r2.dev` nie na produkcję (własna domena); **R2**: Positron nie ma warstw rastrowych, `name:pl` zadeklarowane → W3.7; **R5**: kreskowanie `FillStyleExtension` możliwe → W3.8; **R12**: bez zmian w kodzie
- 26.10.2026 · Kontrakt spisu biblioteki: robot (`categories`, `variables`) ≠ `query.ts` (inne pola) – naprawa schematem zod i adapterem (`index-contract.ts`) scalona jako #350 (Claude)
- 26.10.2026 · Research R2, R5, R7–R12 robi Haiku w wąskich zleceniach (jedno pytanie, fakty z linkami); decyzję podejmuje Opus/Sonnet po weryfikacji i Ty (Ty, czat Claude)
- Starsze wpisy (21–25.10.2026), „Pomiar fal” (F1–F13) i szczegóły F8–F14: `docs/STAN-ARCHIWUM.md`; fale Q/P: `docs/FALE.md`.
