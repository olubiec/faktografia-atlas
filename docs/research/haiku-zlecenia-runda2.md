# Research dla Haiku – druga runda (propozycja z 26.10.2026)
Format jak w `docs/research/haiku-zlecenia.md` (jedno pytanie = jedno zlecenie; na początku KAŻDEGO zlecenia wklej „Nagłówek” z tamtego pliku). Zlecenia powstały z luk po weryfikacji pierwszej rundy.
Poprawka do pierwszej rundy: w sekcji „Ustalone” tamtego pliku stoi „51 050 zmiennych”; prawdziwy katalog ma **63 960** zmiennych na poziomie powiatu lub gminy (spis ≈ 7,9 MB, ≈ 593 KB po gzip) – nadal poniżej progu 1 MB, więc dzielenie spisu niepotrzebne.

## R9.5 – Hasła słownika GUS dla pozostałych wskaźników · **przed W1.9**
**Po co:** W1.9 ma objaśnienia dla wszystkich wskaźników z `config/indicators.json`; sprawdzone mamy 5 haseł (przyrost naturalny 3956, gęstość zaludnienia 3915, stopa bezrobocia rejestrowanego 2390, saldo migracji 2259, lesistość 1706).
**R9.5** Dla każdego z pozostałych wskaźników z listy (wklej `id` i nazwę z `config/indicators.json`) znajdź w słowniku pojęć GUS (stat.gov.pl/metainformacje/slownik-pojec) hasło o tym samym znaczeniu: numer, tytuł, źródło definicji (kto jest autorem tekstu), link. Brak hasła → „BRAK”.
Format: tabela wskaźnik · numer hasła · tytuł · autor/źródło tekstu · link · data.

## R2.4 – Czy nazwy po polsku są naprawdę w kafelkach · **po K7**
**Po co:** W3.7 – pole `name:pl` jest zadeklarowane w TileJSON, ale nie wiadomo, czy mają je obiekty w Polsce.
**R2.4** Czy dokumentacja OpenMapTiles / OpenFreeMap opisuje, kiedy atrybut `name:pl` jest wypełniany (skąd bierze się z OSM, czy zawsze, czy tylko gdy jest tag `name:pl`)? Jaki jest przykład z linkiem dla dużego miasta w Polsce?
Format: 3–5 punktów · linki · daty.

## R5.4 – Tryb ciemny mapy w MapLibre · **po K7**
**Po co:** W3.7 – ciemny podkład bez osobnych kafelków.
**R5.4** Czy OpenFreeMap udostępnia ciemny styl (np. `dark`) w tym samym zestawie kafelków co Positron, i jaka jest oficjalna lista stylów? Czy dokumentacja MapLibre opisuje zmianę kolorów warstw w czasie działania (`setPaintProperty`) jako wspierany sposób?
Format: lista stylów z linkami · 2–3 punkty o `setPaintProperty` · daty.

## R11.4 – CORS i kompresja na własnej domenie R2 · **po założeniu konta (D6)**
**Po co:** „próba R2” – czego nie da się sprawdzić bez konta.
**R11.4** Jak w dokumentacji Cloudflare R2 ustawia się CORS dla zasobnika podpiętego do własnej domeny, i czy odpowiedzi JSON z własnej domeny są kompresowane (gzip/brotli) automatycznie? Czy `aws s3 sync` z R2 wymaga obejścia sum kontrolnych (opcje `request_checksum_calculation`)?
Format: 3–6 punktów · linki · daty · „NIEZWERYFIKOWANE” tam, gdzie dokumentacja milczy.

## R7.5 – (zamknięte: odpowiedź z kodu, bez Haiku)
Jak robot składa tytuły: `scripts/data/library.mjs` zapisuje tylko `n1`–`n3`, dlatego tytuły zmiennych z `n4`/`n5` się dublują. Naprawa: zadanie W1.25.
