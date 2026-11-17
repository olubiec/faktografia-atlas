# QC913 – Pasek stron eksportu (miniatury „n/N Rodzaj”, ×, ‹ ›, +)
Cel: Poziomy pasek stron zestawu z numerami, usuwaniem, zmianą kolejności i przyciskiem dodawania.
Zmieniaj: src/view/share/DeckStrip.tsx, tests/unit/deck-strip.test.tsx
Wymagane: tests/unit/deck-strip.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/share/deck.ts (`numbering`), src/view/share/ShareDialog.tsx (obecny przełącznik kart), src/view/ui/Icon.tsx, docs/PRODUKT.md §4b, docs/STYL.md

## Kontekst
Właściciel: „każde okno numerowane 1/5, 3/5… i × do każdej strony graficznej, + do dodania”. Pasek jest komponentem „głupim”: dostaje strony i callbacki.

## Research
1. **Przeciąganie stron to „Później”** – tylko strzałki ‹ ›.
2. Na telefonie pasek przewija się w poziomie **wewnątrz siebie** (`overflow-x-auto`, `scroll-snap`), a strona nie dostaje poziomego przewijania – użyj wzorca z istniejących stron (np. `RankingBars`/tabele), jeśli taki jest.
3. Etykiety rodzajów (po polsku): Mapa, Ranking, Tabela, Duża liczba, Wykres lat, Rozkład, Profil, Porównanie, A vs B; dla rankingu z `side`: „Ranking – najwyżej/najniżej”.

## Zadanie
`src/view/share/DeckStrip.tsx`:
- Props: `{ pages: { id: string; kind: PageKind; label: string /* np. „2/5” */; title: string }[]; currentId: string; onSelect(id); onRemove(id); onMove(id, dir: -1|1); onAdd(): void; canRemove: boolean }`.
- Kafelek strony (przycisk wyboru): „<n/N> <Rodzaj>”, `aria-current="true"` dla bieżącej; obok × (`aria-label` „Usuń stronę 2 (Tabela)”), ‹ › (aria-label „Przesuń stronę … w lewo/prawo”).
- × ukryte/wyłączone, gdy `canRemove === false` (ostatnia strona); ‹ pierwszej i › ostatniej wyłączone.
- Na końcu przycisk „+ Dodaj stronę” → `onAdd`.
- ≥ 44 px, tokeny, focus widoczny; bieżąca strona przewija się do widoku (`scrollIntoView({ inline: 'nearest' })`, bez animacji przy reduced-motion).
- Etykiety numerów pochodzą z propsów, komponent ich **nie liczy**.

## Testy
1. Renderuje wszystkie strony z etykietami „1/4 Mapa”… i `aria-current` na bieżącej.
2. × woła `onRemove(id)`; przy `canRemove=false` × jest `disabled`.
3. ‹ › wołają `onMove(id, -1/1)`; krawędzie wyłączone.
4. „+ Dodaj stronę” woła `onAdd`.
5. Klik w kafelek woła `onSelect(id)`; klawiatura: Enter/Spacja.
6. Wszystkie przyciski ≥ 44 px i mają nazwy dostępne.
7. Kontener paska ma `overflow-x-auto` (przewijanie wewnątrz), a nie szerokość większą od rodzica (test klasy).
8. Po usunięciu fokus nie ginie (przechodzi na sąsiedni kafelek lub „+”).

## Gotowe, gdy
- × usuwa, ‹ › zmienia kolejność, pola ≥ 44 px; testy zielone.
Nie ruszaj: `ShareDialog.tsx` (QC917), `deck.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
