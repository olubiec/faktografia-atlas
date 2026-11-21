# PX02 – [CZEKA NA ZGODĘ D3] Test `picker-scroll`: jednoznaczny selektor okna wyboru wskaźnika
Cel: Test „indicator picker fits in viewport…” przestaje być losowo czerwony, bo mierzy właściwe okno, a nie „pierwszy pasujący z wielu”.
STATUS: **Nie puszczać bez zgody właściciela (decyzja D3 w docs/PLAN-POPRAWEK.md) i dopiero po scaleniu FIX4** (FIX4 przebudowuje okno wyboru wskaźnika, więc przyczynę trzeba ustalić na nowym kodzie). To zmiana istniejącego testu.
Zmieniaj: tests/e2e/picker-scroll.spec.ts
Wymagane: tests/e2e/picker-scroll.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/picker-scroll.spec.ts --repeat-each=10
Przeczytaj najpierw: tests/e2e/picker-scroll.spec.ts (linie ~25–55: `page.locator('[role="dialog"], [data-slot="popover-content"]').boundingBox()`), src/view/controls/IndicatorPicker.tsx (po FIX4), src/view/main/MobileIndicatorBar.tsx (arkusz `role="dialog"` „Panel wskaźnika”), tests/e2e/mobile-indicator-sheet.spec.ts

## Kontekst
Selektor `[role="dialog"], [data-slot="popover-content"]` łączy dwa różne elementy. Na telefonie otwarty jest jednocześnie arkusz „Panel wskaźnika” (`role="dialog"`) i okno listy wskaźników (`data-slot="popover-content"`): `locator(...).boundingBox()` bierze pierwszy dopasowany element w kolejności DOM albo zgłasza błąd dopasowania wielu elementów – zależnie od momentu renderowania. Stąd losowość (flaky) na „390x844 (mobile)” i na niskim ekranie. FIX2 już raz zmieniał ten plik; ustalamy przyczynę dowodem, nie zgadywaniem.

## Research (obowiązkowy, 15 min)
1. Po scaleniu FIX4: `pnpm build && pnpm exec playwright test tests/e2e/picker-scroll.spec.ts --repeat-each=20`; zapisz, które przebiegi padają i na której asercji.
2. W nieudanym przebiegu wypisz `await page.locator('[role="dialog"], [data-slot="popover-content"]').count()` – jeśli > 1, przyczyna potwierdzona.
3. Jeśli przyczyna jest inna (np. przewijanie listy po FIX4), opisz ją w PR i zatrzymaj się – nie zgaduj poprawki.

## Zadanie
Zamień **tylko** selektor okna na jednoznaczny: element z `data-slot="popover-content"`, który zawiera `listbox` o nazwie „Lista wskaźników” (np. `page.locator('[data-slot="popover-content"]').filter({ has: popover })`), i mierz jego `boundingBox()`. Pozostałe asercje (mieści się w ekranie, pole szukania widoczne, wybór ostatniego, `?i=` w adresie) bez zmian. Komentarz po polsku, dlaczego selektor jest zawężony.

## Testy
1. `--repeat-each=10` na obu rozmiarach (390×844 i 1440×600): 20/20 zielone.
2. Drugi test w pliku (przewijanie panelu, „ranking and footer are visible”) zielony bez zmian.
3. Asercja `popoverBox.y + popoverBox.height <= height + 2` nadal istnieje i nadal pada, gdy okno wystaje poza ekran (sprawdź lokalnie, tymczasowo zwiększając wysokość okna w kodzie – eksperyment nie wchodzi do commita; wynik w opisie PR).

## Gotowe, gdy
- 20/20 zielone; w opisie PR zdanie dla właściciela: „Test mierzył niewłaściwe okno, gdy na telefonie otwarte są dwa; teraz mierzy to jedno, które trzeba”.
Nie ruszaj: kodu źródłowego, innych testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
