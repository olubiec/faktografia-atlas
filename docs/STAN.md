# Stan – 21.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (commit 095b2bb). Sprawdzone przez właściciela na produkcji: nie, o ile nie napisano inaczej.
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`); da się oddalić do całej Polski. Sprawdzone: nie.
- Kolory mapy według 20 wskaźników GUS, legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej; lista wskaźników przewija się. Sprawdzone: nie.
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”). Sprawdzone: nie.
- Profil miejsca na komputerze – częściowo nowy: wiersz wskaźnika rozwija się (wykres lat, objaśnienie, „Pokaż na mapie”), zakreślenie trzyma się tekstu. Brak: nagłówka bez powtórzeń, dużej liczby z rankingiem, zakładek. Sprawdzone: nie.
- Telefon: **nie nadaje się do użytku** (sprawdzone 21.10: panel nad mapą, mapa jako wąski pasek, profil zasłania resztę).
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.

## Sesja teraz: S14 – Profil miejsca jak makieta 03 (dokończenie)
Na końcu: na komputerze klik w miejsce → nagłówek, duża liczba w kółku z miejscem w rankingu, słupki rankingu, zakładki Przegląd / Powiaty / Gminy, „Kopiuj link”. Prompty: `docs/prompty/S14.md`; plan i „co zobaczysz”: `docs/PLAN.md`.

## Fale: bieżąca fala 1 · bramka: zielone CI na main po scaleniu wszystkich PR fali
- Fala 1 (teraz): PR #198 (tekst zmiany w latach – obejrzeć i scalić) + PROMPT 1 (przegląd profilu).
- Fala 2: PROMPT 2 (zakładki). Fala 3: PROMPT 3 (test całej ścieżki). Na koniec: PROMPT 4 (ten plik).
- Zamknięte fale: – (nowy proces od 21.10.2026; wcześniejsze zadania S14.1, S14.2, S14.7–S14.9 scalone starym procesem).

## Plan następnych sesji (1 linia każda; szczegóły w docs/PLAN.md)
- S15 – Telefon od nowa: mapa na cały ekran, dolny pasek wskaźnika z arkuszem, profil w arkuszu 40% → 100%, porządek z okruszkami, dymkiem i zgodą.
- S16 – Płynne wejście w głąb zamiast skoku: kamera podjeżdża, jednostki pojawiają się „kafelek po kafelku”, reszta kraju blednie, kolory się przelewają.
- S17 – Objaśnienia i „Na tle kraju” liczone z danych; legenda w trybie ciemnym; zwiad danych „miasto / obszar wiejski”.
- S18 – Porównanie dwóch miejsc (`?c=`), także na telefonie.

## Znane problemy / dług (co · skąd · priorytet · kiedy)
- Telefon nieużywalny · ogląd 21.10 · wysoki · S15.
- Wejście w głąb to skok, reszta Polski znika · uwaga właściciela 21.10 · wysoki · S16.
- Zakreślenie typu „highlight” zasłania tekst w wierszach profilu · zrzut 21.10 · średni · S14 fala 1 (wyłączenie), S17 (usunięcie kodu).
- Vercel: dwa projekty podpięte do repo (`faktografia-atlas`, `faktografia-atlas-fvfq`) – każdy push liczy się podwójnie, 21.10 wyczerpany limit 100 podglądów · ogląd PR #199 · wysoki · właściciel usuwa jeden projekt.
- Brak prostych objaśnień wskaźników · test 20.10 · średni · S17 (szkic: docs/data/explanations-szkic.json).
- Szybkość nie mierzona na telefonie · plan · średni · S16 (krok 16.5).
- „Co działa” niesprawdzone przez właściciela na produkcji · proces · wysoki · przy każdej fali z widocznymi zmianami.
- Klucz PostHog · plan · niski · przed statystykami wyszukiwań („Później”).

## Pomiar fal (1 linia na falę: prompty · poprawki · Twoje minuty · model i limit)
- (pierwszy wpis po bramce fali 1)

## Decyzje (najnowsze na górze, 1 linia, kto)
- 21.10.2026 · Proces WORKFLOW UNIWERSALNY v5.1 (fale, gotowe elementy, tryby czatu); CI wg §10.5 (zadania `testy`, `bezpieczenstwo`); `MASTER_PLAN.md` zastąpiony przez `docs/TECHNIKA.md` (dane, architektura, pakiety) (Ty, czat Claude)
- 21.10.2026 · Stary Autopilot i „Zgody” wyłączone w GitHub, ich Issues zamknięte, etykiety starego procesu usunięte, stare gałęzie usunięte (Ty, czat Claude)
- 21.10.2026 · Nocne PR-y z danymi bez auto-scalania; wrócić, gdy będą ≥ 2 tygodniowo (v5.1 §12) (Ty, czat Claude)
- 21.10.2026 · Plan: S15 telefon, S16 płynne wejście w głąb „kafelek po kafelku”, S17 objaśnienia, S18 porównanie; profil na telefonie (dawne S14.5) w S15 (Ty, czat Claude)
- 21.10.2026 · PR #199 (S14.3) zamknięty – dwa zakreślenia, własne czytanie adresu, zmienione testy; S14.3 od nowa. PR #198 (S14.10) – scalić po obejrzeniu podglądu (Ty, czat Claude)
- 21.10.2026 · Kontekst „na tle kraju” liczony automatycznie z danych, ręczne objaśnienia opcjonalne (Ty, czat Claude)
- 21.10.2026 · S14 = profil miejsca wg makiety 03 (Ty, czat Claude)
