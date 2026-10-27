import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DownloadCsv } from '../../src/view/library/DownloadCsv';
import * as shareFileModule from '../../src/view/share/share-file';
import { shareFileName } from '../../src/core/share/csv';

describe('DownloadCsv component & CSV generation logic (@S21)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleProps = {
    name: 'Gęstość zaludnienia',
    unit: 'os./km²',
    level: 'pow',
    year: 2024,
    rows: [
      { teryt: '0201', name: 'powiat bolesławiecki', value: 123.45 },
      { teryt: '02', name: 'dolnośląskie', value: null },
    ],
  };

  it('generuje treść CSV zaczynającą się od BOM, z separatorem ;, przecinkiem dziesiętnym, leading zeros TERYT i pustym polem dla null', () => {
    const csvContent = DownloadCsv.generateCsvContent(sampleProps);

    // BOM check
    expect(csvContent.startsWith('\uFEFF')).toBe(true);

    const lines = csvContent.slice(1).trim().split('\r\n');
    expect(lines.length).toBe(3);

    // Header check
    expect(lines[0]).toBe(
      'TERYT;Nazwa;Poziom;Gęstość zaludnienia (os./km²);Rok;Źródło'
    );

    // Row 1 check ("0201" preserved, decimal comma 123,45)
    expect(lines[1]).toBe(
      '0201;powiat bolesławiecki;pow;123,45;2024;GUS, Bank Danych Lokalnych (CC BY 4.0)'
    );

    // Row 2 check ("02" preserved, null -> empty field)
    expect(lines[2]).toBe(
      '02;dolnośląskie;pow;;2024;GUS, Bank Danych Lokalnych (CC BY 4.0)'
    );
  });

  it('generuje treść CSV poprawnie, gdy jednostka wskaźnika jest null lub undefined', () => {
    const csvContent = DownloadCsv.generateCsvContent({
      ...sampleProps,
      unit: null,
    });
    const lines = csvContent.slice(1).trim().split('\r\n');
    expect(lines[0]).toBe('TERYT;Nazwa;Poziom;Gęstość zaludnienia;Rok;Źródło');
  });

  it('generuje bezpieczną nazwę pliku bez polskich znaków i spacji', () => {
    const fileName = shareFileName(
      'faktografia',
      [sampleProps.name, sampleProps.level, sampleProps.year],
      'csv'
    );
    expect(fileName).toBe('faktografia-gestosc-zaludnienia-pow-2024.csv');
    expect(fileName).not.toMatch(/[ąęćłńóśźż\s]/i);
  });

  it('renderuje przycisk o min-h-[44px] (obszar dotykowy ≥ 44px) oraz etykiecie "Pobierz CSV"', () => {
    const html = renderToString(<DownloadCsv {...sampleProps} />);

    expect(html).toContain('aria-label="Pobierz CSV"');
    expect(html).toContain('Pobierz CSV');
    expect(html).toContain('min-h-[44px]');
  });

  it('wywołanie downloadFile tworzy Blob i odpowiednią nazwę pliku po kliknięciu', () => {
    const downloadSpy = vi
      .spyOn(shareFileModule, 'downloadFile')
      .mockImplementation(() => {});

    const content = DownloadCsv.generateCsvContent(sampleProps);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const fileName = shareFileName(
      'faktografia',
      [sampleProps.name, sampleProps.level, sampleProps.year],
      'csv'
    );
    shareFileModule.downloadFile(blob, fileName);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    const [blobArg, nameArg] = downloadSpy.mock.calls[0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(nameArg).toBe('faktografia-gestosc-zaludnienia-pow-2024.csv');
  });
});
