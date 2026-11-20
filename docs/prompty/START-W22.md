# Prompt startowy fali W22 (plan uproszczenia)
Użycie: gdy gałąź planu (`claude/great-wright-8oe4ax`) jest scalona do `main`, wklej poniższy blok w nowej sesji Claude w repozytorium `olubiec/faktografia-atlas`. Sesja startowa niczego nie wykonuje sama: przenosi pliki zadań i uruchamia osobne sesje.

## 1. Prompt dla sesji startowej (wklej w całości)
```
Jesteś sesją startową fali W22 w repozytorium olubiec/faktografia-atlas. Nie wykonujesz zadań, tylko startujesz fale.
1) Przeczytaj: AGENTS.md, docs/FALE.md, docs/PLAN-UPROSZCZENIE.md (§0 i §4), docs/research/u/WYTYCZNE.md.
2) Sprawdź, że jesteś na aktualnym main (git fetch origin && git checkout main && git pull). Jeśli plików tasks/poczekalnia/W22-U*.md nie ma, zatrzymaj się i napisz mi, że gałąź planu nie jest scalona.
3) Przenieś poleceniem git mv dokładnie te pliki z tasks/poczekalnia/ do tasks/: W22-U00, W22-U01, W22-U02, W22-U03, W22-U04, W22-U05, W22-U06, W22-U07, W22-U08, W22-U10, W22-U11 (11 plików). NIE ruszaj W23-U09 ani żadnych innych plików z poczekalni i z tasks/wstrzymane/.
4) Sprawdź, że żadne dwa zadania nie mają wspólnego pliku w linii „Zmieniaj” (wyjątek: katalogi proto/ i docs/research/u/ mają osobne pliki na zadanie). Konflikt: zatrzymaj się i opisz.
5) Commit „start W22” i push na main (to jedyny push na main, jaki wolno ci zrobić).
6) Dla każdego z 11 plików tasks/W22-*.md uruchom osobną sesję (create_session, to samo repozytorium, środowisko jak twoje, tytuł „[W22-<id>]”) z promptem z sekcji 2 poniżej (podstaw <id> i nazwę pliku). Niczego nie scalaj.
7) Na końcu wypisz tabelę: id, tytuł, id sesji. Zakończ.
```

## 2. Prompt dla sesji zadania (podstaw `<id>` i plik)
```
Jesteś sesją zadania [W22-<id>] w repozytorium olubiec/faktografia-atlas. Wykonaj dokładnie jedno zadanie: tasks/W22-<id>-*.md.
Kolejność czytania: AGENTS.md, docs/FALE.md, docs/PLAN-UPROSZCZENIE.md (§0 decyzje zatwierdzone), docs/research/u/WYTYCZNE.md, plik zadania, pliki z jego linii „Przeczytaj najpierw”.
Zasady: pracuj na gałęzi claude/<id> od origin/main; zmieniaj tylko pliki z „Zmieniaj”; aktualizuj gałąź tylko przez git merge origin/main; przed pushem sprawdź git diff --name-only origin/main...HEAD i git diff --name-status --diff-filter=D origin/main...HEAD (musi być puste); uruchom komendy z linii „Weryfikacja”; czerwone testy poprawiasz sam.
Najpierw testy z „Gotowe, gdy”, potem kod lub raport. Raport badawczy ma strukturę z WYTYCZNE §3 i kończy się „Rekomendacją” i „Pytaniami do właściciela” (najwyżej 3).
Otwórz PR z tytułem „[W22-<id>] …” i opisem z sekcją „Po ludzku” (co zrobiłem, co obejrzeć na podglądzie Vercel i pod jakim adresem, czego nie zrobiłem). Nie scalaj. Gdy zadanie jest niejasne lub wymaga pliku spoza „Zmieniaj”, zatrzymaj się i opisz to w PR.
```

## 3. Co właściciel ogląda po fali (kolejność)
| Id | Gdzie patrzeć | Co ma być widać |
|---|---|---|
| U10 | podgląd Vercel, dowolna strona; potem `?share=1` | Brak „Pobierz i udostępnij”; „Kopiuj link” jest; z `?share=1` przycisk wraca |
| U00 | podgląd na telefonie | Od startu widać całą Polskę; CI zielone |
| U11 | GitHub → Actions → „Fetch library” (po scaleniu, przy najbliższym przebiegu) | Tabela „pobrano wg działów”, ok. 3 000 zapytań na przebieg |
| U04 | `/__test/proto/wybor-danych` | Kategorie, wejście w kategorię, szukajka |
| U05 | `/__test/proto/widoki` | Przełącznik Mapa / Wykres / Tabela / Ranking |
| U06 | `/__test/proto/dwie-mapy` | Dwie mapy, przełącznik układu góra/dół ↔ A/B |
| U07 | `/__test/proto/start` | Animowane tło, oba warianty tła |
| U01, U02, U03, U08 | raporty w `docs/research/u/` (PR → „Files changed”) | Tabele; wyniki „przed”; kartka testu; lista testów |

Raporty czytaj od sekcji „Pytania do właściciela”. Odpowiedzi na nie zbiera U09.

## 4. Start W23 (synteza) – po scaleniu wszystkich PR-ów W22
Wklej w nowej sesji: „Jesteś sesją startową fali W23. Przenieś git mv tasks/poczekalnia/W23-U09-synteza-plan-docelowy.md do tasks/, commit i push na main, uruchom jedną sesję zadania wg promptu z docs/prompty/START-W22.md §2 (id U09, prefiks W23), zakończ.” U09 pisze `docs/PLAN-DOCELOWY.md`; po Twoich odpowiedziach powstają zadania etapu B.
