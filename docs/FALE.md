# Fale zadań – jak je prowadzi Claude (od 17.11.2026)
Pętla Jules Loop i Orkiestra zostały usunięte. Zadania wykonują sesje Claude, a scala właściciel.

## Układ
- Zadanie = plik `tasks/W<fala>-<id>-<nazwa>.md` (wzór: `tasks/SZABLON.md`). Numer fali jest w nazwie pliku, osobnej listy fal nie ma.
- Zadania jednej fali nie dzielą plików i nie zależą od siebie, więc idą równolegle. Pliki z `tasks/poczekalnia/` czekają na start.
- Start fali = pliki `W<N>-*.md` w `tasks/` na `main` (robi go sesja startowa z promptu startowego).

## Przebieg fali
1. **Sesja startowa** (prompt startowy): wrzuca pliki fali na `main`, potem dla każdego `tasks/W<N>-*.md` uruchamia osobną sesję Claude (`create_session`) i kończy. Nie wykonuje zadań sama.
2. **Sesja zadania**: czyta swój jeden plik, pracuje na gałęzi `claude/<id>` od `origin/main`, zgodnie z `AGENTS.md`, otwiera PR `[W<N>-<id>]` z „Po ludzku”. Nie scala.
3. **Właściciel**: ogląda podgląd Vercel, scala zielone PR-y (lub odsyła z uwagą), potem puszcza następną falę.
4. **Po fali** Claude aktualizuje `docs/STAN.md` i podaje listę do kontroli właściciela.

## Kontrola, którą wcześniej robiła pętla (teraz robi sesja zadania)
- Zakres: `git diff --name-only origin/main...HEAD` tylko z „Zmieniaj” i „Wymagane”.
- Usunięcia: `git diff --name-status --diff-filter=D origin/main...HEAD` puste.
- Aktualizacja gałęzi: tylko `git merge origin/main`.
- Zielone `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, e2e z `@S<n>` w nazwie, jeśli zadanie je ma.

## Stan fal na 18.11.2026
| Status | Fala | Zadania | PR / uwagi |
|---|---|---|---|
| ✅ | F1–F13 (stary plan S14–S21) | – | zamknięte do 28.10.2026 (szczegóły: `docs/STAN.md`) |
| ✅ | Q1 = W1-QC* | 22 pliki w `tasks/`, wszystkie scalone | #453–#472, #474–#476 (+ QC601 #459); zadania W16-M01–M06 z `tasks/` to starsza fala Orkiestry (M02–M05 w historii main; M01, M06 – do weryfikacji) |
| ✅ | Poprawki: FIX, FIX2, FIX3, FIX4, FIX5, PLAN | – | #477, #478, #479, #485, #481, #480 |
| ✅ | P1 = W19 (PF01–PF09) | 9/9 | #482–#491 |
| ✅ | FIX6 (A–I) | 10/10 | #493–#502 (plan: `tasks/poczekalnia/FIX6-KOLEJNOSC.md`) |
| 🔶 | FIX7 | startowy widok mapy | PR #503, CI czerwone (testy dotykowe) |
| ⬜ | Q2 = W2 | 19 zadań w `tasks/poczekalnia/` (6 nowych + 13 z `Q/`; QC402 i QC502 pominięte) | na „start Q2”, po sprawdzeniu kolizji plików z FIX4/FIX6/FIX7 |
| ⬜ | Q3–Q7 = W3–W7 | 12 · 11 · 10 · 5 · 3 | po kolei; PM10 jedyne na plikach kamery w W3 – po FIX6 jego zakres do weryfikacji (kamera bez stanu Reacta zrobiona w FIX6H2) |
| ⬜ | Uwagi 19.11 = W4-QU/W5-QU/W6-QU | 7 · 6 · 2 (`tasks/poczekalnia/`) | kolejne Q (Q4–Q6), nie Q2: okno udostępniania, Biblioteka, Rankingi, wykres lat; plan: `docs/PLAN-UWAGI-19-11.md` |
| ⬜ | Strona startowa (koncept 19.11) = QU32 (W4d) + QU33–QU38 (W6/W7) | 1 + 6 | czeka na decyzje A/B/C; plan: `docs/KONCEPT-STRONA-STARTOWA.md` |
| 🔷 **najpierw** | Plan uproszczenia (20.11) = W22-U00–U08, U10, U11 (badania, ukrycie „Pobierz i udostępnij”, priorytet robota biblioteki; równolegle) → W23-U09 (synteza) → etap B (~12) | 11 · 1 | idzie PRZED wszystkim powyżej; reszta poczekalni zamrożona do werdyktu U09; „Pobierz i udostępnij” → `tasks/wstrzymane/`; plan: `docs/PLAN-UPROSZCZENIE.md` |
Uwaga: zadania W17/W18 w poczekalni nadal czekają; W17-T04 i W17-T05 są zastąpione przez PF08 i PF07 (zrobione). Pełny plan: `docs/PLAN-POPRAWEK.md`; otwarte sprawy: `docs/STATUS-PRZERWANE.md`.

## Odchudzenie planu (21.11.2026)
Etap B (W23) zmniejszony: scalone B01–B07; w `tasks/` zostają tylko **W23-B13** i **W23-B14** (zakres zmniejszony). Odłożone: B08–B12, B15, U03b, U11b → `tasks/odlozone/` (powody i zamienniki w README tam). Zadania z falami W1–W3, W16, W22 i scalone B01–B07 przeniesione do `tasks/zrobione/` (historia, nie startują). `tasks/poczekalnia/` i `tasks/wstrzymane/` bez zmian: nadal nie startują. Fale po B13–B14 zdefiniuje właściciel.

## Etap C (21.11.2026)
Nowe polecenia właściciela (okno „Wybierz dane”, wejście do mapy, spójność ekranów, bez „Moich wskaźników” i Biblioteki w innych miejscach) rozpisane w `docs/PLAN-FALE-C.md`: zadania `tasks/W24-C01…C09` + `W23-B13` i `W23-B14` (dostosowane). Cztery fale; nic nie startuje samo.

## Fale W27–W30: nowe dane, premiery GUS, świeżość Odkryć, kalendarium (25.11.2026)
Polecenia właściciela: pobrać nowe, nieniszowe dane i pokazać je na mapach; premiery z kalendarium GUS pobierać w pierwszej kolejności; świeże i skrajne dane najpierw w „Odkryciach” i w materiałach; kilka dni etykiety „Nowość”; tablica kalendarium na górze repo; automat dopasowujący tematy do trendów (robot proponuje, właściciel decyduje).
Zasada „nie niszowe” (W27-D01, wspólna dla wszystkich zadań): ≥ 95% gmin z wartością, ostatni rok ≥ bieżący − 2, seria ≥ 4 lata, wskaźnik względny.

| Fala | Zadania (w fali równolegle, rozłączne pliki) | Zależy od |
|---|---|---|
| W27 | `D01` nowe wskaźniki główne (urodzenia, zgony, seniorzy na 100 dzieci, apteki, drogi rowerowe; warunkowo małżeństwa, żłobki) · `D02` świeże dane i skrajności najpierw w Odkryciu dnia, zestawieniach i „3 rzeczach” · `D03` trendy z odsłon Wikipedii → `trendBoost` (bez sekretów GSC) · `D05` premiera w kalendarium GUS = pobranie tego samego dnia + księga kalendarium (`library/calendar.json`) | – |
| W28 | `D04` robot proponuje zmienne pasujące do tematów na czasie + premia w kolejce · `D06` etykieta „Nowość” (wybór danych, karty faktów) · `D07` tablica „Kalendarium danych”: przypięte zgłoszenie + znaczek w README (zaplanowane, czeka, pobrane, odrzucone, wdrożone, odkrycia) | D02, D03, D05 |
| W29 | `D08` pakiet „Do materiałów” (social media; tekst, nie generator slajdów) · `D09` premiery z biblioteki w Odkryciach na czas świeżości | D07; D02+D05 |
| W30 | `D10` „Wkrótce od GUS” i „Nowości na mapie” na `/nowe-dane` | D05, D07 |

Uwagi: D01 wymaga przebiegu „Fetch data” na gałęzi zadania (sesja uruchamia albo prosi właściciela); po D01 i D06 odświeżyć zrzuty („Update snapshots”). D07 – właściciel raz przypina zgłoszenie „Kalendarium danych”. Czego nie ma w planie: Google Trends (brak ogólnodostępnego API), automatycznego dodawania wskaźników głównych przez robota.
