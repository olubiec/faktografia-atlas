# O04 – Wybór pięciu kart ról dla gminy (czysta logika)
Cel: dla TERYT-u gminy funkcja zwraca karty: Najbardziej nietypowe, Mocna strona, Słabsza strona, Największa zmiana w 10 lat, a gdy karty brak – uczciwy komunikat zamiast wypełniacza.
Zmieniaj: src/core/facts/roles.ts, tests/unit/w32-o04-roles.test.ts, tests/fixtures/facts-roles/*
Wymagane: tests/unit/w32-o04-roles.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§3), src/core/facts/select.ts, src/core/facts/rank.ts, config/roles.json (W31-O03), src/core/facts/human-scale.ts (W31-O02), src/core/facts/types.ts (W31-O01)

Zadanie:
1. `pickRoles(file, teryt)` → lista `{ role, fact, indicatorId }` według tabeli z §3: największy stosunek do mediany (≥ próg z `roles.json`; remis: rzadszy percentyl), najlepszy i najgorszy percentyl wśród wskaźników z `valence` (inny wskaźnik niż karta 1), największa zmiana w 10 lat (bez okien ze zmianą granic).
2. Brak mocnej strony (< 75. percentyla) albo słabszej (> 25.) = karta `none` z tekstem „W żadnym z N wskaźników gmina nie odstaje wyraźnie od środka stawki.”.
3. Zakaz powtórzenia wskaźnika w dwóch kartach. Funkcja zwraca też listę do przeglądu (50 losowych gmin z ziarnem) dla właściciela.
4. Teksty z `humanScale`, przepuszczone przez `findViolations` (test).

Gotowe, gdy:
- Test na fixture (Maszewo): karta 1 = czytelnictwo, 2 = przyrost naturalny, 3 = powierzchnia mieszkania, 4 = firmy w 10 lat.
- Test: żaden wskaźnik nie występuje dwa razy; brak mocnej strony daje kartę `none`.
- Test: żaden tekst nie narusza słownika tonu.
- Test: gmina z zerową medianą wskaźnika nie powoduje wyjątku ani dzielenia przez zero.
Nie ruszaj: `src/view/*`, istniejącego `select.ts`.
Tytuł PR zaczyna się od `[W32-O04]`; opis ma „Po ludzku” i listę 50 gmin do przeglądu.
