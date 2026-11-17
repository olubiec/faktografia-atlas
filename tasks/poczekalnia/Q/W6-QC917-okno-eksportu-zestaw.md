# QC917 – Okno „Pobierz i udostępnij” jako edytor zestawu stron
Cel: Okno łączy pasek stron, podgląd bieżącej strony, „Dane na tej stronie”, format i motyw dla całego zestawu oraz przyciski pobierania (strona, wszystkie, zestaw, CSV).
Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareControls.tsx, tests/unit/share-dialog-deck.test.tsx
Wymagane: tests/unit/share-dialog-deck.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/share-dialog.spec.ts tests/e2e/share-map.spec.ts tests/e2e/share-profile.spec.ts tests/e2e/share-compare.spec.ts tests/e2e/s19-share.spec.ts
Przeczytaj najpierw: src/view/share/{ShareDialog,ShareControls,LazyShareDialog,CardSvg,render-png,share-file,useDeck,DeckStrip,AddPageMenu,PageDataEditor}.tsx|ts (QC912–QC916), src/core/share/{deck-scene,deck-csv,csv,formats}.ts, **wszystkie istniejące testy udostępniania** (tests/e2e/share-*.spec.ts, s19-share.spec.ts, tests/unit/share-*.test.ts – **nie zmieniaj**), docs/PRODUKT.md §4b, docs/STYL.md

## Kontekst
To jest zadanie, w którym właściciel zobaczy „× i + na każdej stronie”. Wszystkie elementy istnieją osobno (QC901–QC916); tu je składamy. **Istniejące e2e udostępniania nie mogą paść ani się zmienić** – opierają się na tych nazwach, które MUSZĄ zostać: dialog `Pobierz i udostępnij`, przyciski `Pobierz obraz`, `Pobierz dane (CSV)`, `Zamknij`, obraz `Podgląd karty`, przyciski otwierające (`Pobierz i udostępnij mapę` itd.). Jeśli któryś z nich zakłada 4 stałe karty (np. „Profil” jako przycisk wyboru) i nie da się go zachować – **zatrzymaj się i opisz w PR**; zachowanie zgodności przez zachowanie roli i nazwy przycisku wyboru strony („Mapa”, „Ranking”, „Profil”, „Porównanie” jako nazwy kafelków paska stron) jest preferowane.

## Research
1. Przeczytaj, jak dziś `ShareDialog` generuje PNG (`render-png.ts`), pobiera plik (`share-file.ts`) i udostępnia systemowo (`navigator.share({ files })`). Wykorzystaj to dla **wielu** plików.
2. Kod okna jest ładowany po kliknięciu (`LazyShareDialog`) – nie importuj okna w ścieżce wejściowej; nowe moduły (`useDeck`, `DeckStrip` …) trafiają do tego samego osobnego pliku JS.
3. Systemowe udostępnianie wielu plików (`navigator.canShare({ files })`): na telefonie „Udostępnij zestaw” wysyła wszystkie PNG naraz; gdy przeglądarka nie obsługuje – pobiera kolejne pliki (jak dziś).
4. D9: **bez ZIP** (nowy pakiet = osobna decyzja). „Pobierz wszystkie” = N kolejnych pobrań PNG (z małym odstępem, żeby przeglądarka nie zablokowała serii; sprawdź, jak robi to dzisiejszy „Udostępnij zestaw”).

## Zadanie
- `ShareDialog`: używa `useDeck` (QC912) z `entry` i `ctx` przekazanymi propsami (dostarczy je QC918; do tego czasu domyślne wartości odtwarzają dotychczasowe zachowanie: zestaw z kart dostępnych w danych).
- Układ: u góry `DeckStrip` (QC913) + `AddPageMenu` (QC914); środek – podgląd bieżącej strony (`pageScene` + `CardSvg`); pod podglądem `PageDataEditor` (QC915); niżej `ShareControls` ze **wspólnym** formatem i motywem; na dole przyciski.
- Przyciski (zachowaj nazwy istniejących): „Pobierz obraz” (bieżąca strona), „Pobierz wszystkie (N)” (nowy), „Udostępnij zestaw” (istniejący, teraz cały zestaw), „Pobierz dane (CSV)” (bieżąca strona) i „Pobierz dane zestawu (CSV)” (nowy, `deckCsv`), „Zamknij”.
- `ShareControls`: usuń wybór „Karta” (zastąpiony paskiem stron), ale zachowaj eksport typów i komponent (importują go testy/inne pliki – sprawdź `rg ShareControls`); format i motyw jak dotąd.
- Zdanie o prawach („Możesz używać i udostępniać, podając źródło: Faktografia Atlas, dane GUS”) zostaje.
- Układ 390 px bez poziomego przewijania; podgląd mieści się nad przyciskami; przyciski ≥ 44 px; pasek stron przewija się wewnątrz.
- Strona bez danych (`pageScene → null`): podgląd „Brak danych dla tej strony” + podpowiedź „Zmień wskaźnik lub usuń stronę”, pobieranie tej strony wyłączone, „Pobierz wszystkie” pomija ją i mówi o tym w komunikacie.

## Testy (`tests/unit/share-dialog-deck.test.tsx`, rysowanie PNG zamockowane)
1. Okno ma nazwę „Pobierz i udostępnij”, pasek stron z „1/N …”, podgląd (`img` „Podgląd karty”), przyciski o istniejących nazwach.
2. × na stronie 2 z 4 → pasek pokazuje „1/3, 2/3, 3/3”.
3. „+ Dodaj stronę” → „Tabela” → nowa strona za bieżącą, numeracja przeliczona, podgląd się zmienia.
4. „+ Dodaj dane” (strona Tabela) → wskaźnik z biblioteki (mock loadera) → **jedno** żądanie; wiersz w „Dane na tej stronie”.
5. „Pobierz wszystkie (N)” wywołuje zapis dokładnie **N** plików; nazwy plików unikalne i z numerem strony (np. `…-1z4.png` – użyj `shareFileName` z `csv.ts`, rozszerz tam tylko jeśli konieczne i wtedy dopisz plik do opisu PR/„Zmieniaj” po zgodzie).
6. Format zmieniony w `ShareControls` zmienia scenę **wszystkich** stron (sprawdź wywołania `pageScene` z nowym formatem).
7. „Udostępnij zestaw” z `navigator.canShare({files})=true` woła `navigator.share` z N plikami; przy `false` – pobiera kolejno.
8. „Pobierz dane zestawu (CSV)” zawiera sekcje „Strona n/N”.
9. Strona bez danych: podgląd z komunikatem, „Pobierz obraz” wyłączone.
10. **Istniejące** testy i e2e udostępniania zielone bez zmian (uruchom wszystkie z linii Weryfikacja).
11. Kod okna nadal ładowany leniwie: test czyta `LazyShareDialog.tsx` i sprawdza `import(`/`lazy(` (nie ma statycznego importu `ShareDialog`).

## Gotowe, gdy
- Test jednostkowy przycisków; „Pobierz wszystkie” tworzy N plików; kod okna ładowany po kliknięciu; wszystkie istniejące testy udostępniania bez zmian.
Nie ruszaj: `LazyShareDialog.tsx`, `useShareData.ts` (QC918), istniejących testów, `csv.ts` bez zgody.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
