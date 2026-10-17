# Sesja CC5.3a – parser miejscowości z PRNG (bez sieci, bez pliku z danymi)

## Kontekst
Stworzenie czystej biblioteki funkcji dla parsera miejscowości z Państwowego Rejestru Nazw Geograficznych (PRNG, GUGiK) bez wykonywania zapytań sieciowych i bez generowania dużego pliku danych w repozytorium. Pobieranie danych PRNG będzie osobnym krokiem w GitHub Actions (CC5.3b).

## Zrealizowane zakresy
- `scripts/geo/localities-parse.mjs`:
  - `STANDALONE_KINDS`: lista dozwolonych rodzajów miejscowości (`miasto`, `wieś`, `osada`, `kolonia`, `osada leśna`).
  - `isStandalone(feature)`: zwraca true wyłącznie gdy `kategoriaObiektu === 'miejscowość'` oraz rodzajObiektu znajduje się na liście `STANDALONE_KINDS`.
  - `toLocality(feature)`: transformuje obiekt z PRNG na strukturę `Locality` (`id`, `name`, `gminaTeryt`, `lon`, `lat`, `approx`). Zaokrągla współrzędne do 4 miejsc po przecinku, dopisuje zera do 7 cyfr w kodzie TERYT.
  - `buildLocalities(features, units)`: filtruje obiekty, odrzuca nieistniejące gminy (do tablicy `skipped`), usuwa duplikaty po `id`, sortuje według `id`, dla obiektów bez geometrii przypisuje centroid gminy z `units.json`.
  - `summarize(result)`: wylicza statystyki rodzajów, obiektów przybliżonych (`approx`) oraz pominiętych (`skipped`).
  - `serialize(localities)` / `assertSizeUnder(json, maxBytes)`: serializuje dane do zwartego JSON bez wcięć i sprawdza limit rozmiaru (maks. 3 MB).
- `tests/fixtures/prng/sample.json`:
  - Próbka fixture z adnotacją `_uwaga` oraz reprezentatywnymi przypadkami (Zakopane, Bukowina Tatrzańska, Osiedle Struga, brak geometrii, błędna gmina, części wsi/miast, przysiółek).
- `tests/unit/localities.test.ts`:
  - Kompleksowy zestaw testów jednostkowych weryfikujący wszystkie warunki odbioru zadania.
- `docs/data-sources.md`:
  - Sekcja „Miejscowości (PRNG)” z opisem metadanych źródła, struktury pól i uwagi o licencji do sprawdzenia w CC5.3b.
- `docs/sessions/CC5.3a.md`:
  - Zapis podsumowania sesji.
