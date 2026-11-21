# Stan – 21.11.2026 (wieczór)

## Stan na 21.11.2026 wieczór (fale 2 i 3 etapu C scalone; poniższe sekcje są starsze – tam, gdzie się różnią, obowiązuje ta)
`main` = commit fca10e1 (#624). Fala 2 i fala 3 `docs/PLAN-FALE-C.md` są scalone; fala 4 (B14, C09) czeka na polecenie właściciela. Wygląd i zachowanie na telefonie: „do sprawdzenia” przez właściciela na podglądzie. Stan CI na `main` po scaleniach #617–#624: **do sprawdzenia** (scalane na polecenie „scal”, bez czekania na CI).

| Status | Praca | PR | Co dało |
|---|---|---|---|
| ✅ scalone | W23-B13 profil: stałe 7 wskaźników + „Dodaj wskaźnik”, „Kopiuj link” w nagłówku | #615 | wspólne menu wyboru wskaźnika |
| ✅ scalone | W24-C04 wspólne moduły okien, sekcji i list linków | #616 | `Window`, `PageSection`, `LinkList` |
| ✅ scalone | W24-C05 nagłówek · C06 stopka · C08 okna · C07 strona `/` według STYL | #617–#620 | jednolity nagłówek i stopka, strona startowa z krokami i przykładami |
| ✅ scalone | Poprawki z podglądu: przełącznik powiat/województwo według realnych poziomów danych; dodawanie wskaźników w profilu (wartości, X); kategorie w pełnym oknie na telefonie | #621 | `LevelSwitch`, `useExtraItems` |
| ✅ scalone | Porównaj: dodane wskaźniki z X i pobieraniem wartości; `/` z banerem na dole mapy | #622 | `ExtraIndicatorList` |
| ✅ scalone | `/`: baner 1/3 mapy z hasłem „Sprawdź swoją miejscowość i okolicę.”, bez podpisu z danymi pod mapą; logo w nagłówku i stopce większe (40/48 px) i wyrównane | #623, #624 | `StartPage`, `Header`, `SiteFooter`, STYL §4 |

**Do sprawdzenia przez właściciela:** `/` na telefonie (baner, hasło, brak podpisu); logo w nagłówku i stopce; mapa: przełącznik powiat/województwo przy wskaźnikach z danymi na obu poziomach; profil: dodanie wskaźnika i X; Porównaj: dodanie wskaźnika, X, wartości; kategorie wskaźników w pełnym oknie na telefonie.

**Znane ograniczenia:** czerwone testy niezwiązane z tą pracą: jednostkowe `docs-no-conflict-markers` (STAN.md – naprawione tym wpisem), `indicator-panel-basic`, `indicator-panel-my`; e2e wyboru danych na telefonie; `map-zoom-out`, `path-s3`. Zrzuty pikselowe `/design` odświeżone workflowem „Update snapshots” (21.11, bez zmian). Zmiany z #621–#624 nie były oglądane w przeglądarce (tylko testy jednostkowe, lint, typy i jeden pomiar logo).

**Dalej:** fala 4 (B14 sprzątanie, C09 strażnik spójności); za zgodą: dokończenie punktu 1 z C08 (profil w tym samym oknie co reszta, dotyka plików ekranu); naprawa czerwonych testów.

## Stan na 21.11.2026 (fala 1 etapu C i „Jedna mapa” scalone; sekcje niżej są starsze – tam, gdzie się różnią, obowiązuje ta)
`main` = commit ccc3ab1 ([M7] #613). Fala 1 etapu C (`docs/PLAN-FALE-C.md`) jest scalona; fale 2–4 czekają na polecenie właściciela. Wygląd i zachowanie na telefonie: „do sprawdzenia” przez właściciela na faktografia.eu.

| Status | Praca | PR / commit | Co dało |
|---|---|---|---|
| ✅ scalone | W24-C01 „Wybierz dane”: okno na cały ekran, bez „Moich wskaźników” na mapie, dolny pasek wyżej; potem bez grupy „Najważniejsze” | 1ba51f7, 2c5fd20 | wskaźniki w grupach z biblioteki |
| ✅ scalone | W24-C02 wejście do mapy: lekkie przybliżenie, kod mapy ładowany przed przejściem | 12c9bd2, a760015 | koniec „zamknij i otwórz” |
| ✅ scalone | W24-C03 audyt układu | 1c805f5 | raport `docs/research/c/C03-audyt-ukladu.md` (zasłonięcia, powtórzenia, moduły wspólne) |
| ✅ scalone | „Jedna mapa” M1–M7 (`docs/PLAN-JEDNA-MAPA.md`) | #605–#613 | wspólny kadr plakatu i mapy, sygnał gotowości mapy, dojazd kamery, dotyk w tle startu, okładka z płynnym przejściem kolorów, mapa otwiera się ze wskaźnikiem z tła |

**Do sprawdzenia przez właściciela:** `/` → „Otwórz mapę” kilka razy w różnych momentach animacji (bez skoku i zmiany kolorów); stuknięcie w województwo w tle; „Wybierz dane” na telefonie i komputerze; dolny pasek na telefonie.

**Znane ograniczenia:** zrzuty pikselowe do odświeżenia workflowem „Update snapshots” (uruchamia właściciel, po fali 1); znane czerwone testy niezwiązane z tą pracą: jednostkowe `indicator-panel-basic`, `indicator-panel-my`, e2e `map-zoom-out`, `path-s3`; pełne `pnpm test:e2e` nie było uruchomione dla M7. Opcjonalnie, tylko za zgodą: jedna trwała scena mapy dla `/` i `/mapa` zamiast okładki (`mapCover.ts`), jeśli skoki wrócą.

**Dalej:** fala 2 (B13, C04) po wpisaniu „Zakres potwierdzony” na podstawie raportu C03.

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

- Sekcje z 18.11.2026 i wcześniejsze: `docs/STAN-ARCHIWUM.md` (przeniesione 21.11.2026).

## Decyzje (najnowsze na górze, 1 linia, kto)
- 21.11.2026 · **Fale 2–3 etapu C scalone (#615–#624)** i poprawki z podglądu właściciela (#621–#624); baner `/` z krótkim hasłem o miejscowości, logo 40/48 px; zmiany `STYL.md` §4 i `PRODUKT.md` za wyraźną prośbą właściciela (Claude)
- 21.11.2026 · **Plan odchudzony:** po B01–B07 w kolejce tylko B13 i B14 (zmniejszone); B08–B12, B15, U03b, U11b odłożone do `tasks/odlozone/`; zadania historyczne w `tasks/zrobione/` (Claude, na polecenie właściciela „usuńmy zbędne, odłóżmy na przyszłość”)
- 21.11.2026 · **Etap C rozplanowany** (`docs/PLAN-FALE-C.md`): 4 fale, zadania `tasks/W24-C01…C09` + B13/B14 dostosowane: okno „Wybierz dane” na cały ekran, „Moje wskaźniki” tylko w Porównaj, płynne wejście do mapy, audyt i wspólne moduły okien/menu/stopki, strona `/` według STYL, testy-strażnicy (Claude, na polecenie właściciela)
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
