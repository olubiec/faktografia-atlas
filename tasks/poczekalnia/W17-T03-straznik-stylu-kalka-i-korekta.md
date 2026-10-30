# T03 – Straznik stylu Kalka i korekta oraz limitu wielkosci plikow
Cel: Statyczny test jednostkowy pilnujacy zakazu uzywania rounded, shadow, backdrop-blur, uppercase oraz limitu ~200 linii na plik.
Zmieniaj: tests/unit/style-guard.test.ts
Wymagane: tests/unit/style-guard.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/STYL.md (§3, §5, §12), AGENTS.md

Zadanie:
1. Utworz `tests/unit/style-guard.test.ts`: test skanujacy pliki w `src/view/**/*.tsx` oraz `src/core/**/*.ts`:
   - Weryfikuje brak klas `rounded-*` (z wyjatkiem scisle zdefiniowanych tokenow, np. `rounded-none`),
   - Weryfikuje brak klas `shadow-*`, `drop-shadow-*`, `backdrop-blur-*`,
   - Weryfikuje brak klasy `uppercase` w etykietach i naglowkach,
   - Weryfikuje brak tagow `<style>` z `!important`,
   - Weryfikuje brak globalnych hackow `window.__render*`,
   - Sprawdza, czy zaden plik w `src/view/` i `src/core/` nie przekracza 220 linii kodu (poza wzornikiem `DesignPage.tsx`).

Gotowe, gdy:
- Test `tests/unit/style-guard.test.ts` przechodzi na zielono dla calego drzewa `src/`.

Nie ruszaj: src/
