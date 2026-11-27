// Sekcje PKD 2007 – GUS podaje same litery („Sekcja J”), a człowiek chce wiedzieć, o jaką branżę chodzi.
const SECTIONS: Record<string, string> = {
  A: 'rolnictwo, leśnictwo, łowiectwo i rybactwo', B: 'górnictwo i wydobywanie', C: 'przetwórstwo przemysłowe',
  D: 'energia elektryczna, gaz i para wodna', E: 'woda, ścieki i odpady', F: 'budownictwo',
  G: 'handel i naprawa pojazdów', H: 'transport i magazynowanie', I: 'zakwaterowanie i gastronomia',
  J: 'informacja i komunikacja', K: 'finanse i ubezpieczenia', L: 'obsługa rynku nieruchomości',
  M: 'działalność profesjonalna, naukowa i techniczna', N: 'usługi administrowania i wsparcia', O: 'administracja publiczna i obrona',
  P: 'edukacja', Q: 'opieka zdrowotna i pomoc społeczna', R: 'kultura, rozrywka i rekreacja', S: 'pozostała działalność usługowa',
  'B+C+D+E': 'przemysł (górnictwo, przetwórstwo, energia, woda)',
};

/** „Sekcja J” → „informacja i komunikacja (sekcja J)”; inne nazwy bez zmian. */
export function pkdSection(name: string): string {
  const m = /^sekcja:?\s*([A-U](?:\+[A-U])*)$/i.exec(name.trim());
  const label = m ? SECTIONS[m[1]!.toUpperCase()] : undefined;
  return label ? `${label} (sekcja ${m![1]!.toUpperCase()})` : name;
}
