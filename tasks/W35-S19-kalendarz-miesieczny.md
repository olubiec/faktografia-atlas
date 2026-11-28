# S19 – Kalendarz miesięczny pod /kalendarium
Cel: strona `/kalendarium` (noindex, poza sitemapą) z klikalnym kalendarzem Pn–Nd: w komórce znaczniki (publikacje GUS, pobrane, pomysł na media), po kliknięciu panel dnia prostym polskim.
Zmieniaj: scripts/data/calendar-board.mjs, .github/workflows/calendar-board.yml, src/App.tsx, src/core/calendar/*, src/view/calendar/*, README.md
Wymagane: tests/unit/s19-calendar-core.test.ts, tests/unit/s19-kalendarium-dni-builder.test.ts, tests/e2e/s19-kalendarium.spec.ts
Dane: robot zapisuje `library/kalendarium-dni.json` na gałęzi data/library (obok badge.json); strona pobiera go z raw.githubusercontent.com (adres w src/core/calendar/source.ts).
Decyzja (właściciel): zadanie zlecone wprost; odrzuconych zmiennych nie pokazujemy.
Do zrobienia przez właściciela: reguła `/kalendarium` w vercel.json (bez niej bezpośrednie wejście na adres na Vercelu da 404) oraz dopisanie `/kalendarium` do listy tras w tests/unit/b14-no-dead-code.test.ts.
