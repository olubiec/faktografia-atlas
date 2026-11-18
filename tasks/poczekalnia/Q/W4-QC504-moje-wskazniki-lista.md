# QC504 – Lista „Moje wskaźniki” z × i strzałkami
Cel: Gotowy komponent listy, który pokazuje wskaźniki użytkownika, pozwala usuwać, zmieniać kolejność i przywracać podstawowe.
Zmieniaj: src/view/my-indicators/MyIndicatorsList.tsx, tests/unit/my-indicators-list.test.tsx
Wymagane: tests/unit/my-indicators-list.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/my-indicators/useMyIndicators.ts (QC503), src/core/my-indicators/my-indicators.ts, src/view/ui/Icon.tsx (ikony z iconoir-react), src/components/ui/button.tsx, docs/PRODUKT.md §4f, docs/STYL.md

## Kontekst
Komponent będzie użyty w trzech miejscach (panel mapy, arkusz telefonu, Biblioteka), więc ma być **neutralny**: dostaje opcjonalne `onSelect`, `activeId`, `onAdd`. Dane (nazwy, jednostki) przychodzą propsem `indicators: Map<string, { name: string; unit: string }>`, żeby nie zależał od źródła (rejestr z QC602 dojdzie później).

## Research
1. Ikony: wyłącznie `Icon` z `src/view/ui` (iconoir-react) – × i strzałki ‹ ›; **żadnego lucide**.
2. Strzałki zamiast przeciągania (D7: przeciąganie to „Później”).
3. Id bez wpisu w `indicators` (np. biblioteka jeszcze się nie wczytała) → pokaż id jako tekst zastępczy, nie wyjątek.

## Zadanie
`src/view/my-indicators/MyIndicatorsList.tsx`:
- Props: `{ indicators: Map<string,{name:string;unit:string}>; activeId?: string | null; onSelect?: (id: string) => void; onAdd?: () => void; compact?: boolean }`.
- Lista z `useMyIndicators()`: wiersz = przycisk z nazwą i jednostką (klik → `onSelect(id)`, zaznaczony `aria-current="true"` gdy `id===activeId`), obok `×` (aria-label „Usuń <nazwa> z moich wskaźników”), `‹` `›` (aria-label „Przesuń <nazwa> wyżej/niżej”; pierwszy ma ‹ wyłączone, ostatni › wyłączone).
- Pod listą: „+ Dodaj wskaźnik” (jeśli `onAdd`) i „Przywróć podstawowe” (wyłączone/ukryte, gdy `isBasic`).
- Pusta lista: tekst „Nie masz jeszcze wskaźników” + duży przycisk „Dodaj pierwszy wskaźnik”.
- Każdy element interaktywny ≥ 44 px, napisy zawijają się w wierszu (długie nazwy), focus widoczny.
- Po usunięciu fokus przechodzi na następny wiersz (lub „Dodaj”), nie ginie.

## Testy (Testing Library)
1. Domyślnie renderuje 7 wierszy z nazwami (przekaż mapę z `config/indicators.json`).
2. × usuwa wiersz (lista ma 6), `useMyIndicators().list` też.
3. „Przywróć podstawowe” po usunięciu 3 → 7 wierszy w kolejności bazowej; przycisk nieaktywny, gdy `isBasic`.
4. › pierwszego zamienia kolejność z drugim; ‹ pierwszego jest `disabled`.
5. Pusta lista → przycisk „Dodaj pierwszy wskaźnik” woła `onAdd`.
6. Klik w nazwę woła `onSelect(id)`; aktywny ma `aria-current`.
7. Id spoza mapy → wiersz z id i bez wyjątku.
8. Po usunięciu fokus nie jest na `body` (`document.activeElement !== document.body`).
9. Wszystkie przyciski mają dostępną nazwę i wysokość/szerokość ≥ 44 px (klasa tokenowa lub styl).

## Gotowe, gdy
- × usuwa wiersz; „Przywróć” wraca do 7 podstawowych; pola ≥ 44 px; testy zielone.
Nie ruszaj: `useMyIndicators.ts`, `core/my-indicators/*`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
