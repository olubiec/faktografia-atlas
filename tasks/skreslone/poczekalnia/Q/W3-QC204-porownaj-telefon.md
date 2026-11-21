# QC204 – Porównaj na telefonie (390 px): pola jedno pod drugim, bez poziomego przewijania
Cel: Strażnik układu mobilnego dla Porównaj oraz poprawki układu, jeśli test padnie.
Zmieniaj: tests/e2e/q-compare-mobile.spec.ts, src/view/pages/ComparePage.tsx
Wymagane: tests/e2e/q-compare-mobile.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-compare-mobile.spec.ts
Przeczytaj najpierw: src/view/pages/ComparePage.tsx (po QC203), tests/e2e/mobile-layout.spec.ts, tests/e2e/mobile-ux-geometry.spec.ts, tests/e2e/helpers/mobile-audit.ts, docs/PRODUKT.md §5, docs/STYL.md

## Kontekst
Właściciel ocenia z telefonu. Strona z dwoma polami i tabelą jest wrażliwa na szerokość. Istniejący pomocnik `tests/e2e/helpers/mobile-audit.ts` już sprawdza geometrię – **użyj go**, nie pisz własnego audytu.

## Research
Przeczytaj `mobile-audit.ts` i jeden speca, który go używa (`mobile-ux-geometry.spec.ts`): jakie ma funkcje (poziome przewijanie, rozmiar celów dotykowych, wystawanie elementów poza ekran). Zastosuj te same kontrole na `/porownaj`.

## Zadanie
1. Napisz `tests/e2e/q-compare-mobile.spec.ts` (`@Q`, viewport 390×844, 360×740): scenariusze niżej.
2. Uruchom; jeśli któryś pada – popraw **układ** w `ComparePage.tsx` (klasy Tailwind z tokenów: `flex-col` poniżej `md`, `min-w-0`, `break-words`, tabela w przewijanym **wewnętrznie** kontenerze `overflow-x-auto` z `role="region"` i `tabindex=0` tylko jeśli tabela jest szersza niż ekran). Nie zmieniaj logiki z QC203.
3. Nie zmieniaj istniejących testów.

## Scenariusze testu
1. 390 px: pole A nad polem B (współrzędna `y` B > `y` A + wysokość A), „Zamień miejsca” widoczny i klikalny.
2. Po wybraniu „Kraków” i „Wrocław”: `scrollWidth ≤ 390` całej strony; tabela nie wystaje poza ekran poza własnym kontenerem przewijania.
3. Wszystkie `button`, `input`, `[role=option]` na stronie mają wysokość i szerokość ≥ 44 px (z wyjątkiem inline linków tekstowych).
4. Lista podpowiedzi nie wychodzi poza ekran (prawa krawędź ≤ 390), pozycje mają ≥ 44 px wysokości.
5. Najdłuższa nazwa („Powiat kędzierzyńsko-kozielski”) w nagłówku tabeli nie wystaje poza kolumnę (zawinięcie/obcięcie), brak poziomego przewijania strony.
6. 360 px: to samo co 2.
7. Klawiatura ekranowa: po focusie na polu zawartość nie ginie (pole nadal widoczne – `scrollIntoView` wystarczy; sprawdź `boundingBox` w obrębie viewportu).

## Gotowe, gdy
- 390 px: pola jedno pod drugim, `scrollWidth ≤ 390`, pola ≥ 44 px; test zielony; istniejące testy mobilne bez zmian.
Nie ruszaj: logiki wyboru miejsc, `PlacePicker.tsx`, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
