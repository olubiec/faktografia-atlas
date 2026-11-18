# QC203 – Strona Porównaj: dwa pola wyboru, „Zamień”, nazwy w nagłówkach
Cel: Użytkownik wpisuje dwa miejsca i dostaje tabelę porównania; link `?c=` odtwarza to samo.
Zmieniaj: src/view/pages/ComparePage.tsx, tests/e2e/q-compare.spec.ts
Wymagane: tests/e2e/q-compare.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-compare.spec.ts
Przeczytaj najpierw: src/view/pages/ComparePage.tsx (aktualne `setComparison`, 6 par), src/core/compare/compare-url.ts (QC201), src/view/compare/PlacePicker.tsx (QC202), src/view/profile/ProfileCompareTable.tsx, src/view/profile/CompareMaps.tsx, tests/e2e/compare-pick.spec.ts, tests/e2e/rankings-and-compare-pages.spec.ts, tests/e2e/helpers/

## Kontekst
Właściciel: „Porównaj nie działa, nie da się wybrać miasta czy wyszukać”. Mamy już model pary (QC201) i pole wyboru (QC202). Tu je składamy w stronę. Istniejące testy e2e (`compare-pick`, `rankings-and-compare-pages`) **nie mogą zmienić się ani paść** – jeśli któryś zakłada 6 gotowych par, zostaw pary jako sekcję „Gotowe porównania” pod polami.

## Research
1. Przeczytaj, jak dziś ComparePage ładuje profile dwóch miejsc (`useProfile`/`load-profile`) – **zachowaj tę ścieżkę** (jedno żądanie profilu na województwo, PRODUKT §7).
2. Sprawdź w `tests/e2e/helpers/` i w istniejących specach, jak e2e czeka na dane (mock sieci z fixture’ami). Użyj tego samego wzorca – testy nie chodzą po prawdziwej sieci.
3. Nagłówki tabeli pokazują dziś TERYT – znajdź, gdzie (prawdopodobnie `ProfileCompareTable` bierze nazwy z propsów) i podaj nazwę z `unitLabel`.

## Zadanie
- Dwa `PlacePicker` (A i B, `excludeTeryt` wzajemnie), przycisk „Zamień miejsca” (≥ 44 px, `aria-label`), przycisk „Wyczyść” przy każdym polu (z PlacePicker).
- Stan z `readComparePair(location.search)`; każda zmiana → `writeCompareSearch` przez `navigate(..., { replace: true })`, tak by link działał po odświeżeniu i „Wstecz” nie zaśmiecało historii przy każdym znaku.
- Tylko A: pod polami komunikat „Wybierz drugie miejsce, żeby zobaczyć porównanie” (rola `status`), tabeli brak.
- A i B: tabela porównania (istniejące komponenty), nagłówki = pełne nazwy, nie kody. `levelsDiffer` → dopisek „różne poziomy – porównuj ostrożnie”.
- Wyczyszczenie którejś strony resetuje wynik (brak starej tabeli).
- „Gotowe porównania” – dotychczasowe 6 par jako przyciski pod spodem, klik ustawia A i B.
- Tytuł strony/nagłówek h1 bez zmian.

## Testy e2e (`tests/e2e/q-compare.spec.ts`, nazwa z `@Q`)
1. Wejście `/porownaj`: dwa pola, brak tabeli.
2. Wpisz „Kraków” → Enter; wpisz „Wrocław” → Enter: adres ma `?c=1261,0264` (sprawdź na fixture’ach prawdziwe kody i użyj ich), widoczna tabela, nagłówki „Kraków…” i „Wrocław…”, **żadnego** 7-cyfrowego kodu w nagłówkach.
3. „Zamień miejsca” odwraca kolejność w adresie i w nagłówkach.
4. × przy B → komunikat „Wybierz drugie miejsce”, tabela znika, adres `?c=<A>`.
5. Wejście z `?c=<A>,<B>` od razu pokazuje tabelę (link działa).
6. Powiat + gmina → widoczny dopisek o różnych poziomach.
7. Kliknięcie gotowej pary ustawia oba pola.

## Gotowe, gdy
- E2E `@Q` zielone, istniejące testy Porównaj bez zmian i zielone.
Nie ruszaj: `compare.ts`, `ProfileCompareTable.tsx` (poza ewentualnym przekazaniem nazw), istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
