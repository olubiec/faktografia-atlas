# Stan – 21.11.2026

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

**Fala 4 (21.11, w PR, niescalone):** B14 sprzątanie #626 (+ osobny PR usuwający trasy `/biblioteka`), C09 strażnik układu #627 (+ osobny PR z poprawkami 6 błędów układu). Po scaleniu: „Update snapshots”.

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

- Sekcja 18.11.2026 (FIX6, W2-FIX7, lista „Do zrobienia”) i decyzje z 26–28.10.2026 przeniesione do `docs/STAN-ARCHIWUM.md` 21.11.2026.
- Starsze sekcje (Co działa, Sesja teraz, Plan, Przypomnienia, Znane problemy / dług – stan z 28.10) przeniesione do `docs/STAN-ARCHIWUM.md` 20.11.2026 (U00).

## Decyzje (najnowsze na górze, 1 linia, kto)
- 22.11.2026 · **SEO:** strategia `docs/SEO.md` (diagnoza, decyzje D1–D9, rutyna, narzędzia); zadania `tasks/poczekalnia/W25-S01…S12` czekają na start; `W18-P04` skreślone (zastąpione przez S03) (Claude, na polecenie właściciela)
- 21.11.2026 · **Plan odchudzony:** po B01–B07 w kolejce tylko B13 i B14 (zmniejszone); B08–B12, B15, U03b, U11b odłożone do `tasks/odlozone/`; zadania historyczne w `tasks/zrobione/` (Claude, na polecenie właściciela „usuńmy zbędne, odłóżmy na przyszłość”)
- 21.11.2026 · **Etap C rozplanowany** (`docs/PLAN-FALE-C.md`): 4 fale, zadania `tasks/W24-C01…C09` + B13/B14 dostosowane: okno „Wybierz dane” na cały ekran, „Moje wskaźniki” tylko w Porównaj, płynne wejście do mapy, audyt i wspólne moduły okien/menu/stopki, strona `/` według STYL, testy-strażnicy (Claude, na polecenie właściciela)
- 20.11.2026 · **W4 scalona do `main` (#556–#570) mimo nieukończonego CI** (na polecenie właściciela „scalaj”); pasek +/− zoomu usunięty (#571, na polecenie właściciela); `.gitignore` dla `.claude/worktrees/` nadal czeka na decyzję (Claude, z polecenia właściciela)
- 18.11.2026 · **D1–D10 z `docs/PLAN-POPRAWEK.md` zatwierdzone** (decyzja oddana Claude przez właściciela); zgoda na zmianę **tylko miejsca kliknięcia** w testach mobilnych dla FIX7 (`s15-mobile`, `mobile-tooltip`, `profile-mobile`), bez zmiany asercji; scalanie dokumentacji bez sprawdzania kodu (Ty)
- Starsze wpisy (21–25.10.2026), „Pomiar fal” (F1–F13) i szczegóły F8–F14: `docs/STAN-ARCHIWUM.md`; fale Q/P: `docs/FALE.md`.
