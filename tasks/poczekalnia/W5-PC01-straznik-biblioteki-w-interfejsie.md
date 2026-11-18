# PC01 – Strażnik interfejsu: każdy pobrany wskaźnik biblioteki da się znaleźć i wybrać
Cel: Test renderujący okno wyboru wskaźnika na rejestrze z `available.json`: dla każdej zmiennej istnieje droga (szukanie po nazwie albo kategoria), która kończy się wyborem `?i=b<id>`.
Zmieniaj: tests/unit/library-ui-reachability.test.tsx
Wymagane: tests/unit/library-ui-reachability.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/indicators/reachability.ts (PF02: `auditIndicators`, `searchIndicators`), src/core/indicators/registry.ts, src/view/controls/IndicatorPicker.tsx (po QC607 i FIX4), src/view/hooks/useIndicatorRegistry.ts (QC606), src/view/my-indicators/AddIndicatorDialog.tsx lub okno dodawania z FIX4/QC505, tests/fixtures/library/available.json, tests/unit/indicator-picker.test.tsx (wzór renderowania pickera)

## Kontekst
PF02 pilnuje zgodności **danych** i rejestru. Ten test pilnuje, że to samo dotyczy **interfejsu**: właściciel zgłaszał „nie wszystkie pobrane wskaźniki są widoczne”. Dopiero po QC606/QC607 (mapa i picker znają bibliotekę) test może przejść — dlatego fala 5.

## Research (10 min)
Ustal publiczny sposób sterowania pickerem w teście (propsy `indicators`, `query`, `onSelect` — patrz `IndicatorPickerContent`). Jeśli picker po FIX4 wyświetla tylko pierwsze N wyników (limit), test musi uwzględniać „Pokaż więcej”/kategorie, a nie tylko pierwszą stronę.

## Zadanie
Nowy test (bez zmian w kodzie): buduje rejestr z fixture `available.json` i prawdziwych 20 wskaźników; dla **każdego** wskaźnika z rejestru: (a) wpisuje w pickerze jego pełną nazwę i sprawdza, że wynik zawiera wiersz tego wskaźnika, (b) klika wiersz i sprawdza, że `onSelect` dostało dokładnie jego `id` (`b<id>` dla biblioteki), (c) sprawdza, że wskaźnik jest osiągalny także przez kategorię (grupa/dział z `description`/`group`).

## Testy
1. Wszystkie wskaźniki z rejestru (≥ 25 w fixture) przechodzą (a)–(c).
2. Wskaźnik o nazwie zduplikowanej z głównym (znacznik „(z biblioteki GUS)”) jest rozróżnialny w wynikach i zwraca właściwe `id`.
3. Wskaźnik tylko powiatowy (w fixture) jest wybieralny; wybór nie rzuca wyjątku.
4. Dodanie sztucznego wskaźnika do `available` (w teście) pojawia się w wynikach bez zmian w kodzie — test generyczny.
5. `auditIndicators` na tych samych danych zwraca `problems = []`.

## Gotowe, gdy
- 5 testów zielonych na `main` po QC606/QC607; jeśli picker ogranicza listę i test nie może jej obejść, napisz w PR (nie osłabiaj testu).
Nie ruszaj: kodu źródłowego, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
