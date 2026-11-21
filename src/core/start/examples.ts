// Przykłady na ekranie startowym: miejsca i pary do porównania (linki na `/mapa`).

export interface StartPlace {
  name: string;
  teryt: string;
  href: string;
}

export interface StartPair {
  teryt1: string;
  teryt2: string;
  name1: string;
  name2: string;
  href: string;
}

function place(name: string, teryt: string): StartPlace {
  return { name, teryt, href: `/mapa?u=${teryt}` };
}

function pair(teryt1: string, name1: string, teryt2: string, name2: string): StartPair {
  return { teryt1, teryt2, name1, name2, href: `/mapa?c=${teryt1},${teryt2}` };
}

export const START_PLACES: StartPlace[] = [
  place('Warszawa', '1465011'),
  place('Kraków', '1261011'),
  place('Powiat tatrzański', '1217'),
  place('Kleszczów', '1001042'),
  place('Sopot', '2264011'),
  place('Wałcz', '3217011'),
];

export const START_PAIRS: StartPair[] = [
  pair('1465011', 'Warszawa', '1261011', 'Kraków'),
  pair('1001042', 'Kleszczów', '2007062', 'Przytuły'),
  pair('1217', 'pow. tatrzański', '1801', 'pow. bieszczadzki'),
  pair('3064011', 'Poznań', '0264011', 'Wrocław'),
  pair('2264011', 'Sopot', '2261011', 'Gdańsk'),
  pair('1217', 'pow. tatrzański', '1211', 'pow. nowotarski'),
];
