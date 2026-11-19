# QR03 – Które wzorce zrzutów zmieniły się po Q2 (PR #506–#523)

Stan: 19.11.2026, main 3ed628d. Zakres porównania: `git diff 04baf72 c5e4595` (04baf72 = #505, c5e4595 = #523, ostatni PR Q2).

## Ustalenia
1. W repozytorium jest **jedna** specyfikacja z `toHaveScreenshot`: `tests/e2e/design.spec.ts` (test „captures visual regression snapshots on CI”, tylko gdy `CI`). Jedyny katalog `*-snapshots`: `tests/e2e/design.spec.ts-snapshots/` (4 pliki PNG). Żadna inna spec e2e nie robi zrzutów pikselowych.
2. Strona `/design` (`src/view/design/DesignPage.tsx`) importuje tylko: `components/ui/*`, `view/ui/*`, `annotation/*`, `legend/*`, `profile/ProfileSheet`, `profile/ProfileSheetMobile`, `core/legend`, `core/profile`. **Żaden z tych plików nie został zmieniony w #506–#523.**
3. Jedyny zmieniony plik z grafu `/design` jest pośredni: `src/view/profile/ProfileCompareTable.tsx` (#522, QC612), osiągalny przez `ProfileSheet` → `ProfileCompare` → `ProfileCompareTable`. Tabela renderuje się dopiero po wybraniu drugiej jednostki; na `/design` zakładka „Porównaj” jest nieaktywna i nikt nie wybiera drugiej jednostki. Tabela nie trafia do zrzutu.

| Spec | Zrzut | PR, który go zmienia | Pewność |
|---|---|---|---|
| design.spec.ts | design-desktop-light | żaden z #506–#523 | pewne, że bez zmian |
| design.spec.ts | design-desktop-dark | żaden z #506–#523 | pewne, że bez zmian |
| design.spec.ts | design-mobile-light | żaden z #506–#523 | pewne, że bez zmian |
| design.spec.ts | design-mobile-dark | żaden z #506–#523 | pewne, że bez zmian |
| (inne specs) | brak zrzutów | – | pewne |

4. Pozostałe zmiany Q2 (ranking, biblioteka, porównaj, eksport, obrys, `load-available`, karty udostępniania) dotyczą ekranów, które nie mają zrzutów pikselowych. Mapę WebGL sprawdzają testy przez `window.__atlas`, nie przez piksele. Tamte ekrany pokrywają testy zachowania (zmienione specs: `library-search`, `q-compare`, `s21-library`, bez `toHaveScreenshot`).
5. Poza zakresem Q2, ale w tym samym pliku: po ostatniej zmianie wzorców (bb41d48, #458, 17.11) `src/view/profile/ProfileSheet.tsx` zmieniły #477 (877a520, 2 linie) i #479 (0021a6e, −38 linii, 18.11). Rendering arkusza na `/design` mógł się przez to zmienić: **możliwe**, nie wynika z Q2. Rozstrzygnie to CI (porównanie z wzorcem), nie czytanie kodu.

## Dowody
- `grep -rln "toHaveScreenshot\|toMatchSnapshot" . --exclude-dir=node_modules` → `tests/e2e/design.spec.ts`, `.github/workflows/update-snapshots.yml` (tylko komentarz/polecenie), katalog zrzutów.
- `find . -name '*snapshots*'` (bez node_modules) → `tests/e2e/design.spec.ts-snapshots/` z: design-{desktop,mobile}-{light,dark}-chromium-linux.png.
- `tests/e2e/design.spec.ts:69-100` – cztery `toHaveScreenshot` (1440×900 jasny/ciemny, 390×844 ciemny/jasny), `fullPage: true`, `maxDiffPixelRatio: 0.005`.
- `.github/workflows/update-snapshots.yml:68` – `playwright test tests/e2e/design.spec.ts --update-snapshots`; l.77 `git add tests/e2e/design.spec.ts-snapshots/`.
- `src/App.tsx:14,30` – trasa `/design` → `DesignPage`. `src/view/design/DesignPage.tsx:1-48` – lista importów (patrz ustalenie 2).
- `git diff --name-only 04baf72 c5e4595 -- src/view/ui src/view/legend src/view/annotation src/components src/index.css src/styles config public/brand package.json | wc -l` → `0`.
- `git diff --name-only 04baf72 c5e4595 | grep -v '^\(src\|tests\|tasks\)/'` → tylko `docs/PRODUKT.md` (brak CSS, tokenów, konfiguracji, zależności).
- `grep -rn ProfileCompareTable src` → użycia: `profile/ProfileCompare.tsx:438` (render dopiero w gałęzi „wybrano drugi profil”, l.412+; bez wyboru zwraca pole wyszukiwania, l.346) oraz `pages/ComparePage.tsx:168` (nie jest częścią `/design`).
- `src/view/profile/ProfileSheet.tsx:186-193` – `ProfileCompare` jest w `TabsContent value="compare"`, bez `profileB`; `DesignPage.tsx:509-513` przekazuje tylko `profile`, `units`, `onClose`.
- `git log bb41d48..HEAD -- src/view/profile/ProfileSheet.tsx ...` → 0021a6e (#479), 877a520 (#477); `git log -- tests/e2e/design.spec.ts-snapshots` → ostatni wpis bb41d48.

## Rekomendacja
**Nie uruchamiać workflowu „Update snapshots” z powodu Q2.** Lista do odświeżenia po #506–#523 jest pusta: ani jedna specyfikacja, ani jeden z 4 zrzutów `/design` nie zmienia się przez te PR-y (pewne). Jedyna rzecz do sprawdzenia to ustalenie 5 (zmiany `ProfileSheet.tsx` z #477/#479 po ostatnim odświeżeniu wzorców): jeśli test „captures visual regression snapshots on CI” jest zielony na main, wzorce są aktualne i nie robić nic; jeśli czerwony, właściciel uruchamia „Update snapshots” raz, na gałęzi z main, i ogląda 4 PNG w „Files changed”. Agent nie generuje wzorców u siebie (AGENTS.md).

## Proponowane zadania
1. **Odczyt wyniku CI zrzutów /design na main** (bez zmian w kodzie)
   - Zmieniaj: docs/research/q2-zrzuty-wplyw.md (dopisek „Wynik CI”: link do przebiegu, zielone/czerwone)
   - Cel: rozstrzygnąć ustalenie 5, czy wzorce `/design` są aktualne po #477/#479.
   - Gotowe, gdy: dopisek podaje numer przebiegu CI na main, status testu „captures visual regression snapshots on CI” i, gdy czerwony, nazwy różniących się zrzutów (z artefaktu raportu Playwright).
2. **Test strażnika: zrzut /design zawiera tabelę porównania** (tylko jeśli właściciel zechce objąć ją zrzutem)
   - Zmieniaj: tests/e2e/design-compare-table.spec.ts (nowy plik)
   - Cel: dziś zmiany `ProfileCompareTable` nie są chronione zrzutem; test DOM (nie piksele) sprawdza przycisk „Usuń wiersz” i brak nakładania napisów w wąskim polu 390 px.
   - Gotowe, gdy: test `@S…` sprawdza na 390 px, że napis wiersza nie wychodzi poza pole, a przycisk × ma co najmniej 44×44 px; istniejące testy bez zmian.
