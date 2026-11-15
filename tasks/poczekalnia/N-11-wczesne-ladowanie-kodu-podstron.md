# N-11 – Kod podstrony ładuje się już po najechaniu lub fokusie na link
Cel: Przejście do /rankingi, /porownaj, /biblioteka itd. bez białego mignięcia `PageFallback`: kod podstrony (lazy chunk) zaczyna się pobierać, gdy kursor najedzie na link albo link dostanie fokus (Tab), a nie dopiero po kliknięciu.
Zmieniaj: src/view/layout/route-chunks.ts, src/App.tsx, tests/unit/route-chunks.test.ts, tests/e2e/route-prefetch.spec.ts
Wymagane: src/view/layout/route-chunks.ts, tests/unit/route-chunks.test.ts, tests/e2e/route-prefetch.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/route-prefetch.spec.ts tests/e2e/perf-budget.spec.ts tests/e2e/main-menu-links.spec.ts tests/e2e/navigation-and-budgets.spec.ts
Przeczytaj najpierw: src/App.tsx (lazy importy stron), src/view/Header.tsx (linki), docs/PRODUKT.md (§7), tests/e2e/perf-budget.spec.ts

Zadanie:
1. `src/view/layout/route-chunks.ts` (plik .ts, bez komponentów – reguła only-export-components): obiekt `routeChunks` ścieżka → funkcja importu dla `/o-projekcie`, `/zrodla`, `/prywatnosc`, `/kontakt`, `/zastrzezenie`, `/rankingi`, `/porownaj`, `/biblioteka` (oraz `/biblioteka/:id` → ten sam import co LibraryVariable). Funkcje: `routeKeyFromHref(href, origin)` (tylko ten sam origin, bez query i hash; `/biblioteka/60614` → klucz LibraryVariable; nieznane → `null`) oraz `prefetchRoute(key, chunks = routeChunks)` – woła import najwyżej raz na klucz (pamięć), błąd importu połyka i pozwala spróbować ponownie.
2. `src/App.tsx`: `lazy(...)` dla tych stron używa funkcji z `routeChunks` (ten sam moduł = ten sam chunk, więc kliknięcie po prefetchu nie pobiera drugi raz). W `AppRoutes` jeden `useEffect` z delegowanymi nasłuchami `pointerover` i `focusin` na `document`: `closest('a[href]')` → `routeKeyFromHref` → `prefetchRoute`. Pomija, gdy `navigator.connection?.saveData === true`. Sprzątanie nasłuchów przy odmontowaniu. Strony testowe (`/__test/*`, `/design`) bez prefetchu.
3. `tests/unit/route-chunks.test.ts`: mapowanie adresów (z query, z hash, inny origin → null, `/biblioteka/60614`, `/` → null); `prefetchRoute` dwa razy = 1 wywołanie importu; odrzucony import → kolejne wywołanie próbuje ponownie.
4. `tests/e2e/route-prefetch.spec.ts` (nazwy z `@S99`, okno 1440×900, zgoda ustawiona na „denied” jak w innych testach): na `/` brak żądania skryptu `Rankings-*.js` przed interakcją; po `hover()` na linku „Rankingi” w nagłówku pojawia się żądanie `Rankings-*.js` (czekaj `page.waitForRequest`) jeszcze przed kliknięciem; po kliknięciu brak drugiego żądania tego pliku i widać „Mediana”. Drugi test: fokus na linku „Porównaj” w nagłówku (`locator.focus()`, czyli zdarzenie `focusin` jak przy Tab) wywołuje żądanie `ComparePage-*.js`.

Gotowe, gdy:
- Testy jednostkowe i nowy spec zielone.
- perf-budget.spec.ts (rozmiary skryptów na wejściu), main-menu-links.spec.ts i navigation-and-budgets.spec.ts zielone bez zmian.
- App.tsx ≤ 120 linii.

Nie rób: zmian w Header.tsx, SiteFooter.tsx, vite.config.ts (bez ręcznego dzielenia chunków), w istniejących testach; bez prefetchu wszystkich stron na starcie (tylko po najechaniu/fokusie); bez prefetchu plików danych (tylko kod).
