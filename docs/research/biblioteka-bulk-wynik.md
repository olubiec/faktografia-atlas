# Zbiorczy eksport BDL: wynik weryfikacji (25.10.2026)
Źródło: raport Gemini Deep Research. Weryfikacja: Claude, 25.10.2026.

## Wniosek raportu, który stoi
Nie „kupujemy czasu robota” przez miesiące: dane BDL się zmieniają, więc pobranie rozłożone na miesiące jest niespójne. Najlepsza droga to prośba do GUS o zbiorczy zrzut.

## Błędne lub niepotwierdzone
- Liczba „ok. 1 mln zapytań” – **błędna**. Nasz pomiar: ok. 38 zapytań na wskaźnik; z kluczem 5000 zapytań / 12 h i 50 000 / 7 dni, czyli ok. 1000 wskaźników tygodniowo.
- Ścieżka „Pobrane podgrupy” (ZIP z CSV/XLSX) w BDL i adres e-mail sekretariatu – niepotwierdzone (strony GUS poza dozwolonymi dla narzędzia). Sprawdź ręcznie w przeglądarce.
- Potwierdzone: formularz „Formularz zapytania o dane” (new.stat.gov.pl), limit 1000 znaków w polu tekstowym.

## Pismo do GUS (gotowe, ≤ 1000 znaków; do wklejenia w formularz)
Dzień dobry,
prowadzę nieodpłatny, publiczny serwis „Faktografia Atlas” (interaktywna mapa Polski z danymi GUS). Korzystam z API BDL i rejestruję pobrane dane jako źródło GUS. Chcę udostępnić użytkownikom pełny katalog wskaźników BDL dla poziomów województw, powiatów i gmin. Pobieranie przez API przy limitach (5000 zapytań/12 h) zajęłoby wiele miesięcy, a dane w tym czasie ulegają zmianom, co daje niespójny zbiór.
Proszę o informację, czy GUS udostępnia zbiorczy zrzut danych BDL (wszystkie zmienne, jednostki do poziomu gminy, wszystkie lata) w formacie CSV/JSON/XLSX albo czy możliwe jest podniesienie limitów dla mojego klucza. Podstawa: ustawa o otwartych danych i ponownym wykorzystywaniu informacji sektora publicznego.
Z poważaniem,
<imię i nazwisko, kontakt>
## Stan
Pismo wysyła Właściciel, kiedy zechce. Bez odpowiedzi robot dalej zbiera dane (ok. 1000 wskaźników tygodniowo).
