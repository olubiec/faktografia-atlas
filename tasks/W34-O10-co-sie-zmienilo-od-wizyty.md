# O10 – „Co się zmieniło od ostatniej wizyty”
Cel: osoba, która wraca na stronę z zapamiętanym miejscem, widzi jedną spokojną linię o nowych danych dla tej gminy od ostatniej wizyty.
Zmieniaj: src/core/start/since-last-visit.ts, src/view/start/SinceLastVisit.tsx, tests/unit/w34-o10-since-last-visit.test.tsx
Wymagane: tests/unit/w34-o10-since-last-visit.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/KONCEPT-ODKRYCIA-V2.md (§6), src/core/start/place-memory.ts, src/core/consent (tylko do czytania), src/core/facts/news.ts

Zadanie:
1. `sinceLastVisit(lastVisit, news, teryt)`: lista nowości (świeże dane) od daty ostatniej wizyty; data i TERYT w `localStorage` tylko jeśli zgoda na zapamiętanie miejsca już istnieje (ta sama co `place-memory`), bez nowych kluczy poza jednym `lastVisit`.
2. `SinceLastVisit`: jedna linia „Od {data}: nowe dane – {nazwa wskaźnika}” + link do mapy; brak nowości = nic nie pokazuje (bez wypełniacza).
3. Błąd lub brak `localStorage` = komponent milczy.

Gotowe, gdy:
- Test: nowości sprzed ostatniej wizyty nie są pokazywane; po niej tak, maks. 3 w jednej linii.
- Test: brak zgody/zapamiętanego miejsca = nic nie zapisujemy i nie pokazujemy.
- Test: wyjątek z `localStorage` nie psuje renderu.
Nie ruszaj: `src/core/consent`, `PlaceFacts.tsx`.
Tytuł PR zaczyna się od `[W34-O10]`; opis ma „Po ludzku”.
