# C06 – Stopka na wspólnych modułach i koniec odwołań do Biblioteki w tekstach i linkach
Fala pliku: W24 (etap C). Fala budowy: 3 z 4. Zależy od: C03, C04, B13. Równolegle z: C05, C07, C08.
ZAKRES WSTĘPNY: listę poprawek wpisze Claude po C03. Przejmuje kroki stopki i „O projekcie” z B14.
Cel: Stopka ma ok. 6 linków zrobionych z `LinkList`, a nigdzie na stronie (stopka, teksty, przykłady, opisy) nie ma już odwołań do Biblioteki, „Moich wskaźników” ani nieistniejących działów.
Zmieniaj: src/view/layout/SiteFooter.tsx, src/view/pages/About.tsx, src/view/pages/Sources.tsx, src/view/pages/SourcesIndicatorTable.tsx, src/view/pages/Privacy.tsx, tests/unit/c06-footer.test.tsx, tests/unit/c06-no-library-refs.test.ts, tests/e2e/c06-footer.spec.ts
Wymagane: tests/unit/c06-footer.test.tsx, tests/unit/c06-no-library-refs.test.ts, tests/e2e/c06-footer.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: AGENTS.md, docs/STYL.md (§5, §11 Teksty, §12), docs/research/c/C03-audyt-ukladu.md, src/view/layout/SiteFooter.tsx (dziś linki do `/biblioteka`, `/rankingi`, `/porownaj` i 7 gotowych map), src/App.tsx (trasa `/biblioteka` zostaje jako przekierowanie, nie zmieniasz jej)
Zadanie:
1. `SiteFooter`: przepisz na `LinkList` z `PageSection`: Mapa · O projekcie · Skąd są dane · Prywatność i zgoda · GitHub · CC BY 4.0 (ok. 6 linków, bez działów tematycznych, bez „Biblioteki”, bez listy 7 wskaźników). `DataFreshness` zostaje. Pola ≥ 44 px.
2. Przeszukaj `src` (`rg -in "bibliotek|moje wskaźniki|moich wskaźnik"`) i popraw widoczne teksty i linki w plikach z „Zmieniaj” (przykłady linków na `/mapa?i=…` mogą zostać tylko tam, gdzie to treść strony, np. Skąd są dane). Pozostałe trafienia w innych plikach wypisz w PR.
3. `About.tsx`: dopisz jedno zdanie o kontakcie (zgłoszenie w repozytorium GitHub); osobnych stron Kontakt i Zastrzeżenie nie robisz.
4. `Privacy.tsx`: jeśli po B13 jest tam jeszcze odwołanie do „Moich wskaźników”, usuń je.
Gotowe, gdy:
- Test e2e (390 i 1280 px): stopka każdej strony ma najwyżej 6 linków (poza tekstem informacji o danych), żadnego do `/biblioteka`, `/rankingi`, `/porownaj` ani do map z listy 7 wskaźników; linki działają; pola ≥ 44 px; nic nie nachodzi na siebie.
- Test jednostkowy `c06-no-library-refs`: pliki `SiteFooter`, `About`, `Sources*`, `Privacy` nie zawierają „Biblioteka”, „Moje wskaźniki” (poza komentarzami).
- Test e2e: `/o-projekcie` zawiera zdanie o kontakcie.
Nie ruszaj: src/App.tsx (przekierowanie `/biblioteka` zostaje), src/core/url/legacy-links.ts, src/view/Header.tsx (C05), src/view/start/* (C07), config/*, docs/STAN.md, package.json, `*-snapshots/`.
Po ludzku (do opisu PR):
- Co zrobiłeś: Stopka jest krótka i taka sama wszędzie; nie ma w niej ani w tekstach strony odwołań do Biblioteki.
- Co sprawdzić na podglądzie Vercel: Przewiń do stopki na `/`, `/mapa`, `/o-projekcie`, `/zrodla`; kliknij każdy link; sprawdź telefon.
- Czego nie zrobiłeś i dlaczego: Stare adresy `/biblioteka…` nadal przenoszą na mapę (to działa dla starych linków).
Tytuł PR zaczyna się od `[W24-C06]`; gałąź `claude/W24-C06` od `origin/main`; nie scalaj.
Prompt podagenta: sekcja 3 w `docs/PLAN-FALE-C.md` z id = C06.
