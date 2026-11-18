# PF05 – Stabilizacja: spis biblioteki naprawdę pobierany raz (test `library-search` linia ~99)
Cel: Ustalić, dlaczego e2e „w całej ścieżce dokładnie 1 żądanie spisu index.json” bywa czerwony, i naprawić przyczynę w kodzie ładowania.
Zmieniaj: src/core/library/load-library.ts, tests/unit/library-load-dedupe.test.ts
Wymagane: tests/unit/library-load-dedupe.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/library-search.spec.ts --repeat-each=10
Przeczytaj najpierw: src/core/library/load-library.ts (`loadLibraryIndex`, `indexPromise`, `isIndexCached`, `.catch`), tests/e2e/library-search.spec.ts (**istniejący – nie zmieniaj**, test od linii ~99), src/view/pages/Library.tsx (kto woła `loadLibraryIndex`, retry), tests/unit/load-library.test.ts, tests/e2e/network-resilience.spec.ts (test „index.json biblioteki” – zachowanie ponowienia ma zostać)

## Kontekst
E2E liczy żądania, których adres zawiera `index.json`, i oczekuje dokładnie 1 na całej ścieżce (kafelek → szukanie → filtr poziomu → Wstecz). Bywa czerwony (flaky). Podejrzane miejsca w kodzie: (1) `.catch` oraz gałąź `!res.ok` zapisują wynik `null` jako **trwały** (`isIndexCached = true`), więc jedno przerwane żądanie (np. przy szybkiej nawigacji) blokuje spis aż do przeładowania, a ponowienie z `Library.tsx` może wywołać drugie żądanie; (2) licznik w teście łapie każdy adres z `index.json` (także np. inny plik o tej końcówce). Nie zgadujemy – najpierw odtwarzamy.

## Research (obowiązkowy, 20 min)
1. Uruchom `pnpm build && pnpm exec playwright test tests/e2e/library-search.spec.ts -g "1 żądanie" --repeat-each=20`; zapisz liczbę czerwonych i **adresy żądań** z nieudanego przebiegu (tymczasowo `console.log(requests)` w kopii testu poza repo – nie zmieniaj testu w repo).
2. Zdecyduj: przyczyna w kodzie (podwójne żądanie, ponowienie, unieważnienie pamięci) czy w teście (adres, kolejność zdarzeń)? 
3. Jeśli przyczyna jest w **teście** – nie zmieniaj go; zatrzymaj się, opisz w PR dowody (adresy, liczby) i zaproponuj poprawkę testu do zgody właściciela. Zadanie kończy się wtedy samym raportem w opisie PR.

## Zadanie (gdy przyczyna jest w kodzie)
W `load-library.ts`: błąd sieciowy/przerwanie (`catch`) i odpowiedź nie-OK nie zapisują trwałego `null`; zwracają `null` tylko tej próbie, a kolejne wywołanie dozwolone jest dopiero po jej zakończeniu (jedno żądanie naraz, dalej `indexPromise`). Poprawna odpowiedź zostaje w pamięci na zawsze (jak dziś). Zachowaj: wielokrotne wywołania równoległe = jedno żądanie; 404 na stronie `/biblioteka` nadal pokazuje komunikat z przyciskiem ponowienia (test `network-resilience`).

## Testy (`tests/unit/library-load-dedupe.test.ts`, nowy plik)
1. 5 równoległych `loadLibraryIndex` = 1 wywołanie `fetch` (wstrzyknięty `fetchImpl`).
2. Po udanej odpowiedzi kolejne wywołania nie robią żądania (0 dodatkowych).
3. Odrzucone żądanie (`reject`) → `null`; następne wywołanie po jego zakończeniu robi **nowe** żądanie i może się udać (wynik ≠ null).
4. Odpowiedź 404 → `null`, bez trwałego zablokowania (kolejna próba możliwa); to samo dla złego JSON-a.
5. Dwa moduły resetowane między testami (`vi.resetModules`) – brak wycieku stanu.
6. E2E `library-search` linia ~99 przechodzi 10/10 (`--repeat-each=10`).

## Gotowe, gdy
- Przyczyna ustalona i opisana w PR (adresy żądań z nieudanego przebiegu).
- Testy 1–5 zielone, e2e 10/10; istniejące `load-library`, `network-resilience`, `library-search` bez zmian.
Nie ruszaj: istniejących testów, `Library.tsx`, `config.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
