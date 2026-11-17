# QC919 – Okno eksportu na telefonie (390 px): układ i cele dotykowe
Cel: Strażnik układu mobilnego edytora zestawu: bez poziomego przewijania, przyciski ≥ 44 px, podgląd mieści się nad przyciskami.
Zmieniaj: tests/e2e/q-share-deck-mobile.spec.ts, src/view/share/ShareDialog.tsx
Wymagane: tests/e2e/q-share-deck-mobile.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-share-deck-mobile.spec.ts
Przeczytaj najpierw: src/view/share/ShareDialog.tsx (po QC917), tests/e2e/share-compare.spec.ts (część z geometrią przycisków – wzór), tests/e2e/helpers/mobile-audit.ts, tests/e2e/mobile-ux-geometry.spec.ts (**istniejące – nie zmieniaj**), docs/PRODUKT.md §5

## Kontekst
Właściciel ocenia z telefonu. Okno z paskiem stron, podglądem, danymi strony, formatem i 5 przyciskami jest wrażliwe na szerokość i wysokość ekranu. Test najpierw; poprawki układu w `ShareDialog.tsx` tylko jeśli test padnie (klasy tokenowe: `flex-col`, `min-w-0`, `max-h-[…]` z tokenów, wewnętrzne przewijanie okna).

## Research
Przeczytaj `mobile-audit.ts` i fragment `share-compare.spec.ts` sprawdzający rozmiar przycisków – użyj tych samych kontroli. Wyświetlaj okno w viewportach 390×844 i 360×740, oraz niskim 390×600 (klawiatura/przeglądarka z paskami).

## Scenariusze (`@Q`, mock sieci z fixture’ami; wejście z mapą i wybraną jednostką)
1. Otwarcie okna: `scrollWidth ≤ viewport` (całe okno i strona pod spodem).
2. Pasek stron: przewija się **wewnątrz** własnego kontenera (`scrollWidth > clientWidth` kontenera, ale nie strony); kafelek bieżącej strony widoczny w kontenerze.
3. Wszystkie `button` i `[role=menuitem]` w oknie: wysokość i szerokość ≥ 44 px.
4. Podgląd karty (`img` „Podgląd karty”) nie jest przykryty przyciskami: dolna krawędź podglądu ≤ górna krawędź pierwszego przycisku akcji **po przewinięciu okna do góry** (okno może się przewijać wewnętrznie; test sprawdza `boundingBox` po `scrollIntoView` podglądu).
5. „Dane na tej stronie” na telefonie domyślnie zwinięte (nie zasłania podglądu); rozwija się jednym tapem.
6. Menu „+ Dodaj stronę” mieści się w ekranie (prawa krawędź ≤ 390), pozycje ≥ 44 px.
7. Najdłuższa nazwa wskaźnika w „Dane na tej stronie” nie powoduje poziomego przewijania.
8. 390×600: przyciski dostępne przez przewinięcie okna; nic nie jest obcięte na stałe (ostatni przycisk „Zamknij” osiągalny).

## Gotowe, gdy
- 390 px: `scrollWidth ≤ 390`, przyciski ≥ 44 px, podgląd mieści się nad przyciskami; test zielony; istniejące testy bez zmian.
Nie ruszaj: logiki `useDeck`, `core/share/*`, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
