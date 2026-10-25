# Plan badań v2 – audyt tego, co zrobione, i gotowce pod kolejne sesje (25.10.2026)

Zastępuje wcześniejszy pomysł badań „przed falą 4” (kolejka F1–F7 jest już w większości na `main`). Prompty do Gemini: `docs/research/gemini-prompty-v2.md`. Raporty przechodzą `TRYB: WERYFIKACJA` (WORKFLOW §8.19), zanim cokolwiek trafi do decyzji, `ELEMENTY.md`, `INSPIRACJE.md` albo kodu.

## 1. Co sprawdziłem w kodzie (stan `main` d797711)
| Obszar | Co jest | Dlaczego do poprawy |
|---|---|---|
| Szablon stron | `About.tsx` (30 linii), `Sources.tsx` (45), `Privacy.tsx` (86): każda strona sama składa układ (`Header` + `main`), **brak wspólnego układu i stopki** (w `src/` stopka jest tylko w oknach i profilu) | powtarzany kod; brak miejsca na linki do prywatności, źródeł i kontaktu pod każdą stroną |
| Metadane | `index.html`: tylko `<title>Faktografia Atlas</title>`; brak opisu, Open Graph, tytułów podstron; w `public/` brak `robots.txt` i `sitemap.xml` | udostępnienie linku (a to jest funkcja S19) pokazuje gołą nazwę; SEO podstron gmin jest w „Później” |
| Strona główna | `Home.tsx` (28 linii) = od razu mapa z panelem; `<h1>` tylko dla czytników. Makieta `docs/design/01-start-komputer.png` (duży nagłówek, szukaj, 4 wskaźniki) **nie jest zbudowana**; PRODUKT §3 świadomie ją zastąpił ekranem „panel + mapa” | nowy gość nie dostaje wprowadzenia; decyzja produktowa do potwierdzenia przez właściciela (patrz §3) |
| Animacje wejścia w głąb | kamera: własna pętla `requestAnimationFrame` w `useMapViewState.ts` (351 linii); kolory: `transitions` deck.gl w `layers/choropleth.ts` (to jest gotowiec); kolejność kafelków: `reveal.ts` + `DataFilterExtension` | warto sprawdzić, czy kamera (i scena „kreślenie” W3.5) nie ma wbudowanego odpowiednika w deck.gl/MapLibre, który skróci własny kod |
| Wybór wskaźnika i filtry | `IndicatorPicker.tsx` (299 linii): grupy po polu `group` + wyszukiwanie; sensowne dla 20 wskaźników | S21 (biblioteka GUS: tysiące zmiennych, kategorie, filtry, „zamów wskaźnik”) wymaga innej struktury |
| Własne komponenty-kandydaci do wymiany | `TrendChart.tsx` (427), `ShareDialog.tsx` (404), `render-png.ts` (148), `csv.ts` (203), `RankingBars.tsx` (171), `classes.ts` (93), `url/state.ts` (137), `search/index.ts` (226), `Annotate.tsx` (165) | dużo własnego kodu tam, gdzie zwykle są gotowe pakiety; wymiana tylko, gdy zysk jest wyraźny i test zostaje bez zmian |

## 2. Badania (kolejność i do czego służą)
| Nr | Temat | Karmi | Kiedy |
|---|---|---|---|
| R1 | Szablon stron, wspólny układ, strona główna, metadane i SEO | nowa sesja „Szablon i strona główna” (S22) | teraz |
| R2 | Gotowe rozwiązania dla animacji przejść (kamera, kafelki, „kreślenie”) | korekty S16 po ocenie na telefonie, W3.5 | teraz |
| R3 | Gotowe komponenty zamiast własnych (audyt zrobionego) | zadania „wymiana na gotowiec” | teraz |
| R4 | Nawigacja, kategorie, filtry i wyszukiwarka dla biblioteki GUS | S21 | przed S21 |
| R5 | Magazyn danych biblioteki GUS (decyzja R6 z `biblioteka-gus.md`) | S21 | przed S21 |

Poza zakresem (już rozstrzygnięte w repo): kafelki podkładowe (blady podkład – „Później”, `TRYB: WYBÓR`), mapowanie BDL↔TERYT (`docs/data/bdl-mapping.md`), miejscowości (SIMC + PRNG), 20 wskaźników, zgoda i PostHog, nocny robot.

## 3. Decyzje czekające na właściciela
1. **Strona główna:** zostajemy przy „od razu mapa” (PRODUKT §3), czy dodajemy wejście wg makiety 01 (nagłówek, szukaj, kilka wskaźników), a mapa pod osobnym adresem lub po przewinięciu? Raport R1 ma dać warianty z przykładami; decyzja po nim.
2. **Wymiana na gotowce:** R3 daje listę z oceną ryzyka; wymieniamy tylko pozycje o wyraźnym zysku (mniej kodu, mniej błędów), po jednej na zadanie.
3. **Inspiracje z cudzych repozytoriów:** zasady w `AGENTS.md` (sekcja „Zasady projektu”) i rejestr `docs/INSPIRACJE.md`.

## 4. Jak wracają wyniki
Raport (treść + 3–5 linków do kluczowych źródeł) → Claude: `TRYB: WERYFIKACJA` → wpisy do `INSPIRACJE.md` / `ELEMENTY.md` → zadania dopisane do `docs/ARCHITEKTURA.md` §3 **razem z** `scripts/ops/automat-kolejka.json` (test `ops-kolejka` pilnuje zgodności) → decyzja w „Decyzjach” w `STAN.md`.
