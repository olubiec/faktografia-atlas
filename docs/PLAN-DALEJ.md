# Plan dalszych prac (dopisane na prośbę właściciela, 16.11)

## 1. Dane z GUS codziennie, od razu na stronie
- Robot w GitHub Actions pobiera dane GUS raz dziennie i zapisuje je do `public/data`.
- Po zapisie dane trafiają na stronę bez ręcznego kroku: automatyczne scalenie zielonego PR (albo zapis wprost na gałąź produkcyjną) i nowe wdrożenie na Vercelu.
- Stan (fala D): `fetch-data.yml` biegnie codziennie (cron 01:10 UTC), zapisuje dane na `data/nightly`, otwiera PR i włącza auto-merge (squash) po zielonym CI; scalenie na main uruchamia wdrożenie Vercel. Wybrano PR + auto-merge zamiast commitu wprost (CI jako bezpiecznik).
- Strażnik anomalii (`nightly-checks.mjs anomaly`, `checkAnomalies`): odrzuca aktualizację, gdy brakuje pliku wskaźnika albo liczba jednostek/wartości spadła o >20% względem main; krok jest przed commitem.
- Limity BDL: API GUS ma limity zapytań na sekundę/kwartał/dzień (znacznie wyższe z kluczem `BDL_CLIENT_ID`, który jest sekretem repozytorium); pobieranie jest więc wolne (krok do 135 min) i wznawialne. Dokładne wartości limitów do potwierdzenia w dokumentacji BDL.
- Właściciel ustawia w GitHub: Settings → General → włączyć „Allow auto-merge”; Actions → General → „Allow GitHub Actions to create and approve pull requests”; sekret `BDL_CLIENT_ID`; ochrona main z wymaganym CI.
- Do ustalenia z właścicielem: czy „baza” = pliki w repozytorium (jak teraz), czy osobna baza.

## 2. Układ strony do pełnej customizacji
- Domyślnie widać tylko kilka podstawowych wskaźników.
- Użytkownik wybiera, które wskaźniki i bloki widzi i w jakiej kolejności; wybór zapamiętany w przeglądarce.
- Karty graficzne do pobrania biorą ten sam wybór (te same wskaźniki, ta sama kolejność).
- Z tym łączą się warianty wielostronicowe kart (1/5, 2/5…) i przycisk „Pobierz wszystkie”.

## 3. Animacje na wszystkich poziomach
- Wejście i wyjście: Polska → województwo → powiat → gmina → miejscowość, w obie strony.
- Pojawianie się i wypełnianie pól (poligonów) po zejściu poziom niżej oraz przy zmianie wskaźnika.
- Tylko gotowe, sprawdzone rozwiązania (deck.gl `transitions` i `FlyToInterpolator`), wszystko z tokenów, wyłączone przy ograniczeniu ruchu.

## 4. Domena faktografia.eu (home.pl + Vercel)
- Rekord A dla domeny głównej i CNAME dla `www` w DNS home.pl; domena dodana w Vercelu.
- Po podpięciu: zrobione: stopka kart to faktografia.eu.

### Decyzja do punktu 2 (układ): bez nowych pakietów
- Edytor to prosta lista z przyciskami „w górę / w dół” i przełącznikiem widoczności (pola min. 44 px), bez przeciągania.
- Powód: dnd-kit i react-grid-layout (obie MIT) rozwiązują przeciąganie, którego na telefonie nie chcemy (konflikt z przewijaniem, słaba dostępność); przyciski działają z klawiatury i czytnika. Bez nowego pakietu nie ma wpisu w `docs/ELEMENTY.md`. Uwaga: ocena bez sprawdzenia w rejestrze npm (brak dostępu do wyszukiwarki w tej sesji); jeśli właściciel zechce przeciąganie, sprawdzić wtedy wersję i licencję.
- Model: `src/core/layout/` (bloki `{id, visible}`, presety „podstawowy” i „pełny”, zapis URL-safe `a.-b.c`, localStorage przez adapter). Grafika do pobrania ma czytać `visibleIds(layout)`.
- Edytor: `src/view/layout/LayoutEditor.tsx`; podpięcie do Home/ProfileSheet/ShareDialog w następnym kroku.

## Podsumowanie fal A–E (stan na 16.11)

Zrobione:
- A: model układu strony (`src/core/layout/`, presety „podstawowy” i „pełny”) i edytor z przyciskami góra/dół.
- B: animacje poziomów i zmiany wskaźnika (crossfade warstw choropleth, kamera), wyłączone przy ograniczeniu ruchu.
- C: układ profilu czytany z wyboru użytkownika; domyślnie pokazuje podstawowe bloki.
- D: codzienny robot danych GUS (`fetch-data.yml`, PR + auto-merge po zielonym CI, strażnik anomalii).
- E: adres kanoniczny i `og:url` ustawione na https://faktografia.eu/ w `index.html`.

Do ustawienia przez właściciela:
- GitHub → Settings → General: włączyć „Allow auto-merge”.
- GitHub → Settings → Actions → General: „Allow GitHub Actions to create and approve pull requests”.
- Sekret repozytorium `BDL_CLIENT_ID` (klucz BDL GUS, wyższe limity zapytań).
- Ochrona gałęzi `main` z wymaganym zielonym CI.
- DNS home.pl (rekord A i CNAME `www`) oraz dodanie domeny w Vercelu.
- Uruchomienie workflow „Update snapshots” po zmianach wyglądu.
