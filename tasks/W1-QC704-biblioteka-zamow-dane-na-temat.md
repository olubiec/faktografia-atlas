# QC704 – Przycisk „Zamów dane na temat…”
Cel: Użytkownik, który nie znalazł wskaźnika, jednym kliknięciem otwiera zgłoszenie na GitHubie z wpisanym tematem.
Zmieniaj: src/view/library/OrderTopicButton.tsx, src/core/library/order.ts, tests/unit/order-topic-button.test.tsx
Wymagane: tests/unit/order-topic-button.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/view/library/OrderButton.tsx (wzorzec), src/core/library/order.ts (`orderIssueUrl`), tests/unit/library-order.test.ts i library-order-button.test.tsx, `.github/ISSUE_TEMPLATE/` (szablon `zamowienie-wskaznika.yml` – tylko do odczytu), docs/PRODUKT.md §4d

## Kontekst
Istniejące `orderIssueUrl` zamawia konkretny wskaźnik (id, nazwa). Tu zamawiamy **temat** („dane o żłobkach”). **Istniejące testy `library-order*.test` nie mogą się zmienić** – dlatego **dodajesz** nową funkcję obok starej, bez zmiany starej. Nie zmieniaj szablonów w `.github/` (zakaz AGENTS.md) – użyj istniejącego szablonu z polami, wstawiając temat w pole `nazwa`, a w `id` tekst „temat”.

## Research
1. Otwórz `.github/ISSUE_TEMPLATE/zamowienie-wskaznika.yml` i spisz **nazwy pól** (`id`, `nazwa`, `dzial`, `poziom`) – parametry URL muszą się zgadzać z nimi.
2. Limit długości adresu: `orderIssueUrl` ucina nazwę przy 1800 znakach – zachowaj to w nowej funkcji (współdziel pomocnika; nie kopiuj pętli).
3. Nie wysyłamy nic sami: link otwiera stronę GitHuba w nowej karcie (`rel="noopener noreferrer"`).

## Zadanie
- `order.ts`: dodaj `export function orderTopicUrl(topic: string, categoryPath?: string | string[]): string` – tytuł „Zamówienie danych na temat: <temat>”, pole `nazwa` = temat, `id` = `temat`, opcjonalnie `dzial`; temat przycięty do 200 znaków i `trim()`; pusty temat → URL z pustą nazwą (przycisk pokaże wtedy tekst „Zamów dane na temat…” bez tematu).
- `OrderTopicButton.tsx`: props `{ topic?: string; categoryPath?: string | string[] }`. Tekst przycisku: bez tematu „Zamów dane na temat…”, z tematem „Zamów dane o „<temat>””. Pod przyciskiem to samo wyjaśnienie co w `OrderButton` (zgłoszenie na GitHubie, wymaga konta, nic nie wysyłamy bez zgody).
- Przycisk jako `<a>` w `Button asChild`, ≥ 44 px.

## Testy
1. `orderTopicUrl('żłobki')` → URL zaczyna się od `https://github.com/olubiec/faktografia-atlas/issues/new?`, zawiera `template=zamowienie-wskaznika.yml`, `nazwa=%C5%BC%C5%82obki`.
2. Temat z `&`, `#`, spacją i polskimi znakami jest poprawnie zakodowany (parsuj `new URL(...).searchParams` i porównaj).
3. Bardzo długi temat (500 znaków) → przycięty, URL ≤ 1800 znaków.
4. Przycisk bez tematu ma ogólny tekst, z tematem – tekst z cudzysłowem; `href` zawiera zakodowany temat.
5. Link ma `target="_blank"` i `rel` z `noopener noreferrer`.
6. Istniejące testy `library-order*.test` – uruchom, mają przejść bez zmian.

## Gotowe, gdy
- Adres zgłoszenia zawiera wpisany temat (zakodowany); testy zielone; stare `orderIssueUrl` nietknięte.
Nie ruszaj: `.github/*`, `OrderButton.tsx`, istniejących testów.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
