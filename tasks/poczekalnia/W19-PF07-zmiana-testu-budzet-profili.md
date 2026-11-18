# PF07 – [CZEKA NA ZGODĘ D1] Test budżetu profili: mierzyć pamięć w obrębie sesji, nie po przeładowaniu strony
Cel: Test „navigation-and-budgets” sprawdza to, co aplikacja naprawdę gwarantuje: jedno pobranie pliku profilu na województwo w całej sesji; po pełnym przeładowaniu dozwolone jest jedno pobranie.
STATUS: **Nie puszczać bez zgody właściciela (decyzja D1 w docs/PLAN-POPRAWEK.md).** To zmiana istniejącego testu, a AGENTS.md zabrania jej bez zgody.
Zmieniaj: tests/e2e/navigation-and-budgets.spec.ts
Wymagane: tests/e2e/navigation-and-budgets.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/navigation-and-budgets.spec.ts
Przeczytaj najpierw: tests/e2e/navigation-and-budgets.spec.ts (krok 8: „Weryfikacja budżetu żądań”), src/core/data/load-profile.ts (`shardCache`, `loadingPromises` – pamięć sesji), docs/PRODUKT.md §7 (wiersz „Wybór miejsca: dokładnie jedno żądanie danych profilu”), playwright.config.ts (`vite preview` – tylko czytasz), tasks/poczekalnia/W17-T05-podroz-po-portalu-i-budzety.md (pierwotny zamysł)

## Kontekst
Krok 8 testu robi dwa razy `page.goto('/?e2e&u=1465011')` i oczekuje 0 nowych żądań `/data/profiles/*.json`. `page.goto` to **pełne przeładowanie**: pamięć w JavaScript (`shardCache`) znika, a `vite preview` wysyła pliki z `Cache-Control: no-cache`, więc przeglądarka pyta serwer ponownie. Test pada (desktop i mobile), choć aplikacja działa zgodnie z PRODUKT §7 (jedno żądanie na wybór miejsca). Zapis do pamięci przeglądarki ponad sesję (Cache Storage/service worker) byłby nową funkcją i ryzykiem „starych danych po nocnej aktualizacji” – nie robimy go dla testu.

## Research (10 min)
1. Potwierdź przyczynę: uruchom test, wypisz adresy i nagłówki odpowiedzi (`response.headers()['cache-control']`) drugiego `goto`.
2. Sprawdź w `load-profile.ts`, że kolejny wybór jednostki z tego samego województwa nie robi żądania, a z innego robi dokładnie jedno.

## Zadanie
Zmień **tylko krok 8** (pozostałe kroki zostają bez zmian): 
- (a) otwórz profil jednostki A (`?u=1465011`, województwo 14), zapamiętaj licznik; 
- (b) bez przeładowania wybierz inną jednostkę z tego samego województwa (przez pole wyszukiwania `Ctrl+K` albo listę „Jednostki w:”) → licznik **bez zmian**; 
- (c) wybierz jednostkę z innego województwa → licznik +1; wróć do A klawiszem Wstecz → licznik bez zmian; 
- (d) po `page.reload()` otwarcie profilu A robi **najwyżej 1** żądanie `profiles/*.json` (zamiast 0).
Nazwę testu zachowaj; dopisz komentarz po polsku, dlaczego przeładowanie nie jest mierzone na zero.

## Testy
1. Desktop i mobile: kroki (a)–(d) przechodzą 5 razy z rzędu (`--repeat-each=5`).
2. Wyłączenie pamięci w `load-profile.ts` (eksperyment lokalny, niezatwierdzany) powoduje czerwony krok (b) – test naprawdę pilnuje pamięci. Wynik eksperymentu w opisie PR.
3. Pozostałe kroki (nawigacja przód/tył) bez zmian.

## Gotowe, gdy
- Test zielony na desktop i mobile, 5/5; w opisie PR jedno zdanie dla właściciela: „Test sprawdzał rzecz, której żadna strona nie spełnia po przeładowaniu; teraz sprawdza pamięć w obrębie wizyty”.
Nie ruszaj: `load-profile.ts`, `vercel.json`, `playwright.config.ts`, pozostałych testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
