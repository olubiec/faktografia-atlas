# QC905 – Numer „n/N” na karcie (w stopce obok źródła)
Cel: Karta pokazuje numer strony zestawu tylko wtedy, gdy stron jest więcej niż jedna.
Zmieniaj: src/core/share/card.ts, tests/unit/card-page-number.test.ts
Wymagane: tests/unit/card-page-number.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/card.ts (stopka: `sourceText`, `siteUrl`, `footerY`), tests/unit/card*.test.ts (istniejące – **nie zmieniaj**, w tym zrzuty/sceny kart), src/core/share/text-fit.ts, src/core/share/formats.ts, docs/PRODUKT.md §4b

## Kontekst
Karta ma w stopce po lewej „Źródło: GUS, Bank Danych Lokalnych, <rok>”, po prawej adres strony. Numer strony („3/5”) ma stać **obok źródła** i nie może wypchnąć ani ściąć źródła ani adresu. **Istniejące testy kart nie mogą się zmienić**: bez numeru karta ma wyglądać identycznie jak dziś (ta sama lista elementów sceny).

## Research
1. Jak liczona jest szerokość źródła: `maxWidth: safeWidth - siteUrlWidth - 16·scale`. Numer dodajemy do **tej samej linii tekstu źródła** (np. „Źródło: GUS, Bank Danych Lokalnych, 2024 · 3/5”) albo osobnym elementem w środku stopki? Wybierz prostsze i bezpieczne dla najwęższego formatu (`story`/`post` mają safe 64 px; `wide` ma 1600 px); zmierz miarą testową (`measure`), że mieści się w polu w 4 formatach.
2. Jak zachować identyczną scenę dla N ≤ 1: nowa opcja `pageLabel?: string` w `CardSceneOptions`; **brak/pusty → żadnego dodatkowego elementu ani zmiany tekstu**.

## Zadanie
- Dodaj `pageLabel?: string` do `CardSceneOptions` (eksportowany typ).
- Gdy `pageLabel` niepusty: dopisz go do stopki (zgodnie z wyborem w Research), w kolorze `olowek`, tym samym rozmiarem `xs`; jeśli źródło + numer nie mieszczą się, **skróć tylko część „Bank Danych Lokalnych” do „BDL”** (nigdy nie obcinaj numeru ani adresu strony).
- Reszta `cardScene` bez zmian.

## Testy (`tests/unit/card-page-number.test.ts`)
1. `cardScene('map', data, 'post', 'light', { measure, pageLabel: '3/5' })` zawiera element tekstowy z „3/5”.
2. Bez `pageLabel` i z `pageLabel: ''`: scena **deep-equal** ze sceną sprzed zmiany (zrób snapshot-w-teście: porównaj z wywołaniem bez opcji; to samo `items.length`).
3. We wszystkich 4 formatach i wszystkich 4 rodzajach kart (`map`, `ranking`, `profile`, `compare`) numer mieści się w stopce (jego `x + szerokość ≤ width - safe.right`), a adres strony i źródło nadal są obecne.
4. Najdłuższy numer „12/12” też się mieści (format `post`).
5. Kolizja: element numeru nie nachodzi na element adresu (`x` numeru + szerokość < `x` adresu).
6. Istniejące testy kart uruchomione i zielone bez zmian.

## Gotowe, gdy
- Scena karty zawiera tekst „3/5”; przy jednej stronie brak; istniejące testy kart bez zmian.
Nie ruszaj: istniejących testów, `card-map/ranking/profile/compare.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
