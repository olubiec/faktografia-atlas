import { formatValue } from '../format/number';
import type { Change } from './changes';

export type ChangeSentenceContext = {
  unitName: string;
  indicatorUnit?: string | null;
  fromYear: number;
  toYear: number;
  /** Odsetek (0-100) jednostek z mniejszą zmianą; null = bez porównania. */
  share: number | null;
};

/**
 * Jedno zdanie „Co się zmieniło” ze stałego szablonu (bez AI).
 * Przykład: „Od 2015 do 2025 r. wartość wzrosła o 6,2% – szybciej niż w 80% jednostek.”
 */
export function changeSentence(
  change: Change,
  ctx: ChangeSentenceContext,
): string {
  const { fromYear, toYear, share } = ctx;
  const prefix = `Od ${fromYear} do ${toYear} r. wartość`;
  if (change.delta === 0) return `${prefix} nie zmieniła się.`;

  const rising = change.delta > 0;
  const verb = rising ? 'wzrosła' : 'spadła';
  const amount =
    change.deltaPercent !== null
      ? `${formatValue(Math.abs(change.deltaPercent), '%', 1).replace(' ', '')}`
      : formatValue(Math.abs(change.delta), ctx.indicatorUnit);
  let text = `${prefix} ${verb} o ${amount}`;

  if (share !== null) {
    // share = odsetek jednostek z mniejszą (algebraicznie) zmianą
    const pct = (n: number) => `${formatValue(Math.round(n), undefined, 0)}%`;
    text += rising
      ? ` – szybciej niż w ${pct(share)} jednostek`
      : ` – mocniej niż w ${pct(100 - share)} jednostek`;
  }
  return `${text}.`;
}
