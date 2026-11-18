# W21-AN02 – Moduł fill-blend (czysta logika)
Opis zakresu już zaimplementowanego.

## 1. Cel
Jedna czysta funkcja mieszania koloru w funkcji czasu zastępuje przejście GPU; działa tak samo w obie strony (z koloru A do B i z B do A).

## 2. Pliki
- Zmieniaj: `src/core/map/fill-blend.ts` (nowy), `tests/unit/fill-blend.test.ts` (nowy)
- Czytaj tylko: `src/core/map/ease.ts`, `config/tokens.json` (`motion.base`)

## 3. Zakres
`blendColor(from, to, t)` (RGBA, zaokrąglone do 0-255, `t` obcięte do 0..1), `blendProgress(startMs, nowMs, durationMs)` (0 przy `durationMs <= 0` zwraca od razu 1), bez Reacta i bez stanu globalnego. Czas z tokenu `motion.base`, 0 przy `prefers-reduced-motion`.

## 4. Testy
Wartości graniczne t=0 i t=1 (dokładnie from i to); symetria: `blend(a,b,t) == blend(b,a,1-t)`; obcięcie t poza 0..1; alfa mieszana jak kanały; czas 0 → natychmiast cel; reduced-motion → cel.

## 5. Gotowe, gdy
Testy zielone, plik ≤ 200 linii, `pnpm lint && pnpm typecheck && pnpm test` zielone.
