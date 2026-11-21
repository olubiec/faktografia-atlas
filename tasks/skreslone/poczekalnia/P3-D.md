# P3-D – Wskaźnik świeżości danych
Cel: Użytkownik widzi „Dane GUS odświeżone: DD.MM.RRRR”.
Zmieniaj: src/core/freshness/freshness.ts, tests/unit/freshness.test.ts, src/view/layout/DataFreshness.tsx, src/view/layout/SiteFooter.tsx
Wymagane: tests/unit/freshness.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, SiteFooter.tsx, public/data (tylko nazwy plików z polem fetchedAt)

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P3-D`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P3-D] Wskaźnik świeżości danych`, `git push -u origin task/P3-D`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Znajdź JEDEN istniejący plik w public/data z polem fetchedAt. Pobierz go przez fetch w runtime (nie importuj JSON do kodu).
Czysta logika w src/core/freshness: format daty pl, wiek w dniach. Komponent pokazuje najnowszą datę; błąd/brak pliku = nic. Starsze niż 60 dni: dopisz „(dane mogą być nieaktualne)”. Jedna linijka w SiteFooter (działaj na bieżącej wersji).

## Gotowe, gdy
- testy jednostkowe formatu i progu 60 dni na stałych datach
- test komponentu z mockiem fetch (jest/brak/błąd)

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
