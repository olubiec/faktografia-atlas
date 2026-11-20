# Wytyczne dla sesji badawczych i prototypowych (W22–W23: U00–U11)
Czytasz je przed każdym zadaniem U. Właściciel nie czyta kodu i ogląda wyniki z telefonu, więc raport ma być zrozumiały bez wiedzy technicznej.

## 1. Zakres i bezpieczeństwo
- Zmieniasz tylko pliki z linii „Zmieniaj”. Potrzebujesz innego pliku: zatrzymaj się i opisz w PR dlaczego.
- Przed pushem: `git diff --name-only origin/main...HEAD` zawiera tylko pliki z „Zmieniaj”; `git diff --name-status --diff-filter=D origin/main...HEAD` jest puste.
- Gałąź aktualizujesz wyłącznie `git merge origin/main`. Bez rebase i `--force`.
- Istniejących testów nie zmieniasz, chyba że zadanie wprost to mówi (U00, U10).
- Nowych pakietów nie instalujesz. Rekomendujesz je w raporcie: nazwa, link do npm i repozytorium, wersja, data wydania, pobrania tygodniowo, licencja, rozmiar po kompresji. Nazwy sprawdzasz w rejestrze.
- Zatwierdzone decyzje właściciela są w `docs/PLAN-UPROSZCZENIE.md` §0. Nie pytaj o nie ponownie. Jeśli dane im przeczą, napisz to w „Rekomendacji”.

## 2. Jak mierzyć i dowodzić
- Każda liczba w raporcie ma źródło: komenda, plik albo pomiar. Komendę podaj pod tabelą.
- Czego nie sprawdziłeś, oznacz `[?]`. Nie zgaduj.
- Źródła zewnętrzne: link, data odczytu, licencja. Cudzego kodu nie kopiujesz. Repozytoria czytasz tylko z wpisem `zweryfikowane` w `docs/INSPIRACJE.md`.
- Pomiary wydajności: SwiftShader (×4 CPU), 3 powtórzenia, podaj medianę i metodę. Napisz wprost, że to liczby orientacyjne, a werdykt daje telefon właściciela.
- Skrypty pomocnicze trzymaj w scratchpadzie, nie w repozytorium (chyba że są w „Zmieniaj”).

## 3. Budowa raportu `docs/research/u/U<nn>.md` (najwyżej 250 linii)
1. **Streszczenie** – 5 zdań: co sprawdziłem, co wyszło, co polecam.
2. **Metoda** – co, jak, kiedy, na którym commicie.
3. **Wyniki** – tabele z liczbami zamiast akapitów.
4. **Rekomendacja** – jeden wariant, dlaczego, czego nie wybrałem i dlaczego.
5. **Co to zmienia w planie** – zadania etapu B, pliki, testy, koszt w sesjach.
6. **Pytania do właściciela** – najwyżej 3. Format: `P1. Pytanie w jednym zdaniu? A) … B) … Zalecam A, bo …`.

Język: polski, zdania do ok. 20 słów, bez skrótów bez objaśnienia. Zrzuty to JPG, razem do ok. 3 MB, w `docs/research/u/u<nn>/`.

## 4. Prototypy (`src/view/test/proto/<nazwa>.tsx`)
- Eksport domyślny: komponent React. Trasa `/__test/proto/<nazwa>` powstaje sama; `src/App.tsx` zostaje nietknięty.
- Na górze pasek „PROTOTYP – nie jest to docelowy ekran” i link do listy prototypów (`/__test/proto`).
- Telefon 390 px najpierw, potem komputer. Pola dotykowe min. 44 px. Animacje wyłączone przy `prefers-reduced-motion`.
- Kolory, kroje, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`). Zero wartości wpisanych na sztywno.
- Dane przez istniejące loadery. Nie importujesz `public/data/*.json` do kodu strony.
- Pliki do ok. 200 linii; większą logikę wydziel do `src/core/` z testem.

## 5. Weryfikacja i PR
- Uruchom komendy z linii „Weryfikacja”. Czerwone testy poprawiasz sam.
- Zrzuty (`*-snapshots/`) powstają tylko w CI przez „Update snapshots”; nie generuj ich u siebie.
- Tytuł PR: `[W22-U<nn>] <krótki opis>`. Opis ma „Po ludzku”:
  1. co zrobiłem (2–3 zdania),
  2. co obejrzeć na podglądzie Vercel (dokładny adres, np. `/__test/proto/start`, i na co patrzeć),
  3. czego nie zrobiłem i dlaczego.
- Nie scalasz. Scala właściciel.
