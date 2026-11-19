# QU16 – Porządki w nawigacji: usunięcie lub scalenie stron powielających mapę
Cel: w nagłówku zostają tylko strony o różnym sensie; stare adresy przekierowują.
Zmieniaj: src/App.tsx, src/view/Header.tsx, tests/unit/nav-redirects.test.tsx
Wymagane: tests/unit/nav-redirects.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/research/q2-nawigacja-duplikaty.md (z QU03)
Zadanie: TYLKO po wyraźnej decyzji właściciela (usunięcie funkcji, AGENTS.md): wdróż wybrany wariant z QU03 – przekierowania `<Navigate replace>`, aktualizacja linków w nagłówku i stopce, wpis w docs/PRODUKT.md robi osobne zadanie QU17.
Gotowe, gdy:
- test: każdy usunięty adres przekierowuje na właściwy
- test: nagłówek nie ma linków do usuniętych stron
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU03, QU12, QU14 i decyzji właściciela.
Tytuł PR zaczyna się od `[W6-QU16]`; opis ma „Po ludzku”.
