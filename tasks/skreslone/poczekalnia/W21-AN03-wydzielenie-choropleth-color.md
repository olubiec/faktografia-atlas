# W21-AN03 – Wydzielenie choropleth-color.ts
Opis zakresu już zaimplementowanego.

## 1. Cel
Kolor jednostki (klasa → RGBA, brak danych, przygaszenie spoza zakresu) liczy jedna funkcja w osobnym pliku; `getFillColor` składa ją z `fill-blend`. `choropleth.ts` wraca poniżej ~200 linii.

## 2. Pliki
- Zmieniaj: `src/view/map/layers/choropleth-color.ts` (nowy), `src/view/map/layers/choropleth.ts` (import zamiast wbudowanej logiki), `tests/unit/choropleth-color.test.ts` (nowy)
- Wymagane: `tests/unit/choropleth-layers-split.test.ts` (bez zmian)
- Czytaj tylko: `src/core/map/fill-blend.ts`, `src/core/map/classes.ts`

## 3. Testy
Każda klasa daje oczekiwany kolor z palety; brak danych → kolor „brak danych”; jednostka spoza zakresu → przygaszona; wynik niezależny od kolejności wywołań (czysta funkcja); TERYT jako string.

## 4. Gotowe, gdy
Zachowanie koloru identyczne jak przed zmianą (istniejące testy bez zmian zielone); nowe testy zielone; `pnpm lint && pnpm typecheck && pnpm test` zielone.
