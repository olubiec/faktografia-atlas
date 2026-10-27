import { Download } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { shareFileName, toCsv } from '../../core/share/csv';
import { downloadFile } from '../share/share-file';

export type CsvRow = {
  teryt: string;
  name: string;
  value: number | null;
};

export type DownloadCsvProps = {
  name: string;
  unit?: string | null;
  level: string | number;
  year: number | string;
  rows: CsvRow[];
  className?: string;
};

const SOURCE_TEXT = 'GUS, Bank Danych Lokalnych (CC BY 4.0)';

export function DownloadCsv(props: DownloadCsvProps) {
  const { name, level, year, className } = props;

  const handleClick = () => {
    const content = DownloadCsv.generateCsvContent(props);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const fileName = shareFileName('faktografia', [name, level, year], 'csv');
    downloadFile(blob, fileName);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      className={className}
      aria-label="Pobierz CSV"
    >
      <Download className="size-5" aria-hidden="true" />
      <span>Pobierz CSV</span>
    </Button>
  );
}

/**
 * Generuje treść CSV dla rankingu wskaźnika biblioteki.
 * Czysta funkcja eksportowana jako właściwość statyczna komponentu do celów testowych.
 */
DownloadCsv.generateCsvContent = function generateLibraryCsvContent({
  name,
  unit,
  level,
  year,
  rows,
}: DownloadCsvProps): string {
  const valueColName = unit ? `${name} (${unit})` : name;
  const columns = ['TERYT', 'Nazwa', 'Poziom', valueColName, 'Rok', 'Źródło'];
  const rowLines = rows.map((r) => [
    r.teryt,
    r.name,
    level,
    r.value,
    year,
    SOURCE_TEXT,
  ]);
  return toCsv(columns, rowLines);
};
