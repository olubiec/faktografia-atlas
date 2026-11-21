# QC510 – Polityka prywatności: jedno zdanie o liście „Moje wskaźniki”
Cel: Uczciwa informacja o tym, co zapisujemy w przeglądarce.
Zmieniaj: src/view/pages/Privacy.tsx, tests/unit/privacy-my-indicators.test.tsx
Wymagane: tests/unit/privacy-my-indicators.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/privacy.spec.ts
Przeczytaj najpierw: src/view/pages/Privacy.tsx, tests/e2e/privacy.spec.ts i tests/unit/privacy*.test.tsx (**istniejące – nie zmieniaj**), src/core/my-indicators/storage.ts (klucz), docs/PRODUKT.md §4f

## Kontekst
Zapis listy w `localStorage` to dane w przeglądarce użytkownika. Prywatność ma o tym mówić jasno i krótko, zgodnie z istniejącym tonem strony (bez żargonu). To dane **niebędące danymi osobowymi** (lista identyfikatorów wskaźników), zostają w przeglądarce i **nie trafiają do nas**.

## Research
Przeczytaj, jak `Privacy.tsx` opisuje inne wpisy w pamięci przeglądarki (np. zgodę na analitykę). Dopasuj styl: nagłówek lub punkt listy, ta sama długość zdań. Nie zmieniaj istniejących zdań.

## Zadanie
Dodaj punkt: „**Moje wskaźniki.** Lista wskaźników, które wybierasz, zapisuje się tylko w pamięci Twojej przeglądarki (klucz `faktografia-my-indicators`). To wyłącznie lista nazw wskaźników; nie wysyłamy jej do nas ani do nikogo innego. Usuniesz ją, czyszcząc dane strony w przeglądarce.”. Klucz w `<code>`.

## Testy
1. Strona zawiera tekst klucza `faktografia-my-indicators`.
2. Zawiera zdanie, że lista nie jest wysyłana („nie wysyłamy”).
3. Klucz w teście pochodzi z eksportu `MY_INDICATORS_KEY` (`storage.ts`) – jeśli kiedyś zmienimy klucz, test wymusi zmianę tekstu.
4. Istniejące testy prywatności (`privacy.spec.ts` e2e, unit) zielone bez zmian.

## Gotowe, gdy
- Test znajduje nazwę klucza na stronie; istniejące testy bez zmian.
Nie ruszaj: `core/consent`, `view/consent`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
