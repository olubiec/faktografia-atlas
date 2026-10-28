# W2.24 – Blok „Miasto i obszar wiejski”: komponent
Cel: zwijany blok z tabelą miasto/wieś (na telefonie karty), jeszcze niepodpięty do profilu.
Zmieniaj: src/view/profile/ProfileParts.tsx, tests/unit/profile-parts.test.tsx
Wymagane: tests/unit/profile-parts.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e

Wspólne „Gotowe, gdy” dla zadań W2/W3 (dopisz do każdego promptu): istniejące testy przechodzą **bez zmian**; brak poziomego przewijania przy 360 i 390 px; pola dotykowe ≥ 44 px; brak błędów axe; najwyżej jedno czerwone zakreślenie na ekranie; animacje wyłączone przy `prefers-reduced-motion`.

Zadanie W2.24 z docs/ARCHITEKTURA.md §3 (kopia sekcji z main):

- **Po ludzku:** zwijany blok z tabelą miasto/wieś (na telefonie karty), jeszcze niepodpięty do profilu.
- **Przeczytaj najpierw:** `docs/PRODUKT.md` §4c, `docs/STYL.md` §2–§4, `src/view/hooks/useIsMobile.ts`.
- **Pliki:** `src/view/profile/ProfileParts.tsx` (nowy), `tests/unit/profile-parts.test.tsx` (nowy).
- **Zadanie:** `ProfileParts({ rows, year, onFirstExpand })`: przycisk „Miasto i obszar wiejski” (`aria-expanded`, domyślnie zwinięty); `onFirstExpand` wołane raz przy pierwszym rozwinięciu; komputer: tabela „Wskaźnik · Gmina · Miasto · Obszar wiejski”; telefon (< 768 px): karta na wskaźnik; `null` → „brak danych”; podpis z §4c; kolory, odstępy i rozmiary tylko z tokenów.
- **Gotowe, gdy (`@S20`):** testy: domyślnie zwinięty; po kliknięciu widać 14 wierszy; `onFirstExpand` dokładnie raz; `null` → „brak danych”; widok telefonu to karty; przycisk ≥ 44 px wysokości; axe bez błędów.
- **Ty sprawdzasz:** ✅ (widoczne dopiero po W2.25).
- **Nie ruszaj:** `ProfileSheet*.tsx`, `ProfileOverview.tsx`.

## Zasady pętli
Zasady z AGENTS.md (były łamane – przestrzegaj dosłownie). Twój PR sprawdza pętla (scripts/jules-loop): PR z plikami spoza listy „Zmieniaj”/„Wymagane”, bez plików z „Wymagane” albo z usuniętymi asercjami nie zostanie scalony.
- Rób tylko to zadanie (W10-W224). Nie wykonuj innych zadań z docs/ARCHITEKTURA.md, nawet jeśli wyglądają na łatwe.
- Tytuł PR zaczyna się od `[W10-W224]`; opis ma sekcję „Po ludzku” (co zrobiłeś · co sprawdzić na podglądzie · czego nie zrobiłeś i dlaczego). Bez `Closes #…` – to zadanie nie jest issue.
- Gałąź aktualizujesz TYLKO `git merge origin/main` (bez rebase, bez nowej gałęzi, bez --force). Przed pushem `git diff --name-status --diff-filter=D origin/main...HEAD` ma być puste.
- NIE edytuj docs/STAN.md, package.json, pnpm-lock.yaml, AGENTS.md, scripts/ops/**, scripts/jules-loop/**, .github/** (chyba że lista „Zmieniaj” je zawiera).
- NIE zmieniaj istniejących testów ani wzorców zrzutów (wyjątek: tylko testy wymienione w zadaniu, tylko tak, jak opisuje zadanie). NIE osłabiaj testów: `skip`, `only`, `fixme`, usuwanie asercji, `@ts-ignore`, `oxlint-disable`. CI czerwone → napraw KOD, nie test. Przeszkadza istniejący test → napisz w PR „przeszkadza istniejący test: <nazwa>” i zatrzymaj się.
- NIE dodawaj plików roboczych (*.txt, *.diff, *.patch, *.log, commit_message*, pr_description*, notatki .md, skrypty pomocnicze, docs/shots/*). NIE twórz drugiej wersji czegoś, co już jest na main.
- Wzorce zrzutów powstają tylko w CI (workflow „Update snapshots”, uruchamia go właściciel): nie generuj ich; w PR napisz, że trzeba je odświeżyć.
- Testy e2e mają w nazwie znacznik `@S<n>` podany w „Gotowe, gdy”.
- Przed PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.
- Uwagi pętli przychodzą jako wiadomość w sesji albo komentarz `@jules` w PR – popraw je w tej samej gałęzi, bez nowego PR.
