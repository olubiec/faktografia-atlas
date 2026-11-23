# F06 – Sygnały z Search Console: kolejność faktów i „Tematy do rozważenia”
Fala pliku: W26 (Odkrycia). Fala budowy: F-5. Zależy od: S12, F01. Warunek pełnego działania: min. 6 tygodni danych w Search Console (kod można scalić wcześniej – przy braku danych mnożnik = 1).
Cel: Raport tygodniowy (S12) liczy wzrost wyświetleń zapytań wg tematu (grupy wskaźników) i zapisuje `config/facts.json` → `trendBoost` (mnożnik 1,0–1,5) w PR robota; dodaje sekcję „Tematy do rozważenia” (zapytania z wyświetleniami, pozycją 8–30, bez dopasowanej strony). Żadne strony nie powstają automatycznie.
Zmieniaj: scripts/seo/gsc-*.mjs, src/core/facts/*, config/facts.json, config/topic-keywords.json, .github/workflows/*gsc*.yml, tests/unit/f06-*.test.ts
Wymagane: tests/unit/f06-signals.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA.md (§7a, §7b), skrypt i workflow S12
Zadanie: przypisanie zapytania do tematu przez słownik `config/topic-keywords.json` (bez AI); mnożnik = 1 + min(0,5, wzrost tydzień do tygodnia), tylko gdy ≥ 100 wyświetleń tematu; „Tematy do rozważenia” = max 10 pozycji.
Gotowe, gdy:
- Test: na nagranym fixture odpowiedzi GSC temat z +40% dostaje mnożnik 1,4; temat < 100 wyświetleń – 1,0.
- Test: zapytanie z pozycją 12 bez dopasowanej strony trafia do „Tematów do rozważenia”; z pozycją 3 – nie.
Nie ruszaj: pliki ekranu, docs/STAN.md.
Po ludzku: gdy ludzie zaczynają częściej szukać np. „mieszkań”, ciekawostki o mieszkaniach same wskakują wyżej na stronie głównej. W poniedziałkowym raporcie widzisz tematy, pod które warto zrobić nową stronę – powstaje dopiero po Twoim „rób”.
Tytuł PR zaczyna się od `[W26-F06]`; gałąź `claude/W26-F06` od `origin/main`.
