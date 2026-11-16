# N-31 – Zakładka profilu zostaje po zmianie szerokości okna (komputer ↔ telefon)
Cel: Wybrana zakładka profilu (np. „Powiaty”) zostaje po przejściu z kolumny bocznej do dolnego arkusza i z powrotem (obrót telefonu, zmiana okna). Dziś `ProfileBody` trzyma `activeTab` we własnym stanie, a `ProfilePortal` próbuje go odtworzyć klikaniem w DOM po 0/1 klatce/50 ms – arkusz telefonu (react-modal-sheet) pojawia się później, więc klik nie trafia i wraca „Przegląd”. Pada przez to responsive-resize „resizing viewport 1440x900 -> 360x740 -> 1440x900 preserves … active profile tab”.
Zmieniaj: src/view/map/ProfilePortal.tsx, src/view/profile/ProfileSheet.tsx, src/view/profile/ProfileSheetMobile.tsx, tests/unit/profile-tab-state.test.tsx, tests/e2e/profile-tab-resize.spec.ts
Wymagane: tests/unit/profile-tab-state.test.tsx, tests/e2e/profile-tab-resize.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e --workers=1 tests/e2e/profile-tab-resize.spec.ts tests/e2e/responsive-resize.spec.ts tests/e2e/profile-tabs.spec.ts tests/e2e/profile.spec.ts tests/e2e/compare-pick.spec.ts tests/e2e/s18-compare.spec.ts tests/e2e/profile-mobile.spec.ts
Przeczytaj najpierw: src/view/map/ProfilePortal.tsx (cały), src/view/profile/ProfileSheet.tsx (`ProfileBody`, linie 42–100: stan `activeTab`, reset po zmianie TERYT, `?c=` → „compare”), src/view/profile/ProfileSheetMobile.tsx, tests/e2e/responsive-resize.spec.ts, AGENTS.md („Błędy powtarzalne” – bez drugiego źródła stanu), tasks/poczekalnia/DIAGNOZA-E2E.md (grupa 2)

Zadanie:
1. Przenieś stan zakładki do `ProfilePortal` (jeden `useState`, wartość początkowa i reset po zmianie TERYT/`?c=` – ta sama logika co dziś w `ProfileBody`, przeniesiona, nie zdublowana). Przekaż `activeTab` i `onTabChange` przez `ProfileSheet` i `ProfileSheetMobile` do `ProfileBody` jako opcjonalne propsy; gdy ich brak (użycie poza portalem, testy jednostkowe), `ProfileBody` działa jak dziś na własnym stanie.
2. Usuń z `ProfilePortal` odtwarzanie zakładki przez `trigger.click()` i jej śledzenie przez nasłuch kliknięć/resize (sekcje rozwinięte mogą zostać jak są – poza zakresem). `ProfileSheet.tsx` ≤ 350 linii (style-guard), `ProfilePortal.tsx` ≤ 200.
3. `tests/unit/profile-tab-state.test.tsx` (`renderToString`): `ProfileBody` z `activeTab="children"` renderuje zakładkę „Powiaty/Gminy” jako `aria-selected="true"`; bez propsa – „Przegląd” (jak dziś); przy `?c=` w adresie zachowanie bez zmian (jeśli wymaga `window`, ustaw je w teście).
4. `tests/e2e/profile-tab-resize.spec.ts` (nazwy z `@S16`): `/?u=12&e2e` 1440×900 → klik „Powiaty (N)” → 360×740 → w arkuszu zakładka „Powiaty” `aria-selected="true"` → 1440×900 → nadal „Powiaty”; po wybraniu innej jednostki zakładka wraca do „Przegląd”.

Gotowe, gdy:
- Nowe testy zielone; responsive-resize.spec.ts (wszystkie 3 testy) zielony bez zmian w nim – uruchom `--workers=1 --repeat-each=3`.
- profile-tabs, profile, compare-pick, s18-compare, profile-sheet.test, footnotes-view.test zielone bez zmian; profile-mobile z `--workers=1` bez nowych czerwonych.

Nie rób: zmian w AtlasMap.tsx, src/view/map/hooks/*, istniejących testach; bez trzymania zakładki w adresie (osobna decyzja); bez nowych pakietów.
