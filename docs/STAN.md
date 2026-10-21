# Stan – 21.10.2026

## Co działa (dla użytkownika)
Na podstawie plików w repo (commit 6fc0490); pełny przegląd działania – audyt sesji S14.
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`).
- Kolory mapy według wskaźnika (20 wskaźników GUS w `public/data/values/`), legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, ranking – **nie sprawdzone przez właściciela na produkcji**.
- Wyszukiwarka jednostek i miejscowości; nazwy gmin z rodzajem („Wałcz (miasto)”) w wyszukiwarce i okruszkach (CC13.6).
- Profil miejsca – **stara wersja**: lista wskaźników w grupach z wykresikiem i miejscem w kraju; bez zakładek, rankingu, rozwijania i „Pokaż na mapie” (zakres S14).
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`.
- Objaśnienia wskaźników: kod gotowy, brak pliku z treścią (S15).

## Bieżąca sesja: S14 – Profil miejsca jak makieta 03

## Następny krok
Scalić paczkę S14 (PR z docs/zadania/S14.md, docs/PLAN.md, docs/STAN.md), ustawić AUTOPILOT=on (limit 2) – dalej Autopilot i Jules; Ty: Tablica i podglądy Vercel.

## Znane problemy
- Ekran główny nie był oglądany przez właściciela po fali 9 (CC13) – lista do obejrzenia w czacie PLAN S14; zauważone błędy → S15.
- Zakładka „Porównaj” będzie nieaktywna („wkrótce”) do S16.

## Dług (punkt · priorytet · sesja)
- Treść objaśnień 20 wskaźników · średni · S15
- Weryfikacja „Co działa” wyżej na produkcji · wysoki · audyt S14

## Zaległe
- Podpięcie Vercel do repo (podgląd PR) – jeśli jeszcze nie zrobione, potrzebne przed scalaniem zadań `widoczne` S14.
- Klucz PostHog – przed statystykami wyszukiwań.

## Decyzje (najnowsze na górze, 1 linia, z kim/gdzie podjęta)
- 21.10.2026 · S14 = profil miejsca wg makiety 03; porównanie przesunięte na S16, objaśnienia na S15 (właściciel, czat Claude TRYB: PLAN – S14)
- 21.10.2026 · Poprzedni STAN.md (fale 1–3, CC0–CC6.1) był nieaktualny – zastąpiony tym plikiem; historia fal w docs/archiwum/ (Claude, PLAN S14)
- 21.10.2026 · Przejście na WORKFLOW v3 (PR #177)
