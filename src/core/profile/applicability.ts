import { isCityCounty } from '../units/label';

/**
 * Czy wskaźnik w ogóle dotyczy tej jednostki. Zestawienia budżetowe GUS są podzielone
 * na „miasta na prawach powiatu” i „gminy bez miast…”; dla gminy wiejskiej wskaźnik
 * „miasta na prawach powiatu – …” to nie 0, tylko „nie dotyczy”. Poziom województwa dotyczy wszystkich.
 */
export function appliesToUnit(indicatorName: string, teryt: string): boolean {
  if (teryt.length !== 4 && teryt.length !== 7) return true;
  const n = indicatorName.trim().toLocaleLowerCase('pl');
  if (n.startsWith('miasta na prawach powiatu')) return isCityCounty(teryt);
  if (n.startsWith('gminy bez miast na prawach powiatu') || n.startsWith('powiaty ziemskie')) return !isCityCounty(teryt);
  return true;
}
