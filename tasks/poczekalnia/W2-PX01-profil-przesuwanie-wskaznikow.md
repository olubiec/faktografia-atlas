# PX01 – Profil: przesuwanie wskaźników w liście „Moje wskaźniki” (wyżej / niżej) i kolejność z listy
Cel: Wiersze wskaźników w profilu mają przyciski przesunięcia i pokazują się w kolejności listy użytkownika; kolejność zapisuje się w tej samej liście co reszta strony.
Zmieniaj: src/view/hooks/useMyIndicators.ts, src/view/profile/ProfileIndicatorList.tsx, tests/unit/profile-indicator-reorder.test.tsx, tests/unit/use-my-indicators-move.test.tsx
Wymagane: tests/unit/profile-indicator-reorder.test.tsx, tests/unit/use-my-indicators-move.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/fix3-owner-feedback.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md §4f (przesuwanie ‹ ›), src/core/my-indicators/my-indicators.ts (`moveIndicator` – już jest i jest przetestowane), src/view/hooks/useMyIndicators.ts, src/view/profile/ProfileIndicatorList.tsx (stan po FIX3 i po FIX4 – **sprawdź, co FIX4 zmienił w oknie dodawania**), tests/unit/profile-indicator-list.test.tsx (**istniejący – nie zmieniaj; musi zostać zielony**, w tym liczba opakowań wierszy i przycisków `min-h-[44px]`), tests/e2e/fix3-owner-feedback.spec.ts

## Kontekst
PRODUKT §4f: „Każdy da się usunąć (×) i przesunąć (‹ ›)”. Po FIX3 w profilu jest tylko ×, a model `moveIndicator` leży nieużywany. Dodatkowo `ProfileIndicatorList` pokazuje wiersze w kolejności wskaźników z profilu (grupami), a nie w kolejności listy użytkownika – więc przesunięcie nie miałoby widocznego skutku. Wskaźniki z biblioteki (`b<id>`) w profilu nie występują (PRODUKT §4d/§7: profil = jeden plik na województwo), ale mogą być na liście; lista profilu pokazuje przecięcie „lista × wskaźniki z danymi profilu”, a przesunięcie działa na całej liście (kolejność pozostałych jest zachowana).

## Research (10 min, bez nowych pakietów)
1. Odnotuj, jak wygląda wiersz po FIX3/FIX4 (przycisk × z `min-h-[44px]`); nowe przyciski mają taki sam rozmiar celu dotykowego.
2. W pionowej liście strzałki „‹ ›” są nieczytelne: użyj ikon góra/dół z `iconoir-react` (np. `NavArrowUp`/`NavArrowDown` przez `Icon` z `src/view/ui`) i `aria-label` „Przesuń wyżej: <nazwa>” / „Przesuń niżej: <nazwa>”. To świadome odstępstwo od litery §4f – wpisz je w „Po ludzku”.

## Zadanie
1. `useMyIndicators.ts`: dodaj `move(id, direction: -1 | 1)` (przez `moveIndicator` + zapis jak `add`/`remove`); API `{ list, add, remove, reset, move }`.
2. `ProfileIndicatorList.tsx` (`personalize`): wiersze w kolejności `list` (grupy pojawiają się w kolejności pierwszego wystąpienia wskaźnika w liście; wewnątrz grupy kolejność z listy); przy każdym wierszu dwa przyciski przesunięcia obok ×; „Wyżej” wyłączony (`disabled`) dla pierwszego widocznego, „Niżej” dla ostatniego; przesunięcie zamienia miejscami z **sąsiadem widocznym w profilu** (pomijając wskaźniki, których profil nie pokazuje). Bez `personalize` – bez zmian.
3. Pola dotykowe ≥ 44 px, kolory i odstępy z tokenów; napisy nie wychodzą poza pole na 360 px.

## Testy
`use-my-indicators-move.test.tsx`:
1. `move('density', -1)` na liście podstawowej zamienia miejscami z poprzednikiem i zapisuje w `localStorage` (atrapa `Storage`).
2. Przesunięcie pierwszego w górę i ostatniego w dół nic nie zmienia (ta sama referencja listy).
`profile-indicator-reorder.test.tsx`:
3. Wiersze pojawiają się w kolejności listy, nie w kolejności `items` (lista `['avg-wage','population']` → najpierw płace).
4. Każdy widoczny wiersz ma przyciski „Przesuń wyżej/niżej”; pierwszy ma „wyżej” wyłączony, ostatni „niżej” wyłączony.
5. Kliknięcie „niżej” na pierwszym zmienia kolejność w DOM; po odświeżeniu komponentu (nowy `render`) kolejność zostaje (zapis).
6. Wskaźnik z listy bez danych w profilu (np. `b60614`) jest pomijany przy sąsiedztwie: przesunięcie zamienia z najbliższym **widocznym**.
7. Przyciski mają klasy rozmiaru celu dotykowego ≥ 44 px.
8. `personalize={false}` – brak przycisków przesuwania.
9. E2E `fix3-owner-feedback.spec.ts` i `profile-indicator-list.test.tsx` zielone bez zmian.

## Gotowe, gdy
- 8 testów zielonych + istniejące bez zmian; `ProfileIndicatorList.tsx` ≤ 200 linii (jeśli przekracza – wydziel `ProfileIndicatorRowActions.tsx`, dopisz do „Zmieniaj” w PR).
Nie ruszaj: `src/core/my-indicators/*`, `ProfileIndicatorRow.tsx`, `ProfileSheet*.tsx`, okna dodawania wskaźników z FIX4 (poza dopasowaniem do nowego `move`).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
