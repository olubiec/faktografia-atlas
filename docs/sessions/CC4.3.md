# Sesja CC4.3 – Okruszki, ?u= i lista klawiaturowa

Data: 18.10.2026

## Opis zmian

Zrealizowano nawigację za pomocą okruszków chleba (breadcrumbs), synchronizację parametru `?u=` z adresem URL oraz wykaz jednostek podrzędnych ułatwiający pełną obsługę mapy z poziomu klawiatury.

1. **Czysta logika okruszków (`src/core/map/breadcrumbs.ts`)**:
   - `getBreadcrumbs(teryt, index)`: wyznacza pełną ścieżkę Polska → województwo → powiat → gmina (nazwy pobierane z `units.json`).
   - Przy wartości `null` lub nieznanym kodzie TERYT zwraca jednopolową ścieżkę `[{ label: 'Polska', teryt: null }]`.

2. **Komponent okruszków (`src/view/map/Breadcrumbs.tsx`)**:
   - Element `<nav aria-label="Ścieżka">` z uporządkowaną listą.
   - Poziomy nadrzędne renderowane jako przyciski o wymiarach obszaru dotykowego min 44 × 44 px.
   - Ostatnia (aktywna) jednostka posiada atrybut `aria-current="page"`.
   - Kliknięcie w poziom nadrzędny przełącza stan wybranej jednostki i aktualizuje URL (`?u=`).

3. **Komponent listy jednostek podrzędnych (`src/view/map/UnitList.tsx`)**:
   - Prezentuje listę bezpośrednich dzieci wybranej jednostki (lub 16 województw na poziomie kraju) posortowanych alfabetycznie (zgodnie z polskim alfabetem).
   - Renderowany jako `<ul>` zawierający przyciski z pełną obsługą klawiatury (Tab, Enter, Spacja).
   - Przycisk wyboru jednostki posiada wysokość min 44 px.

4. **Kolejność fokusa i integracja (`src/view/map/AtlasMap.tsx`)**:
   - Podpięto `Breadcrumbs` i `UnitList` w nakładce mapy.
   - Zachowano ścisłą kolejność tabbingową DOM: okruszki → „Wróć” → lista → mapa.
   - Wszystkie komponenty wykorzystują wyłącznie tokeny ze stylu (np. `bg-arkusz`, `border-linia`, `text-tusz`, `hover:bg-linia/20`, bez zabronionych `shadow-`, `rounded-` czy `backdrop-blur`).

5. **Testy jednostkowe i E2E (`tests/unit/breadcrumbs.test.ts`, `tests/e2e/breadcrumbs.spec.ts`)**:
   - 5 nowych testów jednostkowych Vitest badających poprawność generowania ścieżki okruszków dla poszczególnych poziomów podziału administracyjnego.
   - 6 nowych testów Playwright E2E weryfikujących wyświetlanie ścieżki, klikanie okruszków, wymiary obszarów dotykowych (min 44 px), listę jednostek, nawigację klawiaturą, kolejność fokusa oraz audyt dostępności Axe na widoku województwa (brak naruszeń).

## Weryfikacja

- `pnpm lint`: zielone
- `pnpm typecheck`: zielone
- `pnpm test`: zielone (25 plików, 144 testy)
- `pnpm build`: zielone (AtlasMap JS gzip: 1090.83 kB, zmiana +0.68 kB gzip ≤ +15 KB)
- `pnpm test:e2e`: zielone (61 testów E2E)
