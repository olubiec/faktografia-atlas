# QC405 – Kafelki wchodzą falą (< 1 s), a kolory przelewają się 300 ms
Cel: Wejście w głąb pokazuje jednostki „kafelek po kafelku” (postęp 0→1 w < 1 s), zmiana wskaźnika/roku przelewa kolory 300 ms.
Zmieniaj: src/view/map/hooks/useChoropleth.ts, tests/e2e/q-reveal-colors.spec.ts
Wymagane: tests/e2e/q-reveal-colors.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-reveal-colors.spec.ts tests/e2e/color-transition.spec.ts
Przeczytaj najpierw: docs/research/q-c401-ruch-mapy.md (QC401, punkty (h) i (i)), src/view/map/hooks/useChoropleth.ts, src/core/map/reveal.ts (`revealPlan`), src/core/map/test-seam.ts (`RevealSeamState`), tests/e2e/color-transition.spec.ts, tests/unit/reveal*.test.ts, docs/PRODUKT.md §5a

## Zgoda na plik ekranu
Ten prompt **wprost** pozwala zmienić `src/view/map/hooks/useChoropleth.ts`. Innych plików `map/hooks/*` nie ruszaj.

## Kontekst
PRODUKT §5a: jednostki niższego poziomu pojawiają się kafelek po kafelku od środka, cała fala < 1 s; zmiana wskaźnika/roku – kolory 300 ms. Właściciel nie widzi animacji. Raport QC401 mówi, czy to nie działa (np. `reveal` startuje za późno, brak `transitions`, deck.gl nie dostaje `updateTriggers`, czas liczony od złej chwili).

## Research
1. Przeczytaj w raporcie QC401 wyniki dla (h) i (i) i trzymaj się jego przyczyn.
2. deck.gl: `transitions: { getFillColor: 300 }` działa, gdy zmienia się **wartość akcesora z `updateTriggers`**; przy zmianie danych (nowa geometria) przejścia nie ma. Sprawdź w `node_modules/@deck.gl/layers` / dokumentacji wersji z `package.json` i opisz wniosek w komentarzu nad warstwą (2 zdania).
3. `revealPlan`: sprawdź, jak liczy opóźnienia kafelków i czy suma < 1 s dla 2 500 jednostek (jest test jednostkowy – nie zmieniaj go).

## Zadanie
- Napraw w `useChoropleth.ts` to, co wskazał raport: start `reveal` przy wejściu w głąb, aktualizacja `progress` w czasie rzeczywistym (requestAnimationFrame lub czas z deck.gl), kolory z `transitions` 300 ms przy zmianie wskaźnika/roku.
- `prefers-reduced-motion`: `progress` skacze do 1 w jednej klatce, przejście kolorów 0 ms.
- `window.__atlas.reveal` (`running`, `progress`) odzwierciedla stan w trakcie.

## Testy (`tests/e2e/q-reveal-colors.spec.ts`, `@Q`, `?e2e`)
1. Klik w województwo: `reveal.running` staje się `true`; `progress` rośnie od 0 do 1; czas od startu do `progress===1` < 1000 ms; zarejestrowane **co najmniej 3 wartości pośrednie**.
2. Po zakończeniu `reveal.running === false`.
3. Zmiana wskaźnika: `__atlas.choropleth.indicatorId` zmienia się, a próbkowanie koloru wybranej jednostki (jeśli szew go wystawia; jeśli nie – asercja przez `reveal`/stan przejścia z istniejącego `color-transition.spec.ts`) pokazuje przejście trwające ~300 ms (±150).
4. `reducedMotion: 'reduce'`: `progress` = 1 po pierwszym odczycie, brak wartości pośrednich.
5. Istniejący `color-transition.spec.ts` zielony bez edycji.
6. Test jednostkowy/regresyjny: wejście w głąb nie robi dodatkowych żądań danych (zlicz żądania – bez zmiany liczby względem stanu przed zadaniem).

## Gotowe, gdy
- E2E przez `__atlas.reveal`: postęp rośnie od 0 do 1 w < 1 s; zmiana wskaźnika – kolory przechodzą 300 ms; istniejące testy bez zmian.
Nie ruszaj: `AtlasMap.tsx`, `useMapViewState.ts` (to QC402/QC404), `reveal.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
