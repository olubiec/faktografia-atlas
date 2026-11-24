// Reguły wyboru „popularnych” danych z biblioteki GUS (decyzja właściciela: zostają tylko
// proste, zrozumiałe wskaźniki; niszowe, techniczne i przestarzałe znikają z całej strony).
// Porównania po małych literach. Edytuj tu – logika jest w curation.ts.

/** Dane, których ostatni rok jest starszy, uznajemy za archiwalne. */
export const STALE_BEFORE_YEAR = 2015;

/** Całe działy (początek nazwy działu GUS). */
export const DROP_SECTIONS = ['powszechne spisy rolne', 'samorząd terytorialny'];

/** Całe grupy (początek nazwy grupy GUS) – techniczne albo rozbite na dziesiątki wariantów. */
export const DROP_GROUPS = [
  'szkolnictwo gimnazjalne', 'szkolnictwo policealne', 'wychowanie pozaszkolne',
  'nauczanie języków obcych', 'nakłady na środki trwałe', 'gospodarka wodno-ściekowa w przemyśle',
  'efekty rzeczowe inwestycji', 'emisja zanieczyszczeń powietrza', 'odpady wytworzone i dotychczas',
  'oczyszczanie ścieków komunalnych', 'pobór i zużycie wody', 'placówki stacjonarnej pomocy',
  'instytucjonalna piecza', 'stacjonarne zakłady opieki', 'lecznictwo uzdrowiskowe',
  'transport morski', 'działalność sceniczna', 'kina', 'lasy prywatne i gminne',
  'zaległości w opłatach', 'gospodarka gruntami', 'dodatki mieszkaniowe', 'targowiska',
  'wydatki budżetów gmin', 'organy', 'pracujący według innego podziału',
  'ochrona przyrody i różnorodności', 'leśnictwo wszystkich form',
];

/** Fragmenty nazwy (tej, którą widzi użytkownik) oznaczające wariant dla specjalistów. */
export const DROP_NAME_PARTS = [
  'prowadzone przez', 'prowadzona przez', 'własność powiatu', 'własność województwa',
  'pomieszczenia', 'sale lekcyjne', 'sale gimnastyczne', 'pracownie', 'oddziały',
  'pełnozatrudn', 'niepełnozatrudn', 'dla dorosłych', 'specjaln', 'bez specjalnych',
  'w roku sprawozdawczym', 'przystosowane dla osób', 'przepustowo', 'dłużnik', 'wniosków',
  'gminy bez miast', 'miasta na prawach powiatu –', 'dotacji celowej',
  'pierwsze półrocze', 'w podziale na miasto i wieś', 'wg funkcjonalnych grup',
  'wg płci', 'wg lokalizacji', 'wg kryterium', '(polska = 100)', '(polska=100)',
  'na 1 km2', 'na km2', 'izby', 'ustęp', 'przyłącza', 'nowo dołączonych',
  'dam3', 'w m]', 'w m ', 'teleporady', 'kapitałów', 'zapotrzebowanie na najem',
  'deficyt', 'najmem socjalnym', 'w dyspozycji gminy', 'dodatków z tytułu', 'dodatki z tytułu',
  'świadczeń specjalnego', 'koszy na śmieci', 'stanowiska dokumentacyjne', 'zespoły przyrodniczo',
  'żywopłoty', 'efektywności kosztowej', 'imprezy organizowane', 'seanse', 'odczyty', 'koncerty',
  'lekcje zajęcia', 'oddział lub filia', 'pozostałe zakłady', 'ośrodki zdrowia gminne',
  'obroty ładunkowe', 'komunikacja krajowa', 'przystanki', 'parkingów', 'sołectwa',
  'powierzchnia – ogółem w ha', 'odprowadzone na 1 mieszkańca', 'ścieków komunalnych odprowadzanych',
  'różnica pomiędzy', 'długość sieci kanalizacyjnej w relacji', 'w mwh', 'w kwh',
  'woda dostarczona', 'woda sprzedana', 'mieszkania niezamieszkane',
];

/** Pojedyncze końcówki nazwy: podział na płeć i podobne rozbicia. */
export const DROP_NAME_ENDINGS = [' – mężczyźni', ' – kobiety', ' - mężczyźni', ' - kobiety'];

/** Jednostki techniczne, niezrozumiałe dla większości (tysiące m³, tony rocznie itp.). */
export const DROP_UNITS = ['dam3', 'hm3', 'm3/dobę', 't/r', 'kg/rok', 'mwh', 'tys. t'];

/** Pojedyncze wskaźniki odrzucone po przeglądzie: duplikaty, mylące nazwy, warianty techniczne. */
export const DROP_IDS = new Set([
  // ludność: starsze serie i duplikaty wskaźników wbudowanych
  '80108', '80125', '149156', '149160', '149164', '1365239', '63233', '1616456', '454134',
  // rynek pracy, szkoły (b1157/b1161 to licea dla dorosłych, b454078 to duplikat)
  '79228', '395391', '278548', '454115', '471928', '454078', '1157', '1161',
  // żłobki i świadczenia: zostają wskaźniki na 1000 dzieci / mieszkańców
  '377227', '377236', '377237', '410639', '1649554', '1649555', '1649557', '1649859', '1649860',
  '259887', '1727889', '1727894', '1727896', '1727897', '1728280', '1735077', '1752260',
  '72317', '1751412', '1728574',
  // mieszkania (b404 to mieszkania zwrócone dawnym właścicielom) i sieci
  '387', '389', '404', '405', '60806', '60810', '60813', '60834', '60838', '60841', '60844',
  '199953', '519967', '1646471', '489', '492', '494', '496', '504', '79175', '396248', '396250',
  '1725887', '1726312', '1735578',
  // odpady, zieleń, kultura
  '54841', '54851', '54853', '60605', '288061', '395749', '455424',
  '395921', '1724788', '1724791', '1232', '1233', '1234',
  // druga kopia tego samego w liczbach bezwzględnych (zostaje wersja na 1000 ludności)
  '744944', '1365224', '1365229', '7849', '7850', '7851',
]);

/** Wyjątki: zostają mimo reguł (zrozumiałe, choć nazwa łapie się na regułę). */
export const KEEP_IDS = new Set(['1243', '64429']);
