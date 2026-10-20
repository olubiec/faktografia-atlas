# UZUPEŁNIENIE WORKFLOW – po falach 7–8

> Wersja 1.0 · 20.10.2026 · dotyczy: `OPERACJE.md`, `FALE.md`, `AGENTS.md`, skryptów (`status`, `new-task`, `wait-ci`, `merge`, `rerun`, `snapshots`, `kick-ci`).
> Źródła ustaleń: retrospektywa fal 7–8 + dwie niezależne recenzje (Claude; Gemini Deep Research, zweryfikowany).
> Oznaczenia pewności: **[D]** dokumentacja/źródło pierwotne · **[R]** relacja · **[O]** ocena · **[?]** do sprawdzenia w repo.

---

## 0. Instrukcja dla AI, które czyta ten plik

1. Ten plik **uzupełnia** obecny workflow. Nie zastępuje go w całości. Tam, gdzie jest sprzeczny z `OPERACJE.md` / `FALE.md`, obowiązuje ten plik.
2. Zanim cokolwiek zmienisz, **odpowiedz na pytania z §7** na podstawie repo. Jeśli odpowiedź zmienia którąś decyzję – zatrzymaj się i opisz to właścicielowi.
3. Wdrażasz w kolejności z §8. Każda zmiana ma kryterium odbioru. **Nie usuwaj starego mechanizmu, dopóki nowy nie działał bez błędu przez jedną pełną falę.**
4. Nie prowadź własnego researchu tematów z §6 – fakty są już zweryfikowane. Jeśli masz dowód, że któryś jest nieaktualny, zgłoś go z linkiem.
5. Właściciel nie czyta kodu. Każdy PR opisujesz prostym językiem: co się zmienia dla niego i co może sam sprawdzić.

---

## 1. Najważniejszy wniosek

Kierunek systemu jest dobry: drogi model planuje raz, rutyna to skrypty z wynikiem albo `STOP`, `STOP` ma właściciela.

Wspólna przyczyna problemów 1–3 z retrospektywy: **kontrole żyją w lokalnych skryptach i w raportach modeli, zamiast w wymaganych sprawdzeniach GitHuba.** Skrypt, który można „po cichu pominąć”, i bramka „odhaczana przez Sonneta” to zaufanie do modelu w miejscu, gdzie system miał mu przestać ufać.

### Nowe zasady nadrzędne
- **Z1. Strażnikiem jest GitHub, nie skrypt.** Każda kontrola, która ma blokować scalenie, jest wymaganym sprawdzeniem (required status check) w regułach gałęzi `main`. Skrypty lokalne są wygodnymi „przyciskami”, nie bramkami.
- **Z2. Model nigdy nie poświadcza bramki.** Bramka = warunek sprawdzalny maszynowo (komenda kończąca się kodem 0/1). Raport modelu może ją tylko cytować.
- **Z3. Błąd powtórzony 2 razy dostaje regułę w CI.** Wtedy Jules sam widzi czerwień i poprawia – bez Sonneta.
- **Z4. Każda poprawka powinna coś upraszczać.** Jeśli dodaje element, musi też jakiś usunąć albo uzasadnić, dlaczego nie może.

---

## 2. Decyzje

| Temat | Decyzja | Uzasadnienie |
|---|---|---|
| Kontrola zakresu PR | Przenieść do CI jako wymagane sprawdzenie | `merge.sh` przepuścił 4 PR (#119, #121, #130, #133) bez kontroli |
| ID zadania | Pole `Zadanie: CCx.y` w treści PR (szablon) + sprawdzenie w CI; brak ID = czerwone CI | Tytuły Julesa są nieprzewidywalne |
| Bramki fal | Warunki maszynowe sprawdzane przez `new-task.sh` → `STOP` | Fala 8 ruszyła mimo niespełnionej bramki fali 7 |
| Pobieranie danych | Automatyczny start po scaleniu kodu pobierania + nocą; limit czasu zapytania | Kolorowanie mapy zależało od ręcznego kliknięcia |
| Kolory | Reguła ESLint + test w CI, jeden dozwolony plik kolorów | 3× ten sam błąd (#109, #122, #133) |
| Zrzuty wzorcowe | Tylko w CI, w obrazie Docker Playwright, na etykietę; wynik commitowany do PR; **bez** auto-scalania | Zrzuty odświeżone za wcześnie (#132); ryzyko różnic środowiska |
| Modele | Podagenci (`.claude/agents/`) zamiast `/model` w jednym wątku | Każdy model ma osobny cache; zmiana modelu w rozmowie zmienia też jakość |
| Pliki zapalne | Lista w jednym pliku; CI wymaga etykiety `sprawdzone`, gdy PR je dotyka | Kontrola nie może zależeć od tego, jak opisano zadanie |
| Bezpieczeństwo | gitleaks, `pnpm audit --prod`, CodeQL, nowe zależności tylko z etykietą | Brak jakiegokolwiek skanu w obecnym procesie |
| Dług techniczny | Sekcja `Dług` w `FALE.md`, przegląd przy planowaniu każdej fali | Zgubione wątki |
| Pomiar | `/usage` na początku i końcu fali w raporcie | Oszczędność jest dziś założeniem, nie pomiarem |

---

## 3. Zmiany do wdrożenia

Każda zmiana: **cel → co zrobić → kryterium odbioru → wykonawca.**
Pliki w `.github/` i skrypty kontrolne to pliki zapalne → wykonawca Sonnet albo Jules + przegląd Sonneta.

### Z-01. Dane: automatyczne pobieranie i limit czasu
- **Co:** workflow pobierania uruchamia się (a) po scaleniu zmian w kodzie pobierania (`on: push` z filtrem ścieżek), (b) nocą, (c) ręcznie. Każde zapytanie do API ma limit czasu i ponowienia z odstępem. Robot zapisuje też raport danych (zastępuje ręczny `docs/data-report.md`).
- **Odbiór:** po scaleniu PR zmieniającego kod pobierania dane pojawiają się na `main` bez kliknięcia; symulowane zawieszenie API kończy się błędem po limicie czasu, a nie wiszącym zadaniem.
- **Wykonawca:** Jules (kod pobierania) + Sonnet (workflow).
- **Natychmiast niezależnie od tego:** właściciel klika „Fetch data”, żeby odblokować test fali 8.

### Z-02. Wymagane sprawdzenia na `main`
- **Co:** w regułach gałęzi (ruleset) dla `main`: wymagany PR, zakaz force-push, wymagane sprawdzenia: `verify`, `zakres`, `tytul-pr`, `bezpieczenstwo`, `zapalne` (z Z-03).
  - **Bez** trybu „gałąź musi być aktualna” (strict) na start. Włączyć dopiero, jeśli pojawią się konflikty po scaleniach.
- **Sprawdzenie `zakres`** (jedno zadanie CI):
  1. Pobiera ID zadania: najpierw pole `Zadanie:` w treści PR, potem nazwa gałęzi, potem tytuł.
  2. Brak ID → **błąd** z komunikatem, jak go dodać (Jules przeczyta i poprawi).
  3. Odczytuje „Zakres” zadania z `FALE.md` (lub z polecenia w Issue) i porównuje z listą zmienionych plików.
  4. Pliki poza zakresem → błąd z listą plików.
- **Sprawdzenie `tytul-pr`:** format tytułu (np. `action-semantic-pull-request` z wzorcem zawierającym ID) – opcjonalne, jeśli pole `Zadanie:` jest wymagane.
- **Szablon PR** (`.github/pull_request_template.md`) zaczyna się od:
  ```markdown
  Zadanie: CCx.y
  ## Co zmienia się dla właściciela
  ## Warunki odbioru → dowód (test/zrzut)
  ## Pliki poza zakresem (powinno być: brak)
  ```
- **Odbiór:** testowy PR bez ID i testowy PR z plikiem spoza zakresu dostają czerwone CI i nie da się ich scalić żadną drogą (ani przyciskiem, ani `merge.sh`).
- **Wykonawca:** Sonnet.

### Z-03. Pliki zapalne
- **Co:** jedna lista ścieżek w `.github/zapalne.txt` (mapa, dane, prywatność, `.github/`, skrypty kontrolne, konfiguracja testów). Zadanie CI `zapalne`: jeśli PR zmienia którąś ścieżkę i nie ma etykiety `sprawdzone` → błąd. Kolumna „Kto sprawdza PR” w `FALE.md` korzysta z tej samej listy.
- **Nie używać** wymaganego przeglądu właściciela kodu (CODEOWNERS + required review): jeśli PR-y Julesa są otwierane z konta właściciela [?], nie da się zaakceptować własnego PR.
- **Odbiór:** PR dotykający pliku zapalnego bez etykiety jest czerwony; po dodaniu etykiety (przez Sonneta po przeglądzie) zielony.
- **Wykonawca:** Sonnet.

### Z-04. Kolory tylko z tokenów
- **Co (trzy warstwy):**
  1. ESLint `no-restricted-syntax` dla literałów kolorów w JS/TS (deck.gl, MapLibre). Przykład do dopasowania:
     ```js
     'no-restricted-syntax': ['error',
       { selector: "Property[key.name=/[Cc]olor$/] > ArrayExpression",
         message: 'Kolor tylko z pliku kolorów (tokeny). Zobacz AGENTS.md.' },
       { selector: "Property[key.name=/[Cc]olor$/] > ArrowFunctionExpression > ArrayExpression",
         message: 'Kolor tylko z pliku kolorów (tokeny). Zobacz AGENTS.md.' },
     ]
     ```
     Z wyjątkiem (override) dla jednego pliku kolorów, np. `src/theme/colors.ts`, który buduje tablice RGB z tokenów.
  2. Klasy Tailwind: reguła `tailwindcss/no-arbitrary-value` (istnieje; reguła „no-arbitrary-value-overuse” **nie istnieje**). Sprawdź zgodność wersji wtyczki z Tailwind v4 [?]. Jeśli reguła daje za dużo fałszywych alarmów – zastąp ją testem z p. 3.
  3. Test przeszukujący kod: `#hex`, `rgb(`, `rgba(`, `hsl(` oraz `-[#` w klasach – poza plikiem tokenów i plikiem kolorów → błąd.
- **Odbiór:** celowo wstawiony kolor na sztywno (w klasie, w CSS i w `getFillColor`) daje czerwone CI z komunikatem wskazującym plik tokenów; obecny kod przechodzi.
- **Wykonawca:** Jules (zadanie) + Sonnet (przegląd, bo konfiguracja lintera to plik zapalny).

### Z-05. Zrzuty wzorcowe
- **Co:**
  - Ujednolicić regułę: obowiązuje wersja z `OPERACJE.md` §6 („gdy PR dotyka czegokolwiek widocznego na /design”). Usunąć sprzeczne zdanie z §2.
  - Zrzuty wzorcowe generuje **wyłącznie** workflow CI w obrazie `mcr.microsoft.com/playwright` (ta sama wersja co `@playwright/test`), uruchamiany etykietą `aktualizuj-zrzuty`. Workflow commituje nowe zrzuty do gałęzi PR i usuwa etykietę.
  - Animacje wyłączone, fonty z repo, zmienne fragmenty maskowane.
  - **Bez auto-scalania** po odświeżeniu: właściciel ogląda różnice, potem scala.
  - Każdy kolejny push do PR po odświeżeniu i tak zostanie porównany ze zrzutami → nie trzeba zgadywać, kiedy Jules skończył (reguła „15 minut” do usunięcia).
- **Odbiór:** zrzuty wygenerowane lokalnie i w CI są identyczne dla tego samego commita; etykieta na PR daje commit ze zrzutami i komentarz z listą zmienionych plików.
- **Wykonawca:** Sonnet. Skrypt `snapshots` przerobić na wywołanie tego workflow (lub usunąć).

### Z-06. Bramki fal jako warunki maszynowe
- **Co:** w `FALE.md` każda fala ma linię `Bramka:` z **komendą**, np.:
  ```
  Bramka fali 7: node scripts/gates/wartosci-na-main.mjs   # plik danych istnieje, ma ≤ 7 dni, przechodzi test kontraktu
  ```
  `new-task.sh` przed wysłaniem zadania fali N+1 uruchamia bramkę fali N. Kod ≠ 0 → `STOP` z komunikatem „bramka fali N niespełniona: …” i właścicielem eskalacji.
  Raport Haiku nadal pokazuje na górze `URUCHOM SONNETA: …` z gotowym poleceniem – ale **to bramka blokuje**, nie raport.
- **Odbiór:** przy niespełnionej bramce `new-task.sh` nie wyśle żadnego zadania kolejnej fali; po spełnieniu warunku – wyśle bez zmian w kodzie skryptu.
- **Wykonawca:** Sonnet.

### Z-07. Modele: podagenci zamiast `/model`
- **Fakty:** każdy model ma własny cache – zmiana `/model` w rozmowie oznacza ponowne wczytanie całej historii bez trafień w cache [D]. Zmiana modelu w środku rozmowy daje też mierzalne przesunięcia jakości [D, badanie na innych modelach].
- **Co:**
  - `.claude/agents/obieg.md` – model `haiku`, tylko narzędzia potrzebne do §3 (status, scalanie, wysyłka, raport). Treść = polecenie z `OPERACJE.md` §3.
  - `.claude/agents/recenzent-zapalnych.md` – model `sonnet`, przegląd PR z etykietą potrzeby przeglądu, wynik = `sprawdzone` albo lista poprawek.
  - Przykład nagłówka:
    ```markdown
    ---
    name: obieg
    description: Jeden obieg wg OPERACJE §3 – status, scalanie zielonych PR, wysyłka gotowych zadań, raport. Kończy się wynikiem albo STOP.
    model: haiku
    tools: Bash, Read
    ---
    ```
  - Opus: **nowa sesja** na planowanie, startuje od `FALE.md` + `OPERACJE.md` + ostatniego raportu. Nie z wielotygodniowego wątku.
  - Długie sesje: `/clear` po zakończeniu zadania; najpierw zapis stanu do plików.
- **Odbiór:** jeden pełny obieg wykonany przez podagenta, bez `/model`; w raporcie odnotowane `/usage` przed i po.
- **Wykonawca:** Sonnet.

### Z-08. Bezpieczeństwo w CI
- **Co:** zadanie `bezpieczenstwo`: gitleaks (sekrety), `pnpm audit --prod --audit-level high`. W ustawieniach repo: skanowanie sekretów + CodeQL (repo publiczne). Zmiana `package.json`/lockfile dodająca zależność wymaga etykiety `nowa-zaleznosc` (wpis w `AGENTS.md`: uzasadnienie w PR).
- **Odbiór:** testowy PR z fałszywym kluczem i testowy PR z nową zależnością bez etykiety są czerwone.
- **Wykonawca:** Sonnet.

### Z-09. Dług techniczny
- **Co:** sekcja `## Dług` w `FALE.md` (punkt, źródło, priorytet, proponowana fala). Opus przy planowaniu każdej fali bierze z niej co najmniej 1 punkt albo pisze, dlaczego nie.
- **Wpisać od razu:** `trackSearch` w wyszukiwarce; nieaktualny `docs/data-report.md` (rozwiązuje Z-01); aktualizacja §6 „lokalnie e2e nie działa” (nieprawda).
- **Uwaga:** limit czasu zapytania nie jest długiem – to Z-01, najbliższa fala.

### Z-10. Pomiar
- **Co:** raport fali zawiera: `/usage` na start i koniec, linię trafień cache (jeśli wersja Claude Code ją pokazuje), liczbę wizyt Sonneta (planowanych/nieplanowanych), liczbę `STOP` i ich przyczyny.
- **Odbiór:** po 2 falach da się odpowiedzieć liczbami, czy obieg Haiku jest tańszy niż alternatywa.

### Z-11. Testy skryptów kontrolnych
- **Co:** przypadki testowe dla logiki, która zostaje w skryptach (lub w CI): PR z ID w tytule / w treści / w gałęzi / bez ID; plik w zakresie / poza; usunięty plik; bramka spełniona / niespełniona.
- **Odbiór:** testy w CI; błąd typu „ID tylko na początku tytułu” byłby wykryty.

### Z-12. Odchudzenie `merge.sh` (na końcu)
- **Warunek:** Z-02, Z-03, Z-08 działały bez błędu przez **jedną pełną falę**.
- **Co:** usunąć z `merge.sh` kontrole zdublowane w CI. Zostaje: sprawdzenie, że wymagane sprawdzenia są zielone, scalenie (squash), kontrola po scaleniu, wpis do raportu.
- **Odbiór:** krótszy skrypt, te same wyniki na fali testowej.

---

## 4. Zmiany w dokumentach

- **`OPERACJE.md`**
  - §2 – usunąć sprzeczną regułę zrzutów.
  - §3 – obieg uruchamiany jako podagent `obieg`, nie przez `/model`.
  - §5 – bramki fal i wymagane sprawdzenia jako źródła `STOP`.
  - §6 – nowe objawy w tabeli błędów (czerwone `zakres`, `zapalne`, `bezpieczenstwo`, bramka niespełniona) z gotową reakcją; poprawić zdanie o lokalnym e2e.
- **`FALE.md`** – linia `Bramka:` z komendą dla każdej fali; sekcja `Dług`; kolumna „Kto sprawdza” oparta na `.github/zapalne.txt`.
- **`AGENTS.md`** – pole `Zadanie:` w PR obowiązkowe; kolory tylko z pliku kolorów/tokenów; nowe zależności tylko z uzasadnieniem i etykietą; nigdy nie zmieniać zrzutów wzorcowych ręcznie.
- **Raport fali** – nowe pola z Z-10; na górze `URUCHOM SONNETA` (jeśli są zadania Sonneta) i stan bramki fali.

---

## 5. Czego NIE robić (odrzucone propozycje)

| Propozycja | Dlaczego odrzucona |
|---|---|
| Kolejka scalania (merge queue) | Dostępna tylko w publicznych repo organizacji lub w Enterprise Cloud; przy kilku PR tygodniowo bez korzyści |
| Tryb „strict” od razu | Przy równoległych PR wymusza ciągłe aktualizacje gałęzi i dodatkowe CI; włączyć tylko przy realnych konfliktach |
| Wymagany przegląd właściciela kodu (CODEOWNERS) | Może zablokować scalanie, jeśli PR-y są z konta właściciela [?] |
| Auto-scalanie po odświeżeniu zrzutów | Akceptacja wyglądu w ciemno |
| Usunięcie wszystkich skryptów od razu | Brak kontroli w okresie przejściowym; najpierw zamiennik w CI |
| Haiku jako cykliczny „agent dokumentacji” | Nowy ruchomy element; dokumenty danych generuje robot danych |
| Reguła `tailwindcss/no-arbitrary-value-overuse` | Nie istnieje |
| Zmienna `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` | Niepotwierdzona |
| Dalsze przełączanie `/model` w długim wątku | Koszt cache + zmiana jakości |
| Plik `JULES.md` | Brak w dokumentacji Julesa; Jules czyta `AGENTS.md` w katalogu głównym |

---

## 6. Fakty zweryfikowane (stan 20.10.2026)

| Fakt | Pewność |
|---|---|
| Każdy model ma osobny cache; `/model` i `/effort` w rozmowie = ponowne wczytanie całej historii bez cache | [D] dokumentacja Claude Code |
| Przy subskrypcji główna rozmowa ma cache 1 h; podagenci, kompaktowanie itp. – 5 min; ustawienie `promptCacheTtl` / `CLAUDE_CODE_PROMPT_CACHE_TTL` (v2.1.242+) | [R] relacja z opisu dokumentacji, nie sprawdzona u źródła |
| Podagent ma własne okno kontekstu i może mieć `model: haiku/sonnet/opus` | [D] |
| Zmiana modelu w środku rozmowy daje istotne statystycznie zmiany wyników (−8…+13 pp w wykonywaniu instrukcji) | [D] ICLR 2026, modele OpenAI |
| Dryf w długich rozmowach stabilizuje się; przypomnienia celu go zmniejszają | [D] arXiv 2510.07777 |
| Standardowe runnery GitHub Actions są darmowe dla repo publicznych; 2000 min dotyczy repo prywatnych w planie Free | [D] dokumentacja GitHub |
| W planie Free reguły gałęzi i auto-merge działają tylko w repo publicznych | [R] |
| Od 25.03.2026 auto-merge bywa odrzucane (HTTP 422), dopóki wymagania nie są spełnione | [R] |
| Merge queue: tylko publiczne repo organizacji lub Enterprise Cloud | [D] |
| Jules czyta `AGENTS.md` z katalogu głównego; brak dokumentacji dla plików zagnieżdżonych | [D] |
| `tailwindcss/no-arbitrary-value` istnieje; nowa wersja wtyczki przepisana pod Tailwind v4 | [D] |
| `dorny/paths-filter` tylko warunkuje uruchamianie zadań; nie sprawdza zakresu | [D] |

---

## 7. Pytania do sprawdzenia w repo PRZED wdrożeniem

1. Gdzie fizycznie działają skrypty (`status`, `merge` itd.): lokalnie na Windows, w Claude Code w chmurze, w Actions? → wpływa na pracę z telefonu.
2. Czyje konto jest autorem PR-ów Julesa (właściciel czy bot)? → Z-03, CODEOWNERS.
3. Gdzie dziś powstają zrzuty wzorcowe (CI czy lokalnie)? Czy zrzuty z #132 były generowane lokalnie? → Z-05.
4. Czy repo jest na koncie osobistym czy w organizacji? Czy jest publiczne? → Z-02, merge queue, darmowe minuty.
5. Wersja wtyczki ESLint dla Tailwind i jej zgodność z Tailwind v4. → Z-04.
6. Jak dziś zdefiniowane są bramki fal 7–9 i czy da się je wyrazić komendą. → Z-06.
7. Czy któryś obecny skrypt robi coś, czego nie ma na liście w §3? → nie zgubić funkcji przy Z-12.

Wynik: krótka tabela „pytanie → odpowiedź → czy zmienia decyzję” w pierwszym PR.

---

## 8. Kolejność wdrożenia

| Krok | Zmiany | Kiedy |
|---|---|---|
| 0 | „Fetch data” ręcznie; odpowiedzi na §7 | Teraz |
| 1 | Z-01 (dane + limit czasu) | Najbliższa fala |
| 2 | Z-02 + Z-03 + Z-08 (jeden PR Sonneta: wymagane sprawdzenia, zapalne, bezpieczeństwo, szablon PR) | Najbliższa fala |
| 3 | Z-04 (kolory) jako zadanie Julesa | Po kroku 2 (sprawdzi je nowa bramka) |
| 4 | Z-05 (zrzuty) + Z-06 (bramki fal) | Następna fala |
| 5 | Z-07 (podagenci) + Z-10 (pomiar) | Równolegle z krokiem 4 |
| 6 | Z-09 (dług) – od razu wpisy; przegląd przy każdym planowaniu | Ciągle |
| 7 | Z-11 (testy skryptów) | Przed Z-12 |
| 8 | Z-12 (odchudzenie `merge.sh`) | Po jednej czystej fali z nowymi sprawdzeniami |

---

## 9. Kryterium sukcesu całości (po 2 falach)

- 0 PR scalonych bez kontroli zakresu.
- 0 fal uruchomionych przy niespełnionej bramce.
- Kolory na sztywno: łapane przez CI, poprawiane przez Julesa bez Sonneta.
- Nieplanowane wizyty Sonneta: ≤ 1 na falę.
- Raport zawiera liczby zużycia limitów z obu fal.

---

## 10. Źródła

- Claude Code – prompt caching: https://code.claude.com/docs/en/prompt-caching
- Relacja o TTL cache (Reddit, przez ProPakistani, 16.10.2026): https://propakistani.pk/2026/10/16/claude-reportedly-resets-your-cache-to-charge-you-more/amp/
- Podagenci Claude Code: https://tembo.io/blog/claude-code-subagents
- ICLR 2026 – drift po zmianie modelu: https://www.iclr.cc/virtual/2026/10016951
- arXiv 2510.07777 – Drift No More?: https://arxiv.org/abs/2510.07777
- GitHub Actions – rozliczanie: https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Ochrona gałęzi w planie Free (relacja): https://github.com/DevToolie/.github/pull/3
- Zmiana auto-merge (marzec 2026): https://devactivity.com/insights/github-auto-merge-bug-undocumented-change-disrupts-pr-workflows-and-developer-performance
- Merge queue – dostępność: https://github.blog/changelog/2023-07-12-pull-request-merge-queue-is-now-generally-available/
- Jules – AGENTS.md: https://jules.google/docs
- eslint-plugin-tailwindcss – no-arbitrary-value: https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/master/docs/rules/no-arbitrary-value.md

---

## 11. Odpowiedzi z repo i korekty (20.10.2026, po sprawdzeniu)

Decyzja właściciela 20.10: **repo publiczne** (opcja A). Audyt przed upublicznieniem: brak plików z sekretami w drzewie i historii, w commitach tylko adresy `noreply`, gitleaks przechodzi na całej historii, workflowy nie używają `pull_request_target`; `legacy/` zawiera tylko `.gitkeep`; brak pliku licencji (domyślnie: wszystkie prawa zastrzeżone).

| Pytanie §7 | Odpowiedź | Zmienia decyzję? |
|---|---|---|
| 1. Gdzie działają skrypty | w sesji Claude w chmurze; właściciel na telefonie | nie |
| 2. Autor PR-ów Julesa | konto właściciela (`olubiec`) | potwierdza: bez CODEOWNERS, etykieta `sprawdzone` |
| 3. Gdzie powstają zrzuty | już tylko w CI, obraz `mcr.microsoft.com/playwright:v1.64.1-jammy` (też #132) | Z-05 w większości zrobione; dochodzi etykieta i uruchamianie CI |
| 4. Konto i widoczność | konto osobiste, repo prywatne (Free): reguły gałęzi → 403; minuty Actions ok. 1 700 z 2 000 w 3 dni (szacunek) | **tak** → repo publiczne |
| 5. Linter | oxlint, nie ESLint | **tak** → Z-04 jako test (warstwa 3), bez wtyczek ESLint |
| 6. Bramki fal jako komendy | tak (`FALE.md` §1) | nie |
| 7. Funkcje skryptów spoza listy | `merge.sh`: kontrola po scaleniu, zdejmowanie szkicu; `new-task.sh`: `Wymaga na main:`, duplikaty | pilnować przy Z-12 |

Korekty treści:
- **Z-08:** CI już ma gitleaks i `pnpm audit --prod --audit-level high`; nowe są tylko etykieta `nowa-zaleznosc` i CodeQL.
- **Z-02 (źródło ID):** gałęzie Julesa nie zawierają ID; kolejność: `Fixes #N` → tytuł issue, potem `Zadanie:`, potem tytuł PR.
- **Z-03:** `sprawdzone` zdejmowane przy każdym nowym commicie.
- **Z-01 / Z-05:** commity i PR-y robota (GITHUB_TOKEN) nie uruchamiają CI; workflowy uruchamiają CI przez `workflow_dispatch`.
- **Z-01:** dane nie trafiają na `main` bez PR; liczby kontrolne sprawdza test zamiast Sonneta.
- **Reguła „15 minut”** z retrospektywy – wycofana (zgodnie z Z-05).

Wdrożenie: zadania CC12.* w `docs/FALE.md` §1 i §5.
