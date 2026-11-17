import { indicatorTableCsv, profileCsv, compareCsv, shareFileName, toCsv } from '../../core/share/csv';
import type { CardKind } from '../../core/share/card';
import type { ShareDialogData } from './ShareDialog';

/** Treść i nazwa pliku CSV dla okna udostępniania (wybór źródła zależny od karty i dostępnych danych). */
export function dialogCsv(data: ShareDialogData, activeKind: CardKind): { csv: string; fileName: string } {
  if (data.csvContent) {
    return { csv: data.csvContent, fileName: data.csvFileName || shareFileName('faktografia', [activeKind, 'dane'], 'csv') };
  }
  if (activeKind === 'profile' && data.unitProfile) {
    return { csv: profileCsv(data.unitProfile), fileName: shareFileName('faktografia', ['profil', data.unitProfile.teryt], 'csv') };
  }
  if (activeKind === 'compare' && data.compareRows) {
    return { csv: compareCsv(data.compareRows, data.compareUnitA, data.compareUnitB), fileName: shareFileName('faktografia', ['porownanie'], 'csv') };
  }
  if (data.units && data.indicatorValues && data.indicator && data.year) {
    return {
      csv: indicatorTableCsv(data.units, data.indicatorValues, data.indicator, data.year),
      fileName: shareFileName('faktografia', [data.indicator.id, data.indicator.minLevel, data.year], 'csv'),
    };
  }
  const cols = ['Tytuł', 'Wartość', 'Źródło'];
  const rows = [['Faktografia Atlas', 'Dane GUS', 'GUS, Bank Danych Lokalnych (CC BY 4.0)']];
  return { csv: toCsv(cols, rows), fileName: shareFileName('faktografia', ['dane'], 'csv') };
}
