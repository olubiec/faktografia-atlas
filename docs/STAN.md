# Stan – 21.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie plików w repo, stan z commitu 6fc0490 (sprawdzone przez właściciela na produkcji: nie).
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`). Sprawdzone: nie.
- Kolory mapy według wskaźnika (20 wskaźników GUS w `public/data/values/`), legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, ranking. Sprawdzone: nie.
- Wyszukiwarka jednostek i miejscowości; nazwy gmin z rodzajem („Wałcz (miasto)”) w wyszukiwarce i okruszkach (CC13.6). Sprawdzone: nie.
- Profil miejsca – **stara wersja**: lista wskaźników w grupach z wykresikiem i miejscem w kraju; bez zakładek, rankingu, rozwijania i „Pokaż na mapie” (zakres S14).
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`.
- Objaśnienia wskaźników: kod gotowy, brak pliku z treścią (S15).

## Sesja teraz: S14 – Profil miejsca jak makieta 03
Po wybraniu miejsca użytkownik ma zobaczyć profil z nagłówkiem bez powtórzeń, bieżącym wskaźnikiem, rankingiem, zakładkami jednostek podrzędnych, rozwijanymi wskaźnikami i „Kopiuj link”. Szczegóły zadań: docs/PLAN.md i docs/zadania/S14.md.

## Plan następnych sesji (1 linia każda)
- S15 – poprawki po oglądzie właściciela i pomiary szybkości (legenda w trybie ciemnym, dane „miasto”, treść objaśnień).
- S16 – objaśnienia wskaźników i „Na tle kraju” liczone automatycznie z danych.
- S17 – porównanie dwóch miejsc (`?c=`).
- S18 – płynne przejścia, ruch i widoczność w wyszukiwarkach.

## Znane problemy / dług
- Zakreślenie nie podąża za tekstem przy przewijaniu profilu → S14.7. Nie da się oddalić mapy do całej Polski → S14.8.
- Profil gminy pokazuje „Gmina” zamiast „Gmina miejska Szczecin” → S14.3 (unitTitle). Dane „samo miasto” w gminach miejsko-wiejskich – zwiad w S15.
- Lista wyboru wskaźnika i panel nie przewijają się na telefonie → S14.9. Malutkie wykresy w profilu nieczytelne → S14.2 i S14.10.
- Brak prostych objaśnień wskaźników → S16 (szkic tekstów: docs/data/explanations-szkic.json). Treść objaśnień 20 wskaźników – dług średni.
- Brak przejść/animacji przy zmianie wskaźnika → S18. Czas ładowania do zmierzenia → S15.
- Ekran główny nie był oglądany przez właściciela po fali 9 (CC13) – zauważone błędy → S15.
- Zakładka „Porównaj” będzie nieaktywna („wkrótce”) do S16.
- „Co działa” wyżej wymaga sprawdzenia na produkcji (wysoki priorytet).
- Podpięcie Vercel do repo (podgląd PR) – jeśli jeszcze nie zrobione, potrzebne przed scalaniem zmian widocznych.
- Klucz PostHog – przed statystykami wyszukiwań.

## Decyzje (najnowsze na górze, 1 linia, kto podjął)
- 21.10.2026 · Przejście na WORKFLOW v5: usunięte Autopilot, Tablica, etykiety zadań, Audytor, plik krytycznych; zostają roboty danych, odświeżanie zrzutów, CI i CodeRabbit (Ty, czat Claude)
- 21.10.2026 · S16: kontekst „na tle kraju” liczony automatycznie z danych, ręczne objaśnienia opcjonalne i per wskaźnik; nocne dodawanie wskaźników musi działać bez ręcznej pracy (Ty, czat Claude)
- 21.10.2026 · Do S14 dodane S14.9 i S14.10; objaśnienia wskaźników awansowane do S16 z gotowym szkicem tekstów (Ty, czat Claude)
- 21.10.2026 · Do S14 dodane S14.7 i S14.8 (niezależne błędy z oglądu); plan: S15 poprawki i pomiary, S16 objaśnienia, S17 porównanie, S18 ruch i SEO (Ty, czat Claude)
- 21.10.2026 · S14 = profil miejsca wg makiety 03; porównanie przesunięte na S16, objaśnienia na S15 (Ty, czat Claude)
- 21.10.2026 · Poprzedni STAN.md (fale 1–3, CC0–CC6.1) był nieaktualny – zastąpiony; historia fal w docs/archiwum/ (Claude)
- 21.10.2026 · Przejście na WORKFLOW v3 (PR #177) – zastąpione przez v5
