# QU12 – Wskaźnik z biblioteki otwiera się na mapie, z wszystkimi funkcjami
Cel: wybór pobranego wskaźnika w Bibliotece prowadzi do mapy (`/?i=b<id>`) z legendą, rokiem, poziomem, rankingiem i udostępnianiem.
Zmieniaj: src/view/pages/LibraryVariable.tsx, src/view/library/OrderButton.tsx, tests/unit/library-open-on-map.test.tsx, tests/e2e/library-open-map.spec.ts
Wymagane: tests/unit/library-open-on-map.test.tsx, tests/e2e/library-open-map.spec.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e
Przeczytaj najpierw: docs/research/q2-biblioteka-pelna-mapa.md (z QU07), docs/research/q2-nawigacja-duplikaty.md (z QU03), tasks z QC606, QC608
Zadanie: Wg raportów QU03/QU07: pobrany wskaźnik → przekierowanie na mapę; niepobrany → strona z „Zamów”. Stare linki `/biblioteka/<id>` działają (przekierowanie). Zakres dokładnie wg rekomendacji (warianty A/B/C z QU03 – obowiązuje wybór właściciela).
Gotowe, gdy:
- test: link /biblioteka/<id> pobranego kończy na /?i=b<id>
- test: niepobrany pokazuje „Zamów”
- e2e: kliknięcie wskaźnika w bibliotece → mapa się maluje, legenda i suwak roku są
Nie ruszaj: istniejących testów (też e2e), wzorców zrzutów, docs/STAN.md, package.json. Jeśli istniejący test przeszkadza, opisz w PR i zatrzymaj się.
Zależy od: QU03, QU07 i decyzji właściciela (usunięcie strony = decyzja).
Tytuł PR zaczyna się od `[W5-QU12]`; opis ma „Po ludzku”.
