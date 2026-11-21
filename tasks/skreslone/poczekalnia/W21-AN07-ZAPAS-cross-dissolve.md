# W21-AN07 – ZAPAS: cross-dissolve dwóch warstw
Uruchomić tylko, gdy po teście właściciela na iPhonie (wersja po AN06) artefakty NIE znikają, a `?diag=notrans,nohatch,nooutline` nie pomaga, albo gdy animacja CPU z AN04 jest za wolna na telefonie.

## 1. Kryteria uruchomienia
Właściciel potwierdza: artefakty przy pierwszym wczytaniu/cofaniu nadal są po AN06. Bez tego potwierdzenia zadania nie wykonujemy.

## 2. Cel
Zamiast mieszać kolory w atrybucie, trzymamy dwie warstwy kolorów (stara i nowa) i płynnie zmieniamy ich `opacity` (uniform, jedna liczba na klatkę, bez zmiany buforów). Po końcu stara warstwa jest usuwana.

## 3. Pliki
- Zmieniaj: `src/view/map/layers/choropleth.ts`, `src/core/map/cross-dissolve.ts` (nowy), `tests/unit/cross-dissolve.test.ts` (nowy)
- Czytaj tylko: `src/core/map/fill-blend.ts`, `src/view/map/hooks/useChoropleth.ts`

## 4. Testy
Suma `opacity` obu warstw ≤ 1 + tolerancja; po końcu zostaje jedna warstwa; id warstw stabilne i różne; reduced-motion → od razu jedna warstwa.

## 5. Gotowe, gdy
Testy zielone; podgląd: brak artefaktów, brak błysku w połowie przejścia; wymaga akceptacji właściciela (zmiana wyglądu przejścia).
