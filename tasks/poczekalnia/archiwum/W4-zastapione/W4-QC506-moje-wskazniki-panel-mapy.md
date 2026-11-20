# QC506 – Sekcja „Moje wskaźniki” w panelu mapy (komputer)
Cel: Na górze panelu wskaźnika widać listę „Moje wskaźniki”: klik pokazuje wskaźnik na mapie, × usuwa, + otwiera okno dodawania.
Zmieniaj: src/view/main/IndicatorPanel.tsx, tests/unit/indicator-panel-my.test.tsx
Wymagane: tests/unit/indicator-panel-my.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/main-screen.spec.ts
Przeczytaj najpierw: src/view/main/IndicatorPanel.tsx, src/view/my-indicators/{MyIndicatorsList,AddIndicatorDialog,useMyIndicators}.tsx|ts, src/view/map/hooks/useMainView.ts (`setIndicator`, lista wskaźników), tests/e2e/main-screen.spec.ts i tests/unit/indicator-panel*.test.tsx (**istniejące – nie zmieniaj**), docs/PRODUKT.md §3, §4f

## Kontekst
To jest pierwsze miejsce, w którym właściciel zobaczy „Moje wskaźniki”. Panel wskaźnika ma dziś jedno okno wyboru z 20 wskaźnikami. Dodajemy **nad nim** sekcję z listą użytkownika (wspólny stan z QC503).

## Research
1. Zobacz strukturę `IndicatorPanel.tsx`: gdzie jest przycisk wyboru, legenda, rok. Wstaw sekcję tak, by **nie przesuwać** istniejących elementów w sposób łamiący istniejące testy e2e (`main-screen.spec.ts`, zrzuty `design.spec.ts` robi CI – zrzuty odświeży właściciel).
2. Zapytaj o potrzebny rejestr: `IndicatorPanel` dostaje `indicators` propsem (20 głównych). Mapa nazw dla listy: zbuduj z propsa `indicators` **oraz** – gdy QC603/QC602 dostępne – z rejestru. Jeśli rejestr jeszcze nie jest wpięty w ekran (to QC606, Q7), użyj samego propsa; id z biblioteki bez wpisu pokazują się jako id (QC504 to obsługuje).
3. Sprawdź limit wysokości panelu – lista 7 wierszy nie może wypychać legendy poza ekran na 1280×720: sekcja w `max-h` z wewnętrznym przewijaniem lub zwijana (domyślnie rozwinięta).

## Zadanie
- Nad przyciskiem wyboru wskaźnika: nagłówek „Moje wskaźniki”, `<MyIndicatorsList indicators={map} activeId={indicator.id} onSelect={setIndicator} onAdd={() => setAddOpen(true)} />` i `<AddIndicatorDialog open={addOpen} … indicators={indicators} />`.
- Klik w wiersz = `setIndicator(id)` (zmienia `?i=` – istniejąca ścieżka, **jedno** żądanie wartości).
- Sekcja zwijana (`aria-expanded`), stan zwinięcia tylko w pamięci komponentu.
- Przy `activeId`, którego nie ma w „moich” (np. wybrano z pełnego okna), nic nie jest zaznaczone – to normalne.

## Testy (`tests/unit/indicator-panel-my.test.tsx`)
1. Panel pokazuje sekcję „Moje wskaźniki” z 7 podstawowymi.
2. Klik w „Gęstość zaludnienia” woła `setIndicator('density')` (mock) / zmienia adres.
3. × usuwa wiersz i wiersz znika z listy; po ponownym renderze (odświeżenie – `__resetMyIndicatorsForTests` + zapisany `localStorage`) lista nadal bez niego.
4. „+” otwiera okno dodawania (`role="dialog"`); wybór wskaźnika dopisuje go na końcu.
5. Aktywny wskaźnik ma `aria-current`.
6. Zwinięcie sekcji ukrywa listę, `aria-expanded=false`.
7. Istniejące testy panelu (`indicator-panel*.test.tsx`) zielone bez zmian; `main-screen.spec.ts` zielony.

## Gotowe, gdy
- Klik w wiersz zmienia `?i=`; × usuwa; + otwiera okno; istniejące testy bez zmian; (wzorce zrzutów do odświeżenia przez właściciela – wpisać w PR).
Nie ruszaj: `Home.tsx`, `AtlasMap.tsx`, `MobileIndicatorBar.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
