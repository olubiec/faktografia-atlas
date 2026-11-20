# QC508 – Komunikat po dodaniu/usunięciu z „Moich” w Bibliotece
Cel: Po kliknięciu „Dodaj do Moich wskaźników” / „Dodano do Moich · usuń” pojawia się krótki komunikat (`role="status"`), który sam znika po 3 s.
Zależy od: nic (przycisk `AddToMineButton` już jest na main i jest użyty w `LibraryVariable.tsx:307` oraz `LibraryResults.tsx:117`).
Kolizje plików: żadne inne zadanie W4 nie rusza `AddToMineButton.tsx`. QU11/QU12 (W5) ruszają widoki biblioteki – wykonaj QC508 przed nimi.
Zmieniaj: src/view/library/AddToMineButton.tsx, tests/unit/add-to-mine-status.test.tsx (nowy)
Wymagane: tests/unit/add-to-mine-status.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/library/AddToMineButton.tsx, src/view/hooks/useMyIndicators.ts, src/view/share/ShareBar.tsx (wzorzec `COPIED_MS` + `useRef` timera), tests/unit/library-add-to-mine.test.tsx (**istniejący – nie zmieniaj**), docs/STYL.md

## Kontekst
Stara nazwa z dawnego promptu (`MyToggleButton`, `src/view/my-indicators/`) **nie istnieje**. Komponent to `AddToMineButton({ varId, name })`: przełącza `add/remove` z `useMyIndicators()`, ma `aria-pressed`, `data-testid="add-to-mine"`, etykiety „Dodaj do Moich wskaźników: <nazwa>” / „Usuń z Moich wskaźników: <nazwa>” i ≥ 44 px. **Tego nie zmieniasz** (istniejący test sprawdza te etykiety). Brakuje tylko komunikatu.

## Zadanie
W `AddToMineButton.tsx` (dziś 24 linie):
- Po kliknięciu pokaż obok przycisku `<span role="status">`: „Dodano do Moich wskaźników” po dodaniu, „Usunięto z Moich wskaźników” po usunięciu. Region `role="status"` jest w DOM od początku (pusty), żeby czytnik ekranu odczytał zmianę; tekst wstawiany po kliknięciu.
- Komunikat znika po 3000 ms: stała `STATUS_MS = 3000` w pliku (to czas wyświetlania, nie animacji – nie ma na niego tokenu `motion`; wzorzec: `COPIED_MS` w `ShareBar.tsx`). Timer w `useRef`, czyszczony przy kolejnym kliknięciu i przy odmontowaniu.
- Szybkie dwa kliknięcia: widoczny jest komunikat po ostatnim, 3 s liczone od ostatniego kliknięcia.
- `prefers-reduced-motion`: komunikat pojawia się i znika bez animacji (żadnego fade/slide; jeśli dodasz przejście, tylko z klasą `motion-reduce:transition-none`). Kolory/rozmiar tekstu z tokenów (`text-xs text-olowek`).
- Układ: przycisk i komunikat w `inline-flex flex-wrap items-center gap-2`; na 390 px bez poziomego przewijania; napis nie wychodzi poza pole.

## Testy
Plik `tests/unit/add-to-mine-status.test.tsx` (nowy; `vi.useFakeTimers()`; interakcje przez `@testing-library/react` jeśli jest w repo – sprawdź `package.json` – inaczej przez `createRoot` + `act`; stan `localStorage` czyszczony w `beforeEach`):
1. Klik „Dodaj do Moich wskaźników: X” → w `role="status"` tekst „Dodano do Moich wskaźników”.
2. Po `vi.advanceTimersByTime(2999)` komunikat nadal jest, po 3000 ms region jest pusty.
3. Klik „Usuń…” → „Usunięto z Moich wskaźników”, a po 3 s znika.
4. Dwa kliknięcia w odstępie 2 s: po kolejnych 2 s komunikat jeszcze jest (liczone od ostatniego kliknięcia), po 1 s dalej znika.
5. Przed pierwszym kliknięciem region `role="status"` istnieje i jest pusty.
6. Odmontowanie komponentu przed upływem 3 s nie zgłasza ostrzeżeń ani błędów (timer wyczyszczony).
7. Istniejący `library-add-to-mine.test.tsx` przechodzi bez zmian (etykiety przycisku, `aria-pressed`).

## Gotowe, gdy
- Komunikat pojawia się po kliknięciu i znika po 3 s (testy 1–4); region `role="status"` obecny od początku (test 5); timer sprzątany (test 6); istniejący test bez zmian (test 7).
Nie ruszaj: `useMyIndicators.ts`, `LibraryVariable.tsx`, `LibraryResults.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
