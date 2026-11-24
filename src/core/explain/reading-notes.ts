/**
 * Krótkie wskazówki „jak czytać”, które wynikają z jednostki i nazwy wskaźnika,
 * a nie z ręcznie pisanego opisu – działają więc także dla wskaźników z biblioteki GUS.
 */
export function readingNotes(name: string, unit: string): string[] {
  const u = unit.trim().toLowerCase();
  const n = name.toLowerCase();
  const notes: string[] = [];
  if (u === '%' || u.includes('%')) {
    notes.push(
      'Wartość to udział w procentach. Może być większa niż 100% – to nie błąd: GUS dzieli liczby zbierane według różnych zasad (np. dzieci w przedszkolach według miejsca przedszkola, a ludność według miejsca zamieszkania), więc w gminie z dużą liczbą miejsc wynik przekracza 100%.',
    );
  }
  if (/na\s*(1\s?000|1000|10\s?000|100\s?000|100\s?tys)/.test(u) || /na\s*(1\s?000|10\s?000|100\s?000)\b/.test(n)) {
    notes.push('Liczba przeliczona na stałą liczbę mieszkańców – dzięki temu można uczciwie porównywać gminy różnej wielkości.');
  }
  if (/mediana/.test(n)) {
    notes.push('Mediana to wartość środkowa: połowa jednostek ma wynik niższy, a połowa wyższy.');
  }
  if (/(średni|przeciętn)/.test(n) && !/mediana/.test(n)) {
    notes.push('Średnia dla całej jednostki – nie mówi nic o różnicach między mieszkańcami.');
  }
  return notes;
}
