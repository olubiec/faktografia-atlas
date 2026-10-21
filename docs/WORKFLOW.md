# WORKFLOW v3 — praca z agentami AI

> Wersja 3.0 · 21.10.2026 · **zbudowana od zera**. Zastępuje wszystkie wcześniejsze pliki: `WORKFLOW.md`, dodatki, v2.x, `PROTOKOL_GEMINI.md`, `UZUPELNIENIE_WORKFLOW.md` (migracja: §19).
> Cel: poziom najlepszych zespołów przy minimum mechanizmów. Trzy workflowy zamiast dwunastu, jedna twarda bramka, scalanie bez Ciebie tam, gdzie nie ma czego oglądać.
> Pewność: **[D]** dokumentacja · **[P]** opinia praktyków · **[R]** pojedyncza relacja · **[O]** ocena autora · **[?]** niezweryfikowane – sprawdź przy wdrożeniu.

---

## 0. Jak używać tego pliku

### 0.1 Ty (właściciel)
- Ten plik trafia w trzy miejsca: **wiedza projektu Claude** (jedyny plik), **wiedza Gema „Architekt-zapas” w Gemini** (§13), **repo** jako `docs/WORKFLOW.md` (żeby Audytor i Jules widzieli te same zasady).
- **Stan projektu żyje w repo, nie w czacie** (`STAN.md`, `PLAN.md`, Issues, Tablica). Dlatego każdy nowy czat zaczynasz od jednego linku (§7) i możesz w każdej chwili zmienić czat, model albo narzędzie.
- **„Co dalej?”** sprawdzasz na **Tablicy** – przypiętym Issue w repo, z powiadomieniem w aplikacji GitHub (§11).
- Twoja praca (telefon): **zamawiasz plan sesji** w czacie → **wgrywasz paczkę zadań** do repo → **reagujesz na Tablicę** (oglądasz podglądy i scalasz, uruchamiasz Audytora, podejmujesz decyzje).

### 0.2 AI, które czyta ten plik
- Twoja rola wynika z narzędzia (§2). Czat Claude w projekcie i Gem „Architekt-zapas” = **Architekt**: plan, paczki zadań, decyzje, diagnozy. **Nie piszesz kodu produkcyjnego w czacie.**
- **Zawsze zaczynasz od sprawdzenia startowego** (§7.7): pobierasz `KONTEKST.md` i potwierdzasz stan w 3 liniach.
- Właściciel **nie programuje i nie czyta kodu**. Piszesz prosto i technicznie poprawnie; termin techniczny tłumaczysz jednym zdaniem.
- **Nie poświadczasz stanu CI ani gotowości sesji** – cytujesz Tablicę albo to, co wkleił właściciel.
- **Nie zgadujesz kodu.** Potrzebujesz pliku → prosisz o link. Pytanie wymaga całego kodu → kierujesz je do Gemini z importem repo albo do Claude Code (§7).
- Nie wymyślasz ustawień, reguł, nazw pakietów ani funkcji narzędzi. Nie wiesz → piszesz „niezweryfikowane”.
- Każda odpowiedź kończy się blokiem **CO DALEJ** (§11.2).

---

## 1. Zasady (12)

1. **Stan w repo, nie w czacie.** Każde narzędzie zaczyna od tych samych plików.
2. **Jedna twarda bramka:** wymagane sprawdzenia GitHub (`verify`, `bezpieczenstwo`, `zgody`). Model nigdy nie poświadcza, że coś przeszło.
3. **Agent zawsze ma czym sprawdzić swoją pracę.** Każde zadanie ma warunki odbioru zamienione na testy. Według twórcy Claude Code to podnosi jakość 2–3 razy [R].
4. **Piszący nie ocenia sam siebie.** Jules pisze; CodeRabbit (inna firma) komentuje każdy PR; Claude jako Audytor zatwierdza pliki krytyczne i całą sesję.
5. **Małe zadania:** 1 zadanie = 1 PR = 1 cel; zwykle do ~300 zmienionych linii [O].
6. **Scala ten, kto musi:** zmiany bez widocznego efektu (`auto`) scala GitHub sam; widoczne scalasz Ty po obejrzeniu podglądu; krytyczne – po werdykcie Audytora.
7. **Najtańsze narzędzie, które daje wymaganą jakość:** Claude – plan i audyt; Jules – kod; Gemini – pytania o kod, ocena wyglądu, zapas; automaty – rutyna.
8. **Automatyzujemy czekanie, nie osąd.**
9. **Sekrety tylko w ustawieniach repo (Secrets).** Nigdy w czacie, kodzie, Issue ani w wiedzy projektu. Wyciekły klucz = natychmiast unieważniasz u dostawcy.
10. **Błąd 2 razy → zasada.** Wpis w `AGENTS.md`, a jeśli się da – test albo reguła lintera.
11. **Prostota:** każda zmiana procesu musi coś usunąć albo mieć udowodniony zysk.
12. **Bez dokumentacji nie wdrażamy.** Ustawienia, reguły i narzędzia podane przez AI wdrażamy dopiero po sprawdzeniu w dokumentacji.

---

## 2. Role i narzędzia

| Kto / co | Rola | Robi | Nie robi |
|---|---|---|---|
| **Ty** | Właściciel | Cele, decyzje, scalanie zmian widocznych, zgody na nowe pakiety | Nie czytasz kodu, nie piszesz poleceń od zera |
| **Claude – czat w Projekcie** | **Architekt** | START, PLAN (paczka zadań), DECYZJA, AWARIA, ZAMKNIJ SESJĘ | Kod produkcyjny, poświadczanie CI |
| **Claude Code** (chmura: aplikacja, przeglądarka) | **Audytor** | Przegląd PR z plikami krytycznymi, audyt sesji, naprawa awaryjna | Rutynowe zadania (to Jules) |
| **Jules** | **Wykonawca** | Zadania z Issues; testy i sprawdzenie w swojej maszynie; poprawki po uwagach CodeRabbit i po czerwonym CI (CI Fixer) | Zmiana zakresu, decyzje architektury |
| **GitHub Actions** | **Strażnik + Autopilot** | CI, Zgody; Autopilot: Issues z paczki, start Julesa, auto-scalanie, Tablica, `KONTEKST.md` | Ocena wyglądu |
| **CodeRabbit** | **Recenzent** | Komentarze do każdego PR (repo publiczne – pełne recenzje) | Blokowanie scalania |
| **Vercel** | Podgląd i produkcja | Link podglądu w każdym PR; wdrożenie po scaleniu | — |
| **Gemini (aplikacja)** | **Oko, pytania o kod, zapas** | Argon: ocena zrzutów i nagrań; 3.1 Pro z importem repo: pytania o kod, druga opinia; Gem „Architekt-zapas” przy braku limitu Claude (§13) | Testowanie, pisanie kodu, zatwierdzanie plików krytycznych |
| **Gem Research** | Researcher | Gotowe komponenty, biblioteki, dane, Deep Research | Decyzje |
| **Antigravity** (opcjonalnie) | Głęboka weryfikacja wizualna | Sesje 3D i gier na komputerze | Rutyna (limit tygodniowy) |

**Hierarchia:** Ty > Architekt > Audytor > Jules. Spór Architekt–Audytor → rozstrzygasz Ty po `TRYB: DECYZJA`.

### 2.1 Kto co testuje
| Kto | Co | Czy blokuje scalenie |
|---|---|---|
| **Jules** | Pisze testy z warunków odbioru i uruchamia je w swojej maszynie przed PR; wewnętrzny krytyk; sam naprawia czerwone CI | **Nie** – to samosprawdzenie wykonawcy |
| **GitHub Actions** | Te same testy i więcej (lint, typy, build, e2e, dostępność, bezpieczeństwo, zgody) – niezależnie, na serwerach GitHuba | **Tak – jedyna twarda blokada** |
| **CodeRabbit** | Czyta zmiany i komentuje błędy | Nie – doradczo |
| **Audytor (Claude Code)** | Czy testy naprawdę sprawdzają warunki; bezpieczeństwo; zakres | Pośrednio – etykieta `sprawdzone` |
| **Ty + podgląd Vercel** | Czy efekt jest taki, jak w zadaniu | Ty decydujesz o scaleniu widocznych |
| **Gemini** | **Nic nie testuje.** Argon ocenia obraz | Nie |

---

## 3. Repozytorium: publiczne, mieszane czy prywatne

### 3.1 Porównanie
| | **Publiczne** | **Prywatne** (darmowy GitHub) |
|---|---|---|
| Minuty GitHub Actions | bez limitu [D] | 2000 / mies. [D] |
| Reguły gałęzi `main` i auto-scalanie | działają | reguły nieegzekwowane bez planu Pro [R] |
| Blokada wypchnięcia sekretu (push protection) | za darmo [D] | niezweryfikowane, prawdopodobnie płatne |
| CodeRabbit | pełne recenzje [D] | tylko podsumowania [D] |
| Claude czyta pliki z linków | tak | nie – tylko integracja GitHub w Projekcie (§7.3) |
| Gemini importuje repo | tak, bez łączenia konta [D] | tylko po połączeniu konta GitHub (u Ciebie nie działa) |
| Jules | tak | tak |
| Kod widoczny dla innych | tak – każdy może go skopiować | nie |

### 3.2 Co wybrać
- **Publiczne (domyślnie):** strony, aplikacje bez płatnej logiki, portfolio, projekty na danych publicznych (Faktografia). Kod strony i tak widać w przeglądarce – zamknięcie repo chroni tylko to, czego w przeglądarce nie ma.
- **Mieszane (produkt płatny):** publiczne repo z interfejsem + małe prywatne repo `<nazwa>-serwer` na backend, prompty, płatne treści i dane. Prywatne jest małe, więc 2000 minut wystarcza; harmonogram Autopilota tam co 60 min (§13.6).
- **Prywatne w całości:** projekt klienta, NDA, dane osobowe. Wtedy albo GitHub Pro (~4 USD/mies.), żeby działały reguły gałęzi i auto-scalanie, albo bez auto-scalania (Ty scalasz wszystko, Audytor przegląda każdy PR krytyczny).

### 3.3 Ryzyko w repo publicznym – realnie
- **Kod:** ktoś może go skopiować; dla typowej strony to małe ryzyko [O]. Brak pliku licencji = formalnie wszystkie prawa zastrzeżone, ale technicznie kopiować się da.
- **Klucze i hasła: ryzyko natychmiastowe.** Automaty śledzą każde wypchnięcie do publicznych repo; wyciekłe klucze bywały użyte w **1–7 minut** [R – kilka niezależnych testów z pułapkami]. **Usunięcie commita nie pomaga** – kopie zostają w forkach i historii [D – GitHub]. Jedyny ratunek: natychmiast unieważnić klucz u dostawcy.
- Dlatego: push protection + gitleaks w CI + zasada 9. „Nikt nie trafi” nie dotyczy kluczy.

### 3.4 Komercja a hosting
Darmowy plan Vercel (Hobby) jest **tylko do użytku niekomercyjnego** [D]. Projekt zarabiający → Vercel Pro (20 USD/mies.) albo hosting, którego darmowy plan dopuszcza użycie komercyjne (np. Cloudflare Pages – sprawdź warunki) [?].

### 3.5 Przed upublicznieniem istniejącego repo
1. Zadanie dla Julesa (ZWIAD): „uruchom gitleaks na **całej historii** i wypisz znaleziska **bez wartości** sekretów”.
2. Każdy znaleziony klucz **unieważnij u dostawcy** i wygeneruj nowy (do Secrets). Usuwanie z historii jest drugorzędne.
3. Sprawdź, czy w historii nie ma plików `.env`, danych osobowych, płatnych treści.
4. Dodaj `LICENSE` (np. MIT, jeśli kopiowanie Ci nie przeszkadza) albo świadomie zostaw bez licencji.
5. Włącz push protection i secret scanning (§18), dopiero potem zmień widoczność.

---

## 4. Pliki w repo – jedno źródło prawdy

```
/
├─ AGENTS.md               zasady dla wszystkich agentów (≤ ~150 linii)
├─ CLAUDE.md               jedna linia: @AGENTS.md (Claude Code czyta CLAUDE.md)
├─ README.md
├─ docs/
│  ├─ WORKFLOW.md          ten plik
│  ├─ PLAN.md              sesje: bieżąca szczegółowo, następne szkicem
│  ├─ STAN.md              stan na dziś (≤ 50 linii)
│  ├─ STYL.md              wygląd (projekty z interfejsem)
│  ├─ zadania/S3.md        paczka zadań sesji = treść Issues
│  ├─ raporty/S3.md        audyt sesji
│  └─ archiwum/            zakończone sesje przeniesione z PLAN.md
├─ .claude/
│  ├─ agents/audytor.md    podagent Audytora
│  └─ commands/            audyt-pr.md · audyt-sesji.md
├─ .coderabbit.yaml
├─ .github/
│  ├─ krytyczne.txt        wzorce plików wymagających Audytora
│  ├─ pull_request_template.md · dependabot.yml
│  └─ workflows/           ci.yml · zgody.yml · autopilot.yml
├─ scripts/autopilot/      zadania.py · stan.py
├─ pnpm-workspace.yaml     minimumReleaseAge (ochrona przed świeżymi paczkami)
└─ kod, testy, e2e/
```
Gałąź **`kontekst`** (generuje Autopilot, nie edytujesz): jeden plik `KONTEKST.md`.

---

## 5. Sesja i zadanie

### 5.1 Sesja
- 3–8 zadań, **jeden efekt widoczny dla użytkownika**, kończy się działającą wersją na produkcji.
- **Gotowa**, gdy: wszystkie Issues sesji zamknięte, CI na `main` zielone, testy e2e sesji (`@S3` w nazwie testu) przechodzą w CI, audyt sesji ma werdykt OK.

### 5.2 Zadanie (format: §16.5)
- **Klasa `auto`** – nic do oglądania: logika z testami, dane, refaktor, testy, dokumentacja. GitHub scala sam po zielonych sprawdzeniach.
- **Klasa `widoczne`** – zmiana interfejsu lub zachowania, które trzeba zobaczyć. Scalasz Ty po obejrzeniu podglądu.
- Brak linii `Klasa:` = `widoczne` (bezpieczniej).
- **Pliki krytyczne** (`.github/krytyczne.txt`) – niezależnie od klasy wymagają werdyktu Audytora (etykieta `sprawdzone`).
- `Zależy od:` – Autopilot startuje zadanie dopiero, gdy zależności są zamknięte, i tylko z bieżącej sesji.
- `Dotyczy:` – pliki, które zadanie zmienia. Zadania bez zależności muszą mieć **rozłączne** `Dotyczy:` (inaczej konflikty) – pilnuje Architekt.
- `Przeczytaj najpierw:` – pliki, które Jules ma przeczytać przed pracą (np. `docs/STYL.md`).

---

## 6. Przebieg sesji krok po kroku

| # | Kto | Gdzie | Co |
|---|---|---|---|
| 1 | Ty | Claude, **nowy czat**, Opus | `TRYB: PLAN – sesja S3` + link do `KONTEKST.md` → Architekt daje plik `docs/zadania/S3.md` (+ zmiany w `PLAN.md`) |
| 2 | Ty (opcjonalnie) | Gemini | KRYTYK paczki (§16.11) – gdy paczka ma zadania krytyczne; uwagi wklejasz Claude → poprawiona paczka |
| 3 | Ty | GitHub w przeglądarce telefonu | *Add file → Upload files* (plik od Claude) do `docs/zadania/` → „Create a new branch… and start a pull request” → po zielonym CI scalasz (PR planistyczny scalasz zawsze Ty) |
| 4 | Autopilot | Actions | Tworzy Issues, oznacza gotowe zadania etykietą `jules` (limit naraz: `AUTOPILOT_LIMIT`) |
| 5 | Jules | GitHub | Plan → testy → kod → PR „Closes #nr” |
| 6 | Automaty | GitHub | CI, Zgody, CodeRabbit, podgląd Vercel; Jules poprawia uwagi i czerwone CI |
| 7 | Scalanie | — | `auto` – samo; `widoczne` – Ty (lista §16.12); krytyczne – najpierw Audytor |
| 8 | Tablica | GitHub | Po każdej zmianie „Co dalej” – powiadomienie na telefon |
| 9 | Ty | Claude Code | Tablica: „Sesja gotowa” → `/audyt-sesji S3` → raport (PR, scalasz) |
| 10 | Ty | Claude, **nowy czat**, Opus | `TRYB: ZAMKNIJ SESJĘ` + link `KONTEKST.md` → nowy `STAN.md`, `PLAN.md`, paczka S4 → krok 3 |

**Twój dzień** [O]: 2–4 razy Tablica (po ~5 min) · raz dziennie jedna sesja Claude Code na wszystkie PR czekające na Audytora · reszta dzieje się sama.
**Alternatywa dla kroku 3**, gdy nie chcesz wgrywać pliku: zadanie w aplikacji Jules „utwórz plik `docs/zadania/S3.md` dokładnie z tą treścią, bez zmian” → PR → scalasz.

---

## 7. Kontekst – jak dawać AI dostęp do repo

### 7.1 Zasada
Każde AI czyta **to samo minimum**: `KONTEKST.md`. Zawiera Tablicę, `STAN.md`, `PLAN.md`, `AGENTS.md`, listy otwartych zadań i PR, linki do dokumentów i spis plików z linkami. Do tego **konkretne pliki do zadania** – nic „na wszelki wypadek”.

**Stały link** (repo publiczne):
`https://raw.githubusercontent.com/<właściciel>/<repo>/kontekst/KONTEKST.md`
Zapisz go w notatce na telefonie dla każdego projektu.

### 7.2 Claude – czat (repo publiczne)
- **Ograniczenie [D]:** Claude pobiera tylko adresy **podane przez Ciebie** albo znalezione w wynikach wcześniejszego pobrania lub wyszukiwania. **Sam nie zbuduje** adresu pliku z linku do repo. Były zgłoszenia blokady `raw.githubusercontent.com`, gdy adresu nie podano wprost [R].
- Dlatego w **pierwszej wiadomości** wklejasz link do `KONTEKST.md`. Linki ze spisu w `KONTEKST.md` Claude może pobrać, bo pochodzą z wyniku pobrania [D – zasada; w praktyce sprawdź raz, §18 p. 12].
- Konkretny plik: wklejasz jego link (`github.com/.../blob/main/...` albo raw). **Maks. 2–3 pliki kodu.** Więcej → Gemini z importem albo Claude Code.
- Link wpisany w instrukcje projektu (§16.9) może wystarczyć albo nie [?] – sprawdź raz; jeśli nie, wklejaj w pierwszej wiadomości (zawsze działa).

### 7.3 Claude – repo prywatne
- Projekt → **„+” → GitHub** → wybierz `AGENTS.md` i folder `docs/` → przed każdą sesją **„Sync”** [D]. Integracja pobiera tylko treść plików – bez PR, Issues i historii [D].
- `KONTEKST.md` z gałęzi `kontekst` tu nie zadziała; treść Tablicy kopiujesz z Issue i wklejasz.
- Pytania o kod → Claude Code.

### 7.4 Gemini
- **Import repo** [D]: tylko na komputerze, w Gemini w przeglądarce: „+” → import kodu → link do repo. Repo publiczne bez łączenia konta; do **5000 plików i 100 MB**; jedno repo na czat; **zdjęcie z chwili importu** (bez synchronizacji – po większych zmianach nowy czat); rozmowę kontynuujesz na telefonie; wymagana włączona Aktywność w aplikacjach Gemini.
- **Bieżący stan:** wklej link do `KONTEKST.md`. Jeśli Gemini go nie otworzy [?] – otwórz link w przeglądarce telefonu, zaznacz wszystko, wklej treść.
- Zastosowania: pytania o kod („gdzie”, „dlaczego”, „co się stanie, jeśli”) – za darmo i od razu; druga opinia o sesji; Architekt zapasowy (§13).

### 7.5 Claude Code
Pracuje bezpośrednio na repo (klonuje je w chmurze) i czyta wszystko. Uruchamiasz polecenia z `.claude/commands/`: `/audyt-pr 41 42`, `/audyt-sesji S3`.

### 7.6 Jules
Widzi całe repo; `AGENTS.md` czyta automatycznie [D]. Resztę wskazuje linia `Przeczytaj najpierw:` w zadaniu. Nie potrzebuje `JULES.md` (taki plik nie istnieje w dokumentacji).

### 7.7 Co podać przed czym
| Co robisz | Gdzie | Co podajesz | AI czyta najpierw |
|---|---|---|---|
| Nowy projekt | Claude (Opus) `TRYB: START` | opis pomysłu | — |
| Plan sesji | Claude (Opus) `TRYB: PLAN – Sx` | link `KONTEKST.md` | KONTEKST; przy interfejsie `STYL.md`; raport poprzedniej sesji (link w KONTEKST) |
| Decyzja techniczna | Claude (Opus) `TRYB: DECYZJA` | link KONTEKST + raport Gema Research | KONTEKST, raport |
| Pytanie o kod | Gemini 3.1 Pro z importem repo | pytanie | cały kod (import) + KONTEKST, jeśli import starszy |
| Problem z PR | Claude (Sonnet) `TRYB: AWARIA` | link KONTEKST + link do PR | KONTEKST, PR |
| Zadanie spoza paczki | Issue z szablonu + etykieta `jules` (albo aplikacja Jules) | treść w formacie §16.5 | `AGENTS.md` + `Przeczytaj najpierw:` |
| Poprawka w PR | komentarz w PR „@jules …” | warunek, który nie działa, cytatem | PR i Issue |
| Audyt PR krytycznych | Claude Code `/audyt-pr 41 42` | numery z Tablicy | Issue, zmiany, testy |
| Audyt sesji | Claude Code `/audyt-sesji S3` | numer sesji | PLAN, paczka, scalone PR |
| Zamknięcie sesji | Claude (Opus) `TRYB: ZAMKNIJ SESJĘ` | link KONTEKST | KONTEKST, raport sesji |
| Ocena wyglądu | Gemini (Argon) | zrzut lub nagranie + `STYL.md` | `STYL.md` |
| Brak limitu Claude | Gem „Architekt-zapas” | link KONTEKST (+ import przy pytaniach o kod) | jak wyżej |

**Sprawdzenie startowe (każdy czat Architekta):** pobierz KONTEKST → napisz 3 linie: *commit i data z nagłówka · bieżąca sesja · następny krok z Tablicy* → dopiero potem tryb.

---

## 8. Jules

1. **Start zadania:** etykieta **`jules`** na Issue uruchamia zadanie, jeśli aplikacja Jules ma dostęp do repo [D]. **Sprawdzone 21.10.2026: Jules ignoruje etykietę dodaną przez `github-actions[bot]`; reaguje, gdy dodaje ją człowiek.** Autopilot dodaje więc etykietę osobistym tokenem właściciela (sekret `JULES_TOKEN`, fine-grained: tylko to repo, Issues: Read and write). Etykietę daje Autopilot (albo Ty ręcznie). Zadania spoza GitHuba – w aplikacji Jules.
2. **Zatwierdzanie planu** [?]: sprawdź na pierwszym zadaniu, czy zadania z Issue czekają na zatwierdzenie planu. Jeśli tak – zatwierdzasz w aplikacji Jules albo włączasz automatyczne zatwierdzanie, jeśli takie ustawienie jest.
3. **Poprawki:** komentarz w PR zaczynający się od `@jules` z konkretem [?] – sprawdź ustawienie reakcji na komentarze.
4. **CI Fixer:** Jules sam naprawia czerwone sprawdzenia na swoich PR (od 19.02.2026) [D].
5. **Limity:** AI Pro – 100 zadań na dobę, 15 równolegle [D]. Autopilot startuje domyślnie 2–3 naraz: więcej równoległych PR = więcej konfliktów i więcej do obejrzenia [O].
6. **Plan B,** jeśli etykieta przestanie działać: Jules API z sekretem `JULES_API_KEY` (wpisujesz sam w ustawieniach) [D – API istnieje; szczegóły w dokumentacji].
7. **ZWIAD** (zadanie rozpoznawcze) jest teraz rzadki – pytania o kod idą do Gemini z importem. Jules robi ZWIAD tylko wtedy, gdy trzeba coś uruchomić (np. gitleaks na historii, pomiar czasu builda).

---

## 9. Kontrole jakości

### 9.1 Wymagane sprawdzenia – tylko trzy
- **`verify`** – lint, typy, testy jednostkowe, build, e2e z testem dostępności (axe) dla interfejsu.
- **`bezpieczenstwo`** – gitleaks (sekrety), `pnpm audit` (podatności wysokie, produkcyjne).
- **`zgody`** – (a) zmiana pliku z `.github/krytyczne.txt` wymaga etykiety `sprawdzone` (od Audytora); (b) zmiana pliku blokady zależności (`pnpm-lock.yaml` itp.) wymaga etykiety `nowa-zaleznosc` (Twoja zgoda; Dependabot zwolniony). **Nowy commit w PR zdejmuje `sprawdzone`.** Lista krytycznych jest zawsze brana z `main` – PR nie może jej sobie skrócić.

Poza bramką, ale włączone: push protection i secret scanning [D – darmowe w publicznych], Dependabot, `minimumReleaseAge` w pnpm [D – pnpm ≥ 10.16; sprawdź].

### 9.2 Reguły gałęzi `main` (ruleset)
Wymagany PR · wymagane sprawdzenia `verify`, `bezpieczenstwo`, `zgody` · zakaz force-push i usuwania · **bez** wymaganych zatwierdzeń (własnego PR nie zatwierdzisz) · **bez** CODEOWNERS · **bez** wymogu „gałąź aktualna z main” (spowalnia; czerwony `main` po połączeniu dwóch PR wyłapie CI na `main` i Tablica) [O] · tylko scalanie „Squash”.

### 9.3 Audytor (Claude Code)
- **Kiedy:** PR z plikami krytycznymi; audyt każdej sesji.
- **Jak:** raz dziennie **jedna** sesja Claude Code na wszystkie czekające PR (numery są na Tablicy): `/audyt-pr 41 42`. Repo wczytuje się raz, więc to tańsze niż osobne sesje [O].
- **Werdykt** (komentarz w PR): `SCAL` → etykieta `sprawdzone` (Audytor nadaje ją sam, jeśli w Twojej konfiguracji ma dostęp do `gh` [?]; inaczej Ty – jedno dotknięcie) · `POPRAW` → lista poleceń dla `@jules` · `ODRZUĆ` → zamykasz PR → `TRYB: DECYZJA`.
- **Model:** Sonnet; Opus przy sesjach z płatnościami, kontami lub bezpieczeństwem.

### 9.4 CodeRabbit
Komentuje każdy PR; Jules poprawia uwagi o błędach. Jeśli Jules nie zareaguje sam – komentarz „@jules popraw uwagi CodeRabbit dotyczące błędów”. **Nie** jest wymaganym sprawdzeniem.

### 9.5 Lista plików krytycznych – krótka
5–15 wzorców: konfiguracja CI i Autopilota, `AGENTS.md`, `CLAUDE.md`, `.claude/`, nagłówki bezpieczeństwa (`vercel.json`), logowanie, płatności, zgody i analityka, pobieranie danych z kluczem. Długa lista = wszystko czeka na Audytora [O].

### 9.6 Błąd 2 razy → zasada
Audytor wypisuje w raporcie błędy powtarzalne; Architekt w `ZAMKNIJ SESJĘ` dopisuje zasadę do `AGENTS.md` (sekcja „Błędy powtarzalne”), a gdy się da – zadanie na test lub regułę lintera.

---

## 10. Scalanie i Autopilot

### 10.1 Kto scala
| PR | Scala |
|---|---|
| `auto`, bez plików krytycznych | GitHub sam po zielonych sprawdzeniach (wbudowane auto-scalanie [D]) |
| `auto`, z plikami krytycznymi | GitHub sam – po `sprawdzone` |
| `widoczne` | Ty – podgląd + lista §16.12 → „Squash and merge” (krytyczne: najpierw `sprawdzone`) |
| PR planistyczny (`docs/`), raport | Ty |
| Dependabot drobne (patch/minor) | Ty jednym kliknięciem po zielonym CI |
| Dependabot duże (major) | zadanie dla Julesa „dostosuj kod do aktualizacji” |

### 10.2 Autopilot (`autopilot.yml`) – co robi
Co 15 minut i po zdarzeniach (scalenie, CI, Issue):
1. Tworzy Issues z bloków paczki (`## Zadanie S3.2 – …`), które jeszcze nie mają Issue.
2. Daje etykietę `jules` gotowym zadaniom bieżącej sesji (zależności zamknięte, limit `AUTOPILOT_LIMIT`; etykieta `wstrzymane` blokuje).
3. Włącza auto-scalanie dla PR, które zamykają wyłącznie zadania `auto`.
4. Uruchamia CI na `main`, jeśli ostatnie scalenie zrobił automat (patrz 10.4).
5. Aktualizuje Tablicę i `KONTEKST.md`.

### 10.3 Wyłącznik
Zmienna repo **`AUTOPILOT=off`** – nie startuje zadań i nie włącza auto-scalania; Tablica działa dalej. Awaria na produkcji: `AUTOPILOT=off` + „Revert” (§12).

### 10.4 Dlaczego harmonogram co 15 min
Zmiany wykonane tokenem Actions (np. scalenie przez auto-scalanie włączone przez automat) **nie uruchamiają innych workflowów**, poza `workflow_dispatch` [D]. Harmonogram to najprostsze obejście bez dodatkowych kluczy. W repo publicznym minuty są bez limitu [D]; GitHub może opóźniać uruchomienia z harmonogramu o kilka–kilkanaście minut [D].

### 10.5 Kalibracja
Pierwsza sesja: `AUTOPILOT=on`, `AUTOPILOT_LIMIT=2`. Jeśli auto-scalone PR nie psuły `main` – 3. Maks. 5 [O].

---

## 11. Tablica i „CO DALEJ”

### 11.1 Tablica
Przypięte Issue z etykietą `tablica`, nadpisywane przez Autopilot. **Komentarz (= powiadomienie push) tylko wtedy, gdy zmienia się „Co dalej”.** W aplikacji GitHub: subskrybuj to Issue.

```
## ➡️ Co dalej
1. Obejrzyj podgląd i scal: #41
2. Audytor (Claude Code): /audyt-pr 43
3. Twoja zgoda na pakiet (etykieta nowa-zaleznosc): #44
## 🔧 Otwarte PR
- #41 S3.2 – Legenda mapy — CI ✅ · widoczne
- #42 S3.3 – Parser danych — CI ⏳ · auto
## 📦 Sesja S3: 4/7 zamkniętych · u Julesa: 2
## 📝 Następny krok wg STAN.md
Domknąć S3, potem S4 – filtr lat.
```

### 11.2 Blok CO DALEJ w odpowiedziach czatu
Maks. 4 linie; każda ze źródłem (Tablica / STAN / PLAN / ta rozmowa). Nigdy „sesja gotowa” czy „CI zielone” z pamięci – tylko z Tablicy.

---

## 12. Awarie i eskalacja

| Sytuacja | Działanie |
|---|---|
| Czerwone CI w PR | Czekasz – Jules CI Fixer. Tablica pokaże „AWARIA” po 2 nieudanych poprawkach → Claude (Sonnet) `TRYB: AWARIA` + link KONTEKST + link PR → polecenie `@jules` → nadal źle → Claude Code naprawia na gałęzi PR |
| Jules zrobił coś innego | `@jules` z cytatem warunku. Drugi raz → zamknij PR, Architekt poprawia zadanie |
| Wygląda źle | Zrzut/nagranie + `STYL.md` → Argon → lista różnic → `@jules` |
| Konflikt między PR | `@jules rozwiąż konflikt z main` |
| Czerwony `main` | `AUTOPILOT=off` → „Revert” ostatniego PR → `TRYB: AWARIA` |
| Produkcja zepsuta | Vercel: przywróć poprzednie wdrożenie (natychmiastowy rollback [D]) → „Revert” w GitHub → diagnoza |
| Wyciek klucza | **Najpierw unieważnij klucz u dostawcy**, nowy do Secrets, potem sprzątanie |
| Etykieta `jules` nie startuje zadań | Sprawdź dostęp aplikacji Jules do repo → ręcznie w aplikacji Jules → plan B (§8 p. 6) |
| Brak limitu Claude | §13 |

---

## 13. Limity i plan B: Gemini jako Architekt

### 13.1 Co staje, gdy kończy się limit Claude
**Nic poza planowaniem i Audytorem.** Autopilot, Jules, CI, CodeRabbit i Tablica działają dalej. Claude Code dzieli limit z czatem [D], więc PR z plikami krytycznymi czekają.

### 13.2 Przejście na Gemini – od razu, bez przenoszenia
1. Nowy czat w **Gemie „Architekt-zapas”** (§16.10) – model 3.1 Pro (wysoki limit dzienny [D]). Argon tylko do trudnych decyzji (niski limit [R]).
2. Pierwsza wiadomość – **identyczna jak w Claude**: link `KONTEKST.md` + tryb.
3. Nic nie kopiujesz z czatu Claude – stan jest w repo (zasada 1). To jest główna zaleta tego układu.
4. Paczkę od Gemini wgrywasz do repo tak samo (§6, krok 3) – Gemini nie zapisuje do repo [D].

### 13.3 Co Gemini może, a czego nie
| Może | Nie może |
|---|---|
| `PLAN`, `AWARIA`, `ZAMKNIJ SESJĘ` (bez audytu), pytania o kod (import repo), `DECYZJA` w sprawach odwracalnych | Dawać `sprawdzone` – PR krytyczne czekają na Audytora Claude |
| | Audyt sesji – odkładasz; w `STAN.md` linia „audyt zaległy: S3” |
| | Decyzje nieodwracalne lub architektury – czekasz na Claude albo Argon + Twoja zgoda [O] |

### 13.4 Ryzyko i zabezpieczenia
- Gdy planuje Gemini, a koduje Jules, **obie strony są od Google** – niezależne kontrole to CI i CodeRabbit [O]. Dlatego w trybie zapasowym: `AUTOPILOT_LIMIT=2`, a zadania dotykające plików krytycznych Gemini oznacza w paczce „czeka na Audytora”.
- Po powrocie limitu Claude: jeden czat `TRYB: PRZEGLĄD` z linkiem KONTEKST – Claude sprawdza decyzje i paczki z okresu zapasowego (1 linia na decyzję w `STAN.md` to umożliwia).
- **Jakość [O]:** do rutynowych sesji (paczka wg szablonu, stan w KONTEKST) Gemini 3.1 Pro wystarcza. Słabiej przy dużych decyzjach architektury.
- Nie zmieniaj Architekta w połowie sesji bez potrzeby – każda zmiana to ryzyko niespójności; dlatego decyzje zawsze lądują w `STAN.md`.

### 13.5 Oszczędzanie limitu Claude
- Jeden czat = jedna sesja/tryb; nowy czat zamiast ciągnięcia długiego wątku.
- **Jeden model na czat** – pamięć podręczna jest osobna dla każdego modelu [D]; zmiana modelu w środku wątku pogarszała wyniki (ICLR 2026: −8…+13 pp) [R].
- Opus: `START`, `PLAN`, `DECYZJA`, `ZAMKNIJ SESJĘ`. Sonnet: reszta.
- Link zamiast plików; pytania o kod → Gemini; „co dalej” → Tablica, nie czat.
- Audytor: jedna sesja dziennie na wszystkie PR.

### 13.6 Inne limity
| Narzędzie | Limit | Co robisz |
|---|---|---|
| Jules | 100 zadań/dobę, 15 równolegle [D] | Nie dojdziesz przy limicie Autopilota 2–5 |
| GitHub Actions – publiczne | bez limitu [D] | — |
| GitHub Actions – prywatne | 2000 min/mies. [D] | Autopilot co 15 min ≈ 2900 krótkich uruchomień/mies. – **za dużo**; w prywatnym ustaw harmonogram co 60 min (`0 * * * *`) |
| Argon | niski, nieopublikowany [R] | Tylko ocena wyglądu i trudne decyzje |
| Antigravity | 5-godzinny + tygodniowy [D] | Tylko sesje 3D/gier |
| CodeRabbit | darmowy w publicznych [D] | Prywatne – tylko podsumowania |

---

## 14. Tryby czatu Architekta

| Tryb | Wejście | Wynik |
|---|---|---|
| `START` | pomysł | Karta projektu (§16.1), wybór typu repo (§3), stos, `AGENTS.md`, `PLAN.md` (S0–S2), `STAN.md`, lista z §18 |
| `PLAN – Sx` | KONTEKST | plik `docs/zadania/Sx.md` (§16.5) + zmiany `PLAN.md`; ≤ 8 zadań; ostatnie zadanie sesji z interfejsem: test e2e `@Sx` sprawdzający efekt sesji |
| `DECYZJA` | pytanie + materiały | 2–3 opcje · koszt · ryzyko · rekomendacja · 1 linia do `STAN.md` |
| `AWARIA` | KONTEKST + PR / log | przyczyna · droga naprawy wg §12 · gotowy komentarz `@jules` |
| `ZAMKNIJ SESJĘ` | KONTEKST (+ raport) | nowy `STAN.md`, zmiany `PLAN.md` (zakończona sesja → `docs/archiwum/`), wpisy „Błędy powtarzalne” do `AGENTS.md`, paczka następnej sesji |
| `PRZEGLĄD` (co miesiąc, po okresie zapasowym) | KONTEKST | co usunąć z procesu, dług, aktualizacje narzędzi z datą i źródłem |
| `WYDANIE` | KONTEKST | wypełniona checklista §16.12 |

Wszystkie kończą się blokiem CO DALEJ. Paczkę i pliki `docs/` Architekt daje **jako plik do pobrania**, w całości (nie fragmenty do sklejania).

---

## 15. Moduły według typu projektu

### 15.1 Web (strony, aplikacje, PWA)
- e2e Playwright + axe (dostępność) w `verify`.
- Dane z API z kluczem pobierasz **w CI/buildzie** do plików; w przeglądarce nigdy – wszystko z prefiksem `VITE_` jest publiczne [D].
- Analityka dopiero po zgodzie użytkownika; plik zgody na liście krytycznych.
- Mapy, WebGL, 3D: **bez blokujących testów pikselowych** (renderowanie bez GPU w CI jest niestabilne) [P] – testujesz logikę i obecność elementów; wygląd ocenia Ty lub Argon.
- Lighthouse – opcjonalnie, doradczo.

### 15.2 Gry
- Zasady, punktacja, zapis gry w czystych modułach z testami jednostkowymi.
- „Czucie gry” (sterowanie, tempo) ocenia człowiek; nagranie → Argon pomocniczo.
- Gra sieciowa: architekturę synchronizacji ustalasz w `TRYB: DECYZJA` przed zadaniami; AI słabo radzi sobie z nią bez gotowego projektu [P].

### 15.3 Skrypty, automatyzacje, treści
Testy na plikach przykładowych (`tests/fixtures/`); sekrety tylko w Secrets; często repo prywatne → §3.2 i harmonogram co 60 min.

### 15.4 Produkty płatne
Wariant mieszany (§3.2); hosting dopuszczający komercję (§3.4); płatności przez gotowego dostawcę; logika płatności w prywatnym repo i na liście krytycznych; `TRYB: DECYZJA` przed pierwszą sesją z płatnościami.

### 15.5 Mobilne / desktop
Build w CI, podgląd przez artefakty lub usługę podglądu – szczegóły ustalasz w `START`, gdy pojawi się taki projekt [O].

---
## 16. Szablony

### 16.1 Karta projektu (`START`, trafia do `README.md`)
```markdown
# <nazwa>
Dla kogo: <1 zdanie> · Problem: <1 zdanie> · Efekt v1: <co użytkownik może zrobić>
Typ: web / gra / skrypt / mobilne · Repo: publiczne / mieszane / prywatne (§3)
Komercyjny: tak/nie (hosting §3.4) · Dane osobowe: tak/nie
Poza zakresem v1: <lista>
```

### 16.2 `AGENTS.md`
```markdown
# Zasady dla agentów – <projekt>
Stan projektu: docs/STAN.md · Wygląd (zmiany UI): docs/STYL.md · Proces: docs/WORKFLOW.md

## Projekt
<1–3 zdania: co to jest i dla kogo>
Stos: <np. Vite + React + TypeScript (strict), pnpm, Tailwind v4, Vitest, Playwright>

## Polecenia
- Instalacja: `pnpm install`
- Pełne sprawdzenie (uruchom przed otwarciem PR):
  `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm e2e`

## Jak pracujesz
- Jedno zadanie = jeden PR. Tytuł PR: `S3.2 – <tytuł>`. W opisie: `Closes #<nr Issue>`
  (GitHub rozumie tylko angielskie słowa: Closes / Fixes / Resolves).
- Zmieniasz tylko pliki z linii `Dotyczy:`. Musisz zmienić inny → napisz w PR dlaczego.
- Najpierw testy z warunków odbioru, potem kod. Każdy warunek = co najmniej jeden test,
  który sprawdza zachowanie (nie tylko „renderuje się”). Testy e2e sesji mają w nazwie `@S<n>`.
- Nie wyłączasz testów, reguł lintera ani typów, żeby przeszło.
- Czerwone sprawdzenie `zgody` to nie błąd do naprawy – czeka na decyzję właściciela lub Audytora.
  Niczego nie zmieniaj z jego powodu.
- Uwagi CodeRabbit o błędach poprawiasz; z uwagą o stylu możesz się nie zgodzić – napisz dlaczego.

## Najpierw zapytaj (napisz w PR i zatrzymaj się)
- Nowy pakiet: podaj nazwę, link do rejestru npm i do repozytorium, datę wydania, pobrania tygodniowo.
  Właściciel doda etykietę `nowa-zaleznosc`.
- Zmiana pliku z `.github/krytyczne.txt`, jeśli zadanie o nią nie prosi.
- Zmiana architektury lub struktury danych, usunięcie funkcji.

## Nigdy
- Sekrety w kodzie, testach, logach, opisach PR. Wszystko z prefiksem `VITE_` trafia do przeglądarki.
- Dane z zewnątrz wstawiane jako HTML.
- Pakiet, którego istnienia nie sprawdziłeś w rejestrze (modele AI wymyślają nazwy pakietów).
- Zmiany w `.github/workflows/` i `scripts/autopilot/` bez zadania, które o to prosi.

## Błędy powtarzalne (dopisuje Architekt po sesji)
- <data> · <błąd> → <jak robić dobrze>
```

### 16.3 Claude Code: `CLAUDE.md`, Audytor, polecenia
**`CLAUDE.md`** – Claude Code czyta `CLAUDE.md`, nie `AGENTS.md`; import daje te same zasady [D]:
```markdown
@AGENTS.md
W tym repo pracujesz jako Audytor – zobacz .claude/agents/audytor.md i docs/WORKFLOW.md §9.3.
```

**`.claude/agents/audytor.md`** [D – format podagentów Claude Code]:
```markdown
---
name: audytor
description: Niezależny przegląd PR z plikami krytycznymi i audyt sesji wg docs/WORKFLOW.md §9.3. Używaj przy /audyt-pr i /audyt-sesji.
tools: Read, Grep, Glob, Bash
model: sonnet
---
Jesteś Audytorem. Kod napisał inny agent (Jules). Nie ufasz opisowi PR – sprawdzasz.

Dla każdego PR:
1. Przeczytaj powiązane Issue (warunki odbioru, `Dotyczy:`), zmiany i testy.
2. Czy każdy warunek odbioru ma test, który naprawdę sprawdza zachowanie?
3. Bezpieczeństwo: sekrety, dane z zewnątrz jako HTML, nowe uprawnienia w workflowach,
   zmiany plików krytycznych – czy wynikają z zadania.
4. Zakres: zmiany poza `Dotyczy:` – uzasadnione?
5. Jeśli środowisko pozwala: `pnpm install && pnpm lint && pnpm typecheck && pnpm test`.

Werdykt jako komentarz w PR (po polsku, prosto):
WERDYKT: SCAL | POPRAW | ODRZUĆ
- POPRAW: maks. 5 punktów, każdy jako gotowe polecenie zaczynające się od „@jules”.
- SCAL: jeśli masz działające `gh` z uprawnieniami – dodaj etykietę `sprawdzone`;
  jeśli nie – napisz właścicielowi „dodaj etykietę sprawdzone do PR #…”.
Nie piszesz nowych funkcji. Nie poprawiasz kodu sam, chyba że właściciel napisze „napraw”.
Na końcu: lista błędów, które widziałeś już wcześniej (kandydaci do „Błędów powtarzalnych”).
```

**`.claude/commands/audyt-pr.md`:**
```markdown
---
description: Audyt PR z plikami krytycznymi, np. /audyt-pr 41 42
---
Użyj podagenta audytor kolejno dla PR: $ARGUMENTS.
Na końcu tabela: PR · werdykt · co ma zrobić właściciel (jedno zdanie).
```

**`.claude/commands/audyt-sesji.md`:**
```markdown
---
description: Audyt zakończonej sesji, np. /audyt-sesji S3
---
Użyj podagenta audytor do audytu sesji $ARGUMENTS:
1. Przeczytaj docs/PLAN.md, docs/zadania/$ARGUMENTS.md i scalone PR tej sesji (tytuły zaczynające się od „$ARGUMENTS.”).
2. Uruchom pełne sprawdzenie (lint, typy, testy, build; e2e, jeśli się da).
3. Oceń: czy efekt sesji dla użytkownika jest osiągnięty; dług; błędy powtarzalne (≥ 2 razy) –
   propozycja zasady do AGENTS.md lub testu/reguły lintera.
4. Zapisz raport do docs/raporty/$ARGUMENTS.md (≤ 60 linii: WERDYKT OK/NIE, co działa, problemy,
   dług, propozycje zasad) i otwórz PR „Raport $ARGUMENTS”.
```

### 16.4 `PLAN.md` i `STAN.md`
```markdown
# Plan – <projekt>
Cel produktu: <1 zdanie>

## S3 – <nazwa> (w toku)
Efekt dla użytkownika: <1 zdanie> · Paczka: docs/zadania/S3.md · Testy sesji: e2e „@S3”

## S4 – <nazwa> (szkic)
- <3–6 punktów>

## Później
- <pomysły>
```
```markdown
# Stan – <data>
## Co działa (dla użytkownika)
## Bieżąca sesja: S3 – <nazwa>
## Następny krok
<jedno zdanie – Tablica pokazuje je jako „wg STAN.md”>
## Znane problemy
## Dług (punkt · priorytet · sesja)
## Zaległe (np. „audyt zaległy: S3” po okresie zapasowym)
## Decyzje (najnowsze na górze, 1 linia, z kim/gdzie podjęta)
```

### 16.5 Paczka zadań `docs/zadania/S3.md`
```markdown
# Paczka – sesja S3 – <nazwa>
Cel sesji: <1 zdanie>

## Zadanie S3.1 – Parser danych gminnych
Klasa: auto
Zależy od: —
Dotyczy: src/data/parse.ts, src/data/parse.test.ts
Przeczytaj najpierw: —
Cel: <co ma działać – prosto>
Warunki odbioru:
- [ ] <sprawdzalny warunek>
- [ ] <…>
Testy: jednostkowe w src/data/parse.test.ts
Poza zakresem: <czego nie ruszać>

## Zadanie S3.2 – Legenda mapy z 7 klasami
Klasa: widoczne
Zależy od: S3.1
Dotyczy: src/map/Legend.tsx, e2e/legenda.spec.ts
Przeczytaj najpierw: docs/STYL.md
Cel: …
Warunki odbioru:
- [ ] …
Testy: e2e „@S3 legenda pokazuje 7 klas” + axe
Poza zakresem: …
```
Zasady dla Architekta: ≤ 8 zadań · nagłówek dokładnie `## Zadanie Sx.y – tytuł` (Autopilot go czyta) · zadania bez wzajemnych zależności mają rozłączne `Dotyczy:` · każde zadanie mieści się w jednym PR · ostatnie zadanie sesji z interfejsem: test e2e efektu sesji.

### 16.6 Szablony GitHub
**`.github/pull_request_template.md`:**
```markdown
Closes #

## Co zmieniło się dla użytkownika (1–3 zdania, prosto)
## Warunki odbioru → testy
- [ ] warunek → nazwa testu
## Czego nie zrobiono i dlaczego
## Nowe zależności: brak / nazwa + link do npm
```
**`.github/ISSUE_TEMPLATE/zadanie.md`** (zadania spoza paczki) – treść jak blok z §16.5. Zadanie spoza paczki scalasz Ty (Autopilot nie włącza auto-scalania dla Issues bez identyfikatora `Sx.y`).

### 16.7 `.coderabbit.yaml`
```yaml
language: pl-PL
reviews:
  profile: chill
  high_level_summary: true
  path_instructions:
    - path: "**/*"
      instructions: >-
        Zgłaszaj przede wszystkim: błędy zmieniające działanie, problemy bezpieczeństwa,
        brak testu dla warunku odbioru z powiązanego Issue, zmiany poza zakresem zadania.
        Uwagi o stylu ogranicz do minimum.
```
[?] – sprawdź nazwy opcji w dokumentacji CodeRabbit przy wdrożeniu.

### 16.8 `krytyczne.txt`, `pnpm-workspace.yaml`, `dependabot.yml`
```text
# .github/krytyczne.txt – wzorce plików wymagających Audytora („sprawdzone”).
# Gwiazdka * pasuje też do „/” (np. .github/* obejmuje całe .github).
.github/*
scripts/autopilot/*
AGENTS.md
CLAUDE.md
.claude/*
vercel.json
src/auth/*
src/platnosci/*
src/zgody/*
```
```yaml
# pnpm-workspace.yaml – nie instaluj wersji opublikowanych w ostatnich 3 dniach
# (paczki „zmyślone” przez AI i zarejestrowane przez atakujących, świeżo przejęte paczki)
minimumReleaseAge: 4320   # minuty; pnpm ≥ 10.16 [D – sprawdź w dokumentacji pnpm]
```
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      drobne: { update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: monthly }
```
Aktualizacje akcji (`.github/`) są krytyczne – `sprawdzone` po zielonym CI możesz dodać sam, to tylko zmiana wersji [O].

### 16.9 Instrukcje projektu Claude (Architekt)
```text
Jesteś Architektem projektu <NAZWA>. Pracujesz wg WORKFLOW v3 (plik w wiedzy projektu).
Link do kontekstu: https://raw.githubusercontent.com/<właściciel>/<repo>/kontekst/KONTEKST.md

Na początku każdego czatu:
1. Pobierz KONTEKST.md (link wyżej albo z pierwszej wiadomości) oraz pliki, które podam.
   Inne pliki pobieraj tylko z linków w spisie KONTEKST.md – i tylko potrzebne.
2. Napisz 3 linie: commit i data z nagłówka · bieżąca sesja · następny krok z Tablicy.
3. Nie możesz pobrać → poproś o wklejenie linku albo treści. Nie zgaduj stanu.
Potem wykonaj TRYB z pierwszej wiadomości (WORKFLOW §14).

Zasady: nie piszesz kodu produkcyjnego; nie poświadczasz CI; pytania wymagające całego kodu
kierujesz do Gemini z importem repo (podaj gotowe pytanie) albo do Claude Code;
fakty techniczne z poziomem pewności – nie wiesz, to „niezweryfikowane”;
po polsku, prosto; paczki i pliki docs/ dajesz jako pliki do pobrania, w całości;
na końcu CO DALEJ (maks. 4 linie, każda ze źródłem).
```

### 16.10 Gem „Architekt-zapas” (Gemini) – instrukcje
Wiedza Gema: ten plik. Instrukcje:
```text
Jesteś zapasowym Architektem projektu, gdy Claude nie ma limitu. Pracujesz wg WORKFLOW v3
z wiedzy Gema – tak samo jak Architekt Claude (§13 opisuje Twoje granice).

Na początku każdego czatu:
1. Otwórz link do KONTEKST.md z pierwszej wiadomości. Nie możesz → poproś o wklejenie treści.
2. Jeśli w czacie jest zaimportowane repo: to zdjęcie z chwili importu; aktualny stan to KONTEKST.md.
3. Napisz 3 linie: commit i data · bieżąca sesja · następny krok z Tablicy.

Granice: nie zatwierdzasz plików krytycznych (zadania, które ich dotyczą, oznaczasz
„czeka na Audytora”); decyzje nieodwracalne i architektoniczne odkładasz na Claude
albo przedstawiasz jako opcje do decyzji właściciela; każdą decyzję zapisujesz jako
1 linię do STAN.md z dopiskiem „(Gemini)”.
Nie wymyślasz ustawień, reguł ani pakietów – nie wiesz, to „niezweryfikowane”.
Po polsku, prosto; pliki dajesz w całości; na końcu CO DALEJ (maks. 4 linie ze źródłem).
```

### 16.11 KRYTYK paczki (zwykły czat Gemini, opcjonalnie)
Wklejasz całą paczkę i polecenie:
```text
Jesteś wrogim recenzentem planu pracy dla agenta programistycznego. Poniżej paczka zadań.
Sprawdź WYŁĄCZNIE: (1) czy zadanie mieści się w jednym PR; (2) czy każdy warunek odbioru da się
sprawdzić testem; (3) czy „Dotyczy:” jest konkretne, a zadania bez zależności nie zmieniają tych
samych plików; (4) brakujące wymagania bezpieczeństwa; (5) czy klasa auto/widoczne jest
właściwa (wszystko, co widać, = widoczne). Bez uwag o stylu i bez nowych funkcji.
Wynik: maks. 7 problemów (zadanie · problem · poprawka). Jeśli nie ma problemów, napisz dokładnie: BRAK UWAG.
```

### 16.12 Listy kontrolne
**Przed scaleniem PR `widoczne` (telefon, 6 punktów):**
1. Przy PR jest ✅ (wszystkie wymagane sprawdzenia).
2. Podgląd Vercel: widać efekt z „Co zmieniło się dla użytkownika”.
3. Działa na telefonie (szerokość, dotyk, czytelność).
4. CodeRabbit: brak nierozwiązanych uwag o błędach.
5. „Czego nie zrobiono” nie psuje celu zadania.
6. Pliki krytyczne → jest `sprawdzone`.

**Wydanie (`TRYB: WYDANIE`):** produkcja działa na telefonie i komputerze · e2e zielone na `main` · dostępność (axe) bez błędów krytycznych · analityka dopiero po zgodzie · sekrety tylko w Secrets · `README.md` aktualny · hosting zgodny z użyciem (§3.4) · decyzje w `STAN.md`.

### 16.13 Gem Research – instrukcje (dopisz do istniejącego Gema)
```text
Jesteś researcherem projektu. Szukasz gotowych rozwiązań: biblioteki, komponenty, dane, wzorce.
Dla każdej propozycji: nazwa · link do repozytorium i do rejestru (npm/PyPI) · licencja ·
data ostatniego wydania · pobrania tygodniowo · zgodność ze stosem z AGENTS.md · ryzyka.
Nie podawaj pakietu, którego istnienia nie sprawdziłeś w rejestrze – napisz „niezweryfikowane”.
Wynik: maks. 3 rekomendacje + tabela porównania. Decyzję podejmuje Architekt (Claude).
```
Gem do pisania kodu – **usuń** (kod pisze Jules; pytania o kod: zwykły czat z importem repo).

---
## 17. Automaty – pełny kod

Wdraża je Jules jednym zadaniem (§18, p. 9); Audytor przegląda (to pliki krytyczne). Kod przetestowano na danych testowych (podstawiony `gh`), nie na żywym repo – pierwsza sesja z `AUTOPILOT_LIMIT=2` jest właściwym testem [O].

### 17.1 `.github/workflows/ci.yml` – `verify` + `bezpieczenstwo`
```yaml
name: CI
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  push:
    branches: [main]
  workflow_dispatch: {}
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4          # wersję pnpm bierze z pola "packageManager" w package.json
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright install --with-deps chromium   # usuń 3 ostatnie kroki w projektach bez interfejsu
      - run: pnpm e2e
      - if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: raport-e2e
          path: playwright-report/
          retention-days: 7
  bezpieczenstwo:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2   # konto osobiste: bez licencji; organizacja: wymaga klucza licencji [D]
        env:
          GITHUB_TOKEN: ${{ github.token }}
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm audit --prod --audit-level high
```
Projekt bez `package.json` (np. Python): Jules podmienia kroki na odpowiedniki (`pip install`, `ruff`, `pytest`, `pip-audit`) – nazwy zadań `verify` i `bezpieczenstwo` zostają.

### 17.2 `.github/workflows/zgody.yml` – `zgody`
```yaml
name: Zgody
on:
  pull_request:
    types: [opened, synchronize, reopened, labeled, unlabeled]
permissions:
  contents: read
  pull-requests: write
concurrency:
  group: zgody-${{ github.event.pull_request.number }}
  cancel-in-progress: true
jobs:
  zgody:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Pliki krytyczne i nowe zależności
        env:
          GH_TOKEN: ${{ github.token }}
          GH_REPO: ${{ github.repository }}
          PR: ${{ github.event.pull_request.number }}
          AKCJA: ${{ github.event.action }}
          AUTOR: ${{ github.event.pull_request.user.login }}
        run: |
          set -euo pipefail
          pliki=$(gh pr diff "$PR" --name-only)
          etykiety=$(gh pr view "$PR" --json labels -q '.labels[].name')
          ma() { printf '%s\n' "$etykiety" | grep -qx "$1"; }
          # nowy commit po audycie unieważnia werdykt
          if [ "$AKCJA" = "synchronize" ] && ma sprawdzone; then
            gh pr edit "$PR" --remove-label sprawdzone
            etykiety=$(printf '%s\n' "$etykiety" | grep -vx sprawdzone || true)
            echo "Nowy commit po audycie – zdjęto etykietę 'sprawdzone'."
          fi
          # lista krytycznych zawsze z main – PR nie może jej sobie skrócić
          wzory=$(gh api "repos/$GH_REPO/contents/.github/krytyczne.txt?ref=main" \
                    -H "Accept: application/vnd.github.raw" || true)
          kryt=""
          while IFS= read -r f; do
            [ -z "$f" ] && continue
            while IFS= read -r w; do
              w=${w%$'\r'}
              case "$w" in ''|'#'*) continue ;; esac
              if [[ "$f" == $w ]]; then kryt="$kryt $f"; break; fi
            done <<< "$wzory"
          done <<< "$pliki"
          zal=$(printf '%s\n' "$pliki" | grep -E '(^|/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|requirements[^/]*\.txt|poetry\.lock|uv\.lock)$' || true)
          blad=0
          if [ -n "$kryt" ] && ! ma sprawdzone; then
            echo "::error::Pliki krytyczne:$kryt – potrzebny werdykt Audytora (etykieta 'sprawdzone')."
            blad=1
          fi
          if [ -n "$zal" ] && [ "$AUTOR" != "dependabot[bot]" ] && ! ma nowa-zaleznosc; then
            echo "::error::Zmiana zależności ($(echo $zal)) – potrzebna zgoda właściciela (etykieta 'nowa-zaleznosc')."
            blad=1
          fi
          [ "$blad" = 0 ] && echo "Zgody: OK"
          exit $blad
```

### 17.3 `.github/workflows/autopilot.yml`
```yaml
name: Autopilot
on:
  schedule:
    - cron: "*/15 * * * *"     # repo prywatne: "0 * * * *" (limit minut, §13.6)
  push:
    branches: [main]
  issues:
    types: [closed, reopened, labeled, unlabeled]
  workflow_run:
    workflows: ["CI", "Zgody"]
    types: [completed]
  workflow_dispatch: {}
permissions:
  contents: write
  issues: write
  pull-requests: write
  actions: write
concurrency:
  group: autopilot
  cancel-in-progress: false
jobs:
  autopilot:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    env:
      GH_TOKEN: ${{ github.token }}
      GH_REPO: ${{ github.repository }}
      AUTOPILOT: ${{ vars.AUTOPILOT }}
      LIMIT: ${{ vars.AUTOPILOT_LIMIT }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main
      - name: Zadania, Jules, auto-scalanie, CI na main
        run: python3 scripts/autopilot/zadania.py
      - name: Tablica i KONTEKST.md
        run: python3 scripts/autopilot/stan.py
      - name: Opublikuj KONTEKST.md na gałęzi kontekst (tylko przy zmianie)
        run: |
          git fetch -q origin kontekst 2>/dev/null || true
          if git show origin/kontekst:KONTEKST.md > /tmp/stary.md 2>/dev/null && cmp -s /tmp/stary.md out/KONTEKST.md; then
            echo "KONTEKST bez zmian"; exit 0
          fi
          cd out
          git init -q && git checkout -q -b kontekst && git add KONTEKST.md
          git -c user.name=autopilot -c user.email=autopilot@users.noreply.github.com commit -qm "kontekst ${GITHUB_SHA::7}"
          git push -qf "https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git" kontekst
```

### 17.4 `scripts/autopilot/zadania.py`
```python
#!/usr/bin/env python3
"""Autopilot (WORKFLOW v3 §10): Issues z paczek, start Julesa, auto-scalanie, CI na main."""
import glob
import json
import os
import re
import subprocess
import sys

WYLACZONY = os.environ.get("AUTOPILOT", "").strip().lower() == "off"
LIMIT = int(os.environ.get("LIMIT") or 3)
NAGLOWEK = re.compile(r"^## Zadanie (S(\d+)\.(\d+)) [–-] (.+)$", re.M)
ETYKIETY = {
    "zadanie": "0e8a16", "auto": "1d76db", "widoczne": "fbca04", "jules": "5319e7",
    "sprawdzone": "0e8a16", "nowa-zaleznosc": "d93f0b", "wstrzymane": "b60205",
    "tablica": "000000",
}


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[gh {' '.join(args[:3])}] {r.stderr.strip()}", file=sys.stderr)
    return r


def gh_json(*args):
    r = gh(*args)
    try:
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else []
    except json.JSONDecodeError:
        return []


def pole(blok, nazwa):
    m = re.search(rf"^{nazwa}:\s*(.*)$", blok, re.M)
    return m.group(1).strip() if m else ""


def paczki():
    zadania = []
    for plik in sorted(glob.glob("docs/zadania/S*.md")):
        tekst = open(plik, encoding="utf-8").read()
        trafienia = list(NAGLOWEK.finditer(tekst))
        for i, m in enumerate(trafienia):
            koniec = trafienia[i + 1].start() if i + 1 < len(trafienia) else len(tekst)
            blok = tekst[m.start():koniec].strip()
            zadania.append({
                "id": m.group(1), "sesja": int(m.group(2)), "nr": int(m.group(3)),
                "tytul": m.group(4).strip(), "blok": blok,
                # brak lub niejasna klasa = widoczne (bezpieczniej)
                "klasa": "auto" if pole(blok, "Klasa").lower().startswith("auto") else "widoczne",
                "zalezy": re.findall(r"S\d+\.\d+", pole(blok, "Zależy od")),
            })
    return sorted(zadania, key=lambda z: (z["sesja"], z["nr"]))


def issues():
    wynik = {}
    for i in gh_json("issue", "list", "--label", "zadanie", "--state", "all", "--limit", "500",
                     "--json", "number,title,state,labels"):
        m = re.match(r"(S\d+\.\d+) ", i["title"])
        if m:
            wynik[m.group(1)] = {"nr": i["number"], "otwarte": i["state"] == "OPEN",
                                 "etykiety": {e["name"] for e in i["labels"]}}
    return wynik


def utworz_brakujace(zadania, istn):
    brak = [z for z in zadania if z["id"] not in istn]
    if not brak:
        return
    jest = {e["name"] for e in gh_json("label", "list", "--limit", "300", "--json", "name")}
    potrzebne = dict(ETYKIETY)
    potrzebne.update({f"sesja-S{z['sesja']}": "c5def5" for z in brak})
    for nazwa, kolor in potrzebne.items():
        if nazwa not in jest:
            gh("label", "create", nazwa, "--color", kolor, "--force")
    for z in brak:
        tresc = z["blok"] + "\n\n---\n_Utworzone przez Autopilota z paczki. Zmiana zadania = zmiana paczki albo ręczna edycja tego Issue._"
        r = gh("issue", "create", "--title", f"{z['id']} – {z['tytul']}", "--body", tresc,
               "--label", "zadanie", "--label", z["klasa"], "--label", f"sesja-S{z['sesja']}")
        if r.returncode == 0:
            nr = int(r.stdout.strip().rstrip("/").rsplit("/", 1)[-1])
            istn[z["id"]] = {"nr": nr, "otwarte": True, "etykiety": {"zadanie", z["klasa"]}}
            print("Utworzono Issue", z["id"], f"#{nr}")


def startuj_julesa(zadania, istn):
    if WYLACZONY:
        print("AUTOPILOT=off – nie startuję zadań")
        return
    otwarte = [z for z in zadania if istn.get(z["id"], {}).get("otwarte")]
    if not otwarte:
        return
    biezaca = min(z["sesja"] for z in otwarte)
    w_toku = sum(1 for v in istn.values() if v["otwarte"] and "jules" in v["etykiety"])
    for z in otwarte:
        if w_toku >= LIMIT:
            break
        i = istn[z["id"]]
        if z["sesja"] != biezaca or {"jules", "wstrzymane"} & i["etykiety"]:
            continue
        # zależność bez Issue traktujemy jak otwartą (blokuje)
        if any(istn.get(d, {"otwarte": True})["otwarte"] for d in z["zalezy"]):
            continue
        if gh("issue", "edit", str(i["nr"]), "--add-label", "jules").returncode == 0:
            i["etykiety"].add("jules")
            w_toku += 1
            print("Start Julesa:", z["id"], f"#{i['nr']}")


def auto_scalanie(istn):
    if WYLACZONY:
        return
    auto = {v["nr"] for v in istn.values() if v["otwarte"] and "auto" in v["etykiety"]}
    for p in gh_json("pr", "list", "--state", "open", "--limit", "50",
                     "--json", "number,isDraft,autoMergeRequest,closingIssuesReferences"):
        if p["isDraft"] or p["autoMergeRequest"]:
            continue
        zamyka = {i["number"] for i in (p.get("closingIssuesReferences") or [])}
        if not zamyka or not zamyka <= auto:
            continue
        nr = str(p["number"])
        if gh("pr", "merge", nr, "--auto", "--squash", "--delete-branch").returncode == 0:
            print("Auto-scalanie włączone: PR", nr)
        else:
            # PR już gotowy (np. wszystko zielone) – zwykłe scalenie; reguły gałęzi i tak
            # odrzucą je, jeśli wymagane sprawdzenia nie przeszły.
            if gh("pr", "merge", nr, "--squash", "--delete-branch").returncode == 0:
                print("Scalono PR", nr)


def ci_na_main():
    """Scalenie wykonane przez automat nie uruchamia CI – uruchamiamy je jawnie."""
    sha = gh("api", f"repos/{os.environ['GH_REPO']}/commits/main", "-q", ".sha").stdout.strip()
    if not sha:
        return
    if not gh_json("run", "list", "--workflow", "ci.yml", "--commit", sha, "--json", "databaseId"):
        gh("workflow", "run", "ci.yml", "--ref", "main")
        print("Uruchomiono CI na main dla", sha[:7])


if __name__ == "__main__":
    zad = paczki()
    istn = issues()
    utworz_brakujace(zad, istn)
    startuj_julesa(zad, istn)
    auto_scalanie(istn)
    ci_na_main()
```

### 17.5 `scripts/autopilot/stan.py`
```python
#!/usr/bin/env python3
"""Tablica (przypięte Issue) i out/KONTEKST.md (WORKFLOW v3 §7, §11)."""
import datetime
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
from fnmatch import fnmatch

REPO = os.environ["GH_REPO"]
RAW = f"https://raw.githubusercontent.com/{REPO}/main"
WYLACZONY = os.environ.get("AUTOPILOT", "").strip().lower() == "off"
BLOKADY = re.compile(r"(^|/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|requirements[^/]*\.txt|poetry\.lock|uv\.lock)$")
ZLE = {"FAILURE", "ERROR", "TIMED_OUT", "ACTION_REQUIRED", "STARTUP_FAILURE"}
OK = {"SUCCESS", "NEUTRAL", "SKIPPED"}


def gh(*args):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if r.returncode != 0:
        print(f"[gh {' '.join(args[:3])}] {r.stderr.strip()}", file=sys.stderr)
    return r


def gh_json(*args):
    r = gh(*args)
    try:
        return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else []
    except json.JSONDecodeError:
        return []


def czytaj(sciezka):
    try:
        return open(sciezka, encoding="utf-8").read()
    except FileNotFoundError:
        return ""


def sekcja(tekst, tytul):
    m = re.search(rf"^## {tytul}\s*\n(.*?)(?=^## |\Z)", tekst, re.M | re.S)
    return m.group(1).strip() if m else ""


def kontrole(pr):
    """Zwraca (nieudane, w_toku) – nazwy kontroli."""
    zle, czeka = [], []
    for c in pr.get("statusCheckRollup") or []:
        nazwa = c.get("name") or c.get("context") or "?"
        wynik = (c.get("conclusion") or c.get("state") or "").upper()
        if wynik in ZLE:
            zle.append(nazwa)
        elif wynik not in OK:
            czeka.append(nazwa)
    return zle, czeka


def main():
    wzory = [w.strip() for w in czytaj(".github/krytyczne.txt").splitlines()
             if w.strip() and not w.strip().startswith("#")]
    zad = gh_json("issue", "list", "--label", "zadanie", "--state", "all", "--limit", "500",
                  "--json", "number,title,state,labels")
    auto_issues = {i["number"] for i in zad if any(e["name"] == "auto" for e in i["labels"])}
    prs = gh_json("pr", "list", "--state", "open", "--limit", "50", "--json",
                  "number,title,url,headRefName,labels,isDraft,statusCheckRollup,closingIssuesReferences,author")

    co_dalej, lista_pr = [], []
    main_ci = gh_json("run", "list", "--workflow", "ci.yml", "--branch", "main", "--limit", "1",
                      "--json", "conclusion,url")
    if main_ci and main_ci[0].get("conclusion") == "failure":
        co_dalej.append(f"🔴 `main` jest czerwony ({main_ci[0]['url']}) → AUTOPILOT=off, „Revert” ostatniego PR, Claude: TRYB: AWARIA")

    sprawdz, audyt, zgoda, awaria = [], [], [], []
    for p in prs:
        nr = p["number"]
        ety = {e["name"] for e in p["labels"]}
        pliki = gh("pr", "diff", str(nr), "--name-only").stdout.split()
        kryt = any(fnmatch(f, w) for f in pliki for w in wzory)
        zalez = any(BLOKADY.search(f) for f in pliki) and "dependabot" not in p["author"]["login"]
        zamyka = {i["number"] for i in (p.get("closingIssuesReferences") or [])}
        auto = bool(zamyka) and zamyka <= auto_issues
        zle, czeka = kontrole(p)
        inne_zle = [z for z in zle if z != "zgody"]
        if inne_zle:
            ci = "❌"
        elif czeka:
            ci = "⏳"
        else:
            ci = "✅" if not zle else "✅ (brak zgody)"
        lista_pr.append(f"- #{nr} {p['title']} — CI {ci} · {'auto' if auto else 'widoczne'}"
                        f"{' · krytyczne' if kryt else ''}{' · szkic' if p['isDraft'] else ''}")
        if p["isDraft"]:
            continue
        if inne_zle:
            proby = gh_json("run", "list", "--branch", p["headRefName"], "--workflow", "ci.yml",
                            "--status", "failure", "--limit", "20", "--json", "databaseId")
            if len(proby) >= 3:
                awaria.append(f"#{nr}")
            continue
        if czeka:
            continue
        if kryt and "sprawdzone" not in ety:
            audyt.append(str(nr))
        if zalez and "nowa-zaleznosc" not in ety:
            zgoda.append(f"#{nr}")
        if not auto and not (kryt and "sprawdzone" not in ety) and not (zalez and "nowa-zaleznosc" not in ety):
            sprawdz.append(f"#{nr}")

    if awaria:
        co_dalej.append(f"🆘 Jules nie naprawił CI po 2 próbach: {', '.join(awaria)} → Claude (Sonnet): TRYB: AWARIA + link do PR")
    if sprawdz:
        co_dalej.append(f"👀 Obejrzyj podgląd i scal (lista §16.12): {', '.join(sprawdz)}")
    if audyt:
        co_dalej.append(f"🔍 Audytor – Claude Code: `/audyt-pr {' '.join(audyt)}`")
    if zgoda:
        co_dalej.append(f"📦 Nowy pakiet – zdecyduj (etykieta nowa-zaleznosc albo komentarz do Julesa): {', '.join(zgoda)}")

    # postęp sesji
    otwarte = [i for i in zad if i["state"] == "OPEN"]
    sesje = sorted({int(m.group(1)) for i in zad if (m := re.match(r"S(\d+)\.", i["title"]))})
    if otwarte:
        biezaca = min(int(re.match(r"S(\d+)\.", i["title"]).group(1)) for i in otwarte
                      if re.match(r"S(\d+)\.", i["title"]))
    else:
        biezaca = sesje[-1] if sesje else None
    postep = ""
    if biezaca is not None:
        wszystkie = [i for i in zad if i["title"].startswith(f"S{biezaca}.")]
        zamkn = sum(1 for i in wszystkie if i["state"] == "CLOSED")
        u_julesa = sum(1 for i in wszystkie if i["state"] == "OPEN" and any(e["name"] == "jules" for e in i["labels"]))
        postep = f"Sesja S{biezaca}: {zamkn}/{len(wszystkie)} zamkniętych · u Julesa: {u_julesa}"
        pr_sesji = [p for p in prs if p["title"].startswith(f"S{biezaca}.")]
        pr_raportu = [p for p in prs if p["title"].startswith(f"Raport S{biezaca}")]
        if wszystkie and zamkn == len(wszystkie) and not pr_sesji:
            if pr_raportu:
                co_dalej.append(f"📄 Scal PR z raportem: #{pr_raportu[0]['number']}")
            elif os.path.exists(f"docs/raporty/S{biezaca}.md"):
                co_dalej.append(f"🏁 Raport S{biezaca} jest → Claude (Opus, nowy czat): TRYB: ZAMKNIJ SESJĘ + link KONTEKST")
            else:
                co_dalej.append(f"🏁 Sesja S{biezaca} gotowa → Claude Code: `/audyt-sesji S{biezaca}`")
    elif not prs:
        co_dalej.append("📝 Brak zadań → Claude (Opus): TRYB: PLAN – pierwsza sesja")
    if not co_dalej:
        co_dalej.append("☕ Nic dla Ciebie – Jules i automaty pracują")
    if WYLACZONY:
        co_dalej.insert(0, "⛔ AUTOPILOT=off – zadania nie startują same")

    nastepny = sekcja(czytaj("docs/STAN.md"), "Następny krok") or "—"
    rdzen = "\n".join([
        "## ➡️ Co dalej", *[f"{n}. {t}" for n, t in enumerate(co_dalej, 1)], "",
        "## 🔧 Otwarte PR", *(lista_pr or ["- brak"]), "",
        f"## 📦 {postep or 'Brak sesji'}", "",
        "## 📝 Następny krok wg STAN.md", nastepny,
    ])
    odcisk = hashlib.sha1("\n".join(co_dalej).encode()).hexdigest()[:12]
    teraz = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    tresc = f"{rdzen}\n\n<sub>Aktualizacja automatyczna · {teraz}</sub>\n<!-- co-dalej:{odcisk} -->"

    tab = gh_json("issue", "list", "--label", "tablica", "--state", "open", "--limit", "1",
                  "--json", "number,body,url")
    if not tab:
        gh("label", "create", "tablica", "--color", "000000", "--force")
        r = gh("issue", "create", "--title", "📋 Tablica", "--label", "tablica", "--body", tresc)
        url = r.stdout.strip()
        if url:
            gh("issue", "pin", url)
    else:
        url = tab[0]["url"]
        stara = tab[0]["body"] or ""
        if stara.split("\n\n<sub>")[0] != rdzen:
            gh("issue", "edit", str(tab[0]["number"]), "--body", tresc)
        if f"co-dalej:{odcisk}" not in stara:
            gh("issue", "comment", str(tab[0]["number"]), "--body",
               "**Nowe na Tablicy:**\n" + "\n".join(f"- {t}" for t in co_dalej))

    # KONTEKST.md – bez znacznika czasu, żeby publikować tylko przy realnej zmianie
    sha = os.environ.get("GITHUB_SHA", "")[:7]
    cz = [f"# KONTEKST – {REPO}", f"Stan: commit `{sha}` na main · Tablica: {url}",
          "Kolejność czytania: TABLICA → STAN → PLAN → AGENTS → linki (tylko potrzebne).", "",
          "---", "## TABLICA", rdzen]
    for f in ("docs/STAN.md", "docs/PLAN.md", "AGENTS.md"):
        t = czytaj(f)
        if t:
            cz += ["", "---", f"## PLIK: {f}", t.strip()]
    cz += ["", "---", "## OTWARTE ZADANIA"]
    cz += [f"- #{i['number']} {i['title']}" for i in otwarte] or ["- brak"]
    cz += ["", "## OTWARTE PR"]
    cz += [f"- #{p['number']} {p['title']} {p['url']}" for p in prs] or ["- brak"]
    cz += ["", "---", "## DOKUMENTY (linki do pobrania)"]
    for f in sorted(set(glob.glob("docs/**/*.md", recursive=True)) | {".github/krytyczne.txt"}):
        if os.path.exists(f) and not f.startswith("docs/archiwum/"):
            cz.append(f"- {f}: {RAW}/{f}")
    pomin = re.compile(r"(^|/)(node_modules|dist|docs)/|\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$|(^|/)pnpm-lock\.yaml$")
    pliki = [f for f in subprocess.run(["git", "ls-files"], capture_output=True, text=True).stdout.splitlines()
             if not pomin.search(f)]
    cz += ["", "## PLIKI KODU (link = pobierz tylko, gdy potrzebny)"]
    cz += [f"- {RAW}/{f}" for f in pliki[:250]]
    if len(pliki) > 250:
        cz.append(f"- … i {len(pliki) - 250} innych (pytania o cały kod → Gemini z importem repo)")
    os.makedirs("out", exist_ok=True)
    with open("out/KONTEKST.md", "w", encoding="utf-8") as plik:
        plik.write("\n".join(cz) + "\n")


if __name__ == "__main__":
    main()
```

### 17.6 Ważne szczegóły
- Nazwy zadań `verify`, `bezpieczenstwo`, `zgody` są wymaganymi sprawdzeniami – zmiana nazwy = zmiana reguł gałęzi.
- `workflows: ["CI", "Zgody"]` w Autopilocie musi odpowiadać polom `name:` w plikach.
- Etykiety tworzy Autopilot sam przy pierwszej paczce.
- PR bez `Closes #nr` Autopilot traktuje jak `widoczne` (bezpieczny domyślny wybór) – jeśli Jules pomija tę linię, dopisz to do „Błędów powtarzalnych” w `AGENTS.md`.
- Login Julesa i Dependabota w PR sprawdź na pierwszych PR; Tablica zwalnia Dependabota po fragmencie „dependabot” w loginie.
- `gh pr list --json closingIssuesReferences` wymaga aktualnego `gh` (na serwerach GitHuba jest) [?].

---
## 18. Konfiguracja jednorazowa (każde repo)

1. **Typ repo** (§3). Istniejące repo przed upublicznieniem → §3.5.
2. **Settings → General → Pull Requests:** tylko „Allow squash merging”; ✓ „Allow auto-merge”; ✓ „Automatically delete head branches”.
3. **Settings → Code security:** ✓ Secret scanning, ✓ Push protection, ✓ Dependabot alerts.
4. **Aplikacje:** Jules (dostęp do repo), CodeRabbit, Vercel, Claude (GitHub w claude.ai/code).
5. **Variables** (Settings → Secrets and variables → Actions → Variables): `AUTOPILOT=off` (na start), `AUTOPILOT_LIMIT=2`. Sekretów nie potrzeba (wyjątek: plan B Julesa §8 p. 6 – wpisujesz sam).
6. **GitHub w telefonie:** powiadomienia push włączone; po pierwszym uruchomieniu Autopilota subskrybujesz Issue „📋 Tablica”.
7. **Projekt Claude:** wiedza = ten plik; instrukcje §16.9 z Twoim linkiem do `KONTEKST.md`.
8. **Gemini:** Gem „Architekt-zapas” (§16.10, wiedza: ten plik); Gem Research – dopisz §16.13; Gem do kodu – usuń.
9. **Szkielet procesu – jedno zadanie dla Julesa** (w aplikacji Jules, bo Autopilota jeszcze nie ma): „Utwórz pliki procesu dokładnie wg `docs/WORKFLOW.md` §4, §16, §17: `AGENTS.md`, `CLAUDE.md`, `.claude/…`, `.coderabbit.yaml`, `.github/…`, `scripts/autopilot/…`, `pnpm-workspace.yaml`, skrypty `lint/typecheck/test/build/e2e` w `package.json`. Nie zmieniaj logiki skryptów.” (najpierw wgraj ten plik jako `docs/WORKFLOW.md`).
10. **Audyt szkieletu:** Claude Code – „przejrzyj PR szkieletu wg §17; sprawdź, czy kod zgadza się z WORKFLOW” → scalasz Ty.
11. **Ruleset `main`** (Settings → Rules → New branch ruleset): cel `main`; ✓ Require a pull request; ✓ Require status checks: `verify`, `bezpieczenstwo`, `zgody` (pojawią się na liście po pierwszym uruchomieniu); ✓ Block force pushes; ✓ Restrict deletions. Gałąź `kontekst` – bez reguł.
12. **Test Claude (raz):** nowy czat w projekcie, wiadomość „Sprawdzenie startowe” **bez** linku. Pobrał KONTEKST z instrukcji → OK. Nie pobrał → zawsze wklejasz link w pierwszej wiadomości. Przy okazji: czy pobiera link ze spisu w KONTEKST.
13. **Test Gemini (raz, komputer):** import repo (mieści się w 100 MB?) + czy otwiera link do `KONTEKST.md`.
14. **Test Julesa (raz):** czy etykieta `jules` startuje zadanie bez zatwierdzania planu; czy reaguje na `@jules` w PR.
15. **Pierwsza sesja:** `AUTOPILOT=on`, limit 2 → kalibracja §10.5.

---

## 19. Migracja z v2.x (np. Faktografia Atlas)

1. `AUTOPILOT=off` (jeśli istnieje) – nic nie startuje w trakcie migracji.
2. **Sekrety w historii** (§3.5) – przed ewentualnym upublicznieniem.
3. **Zadanie dla Julesa „Migracja na WORKFLOW v3”:**
   - wgraj nowy `docs/WORKFLOW.md`; utwórz pliki z §18 p. 9;
   - **usuń** stare workflowy: `tablica.yml`, `bramka.yml`, `zadania.yml` (stary), `scalanie.yml`, `recenzent.yml`, `tlumacz.yml`, `pomiar.yml`, `kontekst.yml`, `jules-cron.yml`, `zrzuty.yml` (jeśli są) oraz `scripts/gates/`;
   - `.github/zapalne*.txt` → jeden `.github/krytyczne.txt` (tylko pozycje naprawdę krytyczne, §9.5);
   - skrypty bramek sesji → testy e2e z `@Sx` w nazwie;
   - lokalne skrypty scalania (np. `merge.sh`) i system „fal” – usuń (zastępuje je Autopilot);
   - istniejące paczki/plany przepisz do formatu §16.4–16.5 (tylko bieżąca i następna sesja; reszta do `docs/archiwum/`).
4. Audyt Claude Code → scalasz → **nowy ruleset** (§18 p. 11), stare wymagane sprawdzenia (`zakres`, `zapalne`, bramki) usuń z reguł.
5. Usuń zmienne `PRZEGLAD`, `RECENZENT_MODEL` i stare etykiety (`klasa-*`, `tor-*`, `ryzykowne`, `w-toku`).
6. Projekt Claude: usuń z wiedzy stare pliki (`WORKFLOW*.md`, `PROTOKOL_GEMINI.md`, `UZUPELNIENIE_WORKFLOW.md`), dodaj ten; podmień instrukcje (§16.9).
7. Pierwsza sesja na v3: limit 2.

**Faktografia – specyfika:** publiczne dane GUS → repo publiczne pasuje (§3.2) · klucz do API BDL (jeśli używasz) tylko w Secrets, dane pobierane w CI do plików, nie w przeglądarce · mapa MapLibre/deck.gl (WebGL) bez blokujących testów pikselowych (§15.1) · PostHog po zgodzie – plik zgody na liście krytycznych · sprawdź, czy repo z danymi TopoJSON mieści się w 100 MB do importu w Gemini.

---

## 20. Wykluczenia – czego świadomie nie robimy

| Nie robimy | Dlaczego |
|---|---|
| GitHub Models (recenzent, tłumacz) | Wyłączone 30.07.2026 [D] |
| Gemini CLI, Gemini Code Assist dla GitHub | Wyłączone dla AI Pro (06.2026) [D] |
| Antigravity CLI w CI | Niejasne, czy automatyzacja na koncie AI Pro jest dozwolona [R] |
| Darmowe API Gemini w repo prywatnym | Dane mogą służyć do ulepszania modeli [R] |
| Gem Asystent, Gem do kodu | Rutynę robią automaty; pytania o kod – zwykły czat z importem |
| `JULES.md` | Jules czyta `AGENTS.md` [D] |
| CODEOWNERS jako wymagany przegląd | Własnego PR nie zatwierdzisz |
| Merge queue | Tylko repo organizacji [D]; zbędne przy jednej osobie |
| Wymóg „gałąź aktualna z main” | Spowalnia; czerwony `main` łapie CI + Tablica [O] |
| Własny skrypt scalania, kontrola `zakres`, dwa poziomy plików zapalnych, osobne bramki sesji, pomiar czasów, tłumacz błędów, tory, 3 klasy zadań | Uproszczenie v3 – rolę przejęły: wbudowane auto-scalanie, CodeRabbit, jedna lista krytycznych, testy `@Sx`, Tablica, 2 klasy |
| Pikselowe testy WebGL/3D jako bramka | Niestabilne bez GPU [P] |
| Auto-scalanie zmian widocznych lub krytycznych bez werdyktu | Zasada 6 |
| Model poświadczający CI lub gotowość sesji | Zasada 2 |
| Zmiana modelu w środku wątku | Osobny cache na model [D]; dryf wyników [R] |
| Całe pliki w wiedzy projektu Claude (poza tym) | Zużywają limit; stan nieaktualny – link do KONTEKST |
| Sekrety w czacie, kodzie, Issue, wiedzy | Zasada 9; boty w minutach [R] |
| Polskie słowa zamykające („Zamyka #”) | GitHub rozumie tylko angielskie (Closes/Fixes/Resolves) [D] |
| Reguła ESLint `tailwindcss/no-arbitrary-value-overuse` | Nie istnieje (istnieje `no-arbitrary-value`) [D] |
| `dorny/paths-filter` jako kontrola zakresu | Nie sprawdza zakresu, tylko filtruje [D] |
| Lokalny skrypt jako jedyny strażnik | Strażnikiem jest GitHub |
| Komercja na darmowym Vercel | Zabronione [D] |
| Narzędzia/ustawienia od AI bez dokumentacji | Zasada 12 |

---

## 21. Fakty zależne od daty (stan 21.10.2026)

| Fakt | Pewność |
|---|---|
| GitHub Actions: repo publiczne bez limitu minut; prywatne na darmowym planie 2000 min/mies. | [D] |
| Reguły gałęzi w repo prywatnych wymagają płatnego planu (Free – tylko publiczne) | [R] |
| Zdarzenia wywołane tokenem `GITHUB_TOKEN` nie uruchamiają innych workflowów (wyjątek: `workflow_dispatch`, `repository_dispatch`) | [D] |
| Auto-scalanie: ustawienie repo + reguły z wymaganymi sprawdzeniami | [D] |
| Słowa zamykające Issue: tylko angielskie (Closes, Fixes, Resolves…) | [D] |
| Push protection darmowe dla repo publicznych | [D] |
| GitHub Models wyłączone 30.07.2026; następcy wg GitHub: Microsoft Foundry, Copilot | [D] |
| Jules: etykieta `jules` na Issue startuje zadanie (aplikacja z dostępem do repo) | [D] |
| Jules w AI Pro: 100 zadań/dobę, 15 równolegle; czyta `AGENTS.md`; CI Fixer od 19.02.2026 | [D] |
| Claude pobiera tylko adresy podane przez użytkownika lub z wyników wcześniejszego pobrania/wyszukiwania | [D] |
| Claude: blokada `raw.githubusercontent.com`, gdy adres nie został podany | [R] |
| Claude – Projekty: integracja GitHub (wybór plików i folderów, ręczny Sync, tylko treść plików) | [D] |
| Claude Code dzieli limit z czatem; pamięć podręczna osobna dla każdego modelu | [D] |
| Zmiana modelu w środku wątku: wahania wyników −8…+13 pp (ICLR 2026) | [R] |
| Gemini – import repo: publiczne bez łączenia konta; 5000 plików, 100 MB; bez synchronizacji; import tylko na komputerze | [D] |
| Gemini Argon w AI Pro: tylko aplikacja Gemini; niski, nieopublikowany limit | [D]/[R] |
| Gemini CLI → Antigravity CLI (19.05.2026); Gemini CLI przestał obsługiwać AI Pro 18.06.2026 | [D] |
| Wyciekłe klucze w publicznych repo używane w 1–7 min; usunięcie commita nie chroni | [R] / [D] |
| ~19,7% pakietów sugerowanych przez modele nie istnieje; 43% zmyślonych nazw powtarza się w 10/10 prób (USENIX Security 2025) | [D] |
| pnpm `minimumReleaseAge` (pnpm ≥ 10.16) | [D] – sprawdź |
| Vercel Hobby: tylko użytek niekomercyjny | [D] |
| CodeRabbit: darmowy dla repo publicznych | [D] |
| Twórca Claude Code: weryfikacja przez agenta podnosi jakość 2–3×; 10–15 sesji równolegle, także z telefonu | [R] |
| Zmienne `VITE_*` trafiają do przeglądarki | [D] |
| Claude Code czyta `CLAUDE.md` (import `@AGENTS.md` działa) | [D] |

---

## 22. Źródła
- GitHub Actions – rozliczenia: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
- GitHub – auto-scalanie: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
- GitHub – słowa zamykające Issue: https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue
- GitHub – zdarzenia z GITHUB_TOKEN: https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication
- GitHub – push protection darmowe dla publicznych: https://github.blog/news-insights/product-news/push-protection-is-generally-available-and-free-for-all-public-repositories/
- GitHub Models – wyłączenie: https://github.blog/changelog/2026-07-01-github-models-is-being-fully-retired-on-july-30-2026/
- Jules – uruchamianie zadań (etykieta): https://jules.google/docs/running-tasks/
- Jules – CI Fixer: https://jules.google/docs/changelog/2026-02-19
- Claude – pobieranie stron: https://docs.claude.com/en/docs/agents-and-tools/tool-use/web-fetch-tool
- Claude – integracja GitHub: https://support.claude.com/en/articles/10167454-using-the-github-integration
- Claude – zgłoszenie blokady raw: https://claudeissues.com/issue/23705-bug-claude-cannot-access-github-repository-source-code
- Claude Code – podagenci: https://docs.claude.com/en/docs/claude-code/sub-agents
- Claude Code – pamięć (CLAUDE.md, importy): https://docs.claude.com/en/docs/claude-code/memory
- Gemini – import repo: https://support.google.com/gemini/answer/16176929?hl=en
- Gemini CLI → Antigravity CLI: https://github.com/google-gemini/gemini-cli/discussions/27274
- Wyciekłe klucze – czas użycia: https://jwatte.com/blog/leaked-api-keys-found-in-minutes-gitignore-rotation-plan.md
- Halucynowane pakiety (USENIX 2025): https://arxiv.org/abs/2406.10279
- pnpm – minimumReleaseAge: https://pnpm.io/settings#minimumreleaseage
- Vercel Hobby: https://vercel.com/docs/plans/hobby
- CodeRabbit – cennik: https://docs.coderabbit.ai/about/pricing
- gitleaks-action: https://github.com/gitleaks/gitleaks-action
- Workflow twórcy Claude Code: https://infoq.com/news/2026/01/claude-code-creator-workflow/ · https://pasqualepillitteri.it/en/news/4564/claude-code-boris-cherny-one-year-on-phone
- Pętla pracy agentowej 2026: https://www.futureproofing.dev/resources/ai-native-team/agentic-coding-workflow-2026
