# GEMINI_HANDOFF
Data: 2026-10-17

## Ostatni stan projektu
CC0 zakończona: repo przygotowane, system stylu Kalka i korekta w docs/STYL.md, tokeny w config/tokens.json, logo w public/brand/, plan w docs/MASTER_PLAN.md (v2). Następna sesja: CC1 (szkielet aplikacji).Stworzono szkielet aplikacji w Vite + React + TS. Zainstalowano pakiety (tailwindcss, react-router, fonty). Działają skrypty jakości (verify, shots, handoff). Wygenerowano plik `src/styles/tokens.css` z tokenów i wdrożono stronę startową z próbnikiem stylów.

## Drzewo plików
```
./.github/workflows/ci.yml
./.gitignore
./.oxlintrc.json
./AGENTS.md
./GEMINI_HANDOFF.md
./README.md
./STAN_PROJEKTU.md
./config/tokens.json
./docs/MASTER_PLAN.md
./docs/README.md
./docs/STYL.md
./docs/sessions/.gitkeep
./docs/sessions/CC1.1.md
./docs/sessions/CC1.md
./docs/shots/.gitkeep
./docs/shots/desktop-dark.jpg
./docs/shots/desktop-light.jpg
./docs/shots/mobile-dark.jpg
./docs/shots/mobile-light.jpg
./index.html
./legacy/marka/.gitkeep
./package.json
./playwright.config.ts
./pnpm-lock.yaml
./public/brand/faktografia-favicon.svg
./public/brand/faktografia-logo-granat.svg
./public/brand/faktografia-logo-jasne.svg
./public/brand/faktografia-znak-granat.svg
./public/brand/faktografia-znak-jasny.svg
./public/favicon.svg
./public/icons.svg
./public/theme-init.js
./scripts/handoff.mjs
./scripts/shots.config.json
./scripts/shots.mjs
./scripts/tokens.mjs
./src/App.tsx
./src/assets/hero.png
./src/assets/react.svg
./src/assets/vite.svg
./src/main.tsx
./src/styles/global.css
./src/styles/tokens.css
./src/view/Header.tsx
./src/view/Home.tsx
./src/view/NotFound.tsx
./tests/e2e/home.spec.ts
./tests/unit/tokens.test.ts
./tsconfig.app.json
./tsconfig.json
./tsconfig.node.json
./vercel.json
./vite.config.ts
./vitest.config.ts

```

## Zależności
```
@fontsource/atkinson-hyperlegible-mono: ^5.3.0
@fontsource/atkinson-hyperlegible-next: ^5.3.0
react: ^19.2.8
react-dom: ^19.2.8
react-router: ^8.4.0
@playwright/test: ^1.64.1
@tailwindcss/vite: ^4.3.3
@types/node: ^24.13.3
@types/react: ^19.2.18
@types/react-dom: ^19.2.7
@vitejs/plugin-react: ^6.1.1
oxlint: ^1.81.0
playwright: ^1.64.1
tailwindcss: ^4.3.3
typescript: ~6.0.2
vite: ^8.3.0
vitest: ^5.0.5
```

## Eksporty w src/
```
Wymagany TypeScript Compiler API w kolejnej iteracji, jeśli wyrażenia regularne zawiodą.

src/App.tsx:
  - App (function)

src/view/Home.tsx:
  - Home (function)

src/view/Header.tsx:
  - Header (function)

src/view/NotFound.tsx:
  - NotFound (function)

```

## Testy
```

[1m[30m[46m RUN [49m[39m[22m [36mv5.0.5 [39m[90m/app[39m

 [32m✓[39m tests/unit/tokens.test.ts[2m > [22mTokens CSS Generation[2m > [22mcontains all light theme colors[32m 3[2mms[22m[39m
 [32m✓[39m tests/unit/tokens.test.ts[2m > [22mTokens CSS Generation[2m > [22mcontains all dark theme colors in the dark scope[32m 1[2mms[22m[39m
 [32m✓[39m tests/unit/tokens.test.ts[2m > [22mTokens CSS Generation[2m > [22mcontains the prefers-reduced-motion block with 0ms motion[32m 0[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 09:18:55
[2m   Duration [22m 200ms[2m (import 41%, tests 22%, transform 22%, worker 15%, environment 1%)[22m


```

## Pliki danych (rozmiary)
```

```
