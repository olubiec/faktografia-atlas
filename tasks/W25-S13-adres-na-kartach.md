# S13 – właściwy adres strony na kartach do udostępniania
Fala pliku: W25 (SEO). Fala budowy: S-1. Zależy od: nic. Równolegle z: S01, S02, S03, S04.
Cel: Karty do udostępniania (obrazki z mapą, rankingiem itd.) podpisują się adresem `faktografia.eu`. Domena `faktografia.pl` nie należy do Faktografii (zajęta przez kogoś innego), więc obecny podpis kieruje ludzi na cudzą stronę.
Zmieniaj: src/core/share/card.ts, src/view/share/ShareDialog.tsx, tests/unit/card-page-number.test.ts, tests/unit/share-card.test.ts, tests/unit/share-logo.test.ts, tests/unit/s13-site-address.test.ts
Wymagane: tests/unit/s13-site-address.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/SEO.md (§1 problem 5, D1), src/core/share/card.ts, src/view/share/ShareDialog.tsx
Zadanie:
1. `src/core/share/card.ts`: domyślne `siteUrl` = `'faktografia.eu'`.
2. `src/view/share/ShareDialog.tsx`: usuń oba wpisane na sztywno `siteUrl: 'faktografia.pl'` (karta bierze wartość domyślną). Nic poza tym w pliku nie zmieniasz.
3. Istniejące testy `card-page-number`, `share-card`, `share-logo`: **wyjątek od zasady o nieruszaniu testów, decyzja właściciela (D1)** – zamieniasz wyłącznie napis `faktografia.pl` na `faktografia.eu`. Żadnej asercji nie usuwasz ani nie osłabiasz.
Gotowe, gdy:
- Test: scena karty bez podanego `siteUrl` zawiera tekst `faktografia.eu` dla każdego rodzaju karty i formatu.
- Test: w `src/` nie ma napisu `faktografia.pl` (przeszukanie plików `.ts`/`.tsx`).
- Istniejące testy kart przechodzą z adresem `faktografia.eu`, z tą samą liczbą asercji.
Nie ruszaj: docs/STAN.md, `*-snapshots/` (jeśli zrzut karty się zmieni – napisz w PR, że trzeba uruchomić „Update snapshots”), pozostałe pliki `src/view/share/`.
Kontekst i decyzje D1–D9: `docs/SEO.md`.
Po ludzku (do opisu PR):
- Co zrobiłeś: obrazki do udostępniania podpisują się adresem faktografia.eu zamiast cudzej domeny faktografia.pl.
- Co sprawdzić na podglądzie Vercel: jeśli okno „Pobierz i udostępnij” jest widoczne – stopka karty pokazuje faktografia.eu. Jeśli jest ukryte, wystarczą zielone testy.
- Czego nie zrobiłeś: niczego poza adresem na kartach.
Tytuł PR zaczyna się od `[W25-S13]`; gałąź `claude/W25-S13` od `origin/main`; nie scalaj.
