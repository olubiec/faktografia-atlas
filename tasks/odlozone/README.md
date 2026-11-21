# Zadania odłożone (21.11.2026)
Decyzja właściciela: plan etapu B jest za obszerny na wypuszczenie strony; zostają tylko zmiany, które realnie coś zmieniają. Poniższe zadania **nie startują**; pliki są nietknięte (poza tym README), więc można je przywrócić przez `git mv` do `tasks/`.

| Zadanie | Co dawało | Dlaczego odłożone | Co działa zamiast |
|---|---|---|---|
| B08 przełącznik widoków + Ranking | zakładki Mapa/Ranking, koniec strony Rankingi | nowa architektura widoków; potrzebna tylko pod B09–B12 | strona `/rankingi` działa |
| B09 widok Wykres | linia lat + mediana na mapie | funkcja „nice to have” | wykres lat w profilu miejsca |
| B10 widok Tabela | tabela miejsc z szukaniem | j.w. | Ranking (lista z filtrem) |
| B11 druga mapa (komputer) | dwa wskaźniki obok siebie | najdroższe wydajnościowo, bez pomiaru na telefonie | `/porownaj` |
| B12 druga mapa na telefonie + koniec Porównaj | j.w. na telefonie | zależy od B11 | `/porownaj` |
| B15 odbiór (testy ścieżek, pomiar kliknięć) | raport przed/po | ciężki zestaw e2e; sens dopiero po B08–B12 | oglądanie podglądu przez właściciela |
| U03b przegląd serwisów na żywo | raport wzorców | badanie, nie wpływa na wypuszczenie; wymaga dopuszczenia hostów | raport U03 |
| U11b zbieranie wyborów do `popularIds` | telemetria wyboru wskaźników | najpierw trzeba mieć dane z B01 (≥ 7 dni) | priorytety robota z `config/library-priority.json` |

Zadania z `tasks/poczekalnia/` (W5-PM13, W5-PM20, W5-QU13, W6-PM14, W6-QU17, W18-P02/P04/P06, P2-A, P3-A, P4-C) i `tasks/wstrzymane/` (udostępnianie) też czekają i nie startują – to samo odroczenie, bez przenoszenia.
Przy powrocie B09–B12 sprawdź w nich zależność od B08 (`i2`, `ViewSwitch`) i uwagi o B14 (zakres zmniejszony).
