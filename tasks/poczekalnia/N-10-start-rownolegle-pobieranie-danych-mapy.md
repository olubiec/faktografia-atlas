# N-10 – Start: dane mapy i profilu z linku pobierane równolegle z kodem mapy
Cel: Skrócić czas do pojawienia się mapy i arkusza profilu przy wejściu z linku `/?u=…`. To prawdopodobna przyczyna „arkusz profilu niewidoczny przez 5 s przy wielu workerach” (N-07, profile-mobile.spec.ts): pobieranie idzie dziś szeregowo.
Zmieniaj: src/core/data/startup-prefetch.ts, src/main.tsx, tests/unit/startup-prefetch.test.ts, tests/e2e/startup-prefetch.spec.ts
Wymagane: src/core/data/startup-prefetch.ts, tests/unit/startup-prefetch.test.ts, tests/e2e/startup-prefetch.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e tests/e2e/startup-prefetch.spec.ts tests/e2e/perf-budget.spec.ts tests/e2e/navigation-and-budgets.spec.ts tests/e2e/freshness-single-fetch.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md (§7 progi), src/main.tsx, src/view/Home.tsx (lazy AtlasMap), src/view/map/AtlasMap.tsx (`AtlasMap` → `loadUnits` + `loadAdminTopo`), src/view/map/hooks/useProfile.ts, src/core/data/load-atlas-data.ts, src/core/data/load-profile.ts, tests/e2e/perf-budget.spec.ts

Diagnoza (planista): łańcuch przy `/?u=12` to: index.js → Home → lazy chunk AtlasMap (~1,3 MB) → dopiero wtedy units.json + admin.topo.json (~1,3 MB) → dopiero po ich wczytaniu `useProfile` pobiera `profiles/12.json` (~1,2 MB) → arkusz. Pod obciążeniem (wiele workerów) trzy kroki szeregowe dają > 5 s. Wszystkie trzy loadery mają pamięć i łączą równoległe wywołania w jedno żądanie, więc wcześniejsze wywołanie nie doda żądań.

Zadanie:
1. `src/core/data/startup-prefetch.ts`: `startupPrefetch(loc: { pathname: string; search: string }, deps = { loadUnits, loadAdminTopo, loadProfileShard })`. Działa tylko dla `pathname === '/'`. Woła `loadUnits()` i `loadAdminTopo()`. Gdy `?u=` to same cyfry o długości 2, 4 lub 7 i pierwsze dwie cyfry to kod województwa (02, 04, …, 32 – parzyste), woła `loadProfileShard(u.slice(0, 2))`. Każdą obietnicę kończy `.catch(() => {})` (błąd obsłuży widok przy właściwym wywołaniu). Zwraca listę nazw wywołanych loaderów (ułatwia testy). Bez wartości wskaźników (mapa sama wybiera plik).
2. `src/main.tsx`: wywołaj `startupPrefetch(window.location)` przed `createRoot(...).render`. Nic więcej w main.tsx nie zmieniaj.
3. `tests/unit/startup-prefetch.test.ts` (atrapy loaderów `vi.fn`): `/` → units + topo, bez profilu; `/?u=12` → profil `'12'`; `/?u=1261011` → profil `'12'`; `/?u=abc`, `/?u=99`, `/?u=13` → bez profilu; `/rankingi?u=12` → nic; odrzucona obietnica loadera nie rzuca nieobsłużonego błędu.
4. `tests/e2e/startup-prefetch.spec.ts` (nazwy z `@S99`): (a) `/?u=12&e2e` (okno 390×844): żądanie `/data/profiles/12.json` pada w kolejności PRZED żądaniem chunku `AtlasMap-*.js` (porównaj indeksy z `page.on('request')`), dokładnie 1 żądanie profili, `__atlas.profileOpen === true`; (b) `/?e2e`: 0 żądań `/data/profiles/`; (c) `/rankingi`: 0 żądań `admin.topo.json`; (d) `/?u=abc&e2e`: 0 żądań profili.
5. Diagnostyka (bez zmian w tych plikach): uruchom `pnpm test:e2e tests/e2e/profile-mobile.spec.ts tests/e2e/mobile-sheet-map-visible.spec.ts --repeat-each=3 --workers=4` przed i po zmianie; w PR podaj liczbę błędów przed/po.

Gotowe, gdy:
- Testy jednostkowe i nowy spec zielone; perf-budget.spec.ts (w tym „na wejściu: bez profili” i „dokładnie jedno żądanie profili”), navigation-and-budgets.spec.ts i freshness-single-fetch.spec.ts zielone bez zmian.
- W PR liczby z punktu 5.

Nie rób: zmian w loaderach (load-atlas-data.ts, load-profile.ts), w AtlasMap.tsx, Home.tsx, useProfile.ts ani w istniejących testach; bez `<link rel="preload">` w index.html (osobna decyzja); bez pobierania wartości wskaźników na starcie.
