# QC914 – Menu „+ Dodaj stronę” (Mapa, Ranking, Tabela, Duża liczba, Wykres lat, Rozkład, Porównanie, Podziel tę stronę)
Cel: Menu z rodzajami stron do dodania, z poprawnymi wyłączeniami i opisami.
Zmieniaj: src/view/share/AddPageMenu.tsx, tests/unit/add-page-menu.test.tsx
Wymagane: tests/unit/add-page-menu.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck-split.ts (`canSplit`), deck.ts (`PageKind`), src/components/ui/popover.tsx, dialog.tsx, docs/PRODUKT.md §4b

## Kontekst
„+” dodaje stronę za bieżącą. Dostępne rodzaje zależą od kontekstu: „Porównanie” tylko gdy są dwa miejsca; „Profil” tylko gdy wybrano miejsce; „Podziel tę stronę” tylko gdy bieżącą da się podzielić.

## Research
Radix `Popover` jest w repo; na telefonie menu może być pełnoekranowym `Dialog` – jedna implementacja wystarczy, jeśli lista mieści się w 390 px (9 pozycji × 44 px ≈ 400 px) – użyj `Popover` z `max-h` i wewnętrznym przewijaniem **tylko** gdy wysokość okna jest mała. **Bez nowych pakietów.**

## Zadanie
`src/view/share/AddPageMenu.tsx`:
- Props: `{ onAdd(kind: PageKind, options?: DeckPage['options']): void; onSplit(): void; hasUnit: boolean; hasPair: boolean; canSplitCurrent: boolean; splitHint?: string | null }`.
- Pozycje z krótkim opisem (jedno zdanie): Mapa („mapa wskaźnika z legendą”), Ranking („najwyżej lub najniżej”), Tabela („kilka wskaźników naraz”), Duża liczba („jedna liczba dla miejsca”), Wykres lat („zmiana w czasie”), Rozkład („ile jednostek w każdej klasie”), Profil (gdy `hasUnit`), Porównanie (gdy `hasPair`), A vs B (gdy `hasPair`).
- Ranking: dwie pozycje „Ranking – najwyżej” i „Ranking – najniżej” (`options.side`).
- „Podziel tę stronę” – osobna sekcja na dole; wyłączona (`aria-disabled`) bez `canSplitCurrent`, z `splitHint` jako opisem, gdy jest.
- Niedostępne rodzaje są **ukryte**, nie wyszarzone (mniej szumu) – wyjątek: „Podziel” zawsze widoczne (wyjaśnia, kiedy działa).
- Wybór zamyka menu, wywołuje callback; fokus wraca na przycisk „+”.
- ≥ 44 px, Escape zamyka.

## Testy
1. Bez miejsca i pary: brak „Profil”, „Porównanie”, „A vs B”; są Mapa, Ranking×2, Tabela, Duża liczba, Wykres lat, Rozkład.
2. `hasPair` pokazuje „Porównanie” i „A vs B”; `hasUnit` – „Profil”.
3. Wybór „Tabela” → `onAdd('table')`; „Ranking – najniżej” → `onAdd('ranking', { side: 'bottom' })`.
4. „Podziel tę stronę” wyłączone dla mapy (`canSplitCurrent=false`), klik nic nie woła; aktywne i woła `onSplit` gdy `true`.
5. `splitHint` widoczny jako opis przy „Podziel”.
6. Escape zamyka; fokus wraca do przycisku otwierającego.
7. Wszystkie pozycje ≥ 44 px i dostępne nazwy.

## Gotowe, gdy
- Wybór dodaje stronę za bieżącą (callback z właściwym rodzajem); „Podziel” wyłączone dla mapy; testy zielone.
Nie ruszaj: `deck-split.ts`, `ShareDialog.tsx`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
