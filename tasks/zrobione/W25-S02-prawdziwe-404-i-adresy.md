# S02 – Prawdziwe 404, bez ukośnika na końcu, strony testowe poza indeksem
Fala pliku: W25 (SEO). Fala budowy: S-1. Zależy od: nic.
Cel: Nieistniejący adres odpowiada kodem 404 (nie 200 ze stroną aplikacji); znane trasy aplikacji działają jak dziś; strony `/__test/*` i `/design` mają nagłówek `X-Robots-Tag: noindex`.
Zmieniaj: vercel.json, public/404.html, tests/unit/s02-vercel-routes.test.ts
Wymagane: tests/unit/s02-vercel-routes.test.ts
Zgoda właściciela na zmianę `vercel.json`: dana przez start tej fali (docs/SEO.md §4). Nagłówków bezpieczeństwa nie zmieniasz.
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: vercel.json, src/App.tsx (wszystkie `<Route path>` i przekierowania starych adresów, np. `/biblioteka`, `/rankingi`, `/porownaj`), dokumentacja Vercel „rewrites”, „trailingSlash”, „Custom 404”
Zadanie:
1. Zamień regułę `/(.*)` → `/index.html` na listę tras aplikacji z App.tsx (i starych adresów, które aplikacja przekierowuje). Pliki z `dist/` mają pierwszeństwo jak dziś (Vercel serwuje plik, jeśli istnieje – w S07 dojdą katalogi `/gmina/…`).
2. `"trailingSlash": false`.
3. `public/404.html`: samodzielna, lekka strona (logo z `public/brand/`, „Nie ma takiej strony”, linki: Strona główna, Mapa); bez skryptów; `<meta name="robots" content="noindex">`. Kolory przez zmienne CSS z `src/styles` nie są dostępne – użyj wyłącznie domyślnych kolorów przeglądarki (zero wartości wpisanych na sztywno).
4. Nagłówek `X-Robots-Tag: noindex` dla `/__test/(.*)` i `/design`.
Gotowe, gdy:
- Test: w vercel.json nie ma reguły przepisującej `/(.*)`; każda ścieżka `<Route path>` z App.tsx (poza `*`) jest objęta regułą; `trailingSlash` = false; nagłówki bezpieczeństwa identyczne jak przed zmianą (porównanie z wartościami w teście).
- Test: public/404.html zawiera noindex, link do `/` i `/mapa`, brak `<script`.
- Na podglądzie Vercel (wpisz w PR wynik lub „do sprawdzenia”): `/nie-ma-takiej` → 404; `/mapa?u=12` działa; `/o-projekcie` działa po odświeżeniu.
Dla właściciela (w PR, nie w kodzie): przekierowanie `www.faktografia.eu` i drugiej domeny na główną ustawia się w panelu Vercel → Domains (D1).
Nie ruszaj: docs/STAN.md, `*-snapshots/`, pliki ekranu spoza „Zmieniaj”.
Kontekst i decyzje D1–D9: `docs/SEO.md` (obowiązują wartości domyślne, chyba że właściciel zmienił je w §3).
Po ludzku (do opisu PR):
- Co zrobiłeś: błędny adres pokazuje teraz „Nie ma takiej strony” z prawdziwym kodem błędu, więc Google nie liczy go jako osobnej strony.
- Co sprawdzić: na podglądzie wpisz zmyślony adres; potem odśwież `/mapa`, `/o-projekcie`, `/zrodla`, `/prywatnosc` – muszą działać.
- Czego nie zrobiłeś: przekierowań domen – to ustawienie w panelu Vercel (instrukcja w PR).
Tytuł PR zaczyna się od `[W25-S02]`; gałąź `claude/W25-S02` od `origin/main`; nie scalaj.
