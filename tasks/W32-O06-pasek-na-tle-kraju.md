# O06 – Pasek „Na tle kraju”: rozkład gmin, mediana i znacznik miejsca (SVG)
Cel: mały komponent pokazuje, gdzie gmina leży w rozkładzie wszystkich gmin, bez liczb, które trzeba przeliczać w głowie.
Zmieniaj: src/view/start/YouAreHere.tsx, tests/unit/w32-o06-you-are-here.test.tsx
Wymagane: tests/unit/w32-o06-you-are-here.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§3 „Budowa jednej karty”), docs/STYL.md, src/core/facts/types.ts (W31-O01)

Zadanie:
1. `YouAreHere({ dist, value, name, unitLabel })`: SVG z 20 słupkami histogramu, cienką linią mediany i znacznikiem z nazwą gminy; szerokość ≥ 280 px, tokeny z `@theme`, zero kolorów w kodzie.
2. Dostępność: `role="img"` i `aria-label` pełnym zdaniem („Maszewo: 32; mediana gmin: 105”); legenda tekstowa pod spodem („▲ Maszewo: 32 / mediana: 105”).
3. Bez animacji przy `prefers-reduced-motion`. Brak `dist` = komponent nic nie rysuje.
4. Zakreślenie `korekta` nie występuje w tym komponencie (jedno zakreślenie na ekran należy do karty 1).

Gotowe, gdy:
- Test: znacznik leży w przedziale odpowiadającym wartości; wartość poza zakresem ląduje na krawędzi.
- Test: `aria-label` zawiera nazwę, wartość i medianę.
- Test: brak `dist` = brak elementu `svg`.
- Test: brak klas kolorów/rozmiarów spoza tokenów (istniejący test `no-hardcoded-colors` zielony).
Nie ruszaj: `PlaceFacts.tsx`, `StartPage.tsx`.
Tytuł PR zaczyna się od `[W32-O06]`; opis ma „Po ludzku”.
