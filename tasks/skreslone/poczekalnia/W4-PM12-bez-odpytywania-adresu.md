# PM12 – Koniec odpytywania adresu co 100 ms: zdarzenie zmiany adresu zamiast `setInterval`
Cel: `useChoropleth` dowiaduje się o zmianie wybranej jednostki ze zdarzenia, a nie z pętli co 100 ms, która budzi stronę także w trakcie ruchu mapy.
Zmieniaj: src/core/url/state.ts, src/view/map/hooks/useChoropleth.ts, tests/unit/url-change-event.test.ts
Wymagane: tests/unit/url-change-event.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/drill.spec.ts tests/e2e/breadcrumbs.spec.ts tests/e2e/reveal.spec.ts
Przeczytaj najpierw: src/view/map/hooks/useChoropleth.ts (efekt z `setInterval(updateSelected, 100)`, `popstate`, `hashchange`; stan `reveal`), src/core/url/state.ts (`writeUrlState` używa `history.replaceState`, które **nie** wywołuje zdarzeń), src/core/url/home.ts (`ATLAS_RESET_EVENT` – wzór własnego zdarzenia), src/view/map/hooks/useMapSelection.ts (kto zmienia `u` i jak), src/core/map/drill.ts, docs/research/q-c401-ruch-mapy.md (pkt 7), tests/unit/url-state.test.ts (**istniejący – nie zmieniaj; musi zostać zielony**)

## Kontekst
Raport QC401 (pkt 7): `useChoropleth.ts` odpytuje adres co 100 ms i przy każdej zmianie woła `setSelectedTeryt`. Pętla działa przez cały czas życia strony (także w trakcie animacji kamery na telefonie), a powstała dlatego, że `replaceState` nie powiadamia nasłuchujących. Dajemy własne, jawne zdarzenie.

## Research (15 min, bez nowych pakietów)
1. Grep: wszyscy autorzy zmian parametru `u` w adresie (`writeUrlState`, `history.pushState`, `history.replaceState`, `location.assign`). Lista z plikami w opisie PR. Jeśli ktoś zmienia adres **poza** `writeUrlState` (bezpośrednio `history.*`) – zatrzymaj się i opisz; nie przerabiaj tych plików (zakaz zmian w plikach ekranu bez wymienienia w zadaniu).
2. Potwierdź, że istniejący test `url-state.test.ts` nie zakłada, że `writeUrlState` jest bez skutków ubocznych.

## Zadanie
1. `src/core/url/state.ts`: eksport `export const ATLAS_URL_EVENT = 'atlas:url';`; `writeUrlState` po `replaceState` wysyła `window.dispatchEvent(new CustomEvent(ATLAS_URL_EVENT))` (tylko gdy `window` istnieje; błąd w nasłuchującym nie psuje zapisu). Zakres: dokładnie ta jedna zmiana.
2. `useChoropleth.ts`: usuń `setInterval`; nasłuchuj `popstate`, `hashchange` i `ATLAS_URL_EVENT`; odczyt `u` jak dotąd; `setSelectedTeryt` tylko przy realnej zmianie wartości; sprzątanie nasłuchów w `return`.
3. Zachowanie obserwowalne bez zmian: wybór jednostki, okruszki, „Wróć”, `reveal` startuje tak samo.

## Testy (`tests/unit/url-change-event.test.ts`)
1. `writeUrlState({ u: '14' })` wysyła dokładnie jedno zdarzenie `ATLAS_URL_EVENT`.
2. Zapis bez `window` (SSR) nie rzuca.
3. Wyjątek w nasłuchującym nie przerywa zapisu adresu (adres jest zmieniony).
4. Hook (`renderHook` z jsdom lub komponent testowy): po `writeUrlState({ u: '1465' })` `selectedTeryt` w hooku zmienia się bez żadnego timera; `vi.useFakeTimers` + przesunięcie 1000 ms nie jest potrzebne (brak `setInterval` — sprawdź `vi.getTimerCount() === 0`).
5. Po odmontowaniu hooka dalsze zdarzenia nie zmieniają stanu (brak wycieku nasłuchów).
6. E2E z linii „Weryfikacja” (`drill`, `breadcrumbs`, `reveal`) zielone bez zmian.

## Gotowe, gdy
- 5 testów zielonych + e2e; w kodzie strony nie ma już `setInterval` odpytującego adres (Grep w opisie PR).
Nie ruszaj: `useMapSelection.ts`, `AtlasMap.tsx`, `useMapViewState.ts`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
