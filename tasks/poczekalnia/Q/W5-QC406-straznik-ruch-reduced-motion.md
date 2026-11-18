# QC406 – Strażnik: przy `prefers-reduced-motion` każdy ruch mapy kończy się w jednej klatce
> **KOREKTA 18.11.2026:** zadanie przeniesione z fali 4 do fali 5 (po QC403 i QC404). Obejmuje także ruchy z `W3-PM10`.
Cel: Test e2e pilnujący, że wszystkie animacje z QC402–QC405 są wyłączane u osób, które o to proszą.
Zmieniaj: tests/e2e/q-reduced-motion-map.spec.ts
Wymagane: tests/e2e/q-reduced-motion-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-reduced-motion-map.spec.ts
Przeczytaj najpierw: tests/e2e/q-zoom-smooth.spec.ts (QC402), q-drill-motion.spec.ts (QC404), q-reveal-colors.spec.ts (QC405), q-outline.spec.ts (QC303), src/core/map/test-seam.ts, AGENTS.md („Animacje wyłączone przy `prefers-reduced-motion`”), docs/PRODUKT.md §5a

## Kontekst
Zasada projektu: animacje wyłączone przy `prefers-reduced-motion`. Poprzednie testy sprawdzają to punktowo; tu jeden spec, który wymusza tę zasadę dla **wszystkich** ruchów naraz i będzie łapał regresje w przyszłości. Tylko test – bez zmian w kodzie (jeśli test padnie, zatrzymaj się i opisz, który ruch łamie zasadę; poprawka to osobne zadanie).

## Research
Przeczytaj, jak poprzednie specy próbkują `__atlas` (funkcja pomocnicza). Wyodrębnij podobny **lokalny** pomocnik w tym pliku (nie edytuj istniejących helperów).

## Zadanie
Napisz spec (`@Q`, `test.use({ reducedMotion: 'reduce' })`, `?e2e`) próbkujący `__atlas.viewState`, `__atlas.reveal`, `__atlas.outlineOpacity` co ~16 ms przez 1 s po każdej akcji i licz **liczbę różnych wartości** (powinna być ≤ 2: stan początkowy i końcowy).

## Scenariusze
1. Klik województwa → zoom/pozycja: ≤ 2 różne wartości; końcowy ≠ początkowy (ruch się odbył, ale od razu).
2. „Wróć” → jak wyżej.
3. Przycisk „Przybliż” (QC403) → jak wyżej.
4. Kółko myszy → ruch natywny gestu dozwolony, ale **programowa** animacja nie powinna dochodzić; asercja: brak wartości pośrednich z `animateToView` (porównaj z wersją bez reduced-motion: tam ≥ 5).
5. Wejście w powiat: `reveal.progress` od razu `1` (brak wartości 0<p<1).
6. Zmiana wskaźnika: przejście kolorów bez wartości pośrednich (albo `reveal` niezmienione i `choropleth.indicatorId` zmienione od razu).
7. Oddalenie do kraju z wybraną gminą: `outlineOpacity` przechodzi od razu z 1 na 0 (bez wartości pośrednich).
8. Dla kontroli: ten sam scenariusz 1 **bez** reduced-motion ma ≥ 10 wartości (żeby test nie przechodził „na pusto”).

## Gotowe, gdy
- Przy `prefers-reduced-motion` każdy z ruchów z QC402–QC405 kończy się w ≤ 2 stanach; scenariusz kontrolny bez reduced-motion pokazuje animację; test zielony.
Nie ruszaj: kodu aplikacji, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
