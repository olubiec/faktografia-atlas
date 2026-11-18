# QC915 – Panel „Dane na tej stronie” (lista wskaźników z ×, „+ Dodaj dane”, „Zmień wskaźnik”)
Cel: Użytkownik w oknie eksportu edytuje dane bieżącej strony: usuwa wskaźniki, dodaje nowe (także z biblioteki), zmienia wskaźnik na stronach jednowskaźnikowych.
Zmieniaj: src/view/share/PageDataEditor.tsx, tests/unit/page-data-editor.test.tsx
Wymagane: tests/unit/page-data-editor.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck-page-data.ts (QC902: `canAddData`, `canRemoveData`, `isSingleIndicator`), deck-split.ts (`splitHint`), src/view/my-indicators/AddIndicatorDialog.tsx (QC505 – **ponowne użycie**), src/view/share/useDeck.ts (`status` ładowania), docs/PRODUKT.md §4b

## Kontekst
To jest „czy dodanie innych danych” z wiadomości właściciela. Okno dodawania wskaźnika (QC505) jest gotowe – to zadanie je **osadza**. Wskaźniki do wyboru pochodzą z rejestru (główne + pobrane); wartości dociąga `useDeck` (QC912).

## Research
1. Obejrzyj `AddIndicatorDialog` – ma domyślnie `useMyIndicators().add`; tu musi wołać **callback strony**, nie dopisywać do „Moich”. Użyj propsu `onAdd` (jest w specyfikacji QC505).
2. Strona jednowskaźnikowa (mapa, ranking, duża liczba, wykres, rozkład, A vs B): zamiast listy z × pokaż jedną pozycję i przycisk „Zmień wskaźnik” (to samo okno wyboru; wybór wywołuje `replaceIndicator`).
3. Podpowiedź podziału (`splitHint`) pokazuj nad listą, gdy strona przekracza limit formatu; przycisk „Podziel stronę” obok.

## Zadanie
`src/view/share/PageDataEditor.tsx`:
- Props: `{ page: DeckPage; names: Map<string, { name: string; unit?: string }>; status: Map<string, 'idle'|'loading'|'ready'|'error'>; indicators: Indicator[]; format: ShareFormatKey; onAdd(id); onRemove(id); onReplace(id); onSplit(): void }`.
- Wielowskaźnikowa strona: lista wierszy (nazwa, jednostka, `status`: przy `loading` „Wczytujemy…”, przy `error` „Nie udało się wczytać” + ×), × wyłączone przy `!canRemoveData(page)`, „+ Dodaj dane” (przy `canAddData`) otwiera `AddIndicatorDialog` z `onAdd`.
- Jednowskaźnikowa: nazwa + „Zmień wskaźnik”.
- Nagłówek „Dane na tej stronie” (zwijany – domyślnie rozwinięty na komputerze, zwinięty na telefonie, żeby nie zasłaniał podglądu).
- ≥ 44 px, 390 px bez poziomego przewijania.

## Testy
1. Strona „Tabela” z 7 wskaźnikami: 7 wierszy z × (po jednym), „+ Dodaj dane” widoczne.
2. × woła `onRemove(id)`; przy jednym wskaźniku × wyłączone (min 1).
3. „+ Dodaj dane” otwiera okno dodawania; wybór → `onAdd('b101')` (i **nie** zmienia „Moich wskaźników” – sprawdź `useMyIndicators().list`).
4. Strona „Mapa”: brak listy z ×, jest „Zmień wskaźnik”; wybór → `onReplace(id)`.
5. `status.get('b101') === 'loading'` → „Wczytujemy…”; `'error'` → komunikat.
6. Przekroczony limit formatu → widoczne `splitHint` i przycisk „Podziel stronę” woła `onSplit`.
7. Nagłówek zwija i rozwija listę (`aria-expanded`).
8. Przyciski ≥ 44 px, dostępne nazwy.

## Gotowe, gdy
- × usuwa wiersz z podglądu (callback), + dodaje; testy zielone.
Nie ruszaj: `AddIndicatorDialog.tsx`, `deck-page-data.ts`, `useMyIndicators.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
