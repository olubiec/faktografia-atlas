---
description: Audyt zakończonej sesji, np. /audyt-sesji S3
---
Użyj podagenta audytor do audytu sesji $ARGUMENTS:
1. Przeczytaj docs/PLAN.md, docs/zadania/$ARGUMENTS.md i scalone PR tej sesji (tytuły zaczynające się od „$ARGUMENTS.”).
2. Uruchom pełne sprawdzenie (lint, typy, testy, build; e2e, jeśli się da).
3. Oceń: czy efekt sesji dla użytkownika jest osiągnięty; dług; błędy powtarzalne (≥ 2 razy) –
   propozycja zasady do AGENTS.md lub testu/reguły lintera.
4. Zapisz raport do docs/raporty/$ARGUMENTS.md (≤ 60 linii: WERDYKT OK/NIE, co działa, problemy,
   dług, propozycje zasad) i otwórz PR „Raport $ARGUMENTS”.
