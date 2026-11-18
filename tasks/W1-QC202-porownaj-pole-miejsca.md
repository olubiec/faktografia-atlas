# QC202 – Pole wyboru miejsca z podpowiedziami (PlacePicker)
Cel: Wielokrotnego użytku komponent: wpisujesz „Krak”, widzisz „Kraków” i inne trafienia, wybierasz myszą, dotykiem albo klawiaturą.
Zmieniaj: src/view/compare/PlacePicker.tsx, tests/unit/place-picker.test.tsx
Wymagane: tests/unit/place-picker.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/search/useSearch.ts (`useSearch(query, limit)`), src/view/search/SearchDialog.tsx (jak wyświetla wyniki jednostek i miejscowości), src/view/ui/SearchField.tsx, src/core/units/label.ts, docs/STYL.md (pola, focus, 44 px), src/components/ui/popover.tsx

## Kontekst
Właściciel: „nie da się wybrać miasta czy wyszukać” (Porównaj, Rankingi). Wyszukiwarka globalna już istnieje (`useSearch`: jednostki i miejscowości). Tu robimy z niej **pole osadzone w stronie**, które zwraca wybrane miejsce przez callback. Komponent nie zna adresu ani strony Porównaj.

## Research (obowiązkowy, krótki)
1. W repo jest pakiet `cmdk` (jest w `package.json`) i `SearchDialog.tsx`. Sprawdź, czy `SearchDialog` używa `cmdk`; jeśli tak, **użyj tego samego wzorca/komponentów** dla spójnego zachowania klawiatury. Jeśli nie – zbuduj własną listę z rolą `combobox`/`listbox` (WAI-ARIA 1.2: `aria-expanded`, `aria-controls`, `aria-activedescendant`).
2. Przeczytaj, co zwraca `useSearch` (typ `SearchResult`: `kind: 'unit' | 'locality'`, nazwa, TERYT). Miejscowość (`locality`) musi zwrócić TERYT swojej gminy – sprawdź pole w `types.ts`.
3. Nie dodawaj pakietów.

## Zadanie
`src/view/compare/PlacePicker.tsx`:
- Props: `{ label: string; value: string | null /* TERYT */; onChange: (teryt: string | null) => void; excludeTeryt?: string | null; placeholder?: string; id?: string }`.
- Gdy `value` ustawione: pokaż nazwę wybranego miejsca (z rodzajem, np. „Kraków (powiat grodzki)”) i przycisk **×** (aria-label „Wyczyść <label>”), klik → `onChange(null)`.
- Gdy puste: pole tekstowe; po wpisaniu ≥ 2 znaków lista do 8 podpowiedzi z `useSearch`; `excludeTeryt` – nie pokazuj miejsca wybranego po drugiej stronie.
- Klawiatura: ↓/↑ zmieniają zaznaczenie, Enter wybiera, Escape zamyka listę, Tab zamyka bez wyboru.
- Brak wyników: „Nie znaleźliśmy takiego miejsca” (rola `status`).
- Pola ≥ 44 px, kolory/odstępy tylko z tokenów, napisy nie wychodzą poza pole (obcinanie wielokropkiem z `title`).
- `prefers-reduced-motion`: żadnych przejść na liście.

## Testy (Vitest + Testing Library; `useSearch` zamockuj lub podaj fixture indeksu jak w `tests/unit/search-*.test.tsx`)
1. Wpisanie „Krak” pokazuje „Kraków”; Enter wywołuje `onChange` z kodem Krakowa.
2. Strzałka w dół zmienia `aria-activedescendant`; Escape zamyka listę (`aria-expanded=false`).
3. × wywołuje `onChange(null)` i wraca pole tekstowe.
4. `excludeTeryt` ukrywa wskazane miejsce w podpowiedziach.
5. Brak trafień → komunikat „Nie znaleźliśmy takiego miejsca”.
6. Wybór miejscowości zwraca TERYT jej gminy (nie kod miejscowości).
7. Element interaktywny ma `min-height` ≥ 44 px (sprawdź klasę tokenową lub style w teście, jak w `tests/unit/touch-targets*.test.tsx`, jeśli taki jest).

## Gotowe, gdy
- „Krak” → „Kraków”, Enter wybiera; wszystkie 7 testów zielone; brak `any`.
Nie ruszaj: `useSearch.ts`, `SearchDialog.tsx`, `ComparePage.tsx` (wpięcie w QC203).

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
