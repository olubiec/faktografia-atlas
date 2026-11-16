# N-42 – Logika parametrów osadzania (`/osadz`) i kodu `<iframe>` (koncept 5, KONCEPTY-ROZWOJU.md)
Cel: Czysta logika pod przyszłą stronę osadzania: odczyt i walidacja parametrów `/osadz?w=&i=&l=&u=&y=&theme=&h=`, bezpieczne wartości domyślne, link „Otwórz pełną mapę” z tymi samymi parametrami oraz tekst kodu `<iframe>` do skopiowania. Bez trasy, bez UI, bez zmian w `vercel.json` (nagłówki ramek – osobna decyzja właściciela).
Zmieniaj: src/core/embed/embed-params.ts, src/core/embed/embed-code.ts, tests/unit/embed-params.test.ts, tests/unit/embed-code.test.ts
Wymagane: src/core/embed/embed-params.ts, src/core/embed/embed-code.ts, tests/unit/embed-params.test.ts, tests/unit/embed-code.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/url/state.ts (`readUrlState` – użyj do `i`, `l`, `u`, `y`; nie kopiuj walidacji), src/core/units/units.ts (`getUnit`), config/indicators.json, docs/PRODUKT.md §4b (zasada „źródło bez wyjątku”, CC BY 4.0)

Zadanie:
1. `embed-params.ts`: `readEmbedParams(search, index?)` → `{ widget: 'map' | 'ranking' | 'trend'; state: UrlState; theme: 'light' | 'dark'; height: 400 | 600 }`. Domyślne: `widget: 'map'`, `theme: 'light'`, `height: 400`, wskaźnik domyślny jak na ekranie głównym (stała z istniejącego kodu – znajdź ją, nie wpisuj drugi raz). `widget: 'trend'` bez poprawnego `u` → `widget: 'map'`. Nieznane wartości → domyślne. Parametry typu `hideSource`, `nologo`, `source=0` są **ignorowane** (stopka ze źródłem jest zawsze – test to pilnuje przez to, że typ wyniku nie ma takiego pola, a funkcja `hasSourceFooter()` zwraca zawsze `true`).
2. `embed-code.ts`: `fullViewHref(params, origin)` → adres pełnego widoku (`/?i=&l=&u=&y=`, bez parametrów osadzania); `embedSnippet(params, origin)` → string `<iframe src="…/osadz?…" title="Faktografia Atlas – <nazwa wskaźnika>" width="100%" height="400" loading="lazy" style="border:0"></iframe>`. Wartości w atrybutach escapowane (`&`, `"`, `<`, `>`), tytuł z nazwy wskaźnika z `config/indicators.json`. Kolejność parametrów w adresie stała (deterministyczna).
3. Komentarze po polsku. Pliki ≤ 200 linii. Kody TERYT jako string.

Gotowe, gdy:
- Test: `?w=map&i=density&l=pow&theme=dark&h=600` → odczyt zgodny 1:1; `?w=xyz&theme=neon&h=999` → wartości domyślne bez wyjątku.
- Test: `?w=trend` bez `u` → `widget: 'map'`; `?w=trend&u=<TERYT z fixture>` → `widget: 'trend'`.
- Test: `?hideSource=1&nologo=1` nie zmienia wyniku względem adresu bez tych parametrów, `hasSourceFooter()` = `true`.
- Test: `embedSnippet` zawiera `loading="lazy"`, `title=` z nazwą wskaźnika, adres `/osadz?` ze stałą kolejnością parametrów; znaki `"`, `<`, `&` w danych wejściowych są escapowane (brak możliwości wstrzyknięcia atrybutu); `fullViewHref` nie zawiera `w=`, `theme=`, `h=`.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.

Nie rób: trasy `/osadz` w `App.tsx`, zmian w `vercel.json` (nagłówki `frame-ancestors`), w `src/view/*`, w `state.ts`; bez analityki i zgody w logice osadzania; bez nowych pakietów; bez wstawiania HTML do DOM (kod `<iframe>` jest tylko tekstem do skopiowania).
