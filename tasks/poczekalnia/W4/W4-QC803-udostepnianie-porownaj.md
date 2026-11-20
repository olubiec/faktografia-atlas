# QC803 – Pasek udostępniania na stronie Porównaj
Cel: `/porownaj` pokazuje „Kopiuj link · Pobierz i udostępnij” tylko wtedy, gdy wybrano dwa miejsca i porównanie jest gotowe; okno otwiera kartę „compare”.
Zależy od: QC801 (`ShareBar`, na main), QC203/QC204 (na main), QC612 (wiersze biblioteki w tabeli – jeśli jeszcze nie na main, karta pokazuje wiersze z profili, patrz Zadanie).
Kolizje plików: `ComparePage.tsx` (180 linii) ruszają też QC205 i QC610/QC612 (W5 i starsze) – QC803 idzie po nich albo scala się przez `git merge origin/main`; QC803 dodaje tylko import i jedno użycie, reszta w nowym pliku.
Zmieniaj: src/view/pages/ComparePage.tsx, src/view/pages/CompareShare.tsx (nowy), tests/unit/compare-page-share.test.tsx (nowy)
Wymagane: tests/unit/compare-page-share.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/share-compare.spec.ts
Przeczytaj najpierw: src/view/pages/ComparePage.tsx (180 linii – limit ~200, więc pasek w nowym pliku; `pair`, `profileA`, `profileB`, `units`, `list`), src/view/profile/ProfileCompare.tsx (wzorzec: `shareData` ok. linii 234–330, przycisk i `LazyShareDialog` ok. linii 476–486), src/view/share/ShareBar.tsx, src/view/share/LazyShareDialog.tsx, src/core/share/card-compare.ts (`CompareCardData`, `CompareCardRow`; `features` i `classOf` są opcjonalne), src/core/compare/compare.ts (`compare`), src/core/compare/compare-url.ts (`writeCompareSearch`), src/view/compare/CompareIndicatorPicker.tsx (`restrictProfile`), src/core/units/label.ts (`unitTitle`), docs/PRODUKT.md §4a, §4b

## Kontekst
Zakładka „Porównaj” w profilu ma już eksport (`ProfileCompare.tsx`); `/porownaj` jeszcze nie. Pasek ma się pojawić dopiero przy **dwóch** miejscach (`profileA && profileB`, czyli wtedy, gdy renderuje się `comparison-result`). Istniejący `tests/e2e/share-compare.spec.ts` sprawdza profil (`?u=12&c=12,24`), nie `/porownaj` – ma zostać zielony bez zmian.

## Zadanie
- Nowy `CompareShare.tsx`: propsy `{ pair: ComparePair; profileA: UnitProfile; profileB: UnitProfile; list: readonly string[] }`. Renderuje `<ShareBar url onOpenDialog />` i `<LazyShareDialog isOpen onClose defaultKind="compare" data={{ compare: card }} />`, stan otwarcia lokalny.
- `url` = `window.location.origin + window.location.pathname + writeCompareSearch(pair)` (zawiera `?c=<a>,<b>`).
- `card` (`CompareCardData`) wzorem `ProfileCompare.tsx`: `compare(restrictedA, restrictedB)` na profilach zawężonych `CompareIndicatorPicker.restrictProfile(profile, list)` (karta = to, co w tabeli), wiersze tylko z oboma wartościami, `valA`/`valB` przez `formatValue`, `diffText` z wyniku; `unitA`/`unitB` = `{ name: unitTitle(unit) lub 'TERYT …', teryt }`; `indicatorName` jak we wzorcu, `year` jak we wzorcu. Mapki w karcie (`features`, `classOf`) pomiń – pola opcjonalne; nie ładuj dodatkowych danych.
- `ComparePage.tsx`: `<CompareShare … />` w bloku `comparison-result`, pod tabelą (nie zasłania pól; 390 px bez poziomego przewijania).

## Testy (tests/unit/compare-page-share.test.tsx, profile z `tests/fixtures`, loadery zamockowane)
1. Bez pary i z samym A (`?c=14`) pasku nie ma; po ustawieniu B (`?c=14,12`) i załadowaniu obu profili jest (`getByRole('button', { name: /Kopiuj link/ })`).
2. Klik „Kopiuj link” → schowek dostaje adres z `c=14,12` (dokładne kody z testu).
3. „Pobierz i udostępnij” → zamockowany `LazyShareDialog` dostaje `defaultKind="compare"`, `data.compare.unitA.teryt === '14'` i `unitB.teryt === '12'`.
4. Po kliknięciu „Zamień miejsca” link ma `c=12,14`, a `unitA.teryt` karty to `12`.
5. Wiersze karty = wiersze tabeli dla bieżącej listy „Moje wskaźniki” (po `remove` jednego wskaźnika karta ma o 1 wiersz mniej).
6. Plik `ComparePage.tsx` i `CompareShare.tsx` ≤ 200 linii (test czyta pliki).
7. W weryfikacji uruchom `tests/e2e/share-compare.spec.ts` – musi być zielony bez zmian.

## Gotowe, gdy
- Pasek tylko przy dwóch miejscach (test 1); link z `?c=` (testy 2, 4).
- Okno otwiera kartę „compare” dla obu miejsc (test 3), karta zgodna z tabelą (test 5).
- Limit rozmiaru plików (test 6); `share-compare.spec.ts` i testy `compare-*` bez zmian i zielone.
Nie ruszaj: `ShareBar.tsx`, `compare-url.ts`, `ProfileCompare.tsx`, `useShareData.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
