# QC505 – Okno „+ Dodaj wskaźnik” (zakładki „Szukaj” i „Kategorie”)
Cel: Użytkownik dodaje do „Moich wskaźników” dowolny wskaźnik z danymi – wyszukiwarką albo przeglądając kategorie.
Zmieniaj: src/view/my-indicators/AddIndicatorDialog.tsx, tests/unit/add-indicator-dialog.test.tsx
Wymagane: tests/unit/add-indicator-dialog.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/indicators/registry.ts (QC602: `buildRegistry`, `library`, `byId`), src/view/my-indicators/useMyIndicators.ts (QC503), src/view/controls/IndicatorPicker.tsx (grupy po `group`, wyszukiwanie), src/components/ui/dialog.tsx, tabs.tsx, src/core/search/normalize.ts, src/view/library/CategoryTiles.tsx (okruszki), docs/PRODUKT.md §4f, docs/STYL.md

## Kontekst
Właściciel: „niżej jest plus, pozwalający wyszukać dane, lub wejść w menu kategorie i sobie wybrać po kategoriach”. Okno jest **dostarczane z danymi z zewnątrz** (props: rejestr), żeby test nie robił sieci i żeby użyć go też w eksporcie (QC915).

## Research
1. Zobacz, jak `IndicatorPicker` grupuje wskaźniki i szuka; **nie kopiuj** – wywołaj wspólne funkcje, jeśli są eksportowane; jeśli nie, napisz małą własną (`normalize` + „zawiera”).
2. Radix `Dialog`/`Tabs` są w repo (`src/components/ui`). Użyj ich (focus-trap, Escape, `aria-*` za darmo). **Żadnych nowych pakietów.**
3. Kategorie: grupy z `Indicator.group` (20 głównych) oraz działy biblioteki z `Indicator.description` (ścieżka „A > B”) – rozbij po „ > ”. Okruszki: „Wszystkie › Ludność › Struktura ludności”.

## Zadanie
`src/view/my-indicators/AddIndicatorDialog.tsx`:
- Props: `{ open: boolean; onOpenChange(open: boolean): void; indicators: Indicator[]; onAdd?: (id: string) => void }` (domyślnie `useMyIndicators().add`).
- Zakładka **Szukaj**: pole (autofocus), wyniki ≤ 30 z licznikiem „Pokazano 30 z N – zawęź frazę”; dopasowanie bez polskich znaków i wielkości liter po nazwie; pozycja = nazwa + jednostka + (dla biblioteki) mała etykieta „GUS”.
- Zakładka **Kategorie**: poziom 1 = grupy (kafelki/lista), wejście w grupę pokazuje wskaźniki i poddziały; okruszki z powrotem do góry.
- Pozycja już w „moich” ma oznaczenie „✓ w moich” i jest nieaktywna (nie można dodać drugi raz).
- Wybór: `add(id)`, okno się zamyka, fokus wraca do przycisku „+”.
- Tylko wskaźniki z danymi (lista z rejestru już taka jest – nie filtruj ponownie, nie pokazuj niepobranych).
- Pusty wynik szukania: „Nie ma takiego wskaźnika z danymi.” i link „Zamów dane na temat…” (`OrderTopicButton` z QC704, jeśli już scalone; jeśli nie – sam tekst).
- ≥ 44 px, 390 px bez poziomego przewijania, `prefers-reduced-motion` bez animacji.

## Testy
1. „bezrob” znajduje „Stopa bezrobocia rejestrowanego (%)” (bez polskich znaków w zapytaniu: „bezrobocia” też).
2. Wybór wyniku wywołuje `onAdd` z właściwym id, zamyka okno.
3. Zakładka „Kategorie”: wybór grupy „Praca” pokazuje jej wskaźniki; okruszek „Wszystkie” wraca.
4. Wskaźnik z biblioteki (`b101`) wyszukiwalny, ma etykietę „GUS”, dodaje się z id `b101`.
5. Wskaźnik już w „moich” → „✓ w moich”, `aria-disabled`, klik nie woła `onAdd`.
6. Escape zamyka okno; fokus wraca do elementu, który je otworzył.
7. Pusty wynik → komunikat; limit 30 → komunikat o skróconej liście (wygeneruj 100 wskaźników).
8. Brak propsa `onAdd` → `useMyIndicators().add` rzeczywiście dopisuje (sprawdź hookiem).

## Gotowe, gdy
- „bezrob” pokazuje stopę bezrobocia; wybór kategorii pokazuje jej wskaźniki; dodanie zamyka okno i dopisuje na końcu listy.
Nie ruszaj: `IndicatorPicker.tsx`, `registry.ts`, `useMyIndicators.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
