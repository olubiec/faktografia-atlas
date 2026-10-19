# Sesja CC7.2a – Komponent arkusza profilu jednostki (komputer)

## Cel zadania
Stworzenie komponentu arkusza profilu jednostki (`ProfileSheet`) na komputer (zerowa szerokość mobilna/podpięcie pod mapę, stała szerokość 440 px), bez podpinania pod mapę, prezentującego dane profilu jednostki zgodnie z makietą `docs/design/03-profil-komputer.png` i wytycznymi z `STYL.md`.

## Zakres zmian
- `src/view/profile/ProfileIndicatorRow.tsx` (nowy) – pojedynczy wiersz wskaźnika w profilu z sformatowaną wartością (`formatValue`), rokiem, rangą w kraju i rodzicielskim dopiskiem fallback (`dane dla powiatu ...`) oraz przypisem (`footnote`).
- `src/view/profile/ProfileSheet.tsx` (nowy) – komponent arkusza profilu jednostki korzystający z `Sheet.tsx`, nagłówka jednostki (nazwa, poziom, TERYT), przycisku zamknięcia (44 px touch target, `aria-label`, skrót Esc), pogrupowanych wskaźników oraz stopki źródła (`formatSource`).
- `src/view/design/DesignPage.tsx` – dodanie sekcji 13a prezentującej komponent `ProfileSheet` zbudowany na danych syntetycznych z `tests/fixtures/synthetic/profile-sample.json`.
- `tests/unit/profile-sheet.test.tsx` (nowy) – zestaw unit testów pokrywających wszystkie warunki odbioru dla arkusza profilu i wiersza wskaźnika.
- `docs/sessions/CC7.2a.md` – niniejsza dokumentacja sesji.

## Warunki odbioru

| Warunek odbioru | Status | Weryfikacja |
| --- | --- | --- |
| Nagłówek: nazwa jednostki, poziom i TERYT małym tekstem | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 1) |
| Przycisk zamknięcia (min. 44 px, `aria-label="Zamknij"`, Esc wywołuje `onClose`) | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 1) |
| Wskaźniki pogrupowane wg `indicator.group` | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 2) |
| Wiersz: nazwa, wartość przez `formatValue` z jednostką, rok, miejsce w kraju bez słów "lepsze/gorsze" dla wskaźnika neutralnego | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 2 & 3) |
| Brak danych: tekst "brak danych", nigdy "0" | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 4) |
| Wartość z poziomu wyższego (`fromParent`): dopisek "dane dla powiatu [nazwa]" | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 5) |
| Pod listą źródło przez `formatSource(rok)` | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 2) |
| Przypis (`footnote`) widoczny pod wierszem wskaźnika | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 6) |
| Brak wychodzenia tekstu poza pole przy najdłuższych nazwach z `units.json` i `indicators.json` | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 7) |
| Zgodność ze `STYL.md` (tło arkusz, ramka linia, bez cieni i zaokrągleń poza `rounded-none`, tokeny) | Spełniony | `tests/unit/profile-sheet.test.tsx` (test 8) |

## Testy i weryfikacja
- Wszystkie jednostkowe testy w `tests/unit/profile-sheet.test.tsx` wykonane pomyślnie.
- Komponent zweryfikowany na podstronie `/design`.
