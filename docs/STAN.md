# Stan – 22.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (commit 095b2bb). Sprawdzone przez właściciela na produkcji: nie, o ile nie napisano inaczej.
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`); da się oddalić do całej Polski. Sprawdzone: nie.
- Kolory mapy według 20 wskaźników GUS, legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej; lista wskaźników przewija się. Sprawdzone: nie.
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”). Sprawdzone: nie.
- Profil miejsca na komputerze – częściowo nowy: wiersz wskaźnika rozwija się (wykres lat, objaśnienie, „Pokaż na mapie”), zakreślenie trzyma się tekstu. Brak: nagłówka bez powtórzeń, dużej liczby z rankingiem, zakładek. Sprawdzone: nie.
- Telefon: **nie nadaje się do użytku** (sprawdzone 21.10: panel nad mapą, mapa jako wąski pasek, profil zasłania resztę).
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.

## Sesja teraz: S14 – Profil miejsca jak makieta 03 (fale F1–F3)
Na końcu: na komputerze klik w miejsce → nagłówek bez powtórzeń, duża liczba w kółku z miejscem w rankingu, słupki rankingu, zakładki Przegląd / Powiaty / Gminy, „Kopiuj link”. Zadania i „Ty sprawdzasz”: `docs/ARCHITEKTURA.md` §3; fale i tabela kolizji: §4.

## Bieżąca warstwa W2 (funkcje) i fala F1 · bramka: zielone CI na main + ocena na podglądzie
- F1 (teraz, naraz): W1.1 PR #198 (obejrzeć i scalić) · W2.1 przegląd profilu · W0.1 nieużywane pakiety · W1.2 wykrywanie telefonu.
- Następne: F2 (W2.2 zakładki · W1.3 arkusz dolny · W1.4 kamera · W1.5 kafelki) · F3 (W2.3 test ścieżki · W3.1 sprzątanie zakreśleń · W1.6 kontekst · W1.7 porównanie - WYKONANE).
- Ostatni prompt każdej fali: aktualizacja tego pliku (treść daje Planista po bramce).
- Zamknięte fale: – (nowy proces od 21.10.2026; S14.1, S14.2, S14.7–S14.9 scalone wcześniej starym procesem).

## Plan następnych sesji (1 linia każda; zadania i fale w docs/ARCHITEKTURA.md §3–§4)
- S15 (F4–F7) – Telefon od nowa: mapa na cały ekran, pasek i arkusz wskaźnika, profil w arkuszu 40% → 100%, okruszki, dymek, zgoda; legenda ciemna i plik objaśnień.
- S16 (F8–F10) – Ruch: płynna kamera, kafelki po kolei, wyblakła reszta kraju, przelewanie kolorów, (opcjonalnie) scena wejścia, pomiar.
- S17 (F11) – „Na tle kraju” w profilu i panelu.
- S18 (F12–F14) – Porównanie dwóch miejsc (`?c=`), także na telefonie.

## Znane problemy / dług (co · skąd · priorytet · w której fali)
- Telefon nieużywalny · ogląd 21.10 · wysoki · F4–F7.
- Wejście w głąb to skok, reszta Polski znika · uwaga właściciela 21.10 · wysoki · F8 (W3.2, W3.3).
- Zakreślenie typu „highlight” zasłania tekst w profilu · zrzut 21.10 · średni · F1 (W2.1 wyłącza), F3 (W3.1 usuwa kod).
- 5 nieużywanych pakietów (nuqs, motion, tw-animate-css, d3-array, d3-scale) · rejestr ELEMENTY 22.10 · niski · F1 (W0.1).
- Brak prostych objaśnień wskaźników · test 20.10 · średni · F7 (W1.9 – po Twojej akceptacji tekstów), F11 (W2.12).
- Legenda w trybie ciemnym mówi „ciemniej znaczy więcej” odwrotnie do kolorów · ogląd 21.10 · średni · F7 (W2.13).
- Dane „miasto / obszar wiejski” gmin miejsko-wiejskich – nieznane · plan · niski · zwiad W1.11 (Deep Research, od F4).
- Szybkość nie mierzona na telefonie · plan · średni · F10 (W3.6).
- „Co działa” niesprawdzone przez właściciela na produkcji · proces · wysoki · przy każdej fali z widocznymi zmianami.
- Klucz PostHog · plan · niski · „Później”.

## Pomiar fal (1 linia na falę: prompty · poprawki · Twoje minuty · model i limit)
- (pierwszy wpis po bramce fali 1)

## Decyzje (najnowsze na górze, 1 linia, kto)
- 22.10.2026 · Plan przebudowany wg v5.3: wszystkie zadania wg warstw (33 dla Julesa) i 14 fal F1–F14 z tabelą kolizji w ARCHITEKTURA.md; prompty pisze właściciel innym narzędziem z zadań §3, dlatego docs/prompty/ usunięty; logika W1 dla S15–S18 robiona wcześniej, równolegle z profilem (Ty, czat Claude)
- 22.10.2026 · WORKFLOW v5.3: warstwy W0–W3 i pliki-węzły w `docs/ARCHITEKTURA.md` (zastępuje TECHNIKA.md i PLAN.md), rejestr licencji `docs/ELEMENTY.md`, STAN aktualizowany po każdej fali; baza: od zera (Ty, czat Claude)
- 22.10.2026 · Usunięty duplikat projektu Vercel; GitHub usuwa gałęzie po scaleniu automatycznie (Ty)
- 21.10.2026 · Proces WORKFLOW UNIWERSALNY v5.1 (fale, gotowe elementy, tryby czatu); CI wg §10.5 (zadania `testy`, `bezpieczenstwo`); `MASTER_PLAN.md` usunięty (Ty, czat Claude)
- 21.10.2026 · Stary Autopilot i „Zgody” wyłączone w GitHub, ich Issues zamknięte, etykiety starego procesu usunięte, stare gałęzie usunięte (Ty, czat Claude)
- 21.10.2026 · Nocne PR-y z danymi bez auto-scalania; wrócić, gdy będą ≥ 2 tygodniowo (v5.3 §12) (Ty, czat Claude)
- 21.10.2026 · Plan: S15 telefon, S16 płynne wejście w głąb „kafelek po kafelku”, S17 objaśnienia, S18 porównanie; profil na telefonie (dawne S14.5) w S15 (Ty, czat Claude)
- 21.10.2026 · PR #199 (S14.3) zamknięty – dwa zakreślenia, własne czytanie adresu, zmienione testy; S14.3 od nowa. PR #198 (S14.10) – scalić po obejrzeniu podglądu (Ty, czat Claude)
- 21.10.2026 · Kontekst „na tle kraju” liczony automatycznie z danych, ręczne objaśnienia opcjonalne (Ty, czat Claude)
- 21.10.2026 · S14 = profil miejsca wg makiety 03 (Ty, czat Claude)
