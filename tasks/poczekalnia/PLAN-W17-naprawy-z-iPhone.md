# Plan W17 – naprawy po teście z iPhone'a (17.11.2026)

## Diagnoza (skąd problemy)
- **faktografia.eu = gałąź `main`.** Prace F1–F5 (pełnoekranowe wyszukiwanie z kategoriami, checkboxy porównania, zestaw kart z numeracją, przyciski eksportu, stopka .eu, jedna warstwa mapy na telefonie) są tylko na gałęzi `claude/laughing-pasteur-8af8jz` i nie trafiły na main. Dlatego na produkcji nie ma „pełnego okna”, zestawu kart, wskaźnika stron, a w stopce jest `faktografia.pl`.
- **Brak zmiany poziomu przy oddalaniu:** w kodzie nie ma logiki „zoom → poziom”. Poziom bierze się tylko z adresu (`?l=`) albo z kliknięcia (`src/core/map/main-view.ts`, `src/view/main/useMainView.ts`).
- **Logo:** `src/view/Header.tsx` linkuje do `/` **z zachowaniem parametrów** (`?l=gmi&u=…&compare=…`), więc nic się nie resetuje.
- **Dwie czerwone jednostki:** obrys `--korekta` z `src/view/map/layers/selected-outline.ts` dla `?compare=a,b`. Zostaje po wyjściu z porównania, a przy widoku całej Polski małe gminy z grubym obrysem wyglądają jak czerwone plamy.
- **Ikona „?”:** `src/view/explain/IndicatorInfo.tsx` (Radix Popover). Na telefonie panel jest w arkuszu z `z-index: 9999`, więc dymek otwiera się **pod** arkuszem i wygląda, jakby nic nie robił (ten sam błąd co wcześniej w IndicatorPicker).

## Kolejność fal
| Fala | Co | Zadania | Model |
|---|---|---|---|
| 0 | Wypuszczenie F1–F5 na faktografia.eu | PR gałęzi do main (po „otwórz PR do main”) | – |
| 1 | Mapa: poziomy, logo, czerwone, „?” | A01, A02, A03, A04 (równolegle) | A01 Opus, reszta Sonnet |
| 2 | Eksport: podgląd zestawu, karta porównania, przyciski | B01, B02, B03 (równolegle) | Sonnet |
| 3 | Porządki: podział ShareDialog, ranking porównania, niestabilne e2e | C01, C02, C03 | Sonnet / Haiku |
| 4 | Właściciel (bez kodu) | ustawienia GitHub, odświeżenie zrzutów | – |

Wspólne dla każdego zadania: zasady z AGENTS.md; gałąź `claude/laughing-pasteur-8af8jz`; czytaj tylko pliki z „Przeczytaj najpierw”; testy najpierw; `Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build` + wskazany spec e2e (`pnpm exec playwright test <spec> --trace off`); commit z nagłówkiem `[W17-<id>]`.

---

# A01 – Zmiana poziomu mapy przy przybliżaniu i oddalaniu
Cel: Oddalenie mapy wraca do powiatów i województw, przybliżenie schodzi głębiej, jak w atlasach typu „drill-down”.
Zmieniaj: src/core/map/zoom-level.ts (nowy), src/view/map/hooks/useMapViewState.ts, src/view/main/useMainView.ts, tests/unit/zoom-level.test.ts, tests/e2e/zoom-level.spec.ts
Wymagane: tests/unit/zoom-level.test.ts, tests/e2e/zoom-level.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md (§5a Kamera), src/core/map/main-view.ts, src/view/main/useMainView.ts (fragment setLevel/level), src/view/map/hooks/useMapViewState.ts (onMove/onMoveEnd)

Zadanie:
1. `zoom-level.ts` (czysta logika): `levelForZoom(zoom, current, allowed)` z progami i histerezą (np. woj < 6.3 ≤ pow < 8.0 ≤ gmi; histereza ±0.3, żeby nie migało). Zwraca poziom z listy `allowed` (minLevel wskaźnika) najbliższy progowi.
2. Wywołuj tylko na `moveend` z gestu użytkownika (pinch/kółko/przyciski +/−), nie przy animacji `animateToView` po kliknięciu jednostki.
3. Zmiana poziomu z zoomu aktualizuje `?l=` przez `replaceState` (nie `pushState`), nie czyści wybranej jednostki, chyba że oddalenie wychodzi poza jej obszar o więcej niż jeden poziom.
4. Domyślny poziom bez `?l=` = `woj` (bez zmian).

Gotowe, gdy:
- Testy jednostkowe: progi, histereza (zoom 6.4 przy obecnym `pow` nie przełącza na `woj`), wskaźnik tylko gminny zostaje na `gmi`.
- E2E (`?e2e`, `window.__atlas`): start `?l=gmi` przy zoomie Polski → po `moveend` poziom = `woj`; przybliżenie do zoomu 8.5 → `gmi`; w historii przeglądarki nie przybywa wpisów.
- Brak migania warstw (crossfade z F1 nadal działa; na telefonie jedna warstwa).

Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/Home.tsx

---

# A02 – Logo wraca na stronę główną
Cel: Kliknięcie logo daje czysty widok Polski (województwa), jak „Home”.
Zmieniaj: src/view/Header.tsx, tests/e2e/logo-home.spec.ts
Wymagane: tests/e2e/logo-home.spec.ts
Przeczytaj najpierw: src/view/Header.tsx (fragment Link z logo)

Zadanie:
1. Link logo prowadzi do `/` i zachowuje wyłącznie `wsk` (wskaźnik) i `rok`. Usuwa `l`, `u`, `compare`, `wsk` porównania itp. Wariant `?logo=znak` zostaje, jeśli był.
2. Po kliknięciu kamera wraca do widoku całej Polski (`fitBounds` Polski, czas `motion.base`, bez animacji przy reduced motion), a arkusz profilu się zamyka.

Gotowe, gdy:
- E2E: start `/?l=gmi&u=1465011&compare=a,b&wsk=X` → klik logo → URL `/?wsk=X`, `__atlas.level === 'woj'`, brak wybranej jednostki, profil zamknięty. Działa w projekcie mobilnym i desktopowym.

Nie ruszaj: src/view/Home.tsx

---

# A03 – Czerwone obrysy tylko tam, gdzie mają sens
Cel: Na widoku całej Polski nie ma „czerwonych plam”, a obrys porównania znika po wyjściu z porównania.
Zmieniaj: src/view/map/layers/selected-outline.ts, src/core/map/outline-style.ts (nowy), src/view/profile/ProfileCompare.tsx, tests/unit/outline-style.test.ts, tests/e2e/compare-outline.spec.ts
Wymagane: tests/unit/outline-style.test.ts, tests/e2e/compare-outline.spec.ts
Przeczytaj najpierw: src/view/map/layers/selected-outline.ts, src/view/profile/ProfileCompare.tsx (fragment zamknięcia)

Zadanie:
1. `outline-style.ts`: szerokość obrysu zależna od zoomu (cienki przy zoomie Polski, min. 1 px; pełny przy zoomie jednostki). Bez wypełnienia; kolor z tokena `--korekta`.
2. Zamknięcie porównania usuwa `compare` z URL (`replaceState`), więc obrys znika.
3. W `window.__atlas` wystaw `outlinedIds: string[]`.

Gotowe, gdy:
- Unit: szerokość dla zoomu 5 < szerokość dla zoomu 10; zawsze ≥ 1.
- E2E: otwórz porównanie dwóch gmin → `outlinedIds.length === 2`; zamknij → `outlinedIds.length === 0` i brak `compare` w URL.

Nie ruszaj: src/view/map/AtlasMap.tsx, src/view/profile/ProfileSheet*.tsx

---

# A04 – Ikona „?” przy wskaźniku działa na telefonie
Cel: Dotknięcie „?” pokazuje wyjaśnienie wskaźnika nad arkuszem.
Zmieniaj: src/view/explain/IndicatorInfo.tsx, tests/e2e/indicator-info.spec.ts
Wymagane: tests/e2e/indicator-info.spec.ts
Przeczytaj najpierw: src/view/explain/IndicatorInfo.tsx

Zadanie:
1. Dymek (PopoverContent) w portalu z `z-[10000]` (arkusz react-modal-sheet ma 9999). Na ekranach `(pointer: coarse)` lub < 768 px pokaż wyjaśnienie jako pełny dialog Radix (jak IndicatorPicker) z przyciskiem „Zamknij” ≥ 44 px.
2. Gdy wskaźnik nie ma wyjaśnienia – nie renderuj przycisku „?” (żadnych martwych ikon).

Gotowe, gdy:
- E2E mobile: otwórz panel wskaźnika w arkuszu → tap „?” → widoczny tekst wyjaśnienia (`toBeInViewport`) i element na wierzchu (`elementFromPoint` w środku dymku należy do dymku). Escape/„Zamknij” zamyka.
- E2E desktop: klik „?” → popover widoczny.

---

# B01 – Podgląd zestawu kart: strony i przełączanie
Cel: W oknie „Pobierz i udostępnij” widać, że kart jest kilka (np. „2 / 4”), i można je przełączać.
Zmieniaj: src/view/share/SharePreviewPager.tsx (nowy), src/view/share/ShareDialog.tsx, tests/e2e/share-preview-pager.spec.ts
Wymagane: tests/e2e/share-preview-pager.spec.ts
Przeczytaj najpierw: src/view/share/useCardSet.ts (eksporty), src/view/share/ShareDialog.tsx (fragment podglądu)

Zadanie:
1. Pod podglądem: strzałki ← → (≥ 44 px, ikony iconoir), licznik „n / N” (`aria-live="polite"`), kropki. Przesunięcie palcem po podglądzie zmienia kartę (pointer events, próg 40 px).
2. Ukryj pager, gdy N = 1.
3. „Pobierz obraz” pobiera bieżącą kartę; „Pobierz zestaw” – wszystkie (logika z F4/F5, bez zmian).

Gotowe, gdy:
- E2E: porównanie 2 gmin z 8 wskaźnikami → licznik „1 / N” (N ≥ 2); klik → „2 / N”, podgląd się zmienia (inny `data-card-id`); na mobile swipe w lewo działa.

---

# B02 – Karta porównania: większe mapy z legendą, zwarta tabela
Cel: Karta porównania wygląda jak gotowa grafika: mapa A z legendą, mapa B z legendą, tabela bez pustych przerw, stopka `faktografia.eu`.
Zmieniaj: src/core/share/card-pages.ts, src/core/share/pagination.ts, src/view/share/CardSvg.tsx, tests/unit/share-compare-layout.test.ts
Wymagane: tests/unit/share-compare-layout.test.ts
Przeczytaj najpierw: src/core/share/card-pages.ts (typ karty porównania), src/view/share/CardSvg.tsx (fragment porównania)

Zadanie:
1. Mapy A i B zajmują razem ok. 40% wysokości karty, każda z mini-legendą (5 klas, tokeny `--seq-*`) i podpisem nazwy jednostki.
2. Wysokość wiersza tabeli liczona z treści (nazwa w maks. 2 liniach), nie rozkładana równo na całą wysokość. Nadmiar wierszy → kolejna karta zestawu (pagination), nie ściskanie.
3. Stopka zawsze z domyślnej domeny (`faktografia.eu`), chyba że wywołujący przekaże inną.

Gotowe, gdy:
- Unit: karta 4:5 z 8 wskaźnikami: obie mapy mają `legend`, wiersze nie zachodzą na siebie, odstęp między wierszami ≤ 1,5× wysokości wiersza; przy 20 wskaźnikach powstają ≥ 2 karty; stopka `faktografia.eu`.
- W PR: „trzeba odświeżyć zrzuty (Update snapshots)”.

---

# B03 – Przyciski eksportu mieszczą się na telefonie
Cel: Żaden napis nie jest ucięty („Udostępni…”).
Zmieniaj: src/view/share/ShareActions.tsx, tests/e2e/share-actions-fit.spec.ts
Wymagane: tests/e2e/share-actions-fit.spec.ts
Przeczytaj najpierw: src/view/share/ShareActions.tsx

Zadanie:
1. Na < 768 px siatka 2×2, krótkie etykiety: „Obraz”, „Udostępnij”, „Zestaw”, „CSV”, pełna nazwa w `aria-label`. Wysokość ≥ 44 px, tekst z tokenów.
2. Formaty (Post/Kwadrat/Story/Poziomy) w jednym przewijanym rzędzie lub siatce 2×2 – bez osieroconego czwartego przycisku.

Gotowe, gdy:
- E2E (375×812): dla każdego przycisku `scrollWidth <= clientWidth`, wszystkie w viewport bez przewijania paska akcji.

---

# C01 – Podział ShareDialog na mniejsze pliki (≤ 200 linii)
Zmieniaj: src/view/share/ShareDialog.tsx, src/view/share/ShareDialogHeader.tsx (nowy), src/view/share/SharePreviewPanel.tsx (nowy)
Gotowe, gdy: każdy plik ≤ 200 linii; wszystkie istniejące testy share-* zielone bez zmian. Model: Haiku.

# C02 – Ranking w porównaniu z pełnej listy jednostek
Zmieniaj: src/view/profile/ProfileCompare.tsx, tests/unit/compare-ranking.test.ts
Gotowe, gdy: pozycja w rankingu liczona względem wszystkich jednostek poziomu (z już wczytanego pliku), nie tylko dwóch porównywanych; test na fixture.

# C03 – Niestabilne testy e2e
Zakres: picker-scroll @S14 (mobile), s19-share:113 (timeout), share-compare:84, camera @S16, compare-table, bottom-sheet-scroll.
Zasada: naprawiasz przyczynę (czekanie na stan `__atlas`, nie `waitForTimeout`); nie zmieniasz asercji. Każdy test 10× z `--repeat-each=10` zielony. Model: Sonnet.

---

# Fala 4 – właściciel (bez kodu)
1. Napisz „otwórz PR do main”, żeby F1–F5 i W17 trafiły na faktografia.eu.
2. GitHub → Settings: „Allow auto-merge”, „Allow GitHub Actions to create and approve pull requests”, secret `BDL_CLIENT_ID`, ochrona `main` z wymaganym CI.
3. Po B02: uruchom workflow „Update snapshots”.
