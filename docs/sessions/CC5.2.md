# Sesja CC5.2 — Okno wyszukiwania Ctrl+K (cmdk)

## Podsumowanie zmian
Zimplementowano okno wyszukiwania (cmdk) aktywowane skrótem klawiszowym `Ctrl+K` / `Cmd+K` oraz kliknięciem w przycisk w nagłówku strony lub pole wyszukiwania na stronie głównej.
Okno korzysta z indeksu i funkcji `search()` stworzonych w CC5.1 (`src/core/search`).

- **Główne komponenty**:
  - `src/view/search/useSearch.ts` — hook integrujący dane jednostek z indeksem wyszukiwania CC5.1.
  - `src/view/search/SearchDialog.tsx` — komponent okna wyszukiwania oparty na `cmdk` i `radix-ui` (Dialog).
  - `src/view/search/index.ts` — eksport modułu wyszukiwarki.
  - `src/view/Header.tsx` — podpięcie skrótu `Ctrl+K` / `Cmd+K`, obsługa kliknięcia `#home-search-field` oraz osadzenie przycisku i okna wyszukiwania.

- **Testy**:
  - `tests/unit/search-ui.test.ts` — testy jednostkowe Vitest.
  - `tests/e2e/search.spec.ts` — testy end-to-end Playwright.

---

## Tabela warunków odbioru

| Warunek odbioru | Status | Test / Weryfikacja |
|---|---|---|
| `Ctrl+K` i `Cmd+K` otwierają okno, `Esc` zamyka i przywraca fokus | Spełniony | `tests/e2e/search.spec.ts` (`opens search modal via Ctrl+K and closes via Esc, restoring focus`) |
| Wyniki pochodzą z `search()` z CC5.1; test sprawdza „lodz” → Łódź | Spełniony | `tests/unit/search-ui.test.ts` oraz `tests/e2e/search.spec.ts` (`searches for "lodz" ...`) |
| Strzałki i Enter działają bez myszy; test E2E na klawiaturze | Spełniony | `tests/e2e/search.spec.ts` (`supports ArrowDown keyboard navigation ...`) |
| Na telefonie okno zajmuje cały ekran; Axe bez nowych naruszeń | Spełniony | `tests/e2e/search.spec.ts` (`takes full screen on mobile viewport`, `axe accessibility audit passes ...`) |
| Brak wyniku pokazuje komunikat, nie pustą listę | Spełniony | `tests/e2e/search.spec.ts` (`displays empty state message when no results match`) |

---

## Zmienione i utworzone pliki
- `src/view/search/SearchDialog.tsx` (nowy)
- `src/view/search/useSearch.ts` (nowy)
- `src/view/search/index.ts` (nowy)
- `src/view/Header.tsx` (podpięcie wyszukiwarki)
- `tests/unit/search-ui.test.ts` (nowy)
- `tests/e2e/search.spec.ts` (nowy)
- `docs/sessions/CC5.2.md` (nowy)
