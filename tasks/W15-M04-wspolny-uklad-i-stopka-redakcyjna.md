# M04 – Wspolny uklad stron SiteLayout i stopka redakcyjna SiteFooter
Cel: Stworzenie wspolnej oprawy redakcyjnej portalu z wielokolumnowa stopka, linkiem do prywatnosci, skip-linkiem i metadanymi.
Zmieniaj: src/view/layout/SiteLayout.tsx, src/view/layout/SiteFooter.tsx, src/view/layout/PageMeta.tsx, src/view/pages/Privacy.tsx, src/view/NotFound.tsx, tests/unit/site-layout.test.tsx
Wymagane: src/view/layout/SiteLayout.tsx, src/view/layout/SiteFooter.tsx, tests/unit/site-layout.test.tsx
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/PRODUKT.md, docs/STYL.md (§2-§5), docs/ELEMENTY.md

Zadanie:
1. Utworz `src/view/layout/SiteFooter.tsx`: 4-kolumnowa stopka w siatce kreslarskiej (`border-t border-linia bg-arkusz text-tusz`):
   - Kolumna 1: Logo Faktografia wg motywu, krotki opis misji portalu, licencja CC BY 4.0 z linkiem.
   - Kolumna 2 (Narzedzia): linki do Mapa Polski (`/`), Rankingi (`/rankingi`), Porownaj (`/porownaj`), Biblioteka (`/biblioteka`).
   - Kolumna 3 (Dzialy tematyczne GUS): 7 linkow do glownych wskaznikow (`/?i=...`).
   - Kolumna 4 (Dokumentacja): O projekcie (`/o-projekcie`), Skad sa dane (`/zrodla`), Prywatnosc i zgoda (`/prywatnosc`), GitHub.
   - Wszystkie pola dotykowe >= 44x44 px, zero cieni, zero zaokraglen.
2. Utworz `src/view/layout/SiteLayout.tsx`: komponent opakowujacy podstrony z linkiem „Przejdz do tresci”, `<Header />`, `<main id="main-content">` i `<SiteFooter />`.
3. Utworz `src/view/layout/PageMeta.tsx`: komponent ustawiajacy `<title>` i tagi meta strony (React 19).
4. W `Privacy.tsx` i `NotFound.tsx`: owin w `SiteLayout`, popraw literowke „serwiser” -> „serwisu”, dodaj informacje o kluczach w `localStorage` (`faktografia-theme`, `fa-consent-v1`).

Gotowe, gdy:
- Test jednostkowy `tests/unit/site-layout.test.tsx` potwierdza obecnosc wszystkich 4 kolumn stopki, linku do `/prywatnosc`, pol dotykowych >= 44 px i brak bledow axe.
- Istniejacy test e2e `tests/e2e/privacy.spec.ts` przechodzi bez zmian.

Nie ruszaj: src/view/Home.tsx, src/view/Header.tsx, src/view/pages/About.tsx, src/view/pages/Sources.tsx
