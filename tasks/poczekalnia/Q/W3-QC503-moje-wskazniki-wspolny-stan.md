# QC503 – Wspólny stan „Moich wskaźników” w Reakcie (jeden stan dla całej strony)
> **KOREKTA 18.11.2026:** hook `useMyIndicators` **już istnieje** w `src/view/hooks/useMyIndicators.ts` ([FIX3], a `W2-PX01` dodaje do niego `move`). Zamiast tworzyć `src/view/my-indicators/useMyIndicators.ts`, rozbuduj ten plik do wspólnego stanu (jeden magazyn, odświeżanie przez zdarzenie `storage`), zachowując API `{ list, add, remove, reset, move }` i istniejący `ProfileIndicatorList`. W „Zmieniaj” zamień ścieżki odpowiednio (testy: `tests/unit/use-my-indicators.test.tsx`).
Cel: Hook `useMyIndicators` – wszystkie komponenty widzą tę samą listę, a zmiana w innej karcie przeglądarki ją odświeża.
Zmieniaj: src/view/my-indicators/useMyIndicators.ts, tests/unit/use-my-indicators.test.tsx
Wymagane: tests/unit/use-my-indicators.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: src/core/my-indicators/{my-indicators,storage}.ts (QC501, QC502), docs/PRODUKT.md §4f, src/view/hooks/useIsMobile.ts (styl hooków), tests/unit/ – jak testuje się hooki (`renderHook`)

## Kontekst
Lista będzie w panelu mapy, na telefonie, w Bibliotece, Porównaj, Rankingach i eksporcie. Wszystkie te miejsca muszą widzieć **tę samą** listę w tej samej chwili. AGENTS.md (błędy powtarzalne) zabrania tworzenia drugiego, równoległego stanu – dlatego **jeden magazyn modułowy** i `useSyncExternalStore`.

## Research
1. React 19 (`package.json`): `useSyncExternalStore` jest wbudowany – **żadnych nowych pakietów** (nie `zustand`, nie `jotai`).
2. Zdarzenie `storage` odpala się tylko w **innych** kartach; zmiany w tej samej karcie trzeba rozgłosić własnym mechanizmem (zbiór subskrybentów).
3. Referencyjna stabilność: `getSnapshot` musi zwracać **tę samą referencję**, gdy nic się nie zmieniło (inaczej nieskończona pętla renderów). To najczęstszy błąd – przetestuj.

## Zadanie
`src/view/my-indicators/useMyIndicators.ts`:
- Magazyn modułowy: `let current: MyIndicators`, inicjalizowany leniwie z `loadMyIndicators()`; `listeners: Set<() => void>`.
- `export function useMyIndicators(): { list: MyIndicators; add(id): void; remove(id): void; move(id, dir): void; reset(): void; has(id): boolean; isBasic: boolean }`.
- Każda operacja: wylicz nową listę funkcją z QC501 → jeśli referencja inna: `current = next`, `saveMyIndicators(next)`, powiadom subskrybentów.
- Subskrypcja `window.addEventListener('storage', …)` (tylko dla klucza `MY_INDICATORS_KEY`) – odczytuje na nowo i powiadamia; zakładana przy pierwszym subskrybencie, zdejmowana po ostatnim.
- `export function __resetMyIndicatorsForTests()` – czyści stan modułu (tylko do testów).
- SSR nie dotyczy (Vite SPA), ale `window` nie jest dotykane poza efektami.

## Testy (`renderHook`/komponenty)
1. Dwa komponenty używające hooka widzą to samo po `add` w jednym z nich.
2. `remove` zapisuje do `localStorage` (odczytaj surowy klucz).
3. Zdarzenie `storage` z nową wartością klucza odświeża listę w obu komponentach; zdarzenie dla **innego** klucza nic nie zmienia.
4. Dodanie istniejącego id nie powoduje ponownego renderu (licznik renderów).
5. `getSnapshot` stabilny: bez zmian dwa kolejne odczyty to ta sama referencja.
6. `reset()` wraca do 7 podstawowych; `isBasic` true po resecie.
7. Brak `localStorage` (rzuca) → hook działa w pamięci, lista zmienia się mimo błędu zapisu.
8. Odpięcie ostatniego komponentu zdejmuje nasłuch `storage` (sprawdź `removeEventListener` przez spy).

## Gotowe, gdy
- Dwa komponenty widzą tę samą zmianę; zmiana w innej karcie odświeża; testy zielone.
Nie ruszaj: `core/my-indicators/*` (tylko import), widoków.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
