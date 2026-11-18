# PF08 – [CZEKA NA ZGODĘ D2] Test „404 na parts/*”: sprawdzać komunikat, który komponent celowo pokazuje
Cel: Test odporności na brak plików miasto/wieś zgadza się z zaprojektowanym zachowaniem profilu gminy miejsko-wiejskiej (komunikat zamiast przycisku).
STATUS: **Nie puszczać bez zgody właściciela (decyzja D2 w docs/PLAN-POPRAWEK.md).** Zmiana istniejącego testu.
Zmieniaj: tests/e2e/network-resilience.spec.ts
Wymagane: tests/e2e/network-resilience.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm exec playwright test tests/e2e/network-resilience.spec.ts
Przeczytaj najpierw: tests/e2e/network-resilience.spec.ts (test „symulacja błędu 404 na parts/*”, ok. linii 58–90), src/view/profile/ProfileOverview.tsx (ok. linii 318–335: gałąź `isPartsLoaded && !partsShard`), src/view/profile/ProfileParts.tsx, src/core/data/load-parts.ts, docs/PRODUKT.md §4c

## Kontekst
Test po 404 na `parts/*.json` oczekuje przycisku „Miasto i obszar wiejski”, klika go i dopiero wtedy szuka komunikatu. Komponent robi inaczej, **celowo**: gdy plik części nie istnieje, w miejscu przycisku pokazuje ramkę „Miasto i obszar wiejski – Dane o mieście i wsi pojawią się po najbliższej aktualizacji” (bez przycisku, bo nie ma co rozwijać). Ten sam komunikat zobaczy dziś każdy odwiedzający na produkcji: na `main` nie ma katalogu `public/data/parts` (dane czekają w PR #451 na gałęzi `data/nightly`). Rozstrzygamy na korzyść zaprojektowanego zachowania, bo zmiana komponentu na „przycisk, który otwiera pusty komunikat” pogorszyłaby doświadczenie.

## Research (10 min)
1. Uruchom test lokalnie i zrób zrzut stanu w chwili asercji (`page.screenshot` poza repo), potwierdź, że widać ramkę z komunikatem i brak przycisku.
2. Sprawdź w `ProfileOverview.tsx`, w jakiej kolejności renderuje się blok (przycisk widoczny krótko przed zakończeniem ładowania?). Test ma być odporny na tę chwilę: czeka na komunikat, nie na zniknięcie przycisku.

## Zadanie
W tym jednym teście: usuń oczekiwanie na przycisk i jego kliknięcie; zamiast tego `await expect(page.getByText('Dane o mieście i wsi pojawią się po najbliższej aktualizacji')).toBeVisible()`, nagłówek ramki „Miasto i obszar wiejski” widoczny, **brak** `button` o tej nazwie po zakończeniu ładowania (`toHaveCount(0)`), główny profil gminy dalej czytelny (istniejące asercje o nagłówku zostają). Pozostałe testy pliku bez zmian.

## Testy
1. Zmieniony test zielony 5/5 (`--repeat-each=5`).
2. Test, który symuluje **udane** wczytanie `parts` (istniejące `profile-parts.spec.ts` / `s20-parts.spec.ts`), nadal zielony i nadal wymaga przycisku z rozwijaniem – nie zmieniasz ich.
3. Pozostałe testy `network-resilience` zielone.

## Gotowe, gdy
- Test zielony; w opisie PR zdanie dla właściciela: „Test oczekiwał przycisku, a strona celowo pokazuje komunikat, gdy danych miasto/wieś nie ma; dopasowałem test do projektu”.
Nie ruszaj: `ProfileOverview.tsx`, `ProfileParts.tsx`, innych testów e2e.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
