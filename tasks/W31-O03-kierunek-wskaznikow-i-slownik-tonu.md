# O03 – Kierunek „lepiej/gorzej” wskaźników i słownik zakazanych słów v2
Cel: jedna lista mówi, które wskaźniki mają jednoznaczny kierunek (do kart „Mocna/Słabsza strona” i porównania z sąsiadem), a test pilnuje tonu redakcyjnego we wszystkich tekstach Odkryć.
Zmieniaj: config/roles.json, src/core/facts/valence.ts, src/core/facts/tone-guard.ts, tests/unit/w31-o03-valence-tone.test.ts
Wymagane: tests/unit/w31-o03-valence-tone.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§3, §5), config/facts.json, config/indicators.json, tests/unit/f01-facts.test.ts

Zadanie:
1. `config/roles.json`: `valence` (id wskaźnika → `up` = wyższy lepszy, `down` = niższy lepszy) dla: bezrobocie, wynagrodzenie, dochody gminy, kanalizacja, przedszkola, czytelnictwo, lesistość, przyrost naturalny, saldo migracji, nowe mieszkania, powierzchnia mieszkania, firmy REGON, apteki, żłobki (id z `config/indicators.json`; brak id = zgłoś w PR i zatrzymaj się). Do tego `roles`: progi mocnej/słabszej strony (75/25), minimalny stosunek do mediany dla „Najbardziej nietypowe” (2), wagi Odkrycia dnia.
2. `valence.ts`: `valenceOf(id)`, `isBetter(id, a, b)`; wskaźniki bez kierunku zwracają `null`.
3. `tone-guard.ts`: lista zakazanych słów i wzorców z §5 (tylko, aż, zaledwie, szok, niesamowite, „bez retuszu”, „dziwne, ale prawdziwe”, derby, wygrywacie, „Wy/Wasza”, „!”, „×”, emotikony, pytania-przynęty „Zgadniesz”, „Wiesz, że”, „najgorsza/najlepsza gmina”) i `findViolations(text)`.

Gotowe, gdy:
- Test: każdy id z `valence` istnieje w `config/indicators.json`; kierunek wyłącznie `up`/`down`.
- Test: `findViolations` wyłapuje po jednym przykładzie z każdej kategorii z §5 i przepuszcza „Z bibliotek publicznych korzysta 1 na 31 mieszkańców.”.
- Test: `isBetter` dla bezrobocia (niższe lepsze) i wynagrodzenia (wyższe lepsze).
Nie ruszaj: `config/facts.json`, `src/view/*`, istniejących testów.
Tytuł PR zaczyna się od `[W31-O03]`; opis ma „Po ludzku” i listę wskaźników z kierunkiem do akceptacji.
