# Audyt fali W4 (Q4) – 20.11.2026

Stan: `main` = 1a54912. Audyt tylko do odczytu (6 subagentów). Niczego w kodzie nie zmieniono.

## 1. Werdykt na zadanie

| Zadanie | Werdykt | Co dalej |
|---|---|---|
| PM12 (koniec odpytywania adresu) | ZBĘDNE | `setInterval` nie ma w `src/`; pilnuje tego `tests/unit/use-choropleth-scope.test.tsx:129`. Zamknąć, bez nowego zdarzenia adresu. |
| QC403 (przyciski zoomu) | DO PRZEPISANIA | Brak `ZoomButtons`, `zoomStepTarget`, `useImperativeCamera`. Klawisze +/- skaczą bez animacji (`useMapViewState.ts` ~412). Znacznik D4 nieaktualny (D4 zatwierdzona 18.11, `PLAN-POPRAWEK.md:168`). |
| QC404 (animacja zejścia po poziomach) | ZAWĘZIĆ | FIX6 zrobił planer i napęd kamery. Zostaje: test e2e `q-drill-motion`, miejscowość skacze (`localityTargetRef`), próg 0,05 daje „instant” dla małych ruchów. |
| QC504 (lista Moje wskaźniki) | ZAWĘZIĆ | ×, „Przywróć podstawowe”, pusta lista, pola ≥44 px już są. Brak strzałek ‹ ›, `aria-current`, fokusu. |
| QC505 (okno dodawania) | ZAWĘZIĆ | `AddIndicatorWindow.tsx` już szuka w bibliotece (limit 50). Brak zakładek, okruszków, komunikatu „Nie ma takiego wskaźnika”. |
| QC506 (sekcja w panelu) | ZAWĘZIĆ (~80%) | Brak `aria-current` na aktywnym wierszu i testu `indicator-panel-my`. |
| QC508 (przycisk w Bibliotece) | ZAWĘZIĆ (zrobione) | Jest `AddToMineButton` (nazwa z promptu `MyToggleButton` nie istnieje). Brak tylko komunikatu `role="status"` znikającego po 3 s. |
| QC607 (picker z biblioteki) | DO PRZEPISANIA | Prompt sam sobie przeczy (≤300 vs limit 50 po korekcie 18.11). `IndicatorPicker.tsx` ma 302 linie, więc grupa musi iść do nowego pliku. Jest też `core/library/picker-results.ts`, o którym prompt nie wspomina. |
| QC802 (udostępnianie w Rankingach) | GOTOWE | `Rankings.tsx` bez `ShareBar`. Karta „ranking” już jest w `useShareData`. |
| QC803 (udostępnianie w Porównaj) | GOTOWE | `ComparePage.tsx` bez `ShareBar`; wzorzec w `ProfileCompare.tsx:234,476`. |
| QC912 (`useDeck`) | ZABLOKOWANE | Wymaga QC903 (`deck-defaults`) i QC904 (`deck-split`); brak ich w kodzie, a QC904 nie ma nawet pliku zadania. |

Zadania W3, od których coś zależy, **nie weszły na main**: PM10, PM02, QC606, QC503, QC903, QC904 (brak pliku), QC916, QC204.
Na main są inne: QC705 (#521), QC612 (#522), QC915 (#523).

## 2. Decyzje właściciela (blokują lub zmieniają zakres)

1. QU03: scalać/usuwać strony – wariant A, B czy C?
2. #531 (podpowiedzi tylko z pobranych): zmieniamy istniejący test czy porzucamy?
3. Czy Rankingi zostają osobną stroną? (blokuje QU14/15, a pośrednio QC802)
4. Wykresy lat: własny SVG czy pakiet (wpis do `ELEMENTY.md`)?
5. QC403: czy D4 obejmuje dopisanie `useMapViewState.ts` do „Zmieniaj”? (AGENTS.md chroni ten plik.)
6. Krok przycisków zoomu: 1 poziom, klawiszy 0,5? Położenie przycisków względem arkusza na telefonie?
7. PM10: uznajemy za zrobione przez FIX6, czy zostaje osobne zadanie?

Rekomendacja Claude: 3 → zostaje (mniej ryzyka przed W5); 5 → tak, wąsko (tylko `zoomBy`); 6 → 1 poziom / 0,5; 7 → zrobione przez FIX6, zadanie PM10 skreślić; 4 → własny SVG (zero nowych zależności), jeśli wykres jest prosty.

## 3. Plan: małe zadania, jeden subagent na zadanie

Zasady wspólne dla każdego subagenta: czyta tylko pliki z „Czyta”, zapisuje tylko „Zapisuje”, odpowiedź zwrotna ≤150 słów, bez zmian poza zakresem, bez commitów (commit/PR robi Claude po zgodzie właściciela). Modele: `haiku` do zbierania faktów, `sonnet` do analizy i kodu. Raporty piszą się do `docs/research/` (nie ruszają kodu).

### Runda A – badania (równolegle, tylko docs, bez decyzji właściciela)

| ID | Cel | Czyta | Zapisuje | Model |
|---|---|---|---|---|
| A1 = QU01 | Jak przełączają się karty w oknie udostępniania, gdzie gubi się stan | `src/view/share/*`, `src/core/share/*` | `docs/research/QU01-*.md` | sonnet |
| A2 = QU03 | Macierz duplikatów zakładek/stron, warianty A/B/C z kosztem | `src/view/pages/*`, routing, `PRODUKT.md` | `docs/research/QU03-*.md` | sonnet |
| A3 = QU04 + QU14 wejście | Rankingi: diagnoza obecnego układu, uwaga 21 (przebudowa od zera?) | `Rankings.tsx`, `RankingsFilters*`, `PLAN-UWAGI-19-11.md` | `docs/research/QU04-*.md` | sonnet |
| A4 = QU05 + QU26 | Wykres lat: wymagania z uwag 11 i 17, wspólny wykres z kursorem, SVG vs pakiet (tabela licencji, rozmiar) | kod wykresów, `ELEMENTY.md` | `docs/research/QU05-*.md` | sonnet |
| A5 = QU06 + QU25 | Menu kategorii i szukajka, uwagi 10 i 13 (filtr poziomów) | `src/view/library/*`, `core/library/*` | `docs/research/QU06-*.md` | sonnet |
| A6 = QU07 + QU27 | Biblioteka → mapa; klik miejsca otwiera mapę z danymi wskaźnika; kolizje z QC606/608/804/806 | `src/view/library/*`, `Home.tsx` (tylko czytanie) | `docs/research/QU07-*.md` | sonnet |
| A7 = QU20 + QU21 + QU29 | Mapa: kropki miejscowości, gmina miejska = miasto, nawigacja po powiecie (Wróć), zawieszenie przed animacją przybliżenia | `src/view/map/*`, `core/map/camera-*` (tylko czytanie) | `docs/research/QU20-21-29-*.md` | sonnet |
| A8 = QU22 + QU23 + QU24 | Logika Moje wskaźniki / wskaźnik mapy / zestaw kart; z-index zakładki „Przewiń w dół” nad oknem; pasek stron bez strzałek | `src/view/share/*`, `useMyIndicators.ts`, tokeny z-index | `docs/research/QU22-23-24-*.md` | sonnet |
| A9 = QU28 + QU30 + QU32 | Nazwa „Faktografia” bez „Atlas” (lista miejsc w repo), mapa nawigacji, prototyp strony startowej z animacją (`/design`) | grep po `src/`, `docs/PRODUKT.md` | `docs/research/QU28-30-32-*.md` | haiku |
| A10 = QU31 | Ślepe testy: które testy nie sprawdzają zachowania (np. tylko „renderuje się”) | `tests/unit`, `tests/e2e` (grep) | `docs/research/QU31-*.md` | haiku |

Każdy raport ma stałą strukturę: Fakty (plik:linia) · Wnioski · Warianty z kosztem · Rekomendacja · Pytania do właściciela. Dopisać do pliku zadania QU03–QU07 jawny zakaz zmian w kodzie (obecnie jest tylko w QU01).

### Runda B – wdrożenia (osobne PR-y, każdy jeden plik zadania)

Można puścić równolegle, bo pliki „Zmieniaj” się nie nakładają.

| ID | Zakres (zawężony) | Zmieniaj | Testy do napisania najpierw |
|---|---|---|---|
| B1 = QC802 | `ShareBar` + `LazyShareDialog` w Rankingach, dane z już policzonego rankingu | `src/view/pages/Rankings.tsx`, `tests/unit/rankings-share.test.tsx` | pasek jest, dialog otwiera kartę „ranking” |
| B2 = QC803 | to samo w Porównaj wg wzorca `ProfileCompare.tsx` | `src/view/pages/ComparePage.tsx`, `tests/unit/compare-page-share.test.tsx` | j.w. |
| B3 = QC607 | Grupa „Z biblioteki GUS” z limitem 50 i „Pokaż więcej”, użyć `searchIndicators` i `picker-results.ts` | `src/view/controls/IndicatorPicker.tsx`, nowy `LibraryGroup.tsx`, `tests/unit/indicator-picker-library.test.tsx` | limit, „Pokaż więcej”, brak duplikatu filtra |
| B4 = QC508-lite | komunikat `role="status"` 3 s po dodaniu/usunięciu | `src/view/library/AddToMineButton.tsx` + test | komunikat znika |
| B5 = QC506-lite | `aria-current` na aktywnym wierszu, test `indicator-panel-my` | `MyIndicatorsBar.tsx`, `IndicatorPanel.tsx`, `MobileIndicatorBar.tsx` | atrybut + test panelu |
| B6 = QC504-lite | strzałki ‹ › zamiast przeciągania, fokus po przesunięciu | `src/view/pages/MyIndicatorsBar.tsx` (lub nowy plik) | kolejność po kliknięciu, fokus |
| B7 = QC505-lite | zakładki Szukaj/Kategorie, okruszki, komunikat „Nie ma takiego wskaźnika” | `src/view/profile/AddIndicatorWindow.tsx` | wynik pusty, zakładki |
| B8 = QC403a | `ZoomButtons` + `zoomBy(±1)` | `ZoomButtons.tsx` (nowy), 1 linia w `AtlasMap.tsx`, `useMapViewState.ts` | po decyzji 5 i 6 |
| B9 = QC404-lite | test e2e `q-drill-motion`, poprawka miejscowości i progu 0,05 | `useMapViewState.ts` / testy e2e | po decyzji 5 |
| B10 = PM12 | Zamknąć bez kodu: dopisać notatkę w `STAN.md` (robi Claude) | – | – |

### Runda C – po decyzjach i po W3

QC903 → QC904 (trzeba najpierw napisać plik zadania) → QC912; QU10–QU17 wg zależności (QU10←QU01; QU11←QU06; QU12←QU03/07; QU13←decyzja 4; QU14←decyzja 3 i przed QU15; QU15←QU04; QU16←decyzja 1; QU17←QU16). Brakujące W3: QC606, QC503, QC916, QC204, PM02 – przejrzeć czy nadal potrzebne, bo część „Moje wskaźniki” zrobiły już QR/QS/UX.

## 4. Kolejność i oszczędność

1. Teraz: Runda A (10 agentów, głównie sonnet/haiku, bez kodu) + Runda B1–B7 (nie zależą od decyzji).
2. Po odpowiedzi na decyzje 5–7: B8, B9.
3. Po raportach A: korekta promptów QU10–QU17 i napisanie plików QC904 oraz brakujących QU33+.
4. Na końcu: Claude aktualizuje `STAN.md` i `FALE.md` (nie robią tego agenci).
