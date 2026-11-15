# N-15 – Test: kontrast granic jednostek w ciemnym motywie (WCAG 1.4.11)
Cel: Domknięcie odłożonego z W18-P02: liczbowa asercja, że obrys granic w ciemnym motywie ma kontrast ≥ 3:1 z tłem mapy, a jasny motyw się nie zmienił. Sam test, bez zmian w kodzie.
Zmieniaj: tests/unit/map-border-contrast.test.ts
Wymagane: tests/unit/map-border-contrast.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/map/layers/admin.ts (`getMapColorsFromCss`, `parseCssColor`, wyliczenie `granica`), config/tokens.json (`color.dark`, `color.light`), tests/unit/tokens.test.ts, tasks/poczekalnia/NOC-RAPORT.md (W18-P02)

Zadanie:
1. W teście podstaw `window`, `document.documentElement` i `getComputedStyle` przez `vi.stubGlobal` tak, by `getPropertyValue('--kalka' | '--arkusz' | '--tusz' | '--ochra' | '--korekta' | '--olowek')` zwracało wartości z `config/tokens.json` (wariant `dark`, potem `light`). Po każdym teście `vi.unstubAllGlobals()`.
2. Ciemny motyw: `granica` ma kanał alfa < 255; po zmieszaniu z tłem (alfa-blending sRGB) kontrast WCAG z `dark.kalka` i z `dark.arkusz` ≥ 3,0. Funkcje luminancji i kontrastu napisz w pliku testu (wzór WCAG 2.x), z komentarzem po polsku. Wartości orientacyjne policzone przez planistę: ok. 3,45 (kalka) i 3,30 (arkusz).
3. Jasny motyw: `granica` równa `kalka` (zachowanie sprzed W18-P02).
4. Przypadek kontrolny: gdy `--olowek` jest pusty, `granica` w ciemnym motywie spada do `kalka` (bez wyjątku).

Gotowe, gdy:
- Test zielony; istniejące testy bez zmian.
- Jeśli import `admin.ts` w środowisku `node` (vitest.config.ts) się nie udaje albo kontrast wychodzi < 3,0 – nie zmieniaj admin.ts, tokenów ani konfiguracji; opisz w PR (komunikat błędu lub zmierzone wartości) i zatrzymaj się.

Nie rób: zmian w src/, config/tokens.json, vitest.config.ts; bez zrzutów pikselowych mapy WebGL.
