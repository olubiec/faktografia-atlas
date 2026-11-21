# QC605 – Adres przyjmuje wskaźnik z biblioteki (`?i=b60614`)
Cel: `readUrlState` nie odrzuca identyfikatorów wskaźników z biblioteki, a nieznane po wczytaniu spisu wracają do domyślnego.
Zmieniaj: src/core/url/state.ts, tests/unit/url-library-indicator.test.ts
Wymagane: tests/unit/url-library-indicator.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/url/state.ts (`VALID_INDICATOR_IDS`, `readUrlState`, `writeUrlState`), tests/unit/url-state*.test.ts (**istniejące – nie zmieniaj**), src/core/indicators/registry.ts (`isLibraryIndicatorId`), src/core/map/main-view.ts

## Kontekst
Dziś `readUrlState` przyjmuje `?i=` tylko z 20 głównych (`VALID_INDICATOR_IDS`). Dla `?i=b60614` zwraca brak wskaźnika, więc link do mapy z wskaźnikiem biblioteki by nie działał. Na etapie odczytu adresu spis pobranych może nie być jeszcze wczytany, więc przyjmujemy **kształt** (`^b\d+$`) i dopiero warstwa wyżej (QC606) sprawdza istnienie po wczytaniu rejestru.

## Research
Sprawdź wszystkie wywołania `readUrlState` (`rg "readUrlState"`) – zachowanie dla głównych wskaźników i nieprawidłowych wartości **ma zostać identyczne**. Zapisz w opisie PR listę wywołujących.

## Zadanie
- W `readUrlState`: przyjmij `i`, gdy jest w `VALID_INDICATOR_IDS` **lub** `isLibraryIndicatorId(i)`.
- Nowy opcjonalny trzeci parametr `isKnownIndicator?: (id: string) => boolean` (nadpisuje regułę, gdy podany) – QC606 poda rejestr; bez parametru zachowanie jak wyżej.
- `writeUrlState` bez zmian (zapisuje `i`, jeśli ustawione).
- Importuj `isLibraryIndicatorId` z `core/indicators/registry.ts` (ten moduł jest czysty, bez cyklicznych zależności – sprawdź).

## Testy (`tests/unit/url-library-indicator.test.ts`)
1. `?i=b60614` → `i === 'b60614'`.
2. `?i=bxyz`, `?i=b`, `?i=B60614`, `?i=nie-ma` → brak `i`.
3. Główne (`?i=density`) bez zmian.
4. Z `isKnownIndicator` podanym: `b60614` odrzucone, gdy funkcja zwraca `false`; przyjęte, gdy `true`.
5. `writeUrlState({ i: 'b60614' })` zapisuje `?i=b60614` w `location.search` (jak istniejące testy zapisu – użyj tej samej techniki, np. `history.replaceState` spy).
6. Okrąglość: `readUrlState(write(...))` = ten sam stan.
7. **Istniejące** testy adresu uruchomione i zielone **bez zmian**.

## Gotowe, gdy
- Test obu przypadków; istniejące testy adresu bez zmian.
Nie ruszaj: istniejących testów, `registry.ts` (tylko import).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
