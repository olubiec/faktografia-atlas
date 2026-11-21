# QU04 – Badanie: Rankingi – mapa się nie ładuje, układ nielogiczny i nieczytelny
Cel: diagnoza błędów i nowy, prosty układ strony Rankingi (do zatwierdzenia przez właściciela).
Zmieniaj: docs/research/q2-rankingi-diagnoza.md
Wymagane: docs/research/q2-rankingi-diagnoza.md
Weryfikacja: pnpm lint
Przeczytaj najpierw: docs/PRODUKT.md (§4e), src/view/pages/Rankings.tsx, src/view/ranking/*, src/core/ranking/*, docs/research/q2-telefon-390.md
Zadanie: Zgłoszenie 19.11: „rankingi są dla mnie nielogiczne i nieczytelne, mapa się nie ładuje”. (1) Otwórz /rankingi na 390 i 1280 px, z i bez `?i=`, `?l=`, `?w=`, wskaźnikiem z biblioteki, przy wolnej sieci (throttling) i po błędzie 404 danych. Ustal, której „mapy” brakuje (czy strona ma ją mieć wg §4e? czy chodzi o mapę wskaźnika w oknie udostępniania?) i dlaczego się nie ładuje – z numerem linii. (2) Audyt czytelności: lista kontrolek w kolejności, jak je widzi użytkownik (pasek „Moje wskaźniki”, poziom, województwo, kierunek, mediana, słupki), co każda robi, które są niejasne, które się dublują z panelem mapy. (3) Zaproponuj układ docelowy: jeden nagłówek „Co porównujemy” (wskaźnik, rok, poziom), pod nim małe okno mapy (to samo co na mapie głównej, bez własnego silnika, jeśli to możliwe – albo link „Pokaż na mapie”), 10 najwyżej / 10 najniżej, „pokaż wszystkie”, pozycja wybranego miejsca. Szkic jako lista bloków dla 390 px i 1280 px. (4) Rozstrzygnij, czy Rankingi powinny być osobną stroną (patrz QU03).
Gotowe, gdy:
- raport podaje przyczynę niezaładowanej mapy (plik:linia) albo dowód, że strona jej nie ma i nie powinna
- raport ma listę kontrolek z oceną czytelności
- raport zawiera szkic układu docelowego i listę zadań dla QU14/QU15
