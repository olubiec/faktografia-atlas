# QC801 – Wspólny pasek „Kopiuj link · Pobierz i udostępnij”
Cel: Jeden komponent paska udostępniania, który zadziała na każdej stronie z danymi.
Zmieniaj: src/view/share/ShareBar.tsx, tests/unit/share-bar.test.tsx
Wymagane: tests/unit/share-bar.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/share/ShareDialog.tsx, ShareControls.tsx, LazyShareDialog.tsx (kod okna ładowany po kliknięciu), src/view/share/useShareData.ts, src/view/share/share-file.ts (jak działa schowek/udostępnianie), docs/PRODUKT.md §4b i D10, docs/STYL.md

## Kontekst
Dziś link i „Pobierz i udostępnij” są tylko na mapie, w profilu i w zakładce porównania. Właściciel chce tego na **każdej** stronie z danymi. Okno eksportu zostanie przebudowane dopiero w QC917; ten pasek ma działać już z obecnym `LazyShareDialog`.

## Research
1. Schowek: `navigator.clipboard.writeText` wymaga bezpiecznego kontekstu i zgody; sprawdź, czy `share-file.ts` ma gotową obsługę – użyj jej. Zapasowa ścieżka: pole z linkiem do zaznaczenia (`<input readOnly>` z `select()`).
2. Sprawdź `LazyShareDialog` – jakie propsy bierze (rodzaj karty, dane); pasek ma przyjąć `onOpenDialog: () => void` i sam **nie** importować ciężkiego kodu okna (PRODUKT §4b: kod ładowany po kliknięciu).
3. Napisy wyłącznie po polsku, krótko.

## Zadanie
`src/view/share/ShareBar.tsx`:
- Props: `{ url?: string /* domyślnie window.location.href */; onOpenDialog?: () => void; showDownload?: boolean /* domyślnie true */; label?: string }`.
- „Kopiuj link”: kopiuje `url`; przycisk zmienia tekst na „Skopiowano” na 2 s (`role="status"`, bez rozjazdu szerokości – stała min-szerokość), potem wraca; błąd schowka → pod paskiem pole z linkiem zaznaczonym do skopiowania i tekstem „Skopiuj ręcznie”.
- „Pobierz i udostępnij”: woła `onOpenDialog` (gdy `showDownload` i `onOpenDialog`).
- Układ: dwa przyciski obok siebie, na 390 px zawijają się jeden pod drugim, bez poziomego przewijania; ≥ 44 px; ikony z `Icon`.
- Brak efektów ubocznych przy samym renderze (żadnego kopiowania, żadnego pobierania danych).

## Testy
1. Klik „Kopiuj link” → `navigator.clipboard.writeText` wywołane z bieżącym adresem; tekst „Skopiowano”; po 2 s (fake timers) wraca „Kopiuj link”.
2. Podany `url` ma pierwszeństwo przed `location.href`.
3. Brak `navigator.clipboard` / odrzucenie obietnicy → widoczne pole z linkiem (`value` = adres), przycisk nie rzuca.
4. „Pobierz i udostępnij” woła `onOpenDialog` dokładnie raz; `showDownload={false}` ukrywa przycisk.
5. Render nie wywołuje `clipboard` ani `onOpenDialog` (brak efektów ubocznych).
6. Dostępność: oba przyciski mają nazwy; `aria-live` dla „Skopiowano”.
7. Brak importu `ShareDialog` w `ShareBar.tsx` (test czyta plik źródłowy lub sprawdza, że moduł nie ciągnie okna – np. `import.meta` nie; wystarczy `readFileSync` i `expect(src).not.toMatch(/ShareDialog/)`).

## Gotowe, gdy
- Klik kopiuje `location.href`; brak schowka → pole z linkiem do zaznaczenia; testy zielone.
Nie ruszaj: `ShareDialog.tsx`, `LazyShareDialog.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
