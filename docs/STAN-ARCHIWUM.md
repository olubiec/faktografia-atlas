# Archiwum STAN.md (stan z 28.10.2026 i starsze wpisy)

Przeniesione z `docs/STAN.md`, bo plik ma limit ok. 100 linii (test `docs-no-conflict-markers`). Najnowsze wpisy są w STAN.md.

## Pomiar fal (F1–F13)
- F1–F7: 33 zadania; część PR-ów (np. W2.1, W2.13, W1.10, W0.1) wymagała 2–3 prób; W2.21 miał jedną nieudaną próbę Julesa. Dokładne liczby poprawek nie były zbierane po zatrzymaniu automatu (25.10).
- Od F8: po każdej fali jedna linia w tej sekcji (zadania · PR-y poprawione · Twoje minuty) – dopisuje Claude przy kolejnej fali.
- F8: 6 zadań, 6 PR-ów scalonych (#325–#330). F8b: 3 zadania, 3 PR-y scalone (#356–#358), plus 2 PR-y Claude (#350 kontrakt, #351 formularz). Liczby prób Julesa i Twoje minuty nie były zbierane.
- F9: 7 zadań, 7 PR (#373–#379). F10: 7 zadań, 7 PR (#389–#395). F11: 3 zadania, 3 PR (#399–#401). F12: 2 zadania, 2 PR (#404, #405); po F12 CI na `main` czerwone (wyścig w teście W2.37) → poprawka Claude #408, PR Julesa #407 odrzucony. F13: 4 zadania, 4 PR (#414–#417; #414 po jednym ponowieniu CI), start 16:47, ostatni PR scalony 17:52 (ok. 1 h 5 min); prompty F13 jako #409. F11–F13 scalane przez skrypt nadzorujący Claude, Twoje minuty na scalanie: 0. Dokładne liczby poprawek Julesa dla F9–F12 nie były zbierane.

## Sesja S20/S21: szczegóły fal F8–F14 (stan 28.10.2026)
- **F8** (6): W1.15 · W1.16 · W1.21 · W1.22 · W1.23 · W1.24 · **F9** (7): W1.17 · W1.18 · W1.19 · W1.20 · W2.27 · W2.34 · W2.35 · **F10** (7): W2.24 · W2.28 · W2.29 · W2.30 · W2.31 · W2.33 · W2.38 (nowe po researchu rundy 3: arkusz na telefonie) · **F11** (3): W2.25 · W2.32 · W2.36 · **F12** (2): W2.26 · W2.37.
- **Punkty kontrolne:** K6 = S20 (miasto i wieś) · K7 = S21 (biblioteka GUS) – **czekają na Twoje obejrzenie na podglądzie** (najlepiej z telefonu). K6 z liczbami dopiero po scaleniu danych z `data/nightly` (patrz „Znane problemy”).
- **F8b zamknięta 26.10.2026** (3/3: W1.25 #358 · W1.26 #357 · W1.27 #356). **F9 zamknięta 27.10.2026 (7/7, PR #373–#379).** **F10 zamknięta 27.10.2026 (7/7, PR #389–#395).** **F11 zamknięta 28.10.2026 (3/3: W2.36 #399 · W2.32 #400 · W2.25 #401).** **F12 zamknięta 28.10.2026 (2/2: W2.37 #404 · W2.26 #405).** **F13 zamknięta 28.10.2026 (4/4, zadania tylko-testowe: T13.4 #415 · T13.3 #414 · T13.2 #417 · T13.1 #416)** plus poprawka testu W2.37 (#408) – patrz „Decyzje”. **CI na `main` zielone (commit 3c38f23).** Przed W2.35 test linku „Zamów” na drugim koncie nadal do zrobienia (5 min).
- **F14 (szlif, pętla Jules Loop od 28.10.2026):** W3.8 kreskowanie „brak danych” · W3.9 rozbicie TrendChart (`tasks/W14-*`). **Poza kolejką:** W1.9 (teksty objaśnień – Twoja akceptacja), W3.5, W3.7 (spike podkładu – po K7) i „Później”; kroki Claude w workflow (`.github/`) – ARCHITEKTURA §4 „Poza falami”.

## Decyzje 21.10–25.10.2026
- 25.10.2026 · Raporty R1–R5 zweryfikowane (`docs/research/weryfikacja-raportow-v2.md`): zero wymian własnych komponentów na pakiety teraz; szablonów nie bierzemy; prerender RR8 odpada (tryb framework); rozpiska N1–N12 w `docs/research/zadania-fala-8.md`, wchodzi do planu po decyzjach D1–D5; plan S22 nie wchodzi do ARCHITEKTURA ani kolejki – decyzja właściciela (Ty, czat Claude)
- 25.10.2026 · Research kierujemy na audyt tego, co już zrobione (szablon stron, strona główna, animacje, własne komponenty) i na gotowce pod S20–S21; wzorce z cudzych repozytoriów wolno studiować i przepisać po swojemu tylko z wpisu w `docs/INSPIRACJE.md` (licencja MIT/BSD/ISC/Apache-2.0/CC0); zmiana zasady w `AGENTS.md` (Ty, czat Claude)
- 25.10.2026 · **Plan S20 + S21** zatwierdzony do realizacji: 24 małe zadania w falach F8–F12, ≤ 7 w fali (Jules lepiej radzi sobie z małymi zadaniami; limit 15 naraz) (Ty, czat Claude)
- 25.10.2026 · **Ręczna pętla:** Ty scalasz, Claude puszcza kolejne (`start-tasks.mjs`); automat zatrzymany (`automat-stop` na #221); limity w kolejce podniesione do 15 naraz (Ty, czat Claude)
- 25.10.2026 · K1–K5 zaakceptowane przez właściciela; uwagi do poprawek później, jako małe zadania (Ty)
- 25.10.2026 · **S20: blok w profilu, bez map** – zwijany blok „Miasto i obszar wiejski” (14 wskaźników), jeden dodatkowy plik na województwo ładowany dopiero po rozwinięciu; bez obrysów części gminy i bez dochodów/wydatków (Claude, decyzja produktowa do zmiany na życzenie)
- 25.10.2026 · **S21 v1 bez mapy dla wskaźnika z biblioteki** – katalog, szukanie, filtry, ranking, CSV, zamówienie; mapa i karty PNG z biblioteki do „Później”; zamówienia = zgłoszenie na GitHubie czytane ręcznie (Claude)
- 25.10.2026 · **Magazyn biblioteki:** docelowo Cloudflare R2 (raport Deep Research zweryfikowany: cennik potwierdzony drugim źródłem, 10 GB bezpłatnie, egress 0); do czasu przejścia gałąź `data/library` + adres w jednym miejscu (`VITE_LIBRARY_BASE`) – przejście na R2 bez zmian w kodzie stron (Claude, tymczasowa)
- 25.10.2026 · **SEO podstron gmin odłożone:** raport Deep Research błędnie uznał limit 2048 „routes” na Vercel za blokadę dla 2500 stron statycznych (dokumentacja: liczą się reguły z `vercel.json`, plików wyjściowych nie ograniczono); ryzyko „scaled content abuse” i brak gotowej treści – wrócić po K7 (Claude)
- 25.10.2026 · **Zbiorczy eksport BDL:** raport zweryfikowany częściowo – liczba „1 mln zapytań” błędna (nasz pomiar: ~38 zapytań na wskaźnik, ok. 1000 wskaźników tygodniowo), ścieżka „Pobrane podgrupy” i adres e-mail sekretariatu niepotwierdzone; formularz GUS i telefon potwierdzone; tekst pisma gotowy (Claude)
- 25.10.2026 · Ręcznie uruchomiony pierwszy przebieg „Fetch library” (poprzednio workflow nigdy nie biegł mimo wpisu „działa”) (Claude)
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
