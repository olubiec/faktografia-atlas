# P03 – Scena wejscia i animacja granic
Cel: Plynna animacja kafelkowania i wejscia na strone glowna przy pierwszym ladowaniu.
Zmieniaj: src/core/motion/timeline.ts, src/view/map/IntroOverlay.tsx, tests/unit/timeline.test.ts, tests/e2e/intro-motion.spec.ts
Wymagane: tests/unit/timeline.test.ts, tests/e2e/intro-motion.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/ARCHITEKTURA.md (W3.5), docs/STYL.md

Zadanie:
1. Rozbuduj `src/core/motion/timeline.ts` o os czasu sceny wejscia mapy (obliczenia klatka po klatce bez bibliotek zewnetrznych).
2. Podepnij scene pod `IntroOverlay.tsx` na stronie glownej z automatycznym wylaczeniem przy `prefers-reduced-motion`.
3. Utworz testy jednostkowe `tests/unit/timeline.test.ts` i test e2e `tests/e2e/intro-motion.spec.ts`.

Gotowe, gdy:
- Testy jednostkowe i e2e przechodza na zielono.
- Animacja jest w pelni deterministyczna i natychmiastowo pomijana przy `prefers-reduced-motion`.
