# QU15 – Rankingi: naprawa ładowania mapy
Cel: mapa (lub jej zamiennik wg QU04) w Rankingach ładuje się zawsze albo pokazuje czytelny stan błędu.
Zmieniaj: src/view/pages/Rankings.tsx, src/view/ranking/RankingMapPreview.tsx, tests/unit/rankings-map-load.test.tsx, tests/e2e/rankings-map.spec.ts
Wymagane: tests/unit/rankings-map-load.test.tsx, tests/e2e/rankings-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/research/q2-rankingi-diagnoza.md (z QU04)
Zadanie: Napraw przyczynę z raportu QU04 (plik:linia). Stany: ładowanie (szkielet), błąd (komunikat + „Spróbuj ponownie”), brak danych. Mapa WebGL sprawdzana przez stan z `window.__atlas`, nie piksele.
Gotowe, gdy:
- test: błąd pobrania pokazuje komunikat i przycisk ponowienia
- e2e: na /rankingi mapa jest gotowa (stan z __atlas) w limicie czasu
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU04. Uwaga na nakładanie się z QU14 (ten sam plik Rankings.tsx – jedno zadanie naraz).
Tytuł PR zaczyna się od `[W5-QU15]`; opis ma „Po ludzku”.
