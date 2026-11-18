# Cienie i wachlarze przy ruchu mapy – protokół sprawdzenia na iPhonie

Dla właściciela. Zadania: `tasks/poczekalnia/W20-KOLEJNOSC.md`. Sprawdzenie po scaleniu CN01–CN06, na podglądzie Vercel w Safari (najnowszy iOS).

## Ścieżka testowa (powtórz dla każdej wersji adresu poniżej)
1. Wejdź na mapę kraju. Dotknij województwo, potem powiat.
2. Cofnij przyciskiem „Wróć”: powiat → województwo → kraj. Powtórz wstecz przeglądarki.
3. Przybliż i oddal szczypaniem na powiecie, potem na województwie.
4. Zmień wskaźnik na tym samym poziomie (powinno płynnie przejść kolorem, ok. 0,3 s).

## Wersje adresu (dopisz na końcu adresu podglądu)
| Adres | Co wyłącza | Wniosek, jeśli cienie znikają |
|---|---|---|
| (bez dopisku) | nic | zadania CN01–CN04 wystarczyły: koniec |
| `?diag=notrans` | przejście koloru | cienie to przejście koloru (CN01/CN02 nie wystarczyły; zgłoś, w którym kroku) |
| `?diag=nohatch` | kreskowanie „brak danych” | winne kreskowanie → decyzja o CN10 (jednolity kolor) |
| `?diag=nooutline` | czerwony obrys wybranej | winna warstwa obrysu |
| `?diag=notrans,nohatch,nooutline` | wszystko trzy | jeśli nadal są: problem w samej warstwie wypełnień/MapLibre → poziom 4 |

## Co zgłosić
Dla każdego adresu: „są / nie ma” cienie i wachlarze (a) przy cofaniu, (b) przy szczypaniu, (c) po zatrzymaniu; nagranie ekranu, jeśli się da. Wniosek z tabeli przesądza, czy uruchamiamy CN10 (wymaga Twojej zgody na zmianę `docs/STYL.md` §2).

## Kryterium sukcesu
Brak wachlarzy i cieni w trakcie ruchu przy cofaniu powiat→woj→kraj i przy szczypaniu; kreskowanie lub jednolity „brak danych” widoczny; zmiana wskaźnika nadal płynna.
