# QU28 – Badanie: nazwa „Faktografia” bez „Atlas”, mapa nawigacji, ślepe testy, koncepcja strony startowej
Cel: jeden raport dla uwag 19 i 22 oraz pomysłu strony startowej (połączone QU28+QU30+QU31+QU32); bez zmiany kodu strony i bez prototypu w kodzie.
Zmieniaj: docs/research/QU28-nazwa-nawigacja-slepe-testy-start.md
Wymagane: docs/research/QU28-nazwa-nawigacja-slepe-testy-start.md
Weryfikacja: pnpm lint
Zależy od: raportów QU03 (macierz stron) i QU25 (menu), jeśli już istnieją – wykorzystaj, nie powtarzaj. Wdrożenia: zadania z decyzji właściciela (QU16, QU33–QU38).
Kolizje plików: brak (nowy plik w docs/research). Wdrożenie nazwy dotknie `Home.tsx`, `AtlasMap.tsx`, `PageMeta.tsx`, `SiteLayout.tsx`, `ShareDialog.tsx` i `index.html` – kolejność względem QU10 (ShareDialog) i QU33–QU38 podaj w raporcie.
Przeczytaj najpierw: docs/PLAN-UWAGI-19-11.md (uwagi 19, 22), docs/KONCEPT-STRONA-STARTOWA.md, docs/PRODUKT.md, docs/AUDYT-W4-20-11.md, src/App.tsx, src/view/Header.tsx, src/view/layout/PageMeta.tsx, src/view/layout/SiteLayout.tsx, src/view/layout/SiteFooter.tsx, src/view/home/PortalSections.tsx, src/view/Home.tsx (tylko czytanie), index.html, src/view/share/useShareData.ts, src/view/share/ShareDialog.tsx, src/core/share/logo.ts, tests/unit/site-layout.test.tsx, tests/unit/style-guard.test.ts, tests/e2e/home.spec.ts, docs/research/R3-seo-wynik.md

## Kontekst
Uwaga 19: nazwa serwisu ma być samo „Faktografia” (nagłówek, tytuł karty, metadane, teksty, grafiki do udostępniania); nazw repozytorium i pakietu nie ruszamy. Uwaga 22: właściciel nie wie intuicyjnie, gdzie co jest – potrzebna mapa nawigacji i ślepe testy. Koncepcja strony startowej: wyłącznie dokument, decyzja odłożona (zalecany wariant A).

## Zadanie
1. Nazwa: `grep -rn "Atlas"` w `src/`, `index.html`, `public/`, `tests/`, `docs/` – tabela: plik:linia · tekst · rodzaj (widoczny dla użytkownika / meta i OG / karta udostępniania / nazwa techniczna: zostaje, np. `AtlasMap`, `window.__atlas`) · czy test sprawdza ten napis (`site-layout.test.tsx` itd.; istniejących testów nie zmieniamy – wypisz, które by pękły, jako blokadę do decyzji). Rozstrzygnij „Atlas w liczbach”, „Atlas Polski”, „Faktografia Atlas” w tytułach. Plan podmiany po plikach.
2. Mapa nawigacji: z `App.tsx`, `Header.tsx`, `SiteFooter.tsx`, `PortalSections.tsx` i dialogów zbuduj drzewo: strona → panele/okna → stany adresu (`?u= ?i= ?y= ?l= ?c=`) → co otwiera co. Diagram jako tekst/ASCII w raporcie. Lista elementów do scalenia lub schowania (kandydaci, bez usuwania: usunięcie funkcji = decyzja właściciela) z liczbą ukrytych vs odkrytych elementów na stronie głównej.
3. Ślepe testy: lista min. 12 scenariuszy „znajdź…” bez podpowiedzi (np. „dodaj wskaźnik do porównania”, „znajdź ranking powiatów”, „pobierz kartę PNG”) z oczekiwaną ścieżką i liczbą kliknięć; format wyniku do wypełnienia na podglądzie Vercel (tabela). Dodatkowo przejrzyj `tests/unit` i `tests/e2e` (grep po asercjach): lista plików, które sprawdzają tylko „renderuje się”/istnienie elementu bez zachowania (nazwa pliku, powód) – tylko lista, testów nie zmieniasz.
4. Strona startowa: bez kodu i bez ruchu w `/design`. Uzupełnij `KONCEPT-STRONA-STARTOWA.md` w raporcie o: liczbę testów wchodzących na `/` (policz grepem `goto`), tabelę „stary adres → nowy” dla wariantu A, pomiar wagi `public/geo/kalka.svg` i `admin.topo.json` (`ls -l`), wniosek, czy `revealPlan` z `src/core/map/reveal.ts` da się użyć bez danych GUS. Prototyp animacji zgłoś jako osobne zadanie z listą plików.
5. Struktura raportu (≤120 linii): Fakty (plik:linia) · Wnioski · Warianty z kosztem · Rekomendacja · Pytania do właściciela.
Gotowe, gdy:
- tabela „Atlas” obejmuje wszystkie trafienia grepa z podziałem na „zmienić” / „zostaje (techniczne)” oraz listę testów, które się zmienią
- raport zawiera drzewo nawigacji z każdą trasą z `App.tsx` i listę kandydatów do scalenia/schowania
- raport zawiera min. 12 scenariuszy ślepych testów oraz listę testów, które nie sprawdzają zachowania (z nazwami plików)
- raport zawiera liczby dla strony startowej (testy na `/`, rozmiary plików) i tabelę przekierowań
- raport kończy się listą zadań wdrożeniowych z plikami i sekcją „Pytania do właściciela”
- `pnpm lint` przechodzi
Nie ruszaj: kod strony (src/, tests/), public/, index.html, scripts/data, docs/KONCEPT-STRONA-STARTOWA.md, wzorce zrzutów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
