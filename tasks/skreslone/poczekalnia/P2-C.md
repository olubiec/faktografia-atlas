# P2-C – Strony Kontakt i Zastrzeżenie o danych
Cel: Dwie nowe strony informacyjne.
Zmieniaj: src/view/pages/Contact.tsx, src/view/pages/DataDisclaimer.tsx, tests/unit/info-pages.test.tsx
Wymagane: tests/unit/info-pages.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test
Przeczytaj najpierw: AGENTS.md, docs/STYL.md, src/view/pages/About.tsx (lub odpowiednik strony „O projekcie”), src/view/layout/SiteLayout.tsx, PageMeta.tsx

## Jak pracować (Claude Code, jedna sesja = to jedno zadanie)
1. `git fetch origin && git checkout claude/inspiring-shannon-vfxoax && git pull` potem `git checkout -b task/P2-C`.
2. Zmieniaj WYŁĄCZNIE pliki z linii „Zmieniaj”. Musisz ruszyć inny: zatrzymaj się i napisz dlaczego.
3. Najpierw testy z „Gotowe, gdy”, potem kod. Nie zmieniaj istniejących testów, nie generuj snapshotów, nie dodawaj pakietów.
4. Tokeny zamiast wartości na sztywno, pola dotykowe min. 44 px, animacje wyłączone przy prefers-reduced-motion, komentarze po polsku, plik do ok. 200 linii.
5. Na końcu: `pnpm lint && pnpm typecheck && pnpm test` (muszą być zielone). Jeden commit `[P2-C] Strony Kontakt i Zastrzeżenie o danych`, `git push -u origin task/P2-C`. Bez PR.
6. Raport po polsku (max 15 linii): co zrobiono, czego nie, wyniki miar, wynik komend.

## Zadanie
Utwórz dwa pliki (export default). NIE ruszaj App.tsx (robi to P2-D).
Kontakt: Mateusz Ołubiec, e-mail mailto:mateuszolubiec05@gmail.com, link do zgłoszeń w repozytorium GitHub (adres weź z istniejących linków w kodzie).
Zastrzeżenie o danych: źródło GUS Bank Danych Lokalnych, licencja CC BY 4.0, brak gwarancji kompletności i aktualności, odwołanie do wskaźnika daty odświeżenia w stopce, jak zgłosić błąd (Kontakt).
Układ i PageMeta jak strona „O projekcie”.

## Gotowe, gdy
- test w MemoryRouter: każda strona ma dokładnie jeden <h1>; Kontakt ma link mailto; Zastrzeżenie wymienia „CC BY 4.0”

## Nie ruszaj
Nic poza listą „Zmieniaj”. Pliki ekranu (Home.tsx, AtlasMap.tsx, ProfileSheet*.tsx) tylko jeśli są w „Zmieniaj”.
