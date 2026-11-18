# PM20 – Pomiar „po”: raport płynności ruchu po PM10, QC403, QC404, QC405, PM12
Cel: Powtórzyć pomiar z PF01 na zmienionym kodzie i opisać różnicę oraz to, co jeszcze zacina, żeby decyzja o trybie oszczędnym (PM14) opierała się na liczbach.
Zmieniaj: docs/research/p-kamera-pomiar-po.md
Wymagane: docs/research/p-kamera-pomiar-po.md
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && PERF=1 pnpm exec playwright test tests/e2e/perf-camera-frames.spec.ts
Przeczytaj najpierw: docs/research/p-kamera-pomiar-telefon.md (PF01: „przed”), docs/research/q-c401-ruch-mapy.md, tests/e2e/perf-camera-frames.spec.ts (PF01 – uruchamiasz, nie zmieniasz), src/core/map/frame-stats.ts

## Kontekst
Zadanie badawcze (jak QC401): bez zmian w `src/` i `tests/`. PF01 dał liczby „przed”; po fali 3–4 (kamera bez stanu Reacta, przyciski „+/−”, wejście w głąb, kolory, koniec odpytywania adresu) mierzymy te same scenariusze, tą samą metodą, na tym samym typie maszyny. Raport kończy się rekomendacją dla właściciela (czy trzeba PM14, jakie progi przyjąć).

## Research / Zadanie
1. Zbuduj `main` po scaleniu fal 3–4 (`pnpm build`, `vite preview`), uruchom `PERF=1` dla 7 scenariuszy z PF01 oraz dwóch dodatkowych: „+” ×3 pod rząd i dojazd do gminy (zoom ≥ 9, miejscowości).
2. Raport `docs/research/p-kamera-pomiar-po.md`: tabela „przed / po” (p50, p95, max, `droppedShare`, długie zadania, `zoom` początek–koniec) i kolumna „zmiana %”; sekcja „Ograniczenia pomiaru” (SwiftShader, headless); sekcja „Co nadal zacina” z wskazaniem plików i linii; sekcja „Rekomendacja”: czy uruchomić PM14 (tak, jeśli p95 w dojeździe z dławieniem ×4 > 33 ms), czy poprawić próg.
3. Dopisz sekcję „Co sprawdzić na telefonie” (5 kroków dla właściciela, po ludzku).

## Testy
Brak nowych testów (raport). Warunkiem jest zielony `pnpm test` i pomiar uruchomiony bez błędów.

## Gotowe, gdy
- Raport zawiera komplet liczb z jednego uruchomienia (dołączone surowe `camera-frames.json` w treści lub opisie PR) i jednoznaczną rekomendację w sprawie PM14.
Nie ruszaj: `src/**`, `tests/**`, `playwright.config.ts`.

## Zasady wspólne (z AGENTS.md – obowiązują w tym zadaniu)
- Najpierw testy z „Gotowe, gdy”, potem kod. Każdy warunek = co najmniej jeden test sprawdzający zachowanie (nie tylko „renderuje się”). Testy na danych z `tests/fixtures`, nigdy z sieci.
- Zmieniasz tylko pliki z linii „Zmieniaj:” (i „Wymagane:”). Musisz zmienić inny → napisz w PR dlaczego i zatrzymaj się. Istniejących testów i wzorców zrzutów nie zmieniasz ani nie osłabiasz.
- Kolory, kroje, rozmiary, odstępy i czasy tylko z tokenów (klasy Tailwind z `@theme`, `config/tokens.json`); zero wartości wpisanych na sztywno. Pola dotykowe ≥ 44 px. Animacje wyłączone przy `prefers-reduced-motion`. Napisy nie wychodzą poza pola.
- `src/core` = czysta logika (Vitest), `src/view` = React. Nazwy po angielsku, komentarze po polsku, pliki do ok. 200 linii. TERYT zawsze jako string.
- Bez nowych pakietów (wyjątek: tylko po sprawdzeniu w rejestrze i z wpisem w `docs/ELEMENTY.md` – tu nie dotyczy). Bez `dangerouslySetInnerHTML`. Bez wywołań API GUS z kodu strony.
- Aktualizacja gałęzi tylko `git merge origin/main`; przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` musi być puste.
- PR: tytuł zaczyna się od `[W<fala>-<id>]`, opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego); bez `Closes #`; wymień, że wzorce zrzutów odświeża właściciel, jeśli zmieniłeś wygląd.
- Jedno zadanie = jedno zachowanie. Czerwone testy na GitHubie poprawiasz w tym samym PR.
