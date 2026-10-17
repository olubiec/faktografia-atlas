# CC1.1b – dokończenie CC1.1 (punkty, których nie ma w main)

## Opis zmian
Dokończono usterki i zaległe punkty ze zgłoszenia #3 (CC1.1):
1. **Testy e2e motywu i CSP**: Dodano test e2e sprawdzający ustawienie ciemnego motywu przed załadowaniem strony przez `page.addInitScript`, test e2e rozmiaru pola dotykowego przycisku motywu (≥44×44 px) oraz test e2e braku błędów CSP w konsoli.
2. **Skala typograficzna i brak wartości na sztywno**: Skonfigurowano rozszerzenie `@theme` w `src/styles/global.css` dla klas font-size (`text-xs` do `text-5xl`). Zamieniono wartości `text-[...px]` na odpowiadające klasy tokenowe w `Home.tsx` i `NotFound.tsx`. Dodano test jednostkowy sprawdzający brak wzorców `text-[...px]` i kolorów hex w `src/view/**/*.tsx`.
3. **Reguły oxlint**: Skonfigurowano w `.oxlintrc.json` reguły: `react/no-danger`, `typescript/ban-ts-comment`, `jest/no-focused-tests`, `vitest/no-focused-tests` oraz `no-restricted-imports` dla `lucide-react`. Każda reguła została zweryfikowana na tymczasowych przykładach.
4. **Czyszczenie aktywów i .gitignore**: Usunięto nieużywane pliki szablonowe (`src/assets/hero.png`, `react.svg`, `vite.svg`, `public/icons.svg`, `public/favicon.svg`) i usunięto zduplikowane wpisy z `.gitignore`.
5. **Nagłówki bezpieczeństwa**: Wystawiono pełen zestaw nagłówków bezpieczeństwa (w tym CSP, HSTS, X-Frame-Options, Permissions-Policy) w `vercel.json` oraz zaktualizowano `vite.config.ts`, aby `preview.headers` były czytane z `vercel.json`. Dodano test jednostkowy weryfikujący nagłówki.
6. **CI i szablony w .github**: Zaktualizowano `.github/workflows/ci.yml` (job `verify` w kontenerze Playwright `mcr.microsoft.com/playwright:v1.64.1-jammy`, job `security` z gitleaks na pełnej historii oraz `pnpm audit --prod --audit-level high`). Utworzono `.github/dependabot.yml` oraz `.github/ISSUE_TEMPLATE/zadanie.md`.
