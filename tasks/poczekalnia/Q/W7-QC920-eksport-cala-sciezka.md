# QC920 – Cała ścieżka eksportu e2e: otwórz → usuń → dodaj → dane → podziel → pobierz wszystkie
Cel: Jeden test e2e odtwarzający to, co robi właściciel: edytuje zestaw stron i pobiera go.
Zmieniaj: tests/e2e/q-share-deck.spec.ts
Wymagane: tests/e2e/q-share-deck.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-share-deck.spec.ts
Przeczytaj najpierw: tests/e2e/share-map.spec.ts (otwarcie okna, pobieranie – wzór `page.waitForEvent('download')`), tests/e2e/share-profile.spec.ts, tests/e2e/helpers/, src/view/share/ShareDialog.tsx (QC917), docs/PRODUKT.md §4b

## Kontekst
Testy jednostkowe sprawdzają klocki; ten e2e sprawdza, że **razem działają** w przeglądarce (bez porównywania pikseli – zasady AGENTS.md: zrzuty tylko dla DOM/SVG, mapy przez `__atlas`). Sieć mockowana fixture’ami (w tym `available.json` i plik wartości biblioteki).

## Research
Zobacz, jak `share-map.spec.ts` łapie pobrania (`download.suggestedFilename()`), i skopiuj podejście. Ustal, jak policzyć pobrane pliki przy serii (kolekcjonuj zdarzenia `download` w tablicy z timeoutem).

## Scenariusz (`@Q`, jeden długi test + 2 krótkie)
1. **Długi:** `/?e2e` z wybraną jednostką → „Pobierz i udostępnij mapę” → pasek stron pokazuje „1/5 Mapa … 5/5 Profil” (liczba stron zgodna z `defaultDeck('map', hasUnit)`).
2. Usuń stronę 2 → numeracja „1/4 … 4/4”; podgląd bieżącej strony zmienił się na sąsiednią.
3. „+ Dodaj stronę” → „Tabela” → wstawiona za bieżącą; numeracja „…/5”.
4. W „Dane na tej stronie” (Tabela): × przy jednym wskaźniku → wiersz znika; „+ Dodaj dane” → szukaj „Bezrobotni zarejestrowani” (wskaźnik z biblioteki) → dodany; dokładnie jedno żądanie jego wartości (zlicz).
5. Dodaj do tabeli tyle wskaźników, by przekroczyć limit `post` (8) → pojawia się podpowiedź „podziel”; „Podziel stronę” → liczba stron +1, numeracja przeliczona.
6. Zmień format na „Story” – podgląd się odświeża; strony zachowane.
7. „Pobierz wszystkie (N)” → przechwycone **dokładnie N** pobrań PNG o unikalnych nazwach zawierających numer strony.
8. „Pobierz dane zestawu (CSV)” → plik zawiera „Strona 1/N” … „Strona N/N”.
9. **Krótki 1:** otwarcie z profilu → zestaw zaczyna się od „Profil”.
10. **Krótki 2:** próba usunięcia jedynej pozostałej strony – × wyłączony; zestaw zostaje z 1 stroną, numer na karcie nie jest pokazywany (N = 1).

## Gotowe, gdy
- E2E `@Q` zielone: otwórz z mapy → usuń 2. → + Tabela → + dane → Podziel → pobierz wszystkie = liczba stron; istniejące testy bez zmian.
Nie ruszaj: kodu aplikacji (jeśli test odkryje błąd – zatrzymaj się i opisz w PR), istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
