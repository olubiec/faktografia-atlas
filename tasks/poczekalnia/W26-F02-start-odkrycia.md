# F02 – Strona startowa: „Odkrycia” zamiast „Przykładów”
Fala pliku: W26 (Odkrycia). Fala budowy: F-2. Zależy od: F01.
Cel: Pod „Otwórz mapę” zamiast „Przykładów” jest sekcja „Odkrycia”: „Twoje miejsce” (szukajka miejscowości, zapamiętany wybór), „Odkrycie dnia”, „Zestawienia”; po wyborze miejsca – „Gmina X – 3 rzeczy, których mogłeś nie wiedzieć”. Każdy fakt = 1 kliknięcie do mapy z właściwym wskaźnikiem, rokiem i zaznaczoną jednostką.
Zmieniaj: src/view/start/*, src/core/start/*, src/core/facts/*, docs/PRODUKT.md, src/view/pages/Privacy*.tsx, tests/unit/f02-*.test.ts, tests/e2e/f02-*.spec.ts
Wymagane: tests/unit/f02-start.test.ts, tests/e2e/f02-odkrycia.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e (tylko @F02 i istniejące testy startu)
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§5, §6, §9, §13), docs/PRODUKT.md §3.1 i §7, docs/STYL.md, src/view/start/StartPage.tsx, src/core/start/examples.ts, istniejąca szukajka miejscowości (znajdź jej adapter i format linku `/mapa?…`)
Zadanie:
1. `PRODUKT.md` §3.1: „Przykłady: 6 miejsc i 6 par” → opis „Odkryć” (stan A i B), §7: `facts-start.json` ≤ 4 KB w pierwszych 3 s; `facts/<WW>.json` dopiero po wyborze miejsca.
2. Stan A: „Twoje miejsce” (pole „Wpisz miejscowość”, szukajka ładowana leniwie dopiero po fokusie – nie w pierwszych 3 s), „Odkrycie dnia” (1 karta z `facts-start.json`, wybór po dacie), „Zestawienia” (4 karty, 3 pozycje + link do mapy z tym wskaźnikiem). Pary do porównania znikają (decyzja §13.2).
3. Stan B: po wyborze miejsca (albo zapamiętanym TERYT w `localStorage`, klucz `faktografia.place`, try/catch) – nagłówek z nazwą, 3 karty faktów z `facts/<WW>.json`, link „Zmień miejsce”. Karta: zdanie, duża liczba, „Zobacz na mapie →”.
4. Polityka prywatności: jedno zdanie, że wybrane miejsce (sam kod TERYT) zapisuje się tylko w przeglądarce.
5. Tokeny z @theme, pola ≥ 44 px, bez animacji przy `prefers-reduced-motion`, napisy nie wychodzą poza karty na 360 px.
Gotowe, gdy:
- e2e @F02: na `/` widać „Odkrycie dnia”; klik „Zobacz na mapie” otwiera `/mapa` z parametrami wskaźnika i jednostki (1 kliknięcie).
- e2e @F02: wpisanie miejscowości i wybór → 3 karty faktów tej gminy; po przeładowaniu strona pamięta wybór.
- e2e @F02: w pierwszych 3 s nie ma pobrań `units.json`, `localities`, `values/`, `facts/`.
- Test jednostkowy: wybór „Odkrycia dnia” po dacie jest deterministyczny; budowa linku do mapy z faktu.
Nie ruszaj: pliki ekranu mapy, docs/STAN.md, `*-snapshots/` (napisz w PR, że trzeba odświeżyć).
Po ludzku: na stronie głównej zamiast nudnych przykładów są ciekawostki: odkrycie dnia, zestawienia i po wpisaniu swojej miejscowości – 3 rzeczy o Twojej gminie. Każda prowadzi jednym kliknięciem na mapę.
Tytuł PR zaczyna się od `[W26-F02]`; gałąź `claude/W26-F02` od `origin/main`.
