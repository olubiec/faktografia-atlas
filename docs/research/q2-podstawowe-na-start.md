# QR01 – Audyt zasady „na start tylko podstawowe”

Data: 19.11.2026 · stan kodu: `origin/main` 3ed628d · tylko odczyt kodu, bez zmian w kodzie.
Zasada: PRODUKT §4a (decyzja 19.11.2026) i §4f – na start 7 wskaźników podstawowych (`BASIC_INDICATORS`), każdy z ×, „+ Dodaj”, „Przywróć podstawowe”, lista może być pusta.

## Ustalenia
Źródło prawdy jest jedno i działa: `BASIC_INDICATORS` (7 id, wszystkie istnieją w `config/indicators.json`), zapis `faktografia-my-indicators`, hook `useMyIndicators`. Trzy ekrany go używają (Profil – lista, Porównaj – strona, Rankingi). Pięć miejsc łamie zasadę albo jej nie realizuje:

| # | Miejsce | Co jest na starcie | Co powinno być | Poprawka |
|---|---|---|---|---|
| 1 | Profil, zakładka „Porównaj” | tabela ze wszystkimi wskaźnikami profilu (ok. 20), bez ×, bez „Dodaj” | 7 podstawowych (lista „Moje wskaźniki”), × w wierszu, „+ Dodaj wskaźnik”, „Przywróć podstawowe” | `restrictProfile` (już jest w `CompareIndicatorPicker`) + ten sam pasek wyboru nad `ProfileCompareTable` |
| 2 | Profil, lista wskaźników bez `view` | `personalize={Boolean(view)}` – bez `view` pokazuje wszystkie, bez × i „Dodaj” | zawsze lista „Moje” | `personalize` zawsze włączone (usunąć warunek) |
| 3 | Panel mapy (komputer) i arkusz wskaźnika (telefon) | `IndicatorPicker` dostaje wszystkie 20 wskaźników; brak „Moich” na górze | na górze 7 „Moich”, reszta za „Dodaj wskaźnik” (okno z zakładkami Szukaj/Kategorie) | `useMyIndicators` w panelu: lista rozwijana pokazuje „Moje” + bieżący; × / „+ Dodaj” / „Przywróć” jak w Rankingach |
| 4 | Biblioteka (`/biblioteka`) | kafelki działów, filtry i lista pierwszych 50 wyników z 1773 pobranych; brak sekcji „Moje wskaźniki” | na górze sekcja „Moje wskaźniki” (7), pełna lista pod wyszukiwaniem lub kategorią | sekcja nad `CategoryTiles` z `useMyIndicators`; lista wyników pusta, dopóki nie ma zapytania lub działu (pusty stan: podpowiedź) |
| 5 | Okno udostępniania (karta Profil, karta Porównanie, CSV) | karta Profil bierze `view.indicators` (wszystkie 20) i obcina `slice(0, 5)` – to pierwsze 5 z katalogu, nie „Moje”; CSV profilu i porównania zawiera wszystkie wiersze (`profileCsv`, `compareCsv`); `initialDeck` daje stronom tylko bieżący wskaźnik | dane stron = „Moje wskaźniki” (PRODUKT §4b: domyślnie lista „Moje”); „Dane na tej stronie” z × i „+ Dodaj dane” | filtrować `view.indicators` i `unitProfile`/`compareRows` listą „Moje”; użyć `seedIndicators` (jest w `deck-page-data.ts`, nigdzie niewywoływane) |

Miejsca zgodne z zasadą: Porównaj (strona `/porownaj`: `restrictProfile` + `CompareIndicatorPicker`, test `compare-page-defaults.test.tsx`), Rankingi (`pickShownIndicators` + `MyIndicatorsBar`), lista w arkuszu profilu z `view`.
Dodatkowo: ranking w Rankingach ma na sztywno `median: 50 // Mocked for test` (`Rankings.tsx:127`) – to nie jest temat QR01, ale liczba na ekranie jest fałszywa; do osobnej poprawki (zadanie 6).

## Dowody
- `src/core/my-indicators/my-indicators.ts:4-12` – 7 podstawowych; `storage.ts:17-28` – brak wpisu = lista podstawowa.
- `grep -rn "useMyIndicators" src` – użycia tylko w: `ProfileIndicatorList.tsx:45`, `Rankings.tsx:81`, `ComparePage.tsx:103`. Brak w panelu mapy, Bibliotece, oknie udostępniania.
- `src/view/profile/ProfileCompare.tsx:438` – `<ProfileCompareTable profileA={profileA} profileB={profileB} />` bez filtrowania; `:233` `compare(profileA, profileB)` na pełnym profilu; `:330` `compareRows: compResult.rows` do eksportu. Por. `ComparePage.tsx:169-170` (poprawnie: `restrictProfile`).
- `src/view/profile/ProfileSheet.tsx:172` – `personalize={Boolean(view)}`; `ProfileIndicatorList.tsx:48-53` – bez personalizacji `shown = items`.
- `src/view/main/IndicatorPanel.tsx:115,129` – `indicators={indicators}`; `src/view/map/hooks/useMainView.ts:10,86` – `indicators: INDICATORS` (całe `config/indicators.json`, 20).
- `src/view/pages/Library.tsx:55-90` – brak sekcji „Moje”; `LibraryResults.tsx:42,53` – `limit` 50 wyników od razu.
- `src/view/share/useShareData.ts:191,205` – `buildProfile(..., view.indicators, ...)` i `.slice(0, 5)`; `:240-247` `initialDeck` – tylko `[data.indicator.id]`; `:283-287` CSV z pełnych danych.
- `grep -rn "seedIndicators" src` – tylko definicja w `src/core/share/deck-page-data.ts:43` (nieużywana).
- Polecenie sprawdzające ID: pętla `grep -c '"id": "<id>"' config/indicators.json` dla 7 id – wynik 1 dla każdego.

## Rekomendacja
Rozszerzyć istniejący model „Moje wskaźniki” na brakujące miejsca, bez nowych abstrakcji i bez zmiany listy podstawowej. Kolejność wdrożenia: najpierw 1 i 2 (Profil – najczęściej oglądany ekran, najmniejsza zmiana), potem 5 (eksport, bo kopiuje błąd do plików użytkownika), potem 3 (panel mapy), na końcu 4 (Biblioteka). Wspólny element „pasek Moich wskaźników” (×, „+ Dodaj”, „Przywróć podstawowe”) wyciągnąć raz w pierwszym zadaniu i używać w kolejnych; Rankingi i Porównaj zostają bez zmian.
Panel mapy (3): zmieniamy tylko zawartość listy rozwijanej – bieżący wskaźnik z adresu (`?i=`) zawsze jest widoczny, nawet spoza listy (jak w Rankingach), a link nie zmienia listy użytkownika.

## Proponowane zadania
1. **Profil: zakładka Porównaj i lista bez `view`**
   Zmieniaj: `src/view/profile/ProfileCompare.tsx`, `src/view/profile/ProfileSheet.tsx`, `tests/unit/profile-compare-basic.test.tsx` (nowy).
   Cel: zakładka „Porównaj” w profilu otwiera się z 7 podstawowymi, ma ×, „+ Dodaj wskaźnik”, „Przywróć podstawowe”; lista profilu zawsze spersonalizowana.
   Gotowe, gdy: test – tabela ma 7 wierszy przy czystym zapisie; × usuwa wiersz; „Przywróć” wraca do 7; profil bez `view` też pokazuje 7.
2. **Okno udostępniania: dane z „Moich wskaźników”**
   Zmieniaj: `src/view/share/useShareData.ts`, `tests/unit/share-basic-data.test.ts` (nowy).
   Cel: karta Profil, CSV profilu i porównania oraz `initialDeck` biorą wskaźniki z listy „Moje” (przez `seedIndicators`), nie z całego katalogu.
   Gotowe, gdy: test – przy czystym zapisie CSV profilu ma 7 wierszy wskaźników, karta Profil pokazuje wskaźniki z listy; po usunięciu jednego z listy znika z eksportu.
3. **Panel mapy i arkusz telefonu: „Moje” na górze**
   Zmieniaj: `src/view/main/IndicatorPanel.tsx`, `src/view/main/MobileIndicatorBar.tsx`, `tests/unit/indicator-panel-basic.test.tsx` (nowy).
   Cel: lista wyboru wskaźnika pokazuje 7 „Moich” + bieżący; reszta przez „+ Dodaj wskaźnik”; „Przywróć podstawowe”.
   Gotowe, gdy: test – czysty zapis = 7 pozycji; bieżący wskaźnik spoza listy jest widoczny; dodanie z okna dopisuje pozycję.
4. **Biblioteka: sekcja „Moje wskaźniki” i pusty stan listy**
   Zmieniaj: `src/view/pages/Library.tsx`, `src/view/library/MyIndicatorsSection.tsx` (nowy), `tests/unit/library-my-indicators.test.tsx` (nowy).
   Cel: na górze 7 „Moich” (× i „Przywróć”), lista 1773 wyników pokazuje się dopiero po zapytaniu lub wyborze działu.
   Gotowe, gdy: test – bez zapytania widać sekcję „Moje” i podpowiedź, nie listę; po wpisaniu frazy lub wyborze działu lista się pojawia.
5. **Strażnik zasady**
   Zmieniaj: `tests/unit/basic-on-start-guard.test.ts` (nowy).
   Cel: jeden test sprawdza, że `BASIC_INDICATORS` ma 7 id istniejących w katalogu, a każdy ekran z listy wyżej renderuje na czystym zapisie dokładnie tyle.
   Gotowe, gdy: test przechodzi po zadaniach 1–4 i zawodzi, gdy któryś ekran wróci do pełnej listy.
6. **Rankingi: usunąć sztuczną medianę**
   Zmieniaj: `src/view/pages/Rankings.tsx`, `tests/unit/rankings-median.test.tsx` (nowy).
   Cel: zamiast `median: 50 // Mocked for test` mediana z danych (`rankings-summary.ts`).
   Gotowe, gdy: test – przy znanych danych wyświetlona mediana równa się policzonej, nie 50.
