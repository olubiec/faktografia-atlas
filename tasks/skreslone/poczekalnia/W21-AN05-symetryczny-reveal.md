# W21-AN05 – Symetryczny reveal w obie strony
Opis zakresu już zaimplementowanego.

## 1. Cel
Wejście w głąb (kraj → woj → pow) i cofanie (pow → woj → kraj) używają tej samej animacji koloru i tego samego czasu; cofanie nie ma osobnej, uboższej ścieżki ani skoków.

## 2. Pliki
- Zmieniaj: `src/core/map/reveal.ts`, `src/core/map/fill-transition.ts` (uproszczenie do stanu reveal bez przełączania czasu GPU), `tests/unit/reveal-symmetric.test.ts` (nowy)
- Wymagane (bez zmian): istniejące testy `reveal` i `fill-transition`; jeśli któryś przeszkadza – zatrzymaj się i opisz w PR (AGENTS.md: nie zmieniasz istniejących testów).
- Czytaj tylko: `src/core/map/fill-blend.ts`, `src/core/map/drill.ts`

## 3. Testy
Dla par poziomów (woj↔pow, kraj↔woj, pow↔gmi): postęp reveal w przód i w tył daje te same wartości w tych samych momentach (lustrzanie); zmiana poziomu w trakcie reveal nie resetuje postępu do 0 bez koloru bieżącego; brak wartości poza 0..1.

## 4. Gotowe, gdy
Testy zielone; ręcznie na podglądzie: cofanie wygląda tak samo płynnie jak wejście, bez błysków; `pnpm lint && pnpm typecheck && pnpm test && pnpm build` zielone.
