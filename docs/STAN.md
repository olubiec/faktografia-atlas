# Stan – 24.10.2026

## Co działa (po ludzku; „sprawdzone przez właściciela: tak/nie”)
Na podstawie kodu na main (commit 095b2bb). Sprawdzone przez właściciela na produkcji: nie, o ile nie napisano inaczej.
- Mapa województw, powiatów i gmin z przechodzeniem w głąb, okruszkami i stanem w adresie (`?u=`, `?i=`, `?y=`); da się oddalić do całej Polski. Sprawdzone: nie.
- Kolory mapy według 20 wskaźników GUS, legenda, suwak lat, panel wskaźnika, przełącznik poziomu, dymek, najwyżej/najniżej; lista wskaźników przewija się. Sprawdzone: nie.
- Wyszukiwarka jednostek i miejscowości; gminy z rodzajem („Wałcz (miasto)”). Sprawdzone: nie.
- Profil miejsca na komputerze – częściowo nowy: wiersz wskaźnika rozwija się (wykres lat, objaśnienie, „Pokaż na mapie”), zakreślenie trzyma się tekstu. Brak: nagłówka bez powtórzeń, dużej liczby z rankingiem, zakładek. Sprawdzone: nie.
- Telefon: **nie nadaje się do użytku** (sprawdzone 21.10: panel nad mapą, mapa jako wąski pasek, profil zasłania resztę).
- Zgoda na statystyki, strony O projekcie / Prywatność / Źródła, panel `?tune`. Nocny robot danych GUS.

## Sesja teraz: prowadzi automat (S14 → S19)
Od 24.10.2026 fale prowadzi automat (`docs/AUTOMAT.md`): zakłada issue z zadaniem, uruchamia Julesa etykietą `jules`, sprawdza PR (`scripts/ops/check-pr.mjs`), scala, wycofuje, a na każdym punkcie kontrolnym (K1–K5) aktualizuje blok niżej i wysyła Ci listę „Ty sprawdzasz”. Kolejność i pliki zadań: `scripts/ops/automat-kolejka.json` = `docs/ARCHITEKTURA.md` §3–§4 (test pilnuje zgodności).
- **Zrobione na main przed automatem:** W1.1 (#198) · W1.3 (#207) · W1.4 (#219) · W1.5 (#209) · W1.6 (#211) · W1.7 (#212) · W1.8 (#214) · W2.10 (#213, Ty obejrzyj na telefonie).
- **Punkty kontrolne:** K1 S14 profil (po F3) · K2 S15 telefon (po F5) · K3 S16+S17 ruch i „Na tle kraju” (po F6) · K4 S18 porównanie (po F5) · K5 S19 pobierz i udostępnij (po F7) = koniec. Fale F1–F7 (v4, do 8 zadań naraz).
- **Poza automatem:** W1.9 (teksty objaśnień – Twoja akceptacja), W1.11 (Deep Research), W3.5 i „Później”.

### Postęp (pisze automat – nie edytuj ręcznie)
<!-- automat:start -->
Automat jeszcze nie ruszył. Pierwsza fala: F1 (W2.1, W1.2, W1.12, W1.13, W3.3, W0.1, W2.13, W1.10).
<!-- automat:end -->

## Plan (1 linia na sesję; zadania i fale w docs/ARCHITEKTURA.md §3–§4)
- S14 (F1–F3) – profil na komputerze; logika kart do pobrania.
- S15 (F4–F7) – telefon od nowa; okno „Pobierz i udostępnij”, karta profilu; legenda ciemna.
- S16 + S17 (F8–F10) – płynna kamera, kafelki, przelewanie kolorów, pomiar; „Na tle kraju”; początek porównania; udostępnianie z panelu.
- S18 (F11) – porównanie: tabela, dwa obrysy, dwie mapki, telefon.
- S19 (F6–F7) – udostępnianie porównania i test całej ścieżki.

## Przypomnienia (poza automatem – pełna tabela: ARCHITEKTURA §4)
- **Badania v2 (25.10.2026):** audyt zrobionego i gotowce pod kolejne sesje – plan i wyniki audytu: `docs/research/plan-badan-v2.md`, prompty do Gemini: `docs/research/gemini-prompty-v2.md` (R1 szablon i strona główna, R2 animacje, R3 gotowe komponenty zamiast własnych – teraz; R4 filtry i kategorie, R5 magazyn danych – przed S21). Raporty wracają do Claude (`TRYB: WERYFIKACJA`), wzorce trafiają do `docs/INSPIRACJE.md`. Do potwierdzenia przez Ciebie: czy dodajemy stronę główną wg makiety 01 (patrz plan-badan-v2 §3).
- **Teraz:** podgląd paska zgód #213 na telefonie. (Deep Research W1.11 zrobiony i zweryfikowany: `docs/research/W1.11-wynik.md`.)
- **Biblioteka GUS – robot działa od 25.10.2026:** workflow `Fetch library` (co 12 h, budżet 2500 zapytań, wspólna kolejka z nocnym pobieraniem) zapisuje katalog działów i wartości na gałęzi `data/library` (nie main, bez PR). Postęp: `library/state.json` na tej gałęzi. Decyzja (Claude, tymczasowa): magazyn = gałąź w repo, dopóki rośnie < ~1 GB; potem R6 (magazyn obiektów).
- **Po K5:** sesja S21 – strona biblioteki: kategorie i filtry (patrz `docs/research/biblioteka-gus.md`, sekcja „Kategorie i filtry”), wyszukiwarka wskaźników, „zamów wskaźnik”, wybór magazynu (R6).
- **Po K5:** sesja S20 – miasto i wieś gmin miejsko-wiejskich (14 wskaźników; bez dochodów i wydatków).
- **Przed F5:** akceptacja tekstów objaśnień (W1.9).
- **Na każdym K1–K5:** Twoja ocena na telefonie. **Po K3:** decyzja o W3.5. **Po K5:** przegląd „Później”.

## Znane problemy / dług (co · skąd · priorytet · w której fali)
- Telefon nieużywalny · ogląd 21.10 · wysoki · F4–F7.
- `main` bez ochrony (brak reguł) · przegląd 24.10 · wysoki · przed pilotem automatu (Ty: ruleset).
- Wejście w głąb to skok, reszta Polski znika · uwaga właściciela 21.10 · wysoki · F8 (W3.2, W3.3).
- Zakreślenie typu „highlight” zasłania tekst w profilu · zrzut 21.10 · średni · F1 (W2.1 wyłącza), F2 (W3.1 usuwa kod).
- Brak prostych objaśnień wskaźników · test 20.10 · średni · W1.9 po Twojej akceptacji tekstów (poza automatem), F9 (W2.12).
- Legenda w trybie ciemnym mówi „ciemniej znaczy więcej” odwrotnie do kolorów · ogląd 21.10 · średni · F7 (W2.13).
- Miasto / obszar wiejski gmin m-w: dane są w BDL dla 14 z 16 wskaźników gminnych; w dochodach i wydatkach BDL daje fałszywe zera · W1.11 · średni · S20 po K5.
- Szybkość nie mierzona na telefonie · plan · średni · F10 (W3.6).
- „Co działa” niesprawdzone przez właściciela na produkcji · proces · wysoki · przy każdej fali z widocznymi zmianami.
- Klucz PostHog · plan · niski · „Później”.

## Pomiar fal
- Liczy automat w issue stanu (zadania / 24 h, poprawki, PR-y na zadanie, wycofania); podsumowanie trafia do bloku „Postęp” na punktach kontrolnych.
- Przed automatem: logika W1.4–W1.8 i W2.10 weszły poza kolejnością fal; W2.3 wszedł za wcześnie i został wycofany (#218).

## Decyzje (najnowsze na górze, 1 linia, kto)
- 25.10.2026 · Decyzje po raportach: strona główna wg makiety 01 – tak; usuwamy nieużywany Plot – tak; „Zamów wskaźnik” jako odnośnik do Tally; magazyn biblioteki najpierw przez adapter, R2 później; kamery nie ruszamy; sesja S22 (W0.2, W2.24, W3.8, W3.9, W2.25, W3.7, punkt kontrolny K6) dopisana do ARCHITEKTURA §3–§4 i kolejki; pobieranie grafik z generatora karuzel odłożone (Ty, czat Claude)
- 25.10.2026 · Raporty R1–R5 zweryfikowane (`docs/research/weryfikacja-raportow-v2.md`): zero wymian własnych komponentów na pakiety teraz; szablonów nie bierzemy; prerender RR8 odpada (tryb framework); rozpiska N1–N12 w `docs/research/zadania-fala-8.md`, wchodzi do planu po decyzjach D1–D5 (Ty, czat Claude)
- 25.10.2026 · Research kierujemy na audyt tego, co już zrobione (szablon stron, strona główna, animacje, własne komponenty) i na gotowce pod S20–S21; wzorce z cudzych repozytoriów wolno studiować i przepisać po swojemu tylko z wpisu w `docs/INSPIRACJE.md` (licencja MIT/BSD/ISC/Apache-2.0/CC0); zmiana zasady w `AGENTS.md` (Ty, czat Claude)
- 24.10.2026 · W1.11 zrobione: raport Deep Research zweryfikowany na nagraniach BDL – podział miasto/wieś **istnieje** (kody 4 i 5) dla 14 z 16 wskaźników gminnych; w dochodach/wydatkach to fałszywe zera; robimy w sesji S20 po K5 (Ty, czat Claude)
- 24.10.2026 · **Pełny automat** prowadzi fale do końca (S14–S19): Jules przez etykietę `jules`, scalanie po `check-pr` i zielonym CI, Twoja ocena na punktach kontrolnych K1–K5 nie blokuje (poprawki jako nowe zadania); zmienia zasadę WORKFLOW „ręczne wklejanie” i bramkę „ocena przed falą” (Ty, czat Claude)
- 24.10.2026 · Posłaniec = zadanie cykliczne co godzinę 7–23 na tanim modelu, decyzje podejmuje skrypt `scripts/ops/automat.mjs`; Naprawiacz raz dziennie (Ty, czat Claude)
- 24.10.2026 · `STAN.md` aktualizuje automat tylko na punktach kontrolnych (blok „Postęp”), nie po każdej fali (Ty, czat Claude)
- 24.10.2026 · W2.4 może zmienić dokładnie dwa testy mobilne (`home.spec.ts`, `picker-scroll.spec.ts`) tak, jak opisuje ARCHITEKTURA §3; W2.5 zdejmuje `fixme` (Ty, czat Claude)
- 24.10.2026 · Automat może sam nałożyć `aktualizuj-zrzuty` raz na PR, gdy czerwone są tylko zrzuty (Ty, czat Claude)
- 24.10.2026 · W1.9 poza automatem (czeka na Twoją akceptację tekstów); W3.5 do „Później” (Ty, czat Claude)
- 24.10.2026 · PR-y #210, #215, #217 zamknięte – zadania W3.1, W2.4, W2.6 wracają przez automat od nowa (Ty, czat Claude)
- 24.10.2026 · Nowe: S19 „Pobierz i udostępnij” (karty PNG w 4 formatach, CSV, systemowe udostępnianie; bez nowych pakietów) i dwie mapki w porównaniu – pomysły właściciela; „generator karuzel” zawężony do serii slajdów pod konta Faktografii (osobne repo) (Ty, czat Claude)
- 24.10.2026 · Wycofany test W2.3 (#216) przez #218, bo `main` był czerwony: test szukał rankingu i zakładek, których nie ma (W2.1/W2.2 niewykonane). Wraca w F3′ po W2.1 i W2.2 (Ty, czat Claude)
- 24.10.2026 · PR #208 zastąpiony czystym #219; #210, #215, #217 wstrzymane (zależności i naruszenia AGENTS.md) (Ty, czat Claude)
- 22.10.2026 · Zadanie W1.3 (BottomSheet) wykonane (PR #207) – poza kolejnością fal (Ty)
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
