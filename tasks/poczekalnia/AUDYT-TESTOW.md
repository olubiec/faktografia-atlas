# Audyt testów i kodu (AUDYT-2, 2026-11-16)

Zakres: `tests/` i `src/`, bez zmian w kodzie i testach. Diffy poniżej to propozycje do zatwierdzenia przez właściciela (AGENTS.md: istniejącego testu nie zmieniam sam). Czego nie uruchamiałem: testów e2e (limit czasu), więc przy każdej propozycji jest oznaczone, co jest ustalone z kodu, a co jest hipotezą do potwierdzenia jednym przebiegiem.

## Priorytety

| P | Co | Gdzie |
|---|---|---|
| P1 | 8 testów e2e z WERYFIKACJA-KONCOWA.md: kruche selektory, gotowe poprawki w sekcji A | `tests/e2e/*` |
| P1 | Błąd aplikacji (a11y), nie test: `heading-order` w przypisach | `src/view/profile/Footnotes.tsx` |
| P2 | `waitForTimeout` (14 miejsc), 59 plików powtarza to samo czekanie na `__atlas`, `as any` w e2e | sekcja C |
| P2 | Puste asercje `toBeDefined()` w testach hooków | `tests/unit/map-hooks.test.tsx` |
| P3 | Pliki > 200 linii (24 w `src`, 22 w `tests`) | sekcja D |
| P3 | Martwy kod: praktycznie brak, same typy `*Props` | sekcja E |

## A. Kruche testy e2e (diffy)

### A1. home.spec.ts „loads properly” (strict mode, 2 logo)
Ustalone z kodu: logo `alt="Faktografia"` jest w `Header.tsx:138` i `SiteFooter.tsx:140`. Trzeci test w tym pliku już używa `header img[...]`.
```diff
--- a/tests/e2e/home.spec.ts
+++ b/tests/e2e/home.spec.ts
@@ -9 +9 @@
-    const logo = page.locator('img[alt="Faktografia"]');
+    const logo = page.locator('header img[alt="Faktografia"]');
```

### A2. picker-scroll.spec.ts (3 testy: „mieści się”, „przewija się do końca”, „brak poziomego przewijania”)
Ustalone z kodu:
- Test „panel przewija się”: `getByText(/Źródło: GUS.../)` trafia pierwszy w element `sr-only` (ratio 0). Widoczny akapit to `<p className="text-xs text-olowek">` w `IndicatorPanel.tsx:193`.
- Przycisk „Wskaźnik”: w `IndicatorPicker.tsx:271` tekst „Wskaźnik” jest w `<span>` w przycisku, ale w trybie arkusza (telefon) przycisk to `MobileIndicatorBar` z `aria-label="Wskaźnik: <nazwa> <rok>…"` (`MobileIndicatorBar.tsx:119`) i `hasText` nie musi go trafić, zależnie od tego, który `button` jest `.first()`. To jest hipoteza, bo nie widziałem DOM po uruchomieniu.
Propozycja: jeden pomocnik wybierający przycisk po nazwie dostępnej, w obu układach (`/^Wskaźnik/`), zamiast `hasText`.
```diff
--- a/tests/e2e/picker-scroll.spec.ts
+++ b/tests/e2e/picker-scroll.spec.ts
@@ -3,2 +3,6 @@
 test.describe('Indicator Picker & Panel Scrolling (@S14)', () => {
+  // Przycisk wyboru wskaźnika: po nazwie dostępnej (desktop: „Wskaźnik Nazwa”, telefon: „Wskaźnik: Nazwa rok”).
+  const pickerTrigger = (page: import('@playwright/test').Page) =>
+    page.getByRole('button', { name: /^Wskaźnik/ }).first();
@@ (4 miejsca: linie 16, 72, 96, 112)
-      const triggerButton = page.locator('button', { hasText: 'Wskaźnik' }).first();
+      const triggerButton = pickerTrigger(page);
@@ -60
-      const footerText = panel.getByText(/Źródło: GUS, Bank Danych Lokalnych/i);
+      const footerText = panel.locator('p:not(.sr-only)', { hasText: /Źródło: GUS, Bank Danych Lokalnych/i });
```
Jeśli po tej zmianie na telefonie nadal brak przycisku, przyczyna jest w aplikacji (brak stałego uchwytu); wtedy zadanie: `data-testid="indicator-trigger"` w `IndicatorPicker` i `MobileIndicatorBar`, a test używa `getByTestId`. Test „44 px” (linia 99) mierzy wtedy właściwy przycisk.

### A3. compare-maps.spec.ts „touch targets” (0 elementów `[data-slot=compare-map]`)
Ustalone z kodu: `data-slot="compare-map"` istnieje (`CompareMaps.tsx:133`), więc selektor jest poprawny. Błąd to `await mapButtons.count()` bez czekania: `count()` nie ma auto-retry, a na 360 px profil jest w arkuszu, który chwilę się animuje. Pierwszy test w pliku używa `toHaveCount(2)` i działa.
```diff
--- a/tests/e2e/compare-maps.spec.ts
+++ b/tests/e2e/compare-maps.spec.ts
@@ -64,3 +64,4 @@
     const mapButtons = page.locator('[data-slot="compare-map"]');
-    const count = await mapButtons.count();
-    expect(count).toBe(2);
+    await expect(mapButtons).toHaveCount(2);
+    const count = 2;
```
Dodatkowo (poprawa jakości, opcjonalnie): `await expect(mapButtons.nth(i)).toBeVisible()` przed `boundingBox()` (`boundingBox` zwraca null dla ukrytego).

### A4. profile-overview.spec.ts „?u=12 … wyróżnione województwo”
Ustalone z kodu (`RankingBars.tsx:96-98`): wyróżnienie to `<span>` z klasami `font-bold text-korekta-tekst`, nie `.text-korekta` (klasa jest inna, selektor `.text-korekta` nigdy jej nie trafi) i nie `button.font-bold`.
```diff
--- a/tests/e2e/profile-overview.spec.ts
+++ b/tests/e2e/profile-overview.spec.ts
@@ -89,3 +89,5 @@
-    // Sprawdzenie wyróżnienia dla małopolskiego (klasa lub styl wyróżniający)
-    const highlightedItem = rankingContainer.locator('li button .text-korekta, li button.font-bold');
-    await expect(highlightedItem.first()).toBeVisible();
+    // Wyróżniona jest dokładnie jedna pozycja: małopolskie (klasa z tokenu korekta-tekst)
+    const highlightedItem = rankingContainer.locator('li:has(.text-korekta-tekst)');
+    await expect(highlightedItem).toHaveCount(1);
+    await expect(highlightedItem).toContainText(/małopolskie/i);
```
Uwaga: jeśli pozycja ma mieć też nazwę dostępną (`aria-current`), lepiej poprosić o `aria-current="true"` w `RankingBars` i testować `li button[aria-current="true"]` (selektor niezależny od stylu).

### A5. tune.spec.ts „tab Typografia … .text-md”
Ustalone: sam kontrakt zmiennej (`--text-md` = `10px`/`96px`/`22px`) jest sprawdzany poprawnie. Pada tylko ostatnia asercja: `document.querySelector('.text-md')` zwraca null (na `/design?tune` nie ma wtedy takiego elementu; jedyny użytek to `<p>` w `DesignPage.tsx:213`). Hipoteza: element jest, ale w niewyrenderowanej sekcji. Odporny wariant nie zależy od treści strony: własny element próbny.
```diff
--- a/tests/e2e/tune.spec.ts
+++ b/tests/e2e/tune.spec.ts
@@ -168,5 +168,10 @@
     const computedFontSize = await page.evaluate(() => {
-      const elem = document.querySelector('.text-md');
-      return elem ? window.getComputedStyle(elem).fontSize : null;
+      const probe = document.createElement('p');
+      probe.className = 'text-md';
+      document.body.appendChild(probe);
+      const size = window.getComputedStyle(probe).fontSize;
+      probe.remove();
+      return size;
     });
     expect(computedFontSize).toBe('22px');
```
To nadal sprawdza, że klasa Tailwind `text-md` reaguje na zmienną, bez zależności od układu strony.

### A6. library-search.spec.ts „w całej ścieżce dokładnie 1 żądanie spisu” (URL ma `?q=ludnosc` bez `k=1`)
Ustalone: test miesza dwa cele. Linia 122 po `history.back()` oczekuje `k=1`, a od P3-C/N-29 szukanie najpewniej zastępuje (`replace`) lub kasuje `k`. To decyzja o zachowaniu, nie o selektorze, więc dwie opcje dla właściciela:
- (a) aplikacja ma wracać do `k=1`: zadanie na aplikację (historia), test bez zmian.
- (b) szukanie celowo czyści kategorię (po N-29 szuka w całym spisie): test zmienić tak:
```diff
--- a/tests/e2e/library-search.spec.ts
+++ b/tests/e2e/library-search.spec.ts
@@ -121,3 +121,3 @@
     await page.evaluate(() => window.history.back());
-    await expect(page).toHaveURL(/.*[?&]k=1/);
+    await expect(page).toHaveURL(/[?&]q=ludnosc/);
```
Niezależnie od wyniku: filtr `url.includes('index.json')` (linia 124) złapie każdy `index.json` (także indeks wyszukiwarki). Zawęzić do spisu biblioteki: `new URL(url).pathname.endsWith('/library/index.json')` (ścieżka z `libraryBase()` w `src/core/library/load-library.ts:79`; sprawdzić dokładną wartość przed zmianą).

### A7. s21-library „pełna ścieżka” ×2 (poza ośmioma, ale wspólny temat z DIAGNOZA 4a)
`requests` liczy też `/data/values/density.json` pobrane przez mapę na `/`. Minimalna poprawka (linie ~41 i ~170): wyzerować licznik po załadowaniu strony głównej.
```diff
     await page.goto('/');
+    await page.waitForFunction(() => (window as any).__atlas?.ready === true);
+    requests.length = 0; // zliczamy dopiero żądania po wejściu na /biblioteka
     const desktopLink = page.locator('header nav').getByRole('link', { name: 'Biblioteka' });
```
Punkt 4b z DIAGNOZY (wskaźnik 103 przy filtrze „tylko z danymi”) nadal wymaga decyzji (a) lub (b) z DIAGNOZY.

### A8. mobile-sheet-map-visible 390/360 (nie z listy ośmiu)
Środowisko bez GPU: animacja arkusza dłuższa niż limit 5 s. Propozycja: `test.slow()` na początku testu (limit x3) zamiast wyłączania; wymaga zgody.

## B. Błąd aplikacji, nie test
`share-compare … axe` (`heading-order`): `Footnotes.tsx:17` ma `<h3 className="sr-only">Przypisy</h3>`, a raport mówi o `<h4>`. Sprawdzić, który komponent renderuje `h4` w kontekście karty/porównania i dopasować poziom do poprzedniego nagłówka (nie zmieniać testu axe).

## C. Jakość e2e
- `waitForTimeout` w 14 miejscach (`search-close` x5, `color-transition` x2, `network-resilience`, `header-library`, `compare-table`, `home:89`, `s16-motion`, `profile-mobile`, `localities-map` x2). Zamienić na `expect.poll`/`toHaveCSS`/`waitForFunction`. Najgorsze: `search-close` (4 x 1000 ms).
- 59 plików powtarza `waitForFunction(() => (window as any).__atlas?.ready === true …)`. Jeden pomocnik w `tests/e2e/helpers/` (np. `waitForAtlas(page, { profileOpen })`) i typ `Win` zamiast `as any` (`camera-resize-retarget` już ma `Win`; najwięcej `as any`: `s16-motion` 17, `profile-mobile-inset` 16, `color-transition` 14).
- `test.fixme`: jeden, `camera-resize-retarget.spec.ts:48`; powód jest w komentarzu (wyścig profilu po animacji, poza zakresem N-09), czyli uzasadniony, ale bez zadania, które go zdejmie. Warto założyć zadanie.
- `test.skip(!process.env.CI, …)` w `design.spec.ts:70` (zrzuty tylko w CI): zgodne z AGENTS.md.
- W `ops-check-pr.test.ts` skip/fixme to tylko dane testowe strażnika, nie wyłączone testy.

## D. Słabe asercje (unit)
- `tests/unit/map-hooks.test.tsx:64,96-98,109`: `toBeDefined()` na polach obiektu stanu (zawsze zdefiniowane przy tej strukturze), czyli nic nie sprawdzają. Zastąpić wartością: np. `expect(state.limits).toEqual({...})` albo typ/zakres.
- `tests/unit/meta.test.ts:55-56,67`: `toBeTruthy()` na `og:title` i kolorze; porównać z oczekiwanym tekstem/hexem z tokenu.
- Pozostałe `toBeDefined()` (`parts-build`, `bdl-mapping`, `ranking`, `values`) poprzedzają użycie wartości, więc akceptowalne, ale `expect(x?.id).toBeDefined()` w `bdl-mapping:106,109` powinno sprawdzać konkretne id.

## E. Pliki > 200 linii (reguła AGENTS.md)
`src` (24): `view/design/DesignPage.tsx` 612 (najgorszy), `profile/ProfileCompare.tsx` 473, `map/hooks/useMapViewState.ts` 448, `map/AtlasMap.tsx` 446, `pages/LibraryVariable.tsx` 406, `profile/ProfileOverview.tsx` 356, `profile/ProfileSheet.tsx` 317, `tune/TunePanel.tsx` 304, `share/ShareDialog.tsx` 299, `controls/IndicatorPicker.tsx` 299, `map/layers/admin.ts` 296, `explain/ContextBlock.tsx` 296, `profile/CompareMaps.tsx` 279, `Header.tsx` 262, dalej 10 plików 203-233 (m.in. `useShareData`, `ProfileCompareTable`, `SearchDialog`, `core/share/csv.ts` 203, `core/profile/profile.ts` 218).
`tests` (22): m.in. `unit/core-contracts-and-fuzz.test.ts` 452, `e2e/s19-share.spec.ts` 385, `library-variable.spec.ts` 351, `s21-library.spec.ts` 321, `tune.spec.ts` 302.
Pliki ekranu (`AtlasMap`, `useMapViewState`, `ProfileSheet`) są pod zakazem edycji bez wymienienia w zadaniu, więc podział tylko jako osobne zadania.

## F. Martwy kod i duplikacje
- Skan eksportów `src/` (bez `components/ui`): jedyne nieużywane poza własnym plikiem to typy `*Props` (ok. 35, to normalny wzorzec) oraz `BBox`/`RoughEllipseOptions` (`roughEllipse.ts`), `CsvRow` (`DownloadCsv.tsx`), `DismissReason` (`useMenuDismiss.ts`), `KeyAction` (`useKeyboardNavigation.ts`), `UseSearchResult`. Do usunięcia z `export` tylko jeśli zależy nam na ciasnym API; ryzyko zerowe, zysk mały. Komponent `view/test/ButtonTestPage.tsx` nie ma importu w `src`/`tests`: sprawdzić, czy jest ładowany leniwie w routerze (inaczej martwy). Skan prosty (nazwa słowna), bez `knip`, które nie jest zainstalowane.
- Duplikacja: czekanie na `__atlas` (sekcja C); w testach picker/home/tune powtarzane lokalizatory przycisku „Wskaźnik” (4 wystąpienia `hasText: 'Wskaźnik'`), co jest źródłem trzech czerwonych naraz.
