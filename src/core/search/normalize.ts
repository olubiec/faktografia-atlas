/**
 * Normalizuje tekst do wyszukiwania:
 * - zamienia na małe litery
 * - usuwa polskie znaki diakrytyczne
 * - zamienia myślniki i wielokrotne spacje na pojedynczą spację
 */
export function normalize(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/[źż]/g, 'z')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
