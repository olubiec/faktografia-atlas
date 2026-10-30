# T01 – Geometryczny audyt Mobile UX 360px i 390px
Cel: Matematyczne weryfikowanie braku kolizji elementow plywajacych, braku ucietych napisow i poprawnosci pol dotykowych na telefonie.
Zmieniaj: tests/e2e/helpers/mobile-audit.ts, tests/e2e/mobile-ux-geometry.spec.ts, tests/e2e/s15-mobile.spec.ts, tests/e2e/s20-parts.spec.ts, tests/e2e/share-profile.spec.ts
Wymagane: tests/e2e/helpers/mobile-audit.ts, tests/e2e/mobile-ux-geometry.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md (§5), docs/STYL.md

Zadanie:
1. Utworz `tests/e2e/helpers/mobile-audit.ts`: funkcje pomocnicze Playwright sprawdzajace matematyczny brak kolizji boundingBox (`expectNoOverlap`), brak ucietego tekstu (`scrollWidth <= clientWidth`), pola dotykowe >= 44x44 px oraz zasieg przewijania arkusza przy stanie 40%.
2. Utworz `tests/e2e/mobile-ux-geometry.spec.ts`: testujacy cala strone glowna, profil, arkusz wskaznika, okno udostepniania i biblioteke na rzutniach 360x740 oraz 390x844.
3. W istniejacych testach `s15-mobile.spec.ts`, `s20-parts.spec.ts` i `share-profile.spec.ts`: usun obejscie `?sheet=full`, testujac prawdziwe przewijanie arkusza od stanu poczatkowego 40%.

Gotowe, gdy:
- Wszystkie testy mobilne przechodza na zielono bez uzycia parametru `?sheet=full`.
- Zadna para elementow plywajacych (naglowek, okruszki, dymek, pasek wskaznika, arkusz profilu, pasek zgody) nie nachodzi na siebie.

Nie ruszaj: src/
