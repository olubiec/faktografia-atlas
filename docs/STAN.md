# Stan – 21.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie plików w repo i historii scaleń (main = commit 095b2bb). Sprawdzone przez właściciela na produkcji: nie, o ile nie napisano inaczej.
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`). Mapę można oddalić do całej Polski (S14.8). Sprawdzone: nie.
- Kolory mapy według wskaźnika (20 wskaźników GUS), legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, ranking. Lista wskaźników przewija się (S14.9). Sprawdzone: nie.
- Wyszukiwarka jednostek i miejscowości; nazwy gmin z rodzajem („Wałcz (miasto)”). Sprawdzone: nie.
- Profil miejsca na komputerze – częściowo nowy: wiersz wskaźnika rozwija się (wykres lat, objaśnienie, „Pokaż na mapie” – S14.2), zakreślenie trzyma się tekstu (S14.7). Brak: nowego nagłówka, dużej liczby z rankingiem, zakładek (S14.3, S14.4). Sprawdzone: nie.
- Telefon: **nie nadaje się do użytku** (oglądane 21.10 – panel nad mapą, mapa jako wąski pasek, profil zasłania resztę) → S15.
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`.

## Sesja teraz: S14 – Profil miejsca jak makieta 03 (dokończenie)
Kolejność: obejrzeć i scalić PR #198 (tekst zmiany w latach) → prompty 1–4 z `docs/prompty/S14.md` (przegląd, zakładki, test ścieżki, STAN). Szczegóły i „co zobaczysz”: `docs/PLAN.md`.

## Plan następnych sesji (1 linia każda; szczegóły w docs/PLAN.md)
- S15 – Telefon od nowa: mapa na cały ekran, dolny pasek wskaźnika z arkuszem, profil w arkuszu 40% → 100%, porządek z okruszkami, dymkiem i zgodą.
- S16 – Mapa: płynne wejście w głąb zamiast skoku – kamera podjeżdża, jednostki pojawiają się „kafelek po kafelku”, reszta kraju blednie, kolory przelewają się.
- S17 – Objaśnienia i „Na tle kraju” liczone z danych; legenda w trybie ciemnym; zwiad danych „miasto / obszar wiejski”.
- S18 – Porównanie dwóch miejsc (`?c=`), także na telefonie.

## Znane problemy / dług
- Telefon nieużywalny → S15. Wejście w głąb to skok bez animacji, reszta Polski znika → S16.
- Profil używa zakreślenia typu „highlight”, które zasłania tekst (np. „miejsce wśród 16”) → S14.3 usuwa je z wierszy, resztę kodu sprząta S17.5.
- Vercel: 21.10 wyczerpany dzienny limit 100 podglądów (PR #199 bez podglądu). Repo jest podpięte do **dwóch** projektów Vercel (`faktografia-atlas` i `faktografia-atlas-fvfq`) – każdy push liczy się podwójnie. Do zrobienia przez właściciela: usunąć jeden.
- Brak prostych objaśnień wskaźników → S17 (szkic tekstów: docs/data/explanations-szkic.json).
- Czas ładowania nie był mierzony na telefonie → S16.5.
- „Co działa” wyżej wymaga sprawdzenia na produkcji (wysoki priorytet).
- Klucz PostHog – przed statystykami wyszukiwań.

## Decyzje (najnowsze na górze, 1 linia, kto podjął)
- 21.10.2026 · Nocne PR-y z danymi: bez auto-scalania; wrócić do tematu, gdy będą ≥ 2 tygodniowo (robot otwiera PR tylko przy zmianie danych) (Ty, czat Claude)
- 21.10.2026 · Plan: S15 telefon, S16 płynne wejście w głąb „kafelek po kafelku”, S17 objaśnienia, S18 porównanie; profil na telefonie (S14.5) przeniesiony do S15 (Ty, czat Claude)
- 21.10.2026 · PR #199 (S14.3) zamknięty – dwa zakreślenia, własne czytanie adresu, zmienione testy; S14.3 od nowa nowym promptem. PR #198 (S14.10) – scalić po obejrzeniu podglądu (Ty, czat Claude)
- 21.10.2026 · Usunięte docs/zadania/, docs/sessions/, docs/archiwum/ (historia w gicie); prompty bieżącej sesji w docs/prompty/, plan w docs/PLAN.md (Ty, czat Claude)
- 21.10.2026 · Przejście na WORKFLOW v5: usunięte Autopilot, Tablica, etykiety zadań, Audytor, plik krytycznych, Issues zadań; zostają roboty danych, odświeżanie zrzutów, CI i CodeRabbit (Ty, czat Claude)
- 21.10.2026 · Kontekst „na tle kraju” liczony automatycznie z danych, ręczne objaśnienia opcjonalne i per wskaźnik (Ty, czat Claude)
- 21.10.2026 · S14 = profil miejsca wg makiety 03 (Ty, czat Claude)
