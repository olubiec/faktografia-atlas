import { describe, expect, it } from 'vitest';
import { loadIndicatorValues, resetValuesCache } from '../../src/core/data/load-values';
import { buildValuesReport } from '../../scripts/data/values-report.mjs';

describe('buildValuesReport & loadIndicatorValues (CC12.3)', () => {
  it('buildValuesReport generuje poprawną tabelę Markdown z nagłówkiem o automatycznym generowaniu', () => {
    const indicators = [
      {
        id: 'pop-test',
        name: 'Ludność ogółem',
        minLevel: 'gmi',
      },
      {
        id: 'unemp-test',
        name: 'Stopa bezrobocia',
        minLevel: 'pow',
      },
    ];

    const units = [
      { teryt: '02', level: 'woj' },
      { teryt: '04', level: 'woj' },
      { teryt: '0201', level: 'pow' },
      { teryt: '0202', level: 'pow' },
      { teryt: '0201011', level: 'gmi' },
      { teryt: '0201021', level: 'gmi' },
    ];

    const files = new Map([
      [
        'pop-test',
        {
          indicatorId: 'pop-test',
          years: [2020, 2021, 2022],
          values: {
            '02': [100, 101, 102],
            '0201': [50, 50, 51],
            '0201011': [10, 10, 11],
            '0201021': [10, 10, null],
          },
          fetchedAt: '2026-03-30T10:00:00.000Z',
        },
      ],
      [
        'unemp-test',
        {
          indicatorId: 'unemp-test',
          years: [2021, 2022],
          values: {
            '02': [5.0, 4.8],
            '0201': [6.0, 5.5],
            '0202': [7.0, 6.8],
          },
          fetchedAt: '2026-03-30T11:00:00.000Z',
        },
      ],
    ]);

    const report = buildValuesReport(files, indicators, units);

    expect(report).toContain('<!-- Plik wygenerowany automatycznie przez scripts/data/values-report.mjs -->');
    expect(report).toContain('Ludność ogółem');
    expect(report).toContain('pop-test');
    expect(report).toContain('woj., pow., gmi.');
    expect(report).toContain('2020–2022');
    expect(report).toContain('50.0%'); // 1 out of 2 gmin has value in last year
    expect(report).toContain('2026-03-30T10:00:00.000Z');

    expect(report).toContain('Stopa bezrobocia');
    expect(report).toContain('unemp-test');
    expect(report).toContain('woj., pow.');
    expect(report).toContain('2021–2022');
    expect(report).toContain('100.0%'); // 2 out of 2 pows have value in last year
    expect(report).toContain('2026-03-30T11:00:00.000Z');
  });

  it('loadIndicatorValues czyta jednoliniowe pliki JSON bez wcięć', async () => {
    resetValuesCache();

    const resultObj = {
      indicatorId: 'single-line-test',
      years: [2022, 2023],
      values: { '02': [1, 2] },
      fetchedAt: '2026-03-30T12:00:00.000Z',
    };

    const singleLineJson = JSON.stringify(resultObj) + '\n';
    expect(singleLineJson.split('\n').filter(Boolean)).toHaveLength(1);

    const mockFetch = async () =>
      new Response(singleLineJson, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const data = await loadIndicatorValues('single-line-test', mockFetch as any);
    expect(data).toEqual(resultObj);
  });
});
