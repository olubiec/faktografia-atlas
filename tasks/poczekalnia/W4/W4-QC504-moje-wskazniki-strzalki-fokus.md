# QC504 – „Moje wskaźniki”: strzałki ‹ ›, aktywny wiersz i fokus
Cel: W istniejącej liście „Moje wskaźniki” da się zmienić kolejność przyciskami ‹ › (zamiast samego przeciągania), aktywny wiersz jest oznaczony `aria-current`, a fokus nie ginie po przesunięciu ani usunięciu.
Zależy od: nic (QC503 jest już zrobione: `src/view/hooks/useMyIndicators.ts` z `move`). **QC506 wykonuje się PO tym zadaniu** (ten sam plik `MyIndicatorsBar.tsx`).
Kolizje plików: `src/view/pages/MyIndicatorsBar.tsx` rusza też QC506 (tylko czyta jego prop `activeId`, nie edytuje pliku). Kolejność: QC504 → QC506.
Zmieniaj: src/view/pages/MyIndicatorsBar.tsx, src/view/pages/myIndicatorsFocus.ts (nowy), tests/unit/my-indicators-arrows.test.tsx (nowy), tests/unit/my-indicators-focus.test.ts (nowy)
Wymagane: tests/unit/my-indicators-arrows.test.tsx, tests/unit/my-indicators-focus.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/pages/MyIndicatorsBar.tsx, src/view/pages/useIndicatorReorder.ts (`IndicatorReorder.move(id, -1|1, steps?)`), src/view/hooks/useMyIndicators.ts, src/core/my-indicators/my-indicators.ts (`moveIndicator`), src/view/ui/Icon.tsx, tests/unit/my-indicators-bar-rows.test.tsx (**istniejący – nie zmieniaj**), docs/PRODUKT.md §4f, docs/STYL.md

## Kontekst
Audyt (docs/AUDYT-W4-20-11.md) wykazał, że katalog `src/view/my-indicators/` nie istnieje. Lista jest w `src/view/pages/MyIndicatorsBar.tsx` (używają jej `MobileIndicatorBar.tsx` przez `MyIndicatorsManager` i `Rankings.tsx`). **Już jest** i nie wolno tego dublować: przycisk × („Usuń wskaźnik <nazwa>”), „Przywróć podstawowe” (ukryte, gdy `isBasic`), „+ Dodaj wskaźnik”, pola ≥ 44 px, uchwyt przeciągania z klawiszami ↑ ↓. **Brakuje**: przycisków ‹ ›, `aria-current` i przywrócenia fokusu.

## Research
1. Ikony wyłącznie przez `Icon` z `src/view/ui/Icon` (iconoir-react); żadnego lucide. Strzałki ‹ › jako ikony (np. `NavArrowUp`/`NavArrowDown` – sprawdź nazwy w `iconoir-react` przed użyciem).
2. Przeciąganie zostaje (to dodatek); strzałki są głównym, dostępnym sposobem. Strzałki pokazują się, gdy podano `reorder` (obaj dotychczasowi użytkownicy go podają) i wołają `reorder.move(id, -1 | 1)`. Nie dodawaj nowego propsa.
3. Brak środowiska DOM w Vitest (`environment: 'node'`, brak Testing Library): testy robisz przez `renderToString` (jak `my-indicators-bar-rows.test.tsx`), a logikę fokusu wydziel do czystej funkcji w osobnym pliku.

## Zadanie
`src/view/pages/myIndicatorsFocus.ts` (nowy, czysta logika):
- `focusAfterChange(list: readonly string[], id: string, action: 'up' | 'down' | 'remove'): { id: string; control: 'up' | 'down' | 'remove' } | 'add'` – po przesunięciu fokus zostaje na tym samym przycisku (`up`/`down`); jeśli po przesunięciu wiersz jest na krawędzi i ten przycisk jest wyłączony, fokus idzie na przeciwny; po usunięciu fokus idzie na × następnego wiersza, a gdy usunięto ostatni – poprzedniego; gdy lista będzie pusta – `'add'`.
`src/view/pages/MyIndicatorsBar.tsx`:
- Nowy opcjonalny prop `activeId?: string | null` (ustawia go QC506; tu tylko dopisz i obsłuż): wiersz z `ind.id === activeId` dostaje `aria-current="true"`.
- Gdy jest `reorder`: w wierszu dwa przyciski ≥ 44 px, `aria-label` „Przesuń <nazwa> wyżej” / „Przesuń <nazwa> niżej”; pierwszy wiersz ma „wyżej” `disabled`, ostatni „niżej” `disabled`.
- Fokus: po kliknięciu ‹ › lub × zapamiętaj wynik `focusAfterChange` w `useRef` i po zmianie `list` (`useEffect`) przenieś fokus na odpowiedni przycisk (znajdź po `data-row-id` + `data-control` w korzeniu komponentu) albo na „+ Dodaj wskaźnik”. Fokus nigdy nie zostaje na `body`.
- Całość ≤ ok. 130 linii kodu; jeśli plik przekroczy ~200 linii, wydziel wiersz do osobnego komponentu w `myIndicatorsFocus.ts`/nowym pliku w tym samym katalogu (dopisz go do „Zmieniaj” w PR).

## Testy
`tests/unit/my-indicators-focus.test.ts` (Vitest, czysta funkcja):
1. `focusAfterChange(['a','b','c'],'a','down')` → `{id:'a', control:'down'}` (fokus zostaje na przycisku).
2. Wiersz na krawędzi po przesunięciu (`['a','b']`, `'b'`, `'up'` – po ruchu jest pierwszy) → `{id:'b', control:'down'}`.
3. Usunięcie środkowego (`['a','b','c']`, `'b'`, `'remove'`) → `{id:'c', control:'remove'}`; usunięcie ostatniego → poprzedni (`'b'`).
4. Usunięcie jedynego → `'add'`.

`tests/unit/my-indicators-arrows.test.tsx` (`renderToString`, dane jak w `my-indicators-bar-rows.test.tsx`):
5. Z `reorder` wiersz ma przyciski „Przesuń Nazwa a wyżej/niżej”; bez `reorder` ich nie ma.
6. Pierwszy wiersz ma „wyżej” z `disabled`, ostatni „niżej” z `disabled`, środkowy oba aktywne.
7. Każdy z przycisków ‹ › ma klasę `min-h-[44px]` i `min-w-[44px]` (jak `BTN_44`).
8. `activeId='b'` → tylko wiersz `b` ma `aria-current="true"`; bez `activeId` żaden.
9. Przyciski ‹ › wołają `reorder.move(id, -1)` / `move(id, 1)` (sprawdź handler przez bezpośrednie wywołanie `props.onClick` na elemencie z drzewa `React.createElement` – albo przez wyrenderowanie funkcji wiersza; jeśli to niemożliwe w `node`, opisz w PR i pokryj e2e Playwright `@S` – patrz „Gotowe, gdy”).

## Gotowe, gdy
- Są przyciski ‹ › z poprawnymi etykietami i stanem `disabled` na krawędziach (test 5–6), ≥ 44 px (test 7).
- Aktywny wiersz ma `aria-current` (test 8).
- Reguły fokusu po przesunięciu i usunięciu są pokryte (testy 1–4); na podglądzie fokus faktycznie zostaje na przycisku (sprawdza właściciel – wpisz w „Co sprawdzić” w PR).
- Istniejący `my-indicators-bar-rows.test.tsx` i `use-my-indicators-move.test.tsx` zielone bez zmian.
Nie ruszaj: `src/view/hooks/useMyIndicators.ts`, `src/core/my-indicators/*`, `IndicatorPanel.tsx`, `MobileIndicatorBar.tsx`, `Rankings.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
