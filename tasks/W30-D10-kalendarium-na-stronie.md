# D10 – Kalendarium na stronie: „Wkrótce od GUS” i „Nowości” na /nowe-dane
Cel: użytkownik i wyszukiwarka widzą na stronie `/nowe-dane` (istnieje od W26-F05) trzy rzeczy:
- co GUS opublikuje w najbliższych dniach (tylko tematy, które pobierzemy);
- co jest nowe na mapie w ostatnich 14 dniach, z linkami do map;
- listę stron „Nowe dane GUS”.

Strona startowa dostaje tylko jeden link tekstowy „Nowe dane GUS” w stopce. Bez nowych żądań w pierwszych 3 s.
Zmieniaj: src/core/facts/news-page.ts, src/core/facts/calendar-public.ts, scripts/seo/build-pages.mjs, scripts/data/build-news.mjs, .github/workflows/fetch-data.yml, tests/unit/w29-d10-calendar-page.test.ts, tests/fixtures/calendar-public/*
Wymagane: tests/unit/w29-d10-calendar-page.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: src/core/facts/news.ts, src/core/facts/news-page.ts, scripts/seo/build-pages.mjs, docs/SEO.md, tasks/W27-D05-premiery-z-kalendarium-najpierw.md, tasks/W28-D07-tablica-kalendarium-w-repo.md

Zadanie:
1. Robot danych zapisuje w swoim PR (`fetch-data`) mały plik `public/data/calendar.json` (≤ 5 KB, bez wcięć). Plik powstaje z `library/calendar.json` (W27-D05) i obejmuje:
   - `planned` na 14 dni: data, tytuł, link GUS;
   - `downloaded` / wdrożone z 14 dni: data, nazwa, id wskaźnika, rok.

   Odrzuconych nie pokazujemy publicznie. Strona nie czyta tego pliku w przeglądarce: używa go generator stron statycznych (`build-pages.mjs`), tak jak `news.json`.
2. `/nowe-dane` (generowane statycznie, `news-page.ts`) dostaje sekcje „Wkrótce od GUS” i „Nowości na mapie (14 dni)”, nad dotychczasową listą:
   - każda nowość ma link „Zobacz na mapie” (`/mapa?i=…&y=…`) i, jeśli istnieje, link do strony `/nowe-dane/<id>-<rok>`;
   - puste sekcje mają zdanie „Na razie nic nowego – zajrzyj po najbliższej publikacji GUS.”;
   - tekst tylko jako tekst (bez HTML z danych).
3. Daty po polsku („2 grudnia 2026”). Tytuły GUS skracane do 120 znaków bez ucinania słów.
4. Link w stopce strony startowej: stopka jest plikiem ekranu spoza listy (`src/view/start/StartPage.tsx` lub komponent stopki). Jeśli link nie istnieje, napisz w PR, którą linię dodać, i zatrzymaj się na tym punkcie.

Gotowe, gdy:
- Test na fiksturach: strona `/nowe-dane` ma obie sekcje, a ich pozycje są w kolejności dat. Pozycja wdrożona ma poprawny link do mapy.
- Test: brak `calendar.json` daje stronę jak dziś plus dwie sekcje z pustym zdaniem.
- Test: tytuł z znakami `<`, `&` jest zakodowany, a nie wstawiony jako HTML.
- Test: `public/data/calendar.json` ≤ 5 KB i bez wcięć. Strona startowa nadal nie pobiera tego pliku (e2e `@S30`, liczenie żądań w pierwszych 3 s).

Nie ruszaj: `src/view/*` (poza punktem 4 tylko opis w PR), `config/*`, `scripts/data/library*.mjs`.
Tytuł PR zaczyna się od `[W30-D10]`; opis ma „Po ludzku”.
