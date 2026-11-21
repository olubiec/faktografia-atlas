# QS06 – Strona wskaźnika Biblioteki: liczby w kafelkach statystyk nieucięte
Cel: liczby w kafelkach statystyk na 390 px są w całości widoczne (zawijanie lub mniejszy rozmiar z tokenów).
Zmieniaj: src/view/library/VariableStatsBar.tsx, tests/unit/variable-stats-bar-wrap.test.tsx
Wymagane: tests/unit/variable-stats-bar-wrap.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/research/q2-telefon-390.md (PR #537, gałąź claude/QR02), src/view/library/VariableStatsBar.tsx
Zadanie: Usuń ucinanie wielokropkiem liczb (VariableStatsBar.tsx ok. l.99, 114, 166–178): zamień truncate na zawijanie i dobierz układ siatki; napisy nie wychodzą poza pola.
Gotowe, gdy:
- test: element z liczbą nie ma klasy truncate i ma klasę zawijania/break
- test: wartość z długą liczbą jest w DOM w całości
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Decyzja 19.11.2026 (właściciel): Claude decyduje sam. Pełne CI musi być zielone; jeśli lokalny test czasowy (próg ms) pada przy równoległych przebiegach, uruchom go osobno i opisz w PR uczciwie, co padło.
