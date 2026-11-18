# QC611 – Strażnik szybkości: wejście na mapę = granice + jednostki + 1 plik wskaźnika + `available.json`
> **KOREKTA 18.11.2026:** próg „`available.json` < 50 KB” dotyczy ok. 100 wskaźników; dziś plik ma 1773 pozycje (ok. 538 KB po rozpakowaniu, ok. 27 KB po gzip). Test ma pilnować rozmiaru **po kompresji** (≤ 100 KB, decyzja D7 w docs/PLAN-POPRAWEK.md – do zatwierdzenia) i że wejście nigdy nie pobiera pełnego `index.json`.
Cel: Test e2e pilnujący progów z PRODUKT §7 po dodaniu wskaźników z biblioteki (nigdy pełny `index.json`, jedno żądanie na dodany wskaźnik).
Zmieniaj: tests/e2e/q-budgets-library.spec.ts
Wymagane: tests/e2e/q-budgets-library.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/q-budgets-library.spec.ts
Przeczytaj najpierw: docs/PRODUKT.md §7 (tabela progów po zmianie 17.11), tests/e2e/navigation-and-budgets.spec.ts, tests/e2e/perf-budget.spec.ts, tests/e2e/network-resilience.spec.ts, tests/e2e/helpers/ (**istniejące – wzorce, nie zmieniaj**), tests/e2e/q-library-on-map.spec.ts (QC606)

## Kontekst
Strona główna nie może pobierać pełnego indeksu biblioteki (7,9 MB). Po wprowadzeniu `available.json` i wskaźników `b…` trzeba pilnować: (1) co jest pobierane na wejściu, (2) co przy dodaniu wskaźnika do „Moich”/eksportu, (3) czy `/biblioteka` nadal robi jedno żądanie indeksu.

## Research
Zobacz, jak `navigation-and-budgets.spec.ts` zlicza żądania (`page.on('request')`, filtrowanie po URL, mockowane odpowiedzi z fixture’ów). **Użyj tego samego sposobu**; nie wykonuj prawdziwych żądań do sieci (fixture’y z `tests/fixtures`).

## Zadanie
Napisz spec `@Q` z mockiem sieci dla: `units.json`, granic, `values/*.json`, `profiles/*`, `library/available.json`, `library/index.json`, plików wartości biblioteki (fixture’y).

## Scenariusze
1. Wejście na `/`: żądania = granice + `units.json` + **dokładnie jeden** `values/<domyślny>.json` + **jeden** `available.json`; **zero** `index.json`, **zero** `profiles/*`, **zero** plików wartości biblioteki.
2. `/?i=b101`: jedno żądanie pliku wartości biblioteki `101`, zero `values/*.json` głównych (poza ewentualnym domyślnym – ustal zgodnie z QC606 i opisz), zero `index.json`.
3. Dodanie wskaźnika do „Moich” (okno + z listą) **nie** pobiera wartości (samo dodanie do listy jest bez sieci).
4. Kliknięcie dodanego `b…` w panelu = jedno żądanie jego wartości; ponowny klik = zero.
5. Eksport (wymaga QC912/QC917 – w tej fali jeszcze ich nie ma): **nie pisz tego scenariusza teraz**; zapisz w opisie PR, że żądania wskaźnika dodanego w eksporcie sprawdza QC920 (krok 4). Nie używaj `skip`/`fixme`.
6. `/biblioteka`: dokładnie jedno żądanie `index.json` (PRODUKT §7); asercja o `available.json` zgodna z faktycznym zachowaniem strony (jeśli `/biblioteka` go nie pobiera – zero; jeśli sekcja „Moje wskaźniki” (QC509) go pobiera – jedno) i opisana komentarzem w teście.
7. `available.json` w 404: strona główna działa (mapa się koloruje), w konsoli brak błędów, żadnych powtórnych prób (zlicz żądania: 1).
8. Rozmiar `available.json` w fixture’ach < 50 KB.

## Gotowe, gdy
- Wejście na mapę = granice + jednostki + 1 plik wskaźnika + `available.json`; nigdy pełny `index.json`; testy zielone.
Nie ruszaj: kodu aplikacji, istniejących speców.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
