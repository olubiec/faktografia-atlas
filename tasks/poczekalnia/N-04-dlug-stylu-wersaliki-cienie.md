# N-04 – Dług stylu: wersaliki w etykietach i cienie zgodnie z STYL.md
Cel: Etykiety piszemy zwykłą wielkością liter, a elementy nad mapą nie mają cienia – tak jak każe docs/STYL.md (zakaz wersalików w etykietach, brak cieni); nowy test pilnuje, żeby nie wróciły (domknięcie długu wykrytego w W17-T03).
Zmieniaj: src/view/library/LibraryFilters.tsx, src/view/library/VariableStatsBar.tsx, src/view/legend/Legend.tsx, src/view/controls/YearSlider.tsx, src/view/controls/IndicatorPicker.tsx, src/view/Home.tsx, tests/unit/style-debt.test.ts
Wymagane: tests/unit/style-debt.test.ts
Weryfikacja: pnpm lint && pnpm typecheck && pnpm test && pnpm build
Przeczytaj najpierw: docs/STYL.md (linia ok. 67 „Zakazy typograficzne” i lista kontrolna na końcu), tests/unit/style-guard.test.ts, tasks/poczekalnia/NOC-RAPORT.md (W17-T03)

Zadanie:
1. Usuń klasę `uppercase` (i towarzyszące `tracking-wide`/`tracking-wider`, które bez wersalików nie mają sensu) w: LibraryFilters.tsx (nagłówek h2), VariableStatsBar.tsx (5 etykiet), Legend.tsx (h4), YearSlider.tsx (2 etykiety), IndicatorPicker.tsx (nagłówek grupy). Tekst etykiet zostaje ten sam (już jest zwykłą wielkością liter w źródle – sprawdź; jeśli w źródle są wersaliki, zamień na zdanie z wielką pierwszą literą).
2. `Home.tsx`: usuń `shadow-sm` z dwóch elementów (podpowiedź na komputerze i przycisk na telefonie, ok. linii 38 i 44); obramowanie `border border-linia` już jest. Nic więcej w Home.tsx nie zmieniaj.
3. `tests/unit/style-debt.test.ts`: przejdź pliki `src/view/**/*.tsx` i sprawdź, że żaden nie zawiera klasy `uppercase` ani `shadow-sm|shadow-md|shadow-lg|shadow ` (dozwolone `shadow-none`); komunikat błędu wypisuje plik i linię. Nie zmieniaj ani nie kopiuj na nowo style-guard.test.ts – to osobny, dodatkowy test.

Gotowe, gdy:
- style-debt.test.ts przechodzi i wykrywa naruszenie (sprawdź lokalnie, wstawiając tymczasowo `uppercase`, potem cofnij; opisz w PR).
- Wszystkie istniejące testy jednostkowe zielone bez zmian.

Nie rób: zmian w Rankings.tsx (zajmuje się nim N-06), src/components/ui/*, config/tokens.json, docs/STYL.md, istniejących testach. Zrzuty wzorcowe legendy/suwaka/biblioteki mogą się zmienić – napisz w PR, że trzeba je odświeżyć workflow „Update snapshots”.
