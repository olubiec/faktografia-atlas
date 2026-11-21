# Plan fal etapu C – wybór danych, wejście do mapy, spójność ekranów (21.11.2026)
Powstał z poleceń właściciela po odchudzeniu etapu B (`docs/PLAN-FALE-B.md`). Zadania: `tasks/W24-C01…C09`; z etapu B zostają `W23-B13` i `W23-B14` (obie dostosowane). Nic nie startuje samo: falę puszcza właściciel po obejrzeniu poprzedniej.

## 1. Polecenia właściciela → zadania
| Polecenie | Zadanie |
|---|---|
| „Moje wskaźniki” do wywalenia; zostaje tylko w Porównaj | C01 (główna mapa), B13 (profil); reszta modułu usuwa B14 dopiero, gdy wróci/zniknie Porównaj |
| Wskaźnik na mapie wybierany z okna jak Biblioteka: menu danych, szukajka, pod nią kategorie; przycisk „Wybierz dane”, okno pełnoekranowe | C01 (komputer i telefon), B13 (profil używa tego samego okna) |
| Dopracować modułowo wygląd, ustawienia, pozycje każdego menu, okna i strony głównej; powtórzenia i zasłanianie; użyć gotowych modeli z innych stron | C03 (audyt i gotowce), C04 (wspólne moduły), C05 (nagłówek, menu telefonu), C06 (stopka), C07 (strona `/`), C08 (panele i okna na mapie), C09 (testy-strażnicy) |
| Animacja przybliżania: lekkie przybliżenie do mapy, bez „zamknij animowaną mapę, potem otwórz prawdziwą” | C02 |
| Dolny pasek na telefonie lekko wyżej | C01 (pasek i okienko miejsca), C08 (reszta stref) |
| Biblioteka usunięta z menu, ale też z innych miejsc (stopka itd.), wszystko na gotowych modułach | C06 (stopka, teksty, linki), C04 (moduły) |
| Strona główna kurczowo według wytycznych stylu, także logo | C07 (lista z STYL §2–§5 i §12), C05 (logo w nagłówku) |

## 2. Tabela fal
Zadania jednej fali nie dzielą plików i nie zależą od siebie, więc idą równolegle (jedna sesja na plik, PR `[W24-Cnn]` lub `[W23-B13]`).

| Fala | Zadania | Zależą od | Pierwsza widoczna zmiana |
|---|---|---|---|
| 1 | **C01** „Wybierz dane” + dolny pasek · **C02** wejście do mapy · **C03** audyt (raport, bez zmian w kodzie) | – | Przycisk „Wybierz dane”, okno na cały ekran; płynne „Otwórz mapę”; raport z listą zasłonięć i powtórzeń |
| 2 | **B13** profil uproszczony i „Kopiuj link” · **C04** wspólne moduły okien, sekcji, list | B13←C01; C04←C03 | Profil: „Zmień wskaźnik” otwiera to samo okno; „Kopiuj link” w nagłówku |
| 3 | **C05** nagłówek i menu telefonu · **C06** stopka i teksty bez Biblioteki · **C07** strona `/` według stylu · **C08** panele i okna na mapie | C05–C07←C04; C08←C01,C04; wszystkie←C03 | Jednolity wygląd, brak zasłaniania, krótka stopka, strona główna zgodna z wytycznymi |
| 4 | **B14** sprzątanie (zakres zmniejszony) · **C09** strażnik spójności (testy) | B14←B13,C05–C08; C09←C05–C08 | Mniej kodu; testy pilnują układu |

Uzasadnienie: okno wyboru (C01) i audyt (C03) nie zależą od niczego i niczego nie psują, więc idą pierwsze; moduły wspólne (C04) powstają po audycie, bo to audyt mówi, jakie moduły są potrzebne; ekrany (C05–C08) przechodzą na moduły równolegle, bo każdy ma osobne pliki; sprzątanie i testy-strażnicy na końcu, żeby nie usuwać ani nie zamrażać niczego, co jeszcze się zmienia.

## 3. PROMPT startowy dla podagenta (podstaw `<ID>` = np. C01)
```
Jesteś podagentem zadania [W24-<ID>] w repozytorium olubiec/faktografia-atlas (katalog /home/user/faktografia-atlas). Wykonaj dokładnie jedno zadanie: tasks/W24-<ID>-*.md.
1. Czytaj w tej kolejności: AGENTS.md, docs/STYL.md, docs/PLAN-FALE-C.md, plik zadania i jego „Przeczytaj najpierw”.
2. Zależności: sprawdź w git log origin/main, że PR-y zadań z linii „Zależy od” są scalone (C03: raport docs/research/c/C03-audyt-ukladu.md jest na main). Jeśli nie, zatrzymaj się i napisz to (nic nie zmieniaj). Jeśli w zadaniu jest „ZAKRES WSTĘPNY” i w pliku nie ma wpisu „Zakres potwierdzony”, zatrzymaj się i napisz.
3. Gałąź: git fetch origin && git checkout -b claude/W24-<ID> origin/main. Aktualizacja gałęzi tylko git merge origin/main (bez rebase i --force).
4. Najpierw testy z „Gotowe, gdy” (mają być czerwone), potem kod. Każdy warunek = co najmniej jeden test zachowania. Nie wyłączaj testów, reguł lintera ani typów. Istniejących testów nie zmieniasz ani nie usuwasz, poza wprost wymienionymi w zadaniu.
5. Zmieniaj tylko pliki z „Zmieniaj” i „Wymagane”. Potrzebujesz innego pliku, nowego pakietu albo warunek jest niejasny: zatrzymaj się i opisz to w PR.
6. Przed pushem: git diff --name-only origin/main...HEAD (tylko pliki z zadania), git diff --name-status --diff-filter=D origin/main...HEAD (puste, chyba że zadanie wymienia usunięcia). Uruchom „Weryfikacja”; czerwone testy poprawiasz sam.
7. Zrzutów (*-snapshots/) nie generujesz; jeśli wzorce mogły się zmienić, napisz w PR, że trzeba uruchomić „Update snapshots”.
8. PR: tytuł „[W24-<ID>] <tytuł zadania>”, opis z sekcją „Po ludzku” (co zrobiłem · co sprawdzić na podglądzie Vercel i pod jakim adresem · czego nie zrobiłem i dlaczego), bez „Closes #”. Nie scalaj.
```
Prompt sesji startowej fali: jak w `docs/PLAN-FALE-B.md` §3, z `W24` zamiast `W23` i listą zadań z tabeli (dla B13 i B14 prompt jest w ich plikach).

## 4. Co sprawdzasz po każdej fali (po ludzku)
| Fala | Gdzie patrzeć | Co ma być widać |
|---|---|---|
| 1 | `/mapa` telefon i komputer; `/` → „Otwórz mapę”; raport C03 w PR | „Wybierz dane” otwiera okno na cały ekran (szukajka u góry, działy niżej); „Moich wskaźników” brak; dolny pasek wyżej; przejście do mapy płynne, bez zamykania i otwierania; raport zgadza się z tym, co widzisz |
| 2 | profil miejsca; nagłówek `/mapa` | „Zmień wskaźnik” otwiera to samo okno; „Kopiuj link” w nagłówku; profil z 7 wskaźnikami |
| 3 | wszystkie strony, telefon i komputer, jasny i ciemny motyw | Nic się nie zasłania ani nie powtarza; stopka z ok. 6 linkami bez Biblioteki; `/` według wytycznych (logo, przyciski, kolory) |
| 4 | `/`, `/mapa`, `/o-projekcie` | Wyglądają jak po fali 3 (B14 usuwa tylko martwy kod); w PR C09 lista ewentualnych błędów układu |
Po falach 1 i 3 uruchom „Update snapshots” (zmieniają się wzorce zrzutów).

## 5. Ryzyka
- C04–C08 mają zakres wstępny do czasu raportu C03: po jego scaleniu Claude wpisuje „Zakres potwierdzony” i poprawia listy plików; bez tego podagent się zatrzyma.
- C02: jeśli pusty kadr przy wejściu do mapy wynika z ładowania samej mapy, potrzebna będzie zgoda na zmianę pliku ekranu (`Home.tsx`/`AtlasMap.tsx`); podagent zatrzyma się i opisze.
- Zmiana tokenów (`config/tokens.json`) wymaga osobnej zgody właściciela (AGENTS.md); C04 zatrzyma się, jeśli będzie potrzebna.
