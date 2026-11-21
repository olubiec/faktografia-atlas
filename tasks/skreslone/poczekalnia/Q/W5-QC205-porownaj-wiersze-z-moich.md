# QC205 – Tabela „Porównaj” z wierszami z „Moich wskaźników”
Cel: Wiersze porównania odpowiadają liście użytkownika: usunięcie wskaźnika z „moich” usuwa wiersz, dodanie wskaźnika z biblioteki dodaje wiersz.
Zmieniaj: src/view/pages/ComparePage.tsx, tests/unit/compare-rows-my.test.tsx
Wymagane: tests/unit/compare-rows-my.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-compare.spec.ts tests/e2e/compare-table.spec.ts
Przeczytaj najpierw: src/view/pages/ComparePage.tsx (po QC203, QC803), src/core/compare/compare.ts i compare-extra.ts (QC610), src/view/my-indicators/useMyIndicators.ts, src/core/indicators/load-any-values.ts, src/view/profile/ProfileCompareTable.tsx, tests/e2e/q-compare.spec.ts, tests/e2e/compare-table.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4a, §4f, D8

## Kontekst
`compare()` zwraca wiersze dla **wszystkich** wskaźników profilu. Użytkownik chce widzieć w tabeli swoją listę. Reguły: wiersz dla wskaźnika głównego z „moich” – z istniejącego wyniku `compare()`; dla wskaźnika z biblioteki – z `compareExtraRow` (pobranie wartości: jedno żądanie na wskaźnik, QC604); wskaźnik z „moich”, którego miejsce nie ma (poziom), – wiersz „brak danych”.

## Research
1. Czy `ProfileCompareTable` pozwala przekazać listę wierszy przefiltrowaną? Jeśli tak – filtruj **w `ComparePage`**; jeśli nie – nie zmieniaj komponentu (poza zakresem), opisz w PR.
2. Zachowanie przy pustej liście „moich”: tabela pokazuje komunikat „Dodaj wskaźniki do swojej listy, żeby je porównać” + przycisk „+ Dodaj wskaźnik” (okno QC505); **nie** pokazuje wszystkich 20 (to by unieważniało pojęcie listy).
3. Kolejność wierszy = kolejność listy „moich”.
4. D8: pobranie wartości dla `b…` – jedno żądanie na wskaźnik, ponowne = 0 (cache `loadAnyValues`).

## Zadanie
- Pobierz `useMyIndicators().list`; zbuduj wiersze w kolejności listy: główne z `compare()`, z biblioteki z `compareExtraRows`.
- Pasek nad tabelą: „Wskaźniki w tabeli: <n> · Zmień” (link/przycisk otwierający okno dodawania i pokazujący × na liście – użyj `MyIndicatorsList` w zwijanym panelu).
- Stany: ładowanie wartości biblioteki („Wczytujemy dane wskaźnika…” przy wierszu), błąd (wiersz „brak danych”).

## Testy (`tests/unit/compare-rows-my.test.tsx`, mock sieci)
1. Domyślnie tabela ma 7 wierszy w kolejności listy podstawowej.
2. Usunięcie „Gęstość zaludnienia” z moich → wiersz znika, pozostałe 6 zostaje.
3. Dodanie `b101` → nowy wiersz na końcu z wartościami obu miejsc (po załadowaniu); dokładnie **jedno** żądanie wartości `b101`; ponowne dodanie/usunięcie/dodanie – zero kolejnych.
4. Pusta lista → komunikat i przycisk dodawania, brak wierszy.
5. Wskaźnik z „moich” bez danych dla poziomu miejsca → wiersz „brak danych”.
6. Istniejące testy tabeli (`compare-table.spec.ts`, `q-compare.spec.ts`) zielone bez zmian – uwaga: jeśli którykolwiek zakłada 20 wierszy, **zatrzymaj się i opisz w PR** (rozwiązanie: opcja „Pokaż wszystkie wskaźniki” przełączająca na stary widok, domyślnie wyłączona – opisz, nie wprowadzaj bez zgody).

## Gotowe, gdy
- Usunięcie wskaźnika z „moich” znika z tabeli; dodanie z biblioteki dodaje wiersz; jedno żądanie na wskaźnik; istniejące testy bez zmian.
Nie ruszaj: `compare.ts`, `ProfileCompareTable.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
