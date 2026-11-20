# QC505 – Okno „+ Dodaj wskaźnik”: zakładki Szukaj/Kategorie, okruszki, komunikat o braku wyniku
Cel: W oknie dodawania wskaźników użytkownik przełącza „Szukaj” i „Kategorie”, w dziale biblioteki widzi okruszki z powrotem do „Wszystkie”, a przy pustym wyniku czyta „Nie ma takiego wskaźnika z danymi.”.
Zależy od: nic (okno `AddIndicatorWindow` i wyszukiwanie w bibliotece są już na main; QC503/QC607 nie są potrzebne).
Kolizje plików: żadne inne zadanie W4 nie rusza `AddIndicatorWindow.tsx`. Okno jest używane w `ProfileIndicatorList.tsx` i `CompareIndicatorPicker.tsx` – nie zmieniaj ich propsów (`items`, `onAdd`).
Zmieniaj: src/view/profile/AddIndicatorWindow.tsx, src/view/profile/LibrarySearchPanel.tsx (nowy), tests/unit/add-indicator-tabs.test.tsx (nowy)
Wymagane: tests/unit/add-indicator-tabs.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/fix4-picker-zoom.spec.ts
Przeczytaj najpierw: src/view/profile/AddIndicatorWindow.tsx (`AddIndicatorWindow`, `LibrarySection`, `LibraryRows`), src/core/library/picker-results.ts (`libraryPickCategories`, `libraryPickResults`, `LIBRARY_PICK_LIMIT`), src/components/ui/tabs.tsx, src/view/library/OrderTopicButton.tsx, istniejące testy: tests/unit/add-indicator-window.test.tsx, tests/unit/add-indicator-library.test.tsx, tests/e2e/fix4-picker-zoom.spec.ts (**nie zmieniaj**), docs/PRODUKT.md §4f, docs/STYL.md

## Kontekst
Okno już istnieje i działa: lista grup po `Indicator.group` jako akordeon (`aria-expanded`), na końcu grupa „Z biblioteki GUS” z polem `aria-label="Szukaj w bibliotece"` (placeholder „Szukaj w bibliotece…”), limitem 50 (`LIBRARY_PICK_LIMIT`) i napisem „Pokazano 50 z N. Zawęź wyszukiwanie.”, wierszami „Dodaj/Dodano/Usuń” (`LibraryRows`). **Tego nie przepisujesz.** Brakuje trzech rzeczy: zakładek, okruszków i komunikatu przy pustym wyniku.

**Ograniczenia z istniejących testów (nie wolno ich zmienić):**
- `add-indicator-window.test.tsx` renderuje okno na serwerze i oczekuje: dokładnie jednego `aria-expanded="true"` (pierwsza grupa), `overflow-y-auto`, `max-h-`, `min-h-[44px]`, tekstu „Dodaj: <nazwa>” tylko w pierwszej grupie. → Domyślna zakładka to **„Kategorie”** z dzisiejszą zawartością bez zmian; same przyciski zakładek **nie** mogą mieć `aria-expanded`.
- `fix4-picker-zoom.spec.ts` po kliknięciu „Z biblioteki GUS” szuka `getByPlaceholder('Szukaj w bibliotece…')` oraz przycisku `/^Ludność \(/`. → Pole szukania w grupie „Z biblioteki GUS” zostaje tam, gdzie jest (ta sama etykieta i placeholder).
- `add-indicator-library.test.tsx` woła `LibraryRows` i `libraryPickResults` – zostają bez zmian (sygnatura `LibraryRows` bez zmian).

## Zadanie
1. `AddIndicatorWindow.tsx`: nad listą pasek zakładek **„Szukaj” | „Kategorie”** (`role="tablist"`, `role="tab"` + `aria-selected`, panel `role="tabpanel"`; użyj `src/components/ui/tabs.tsx`, jeśli da się zachować powyższe wymagania serwerowego renderu, inaczej własne przyciski). Pola dotykowe ≥ 44 px. Domyślnie „Kategorie” (dotychczasowy widok). „Szukaj” pokazuje tylko `LibrarySearchPanel` (pole + wyniki biblioteki, bez akordeonu działów).
2. `LibrarySearchPanel.tsx` (nowy, wydzielony z `LibrarySection`, żeby `AddIndicatorWindow.tsx` został ≤ ok. 200 linii): pole `aria-label="Szukaj w bibliotece"` + lista przez `libraryPickResults` + `LibraryRows`; komunikat limitu jak dziś. `LibrarySection` używa tego samego komponentu (jedno źródło; nigdy dwa pola naraz na ekranie).
3. Okruszki: gdy w „Kategorie → Z biblioteki GUS” wybrany jest dział, nad wynikami `<nav aria-label="Okruszki">`: przycisk „Wszystkie” (zwija dział, `setCat(null)`) › nazwa działu (tekst, `aria-current="page"`). Dział biblioteki to dziś poziom główny, więc okruszek ma 2 człony – nie wymyślaj głębszych.
4. Pusty wynik (szukanie bez trafień **albo** dział bez wyników): zamiast „Brak wyników.” tekst **„Nie ma takiego wskaźnika z danymi.”** (`role="status"`) i `<OrderTopicButton topic={wpisana fraza} />` z `src/view/library/OrderTopicButton.tsx` (istnieje na main).
5. `prefers-reduced-motion`: bez nowych animacji (zakładki przełączają się natychmiast); kolory i odstępy tylko z klas tokenów.

## Testy
Plik `tests/unit/add-indicator-tabs.test.tsx` (nowy; dane z `tests/fixtures` lub małego `prepareLibraryIndex`, jak w `add-indicator-library.test.tsx`; interakcje przez `@testing-library/react`, jeśli jest w repo – sprawdź `package.json`; w przeciwnym razie przez `renderToString` i wywołanie handlerów z drzewa):
1. Okno ma zakładki „Szukaj” i „Kategorie”; domyślnie `aria-selected="true"` ma „Kategorie”, a dotychczasowa zawartość (pierwsza grupa rozwinięta) jest widoczna.
2. Przełączenie na „Szukaj” pokazuje pole `Szukaj w bibliotece`, a grup akordeonu nie ma w DOM; powrót na „Kategorie” je przywraca.
3. Wpisanie frazy bez trafień w „Szukaj” → tekst „Nie ma takiego wskaźnika z danymi.” oraz link/przycisk „Zamów dane o „<fraza>””.
4. Wybór działu biblioteki pokazuje okruszki „Wszystkie › <dział>”; klik „Wszystkie” zwija dział i okruszków już nie ma.
5. Wyniki w „Szukaj” nadal ≤ 50 z napisem „Pokazano 50 z 120” (120 wskaźników z `has: 1`).
6. Przyciski zakładek i „Wszystkie” mają `min-h-[44px]`.
7. Istniejące `add-indicator-window.test.tsx` i `add-indicator-library.test.tsx` przechodzą bez zmian.

## Gotowe, gdy
- Zakładki przełączają widoki (test 1–2); okruszki wracają do „Wszystkie” (test 4); pusty wynik pokazuje „Nie ma takiego wskaźnika z danymi.” z przyciskiem zamówienia (test 3); limit 50 działa (test 5); istniejące testy i `fix4-picker-zoom.spec.ts` zielone bez zmian (test 7).
Nie ruszaj: `core/library/picker-results.ts`, `useMyIndicators.ts`, `ProfileIndicatorList.tsx`, `CompareIndicatorPicker.tsx`, `src/view/profile/ProfileSheet*.tsx`, istniejących testów.
Uwaga: `ProfilePortal.tsx` (src/view/map) przechwytuje kliknięcia w `[role="tab"]` w profilu – po wdrożeniu sprawdź na podglądzie, że zakładki okna nie przełączają zakładek profilu (jeśli przełączają, zatrzymaj się i opisz w PR; pliku nie zmieniaj).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
