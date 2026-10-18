# CC7.1 – logika profilu jednostki (czysta logika)

## Zadanie
Zadanie: CC7.1 – logika profilu jednostki (czysta logika)
Kontekst: arkusz profilu (CC7.2) pokaże dla wybranej gminy/powiatu wartości wskaźników i miejsce w rankingu. Tu powstaje tylko logika. Wskaźniki: kontrakt Indicator, wartości: IndicatorValues (docs/MASTER_PLAN.md §4.5). Testy na danych syntetycznych.
Cel dla użytkownika: brak widocznej zmiany; to podstawa arkusza profilu.

Zakres (tylko te pliki):
- `src/core/profile/profile.ts` (nowy)
- `tests/unit/profile.test.ts` (nowy)
- `tests/fixtures/synthetic/profile-sample.json` (nowy, z polem `"_comment": "dane syntetyczne do testu"`)
- `docs/sessions/CC7.1.md`

Warunki odbioru:
1. `buildProfile(teryt, indicators, valuesById, units)` zwraca dla każdego wskaźnika: ostatni rok z wartością, wartość, miejsce w kraju i w województwie (wśród jednostek tego samego poziomu), liczbę jednostek w rankingu.
2. Kierunek rankingu z `higherIsBetter`; dla null (neutralny) ranking malejąco, z flagą `neutral: true`.
3. Remisy dostają to samo miejsce (test). Jednostki z null nie biorą udziału w rankingu i nie dostają miejsca.
4. Gdy wskaźnik ma `minLevel` wyższy niż poziom jednostki (np. powiat dla gminy), profil bierze wartość jednostki nadrzędnej i ustawia `fromParent: "<teryt rodzica>"`.
5. Nieznany TERYT zwraca pusty profil bez wyjątku. Moduł bez Reacta i DOM.

## Podsumowanie prac
- Utworzono fixture `tests/fixtures/synthetic/profile-sample.json` zawierający dane syntetyczne dla jednostek wszystkich poziomów, wskaźników z różnym kierunkiem (`higherIsBetter`: true/false/null) oraz minLevel (`gmi`/`pow`).
- Napisano pełny zestaw testów jednostkowych w `tests/unit/profile.test.ts` weryfikujący wszystkie warunki odbioru.
- Zaimplementowano moduł czystej logiki profilu jednostki w `src/core/profile/profile.ts` (funkcja `buildProfile` wyliczająca pozycje krajowe, wojewódzkie, remisy, wartości nadrzędne oraz brakujące/nieznane kody TERYT).
