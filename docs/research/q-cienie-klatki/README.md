# Klatki animacji zmiany poziomu i wskaźnika (research q-cienie)

Zrzuty KAŻDEJ klatki przejść, żeby zobaczyć przebieg. Chromium headless + SwiftShader (render programowy), viewport 390x844, DPR 1, motyw jasny, `?e2e`. To NIE iOS/Safari: artefakty specyficzne dla GPU telefonu mogą tu nie wystąpić.

## Metoda
Render programowy robi jeden zrzut co 7-11 s, więc zrzuty "co 50-100 ms" realnego czasu dają tylko 2 klatki. Dlatego w skrypcie (poza repo) zamrożono zegar strony: `performance.now`, `Date.now` i `requestAnimationFrame` są wirtualne, a po zmianie `?u=`/`?i=`/`?y=` (pushState + popstate) zegar przesuwany jest co 60 ms, po każdym kroku jest zrzut i odczyt `__atlas.reveal.progress`, `viewState.zoom`. Podpis pod klatką: nr, czas wirtualny, progress, zoom. Kod aplikacji bez zmian (build z HEAD 8a19ac7). Kontrolna klatka po 1 s = ostatnia klatka arkusza (animacje zakończone).

## Arkusze (6 kolumn, klatki co 60 ms czasu wirtualnego)
| plik | przejście | klatek |
|---|---|---|
| 1-przyblizanie-woj-pow.jpg | małopolskie -> powiat tatrzański | 21 |
| 2-przyblizanie-pow-gmi.jpg | powiat tatrzański -> gmina Zakopane | 21 |
| 3-oddalanie-pow-woj.jpg | powiat tatrzański -> małopolskie | 17 |
| 4-oddalanie-gmi-pow.jpg | Zakopane -> powiat tatrzański | 21 |
| 5-zmiana-wskaznika.jpg | density -> unemployment-rate (woj. 12) | 16 |
| 6-zmiana-roku.jpg | unemployment-rate 2021 -> 2022 (woj. 12) | 16 |

## Co widać (uczciwie)
- Nie widać wachlarzy, białych wielokątów ani niebieskich odłamków w żadnej klatce przy tej skali (arkusz ~195 px na klatkę; drobne artefakty <2 px mogłyby umknąć).
- Przebieg każdego przybliżenia/oddalenia jest taki sam: (a) klatka 0: stary widok; (b) klatka 1-2 (60-120 ms): NAGŁY skok do widoku z zoom ok. 5,5 (cały region/Polska południowa) i podmiana warstwy na drobną siatkę gmin w szarościach, bez zaznaczenia (czerwony obrys jednostki jest maleńki albo go brak); (c) klatki 3-8: ta sama siatka, zoom prawie stały (5,5-5,7), progress rośnie 0,2->0,5; (d) klatki 9-17: kamera leci z zoom 5,5 do docelowego (np. 9,1), siatka gęstnieje, potem rozrzedza się, wypełnia się kolorami wybranego poziomu; (e) ostatnie 2-3 klatki: pojawiają się kropki miejscowości.
- Wniosek wizualny: przy zmianie poziomu mapa nie "zbliża się płynnie" od starego widoku, tylko ucieka najpierw do szerokiego widoku (zoom ok. 5,5), co przy dużym zoomie 9-10 (gmina->powiat, klatka 0->1) jest gwałtownym skokiem skali w jednej klatce. Dotyczy obu kierunków i woj<->pow, pow<->gmi.
- Panel profilu (dół) pojawia się od klatki 2-3 wysuwany od dołu; tekst się nie przycina.
- Zmiana wskaźnika (arkusz 5): klatka 0 = puste wypełnienie (tylko czerwony obrys województwa, białe tło), od klatki 1 nowe kolory, a potem TAKŻE odbywa się ten sam lot kamery 6,7 -> 5,5 -> 6,65 z siatką gmin (klatki 3-9). Zmiana roku (arkusz 6): bez pustej klatki, ale ten sam lot kamery. Uwaga: wskaźnik/rok zmieniałem przez URL (popstate), nie przez interfejs, więc lot kamery może być skutkiem tej drogi, nie samego przełącznika w UI.
- `reveal.running` ma wartość true tylko do progress 1 (ok. klatki 15), kamera animuje się dłużej (do klatki 20); ostatnia klatka: running=false, camera.animating=false.
