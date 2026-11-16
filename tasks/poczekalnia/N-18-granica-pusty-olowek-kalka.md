# N-18 – Granica jednostek: pusty --olowek daje kalkę (domknięcie N-15)
Cel: Gdy w motywie ciemnym zmienna CSS `--olowek` jest pusta lub niepoprawna, obrys granic (`granica`) ma kolor `kalka`, a nie jasny token `olowek` z pliku tokenów. Domyka odłożony przypadek kontrolny 4 z N-15.
Zmieniaj: src/view/map/layers/admin.ts, tests/unit/map-border-fallback.test.ts
Wymagane: tests/unit/map-border-fallback.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/dark-mode-map.spec.ts tests/e2e/map.spec.ts
Przeczytaj najpierw: src/view/map/layers/admin.ts (`getMapColorsFromCss`, linie ok. 76–102), tests/unit/map-border-contrast.test.ts (sposób podstawiania `getComputedStyle`), tasks/poczekalnia/NOC-RAPORT.md (W18-P02, N-15)

Diagnoza: `olowekStr = style?.getPropertyValue('--olowek')?.trim() || tokensJson.color.light.olowek` – przy pustej zmiennej w ciemnym motywie bierze jasny `olowek`, więc granica = [77,91,114,140] zamiast kalki.

Zadanie:
1. `admin.ts`: kolor granicy liczony z SUROWEJ wartości `--olowek` (bez zapasowego tokenu jasnego). Pusta, same spacje albo niepoprawna wartość → `granica = kalka`. Pole `olowek` w zwracanym obiekcie zostaje jak dziś (z zapasem z tokenów) – używają go inne miejsca. Motyw jasny i poprawny `--olowek` w ciemnym – wynik identyczny jak dziś. Plik nie rośnie o więcej niż 8 linii; komentarz po polsku.
2. `tests/unit/map-border-fallback.test.ts` (własne podstawienie `window`/`document`/`getComputedStyle`, wzorem map-border-contrast): ciemny + `--olowek: ''` → `granica` równa `kalka`; ciemny + `'   '` → kalka; ciemny + `'nonsens'` → kalka; jasny + `''` → kalka; ciemny + poprawny token ciemny → alfa 140 i RGB z tokenu (regresja).

Gotowe, gdy:
- Nowy test zielony; `map-border-contrast.test.ts`, `choropleth.test.ts`, `no-hardcoded-colors.test.ts`, `style-guard.test.ts` zielone bez zmian; dark-mode-map.spec i map.spec zielone.

Nie rób: zmian w config/tokens.json, choropleth.ts, w istniejących testach ani w wartości alfy 140.
