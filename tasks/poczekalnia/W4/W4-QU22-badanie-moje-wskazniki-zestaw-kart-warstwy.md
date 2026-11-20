# QU22 – Badanie: logika „Moje wskaźniki” / wskaźnik mapy / zestaw kart, warstwa zakładki „Przewiń w dół”, pasek stron bez strzałek
Cel: jeden raport dla uwag 12, 14 i 15 (połączone QU22+QU23+QU24); bez zmiany kodu strony.
Zmieniaj: docs/research/QU22-moje-zestaw-warstwy-pasek.md
Wymagane: docs/research/QU22-moje-zestaw-warstwy-pasek.md
Weryfikacja: pnpm lint
Zależy od: dobrze po raporcie QU01 (docs/research/q2-udostepnianie-przelaczanie.md), ale może iść równolegle; wdrożenie QU10 czeka na oba.
Kolizje plików: brak (nowy plik w docs/research). Wdrożenia z raportu dotkną `ShareDialog.tsx`/`DeckStrip.tsx` – tak samo QU10 i QC915/QC917, więc kolejność: QU10 → zadanie z tego raportu. Token z-index = `config/tokens.json` (zmiana tylko za zgodą właściciela; Home.tsx chroniony).
Przeczytaj najpierw: src/view/hooks/useMyIndicators.ts, src/view/main/IndicatorPanel.tsx, src/view/main/MobileIndicatorBar.tsx, src/view/pages/MyIndicatorsBar.tsx, src/view/share/ShareDialog.tsx, src/view/share/useShareData.ts, src/view/share/AddPageMenu.tsx, src/view/share/ShareControls.tsx, src/view/share/DeckStrip.tsx, src/core/share/deck.ts, src/core/share/deck-page-data.ts, tests/unit/deck-strip.test.tsx, src/view/Home.tsx (tylko czytanie: linia z napisem „Przewiń w dół”, `z-[60]`), config/tokens.json, src/components/ui/dialog.tsx, docs/PLAN-UWAGI-19-11.md (uwagi 12, 14, 15)

## Kontekst
Uwaga 12: karta powiatu Chorzów pokazuje wskaźnik mapy (saldo migracji), a lista „Moich wskaźników” nie wpływa na udostępnianie. Uwaga 14: pasek „Przewiń w dół…” nakłada się na okno udostępniania. Uwaga 15: pasek stron ma strzałki ‹ › i „×” przy każdej stronie; ma być przeciąganie.

## Zadanie
1. Stany: opisz trzy źródła (wskaźnik mapy z `useMainView`, lista „Moje” z `useMyIndicators`, zestaw kart w oknie z `deck.ts`). Tabela „akcja użytkownika → co się zmienia (plik:linia) → co powinno”. Zaproponuj jedną zasadę (np. okno zaczyna od wskaźnika mapy, „+ Dodaj stronę” podpowiada z „Moich”).
2. Z-index: wypisz wszystkie klasy `z-[…]`/`z-…` w `src/` (grep) z elementem i wartością; pokaż, który element przykrywa okno (portal `dialog.tsx`), i zaproponuj nazwę oraz wartość tokenu w `config/tokens.json`/@theme (bez edycji pliku). Pamiętaj: `Home.tsx` i tokeny wymagają zgody właściciela.
3. Pasek stron: opisz dzisiejsze akcje (strzałki, ×, kafelek) i wariant przeciągania (mysz + dotyk, np. Pointer Events własnym kodem; dostępność z klawiatury przez menu „Przenieś”; „+ Dodaj stronę” zawsze widoczny; pola ≥44 px; `prefers-reduced-motion`). Sprawdź, czy któryś istniejący test (`deck-strip.test.tsx`, `share-deck-*.test.tsx`) wymaga strzałek – jeśli tak, to blokada (istniejących testów nie zmieniamy).
4. Struktura raportu (≤120 linii): Fakty (plik:linia) · Wnioski · Warianty z kosztem · Rekomendacja · Pytania do właściciela. Warianty z kosztem (pliki, linie, ryzyko) po min. 2 dla każdej z trzech uwag.
Gotowe, gdy:
- raport zawiera tabelę „akcja → co się zmienia” dla co najmniej 8 akcji (zmiana wskaźnika mapy, dodanie/usunięcie w „Moich”, dodanie strony, zmiana jednostki…)
- raport zawiera pełną listę elementów z z-index z nazwami plików i wskazuje przykrywający element
- raport podaje, które istniejące testy dotykają strzałek/× paska (nazwy plików i testów) i czy blokują wariant
- raport kończy się listą zadań wdrożeniowych z plikami, kolejnością względem QU10/QC915/QC917 i sekcją „Pytania do właściciela”
- `pnpm lint` przechodzi
Nie ruszaj: kod strony (src/, tests/), config/tokens.json, wzorce zrzutów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
