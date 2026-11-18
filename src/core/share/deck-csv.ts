import type { CompareRow } from '../compare/compare';
import type { Indicator, IndicatorValues, UnitProfile } from '../profile/profile';
import type { Unit } from '../units/types';
import { compareCsv, indicatorTableCsv, profileCsv, toCsv } from './csv';

const BOM = '﻿';
const FOOTER = 'Źródło: GUS, Bank Danych Lokalnych; licencja CC BY 4.0';

export type DeckCsvSection = { title: string; csv: string };

/** Dane już policzone – tu niczego się nie pobiera. */
export type PageCsvInput =
  | { kind: 'map' | 'ranking' | 'histogram'; units: Unit[]; values: IndicatorValues; indicator: Indicator; year: number }
  | { kind: 'table' | 'profile'; profile: UnitProfile }
  | { kind: 'compare' | 'versus'; rows: CompareRow[]; a: UnitProfile | Unit | string | null; b: UnitProfile | Unit | string | null; indicators?: Indicator[] }
  | { kind: 'bignumber' | 'trend'; indicator: Indicator; unitName: string; series: { year: number; value: number | null }[] };

/** CSV jednej strony (bez BOM) – wybiera istniejącą funkcję z csv.ts wg rodzaju strony. */
export function pageCsv(input: PageCsvInput): string {
  let csv: string;
  switch (input.kind) {
    case 'map':
    case 'ranking':
    case 'histogram':
      csv = indicatorTableCsv(input.units, input.values, input.indicator, input.year);
      break;
    case 'table':
    case 'profile':
      csv = profileCsv(input.profile);
      break;
    case 'compare':
    case 'versus':
      csv = compareCsv(input.rows, input.a, input.b, input.indicators);
      break;
    case 'bignumber':
    case 'trend': {
      const col = input.indicator.unit ? `${input.indicator.name} (${input.indicator.unit})` : input.indicator.name;
      csv = toCsv(['Nazwa', 'Rok', col], input.series.map((p) => [input.unitName, p.year, p.value]));
      break;
    }
  }
  return csv.replace(BOM, '');
}

/** Składa plik zestawu: jeden BOM, sekcja na stronę, pusta linia między nimi, stopka ze źródłem. */
export function deckCsv(sections: DeckCsvSection[], opts?: { pageLabels?: string[] }): string {
  const n = sections.length;
  const parts = sections.map((s, i) => {
    const head = n > 1 ? toCsv([opts?.pageLabels?.[i] ?? `Strona ${i + 1}/${n}`, s.title], []).replace(BOM, '') : '';
    return head + s.csv;
  });
  return BOM + parts.join('\r\n') + '\r\n' + FOOTER + '\r\n';
}
