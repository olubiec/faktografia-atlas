# Raport mapowania jednostek GUS ↔ TERYT

- **Data pobrania / mapowania:** 2026-10-17
- **Liczba jednostek w odpowiedzi BDL:**
  - Poziom 2 (województwa): 16
  - Poziom 5 (powiaty): 382
  - Poziom 6 (gminy): 4198
  - Razem BDL: 4596
- **Liczba przypisanych jednostek do units.json:** 2875 / 2875

## Pominięte typy jednostek w BDL

| Typ / Kind | Opis | Liczba |
|---|---|---|
| 4 | Miasto w gminie miejsko-wiejskiej | 737 |
| 5 | Obszar wiejski w gminie miejsko-wiejskiej | 737 |
| 8 | Dzielnica / delegatura | 19 |
| - | Archiwalne / nieaktywne jednostki BDL bez odpowiednika w TERYT | 228 |

## Rozbieżności nazw

Znaleziono 1 rozbieżności nazw po normalizacji:

| TERYT | BDL ID | Poziom | Nazwa w units.json | Nazwa w BDL | Znormalizowana (json) | Znormalizowana (bdl) | Opis |
|---|---|---|---|---|---|---|---|
| 2812052 | 042815412052 | gmi | Nowe Miasto Lubawskie | Bratian | nowe miasto lubawskie | bratian | Gmina wiejska Nowe Miasto Lubawskie w BDL nazywa się Bratian (od nazwy siedziby gminy). Kod TERYT i przypisanie BDL są w 100% poprawne. |
