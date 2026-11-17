# QC806 – Biblioteka (lista): „Kopiuj link” z bieżącym stanem filtrów
Cel: Link z `/biblioteka` odtwarza kategorię i wyszukiwane hasło.
Zmieniaj: src/view/pages/Library.tsx, tests/unit/library-copy-link.test.tsx
Wymagane: tests/unit/library-copy-link.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-page.spec.ts
Przeczytaj najpierw: src/view/pages/Library.tsx (po QC509), src/view/share/ShareBar.tsx (QC801), tests/e2e/library-page.spec.ts i tests/e2e/library-search.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §4d, D10

## Kontekst
Lista biblioteki nie ma nic do pobrania jako karta, więc tylko „Kopiuj link” (`showDownload={false}`). Stan w adresie już jest (`?k= &q= &l= &p=`).

## Research
Upewnij się, że `Library.tsx` zapisuje stan filtrów do adresu **na bieżąco** (`replaceState`); jeśli tylko przy wejściu – link skopiowany z `location.href` byłby nieaktualny. Wtedy przekaż `url` zbudowany ze stanu, nie z `location.href`.

## Zadanie
- `<ShareBar showDownload={false} url={…} />` nad listą, obok zdania „m z n” (jedno miejsce, wyrównane), zawija się na 390 px.
- `url` zawiera `?k=` (kategoria), `?q=` (hasło), `?l=` (poziom), `?p=` (strona), tylko ustawione.

## Testy
1. Wybierz kategorię i wpisz hasło → „Kopiuj link” kopiuje adres z `k` i `q` (dokładne wartości).
2. Pusty stan → adres bez parametrów.
3. Brak przycisku „Pobierz i udostępnij” (`queryByText` = null).
4. 390 px: pasek nie powoduje poziomego przewijania (test geometrii jak w istniejących specach mobilnych – w ramach testu jednostkowego wystarczy klasa `flex-wrap`; e2e istniejące zielone).
5. Istniejące testy biblioteki zielone bez zmian.

## Gotowe, gdy
- Link zawiera `?k=&q=`; testy zielone; istniejące testy bez zmian.
Nie ruszaj: `query.ts`, `ShareBar.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
