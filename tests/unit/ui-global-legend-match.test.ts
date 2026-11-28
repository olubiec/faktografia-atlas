import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { classColorToken, classify, legendBreaks } from '../../src/core/map/classes';
import { buildLegend } from '../../src/core/legend/legend';
import { schemeFor } from '../../src/core/map/choropleth';

type Values = { years: number[]; values: Record<string, (number | null)[]> };

describe('UI-GLOBAL 5: opisy legendy zgadzają się z klasami kolorów', () => {
  test('każda wartość ma kolor klasy, której przedział z legendy ją zawiera (wszystkie wskaźniki, ostatni rok)', () => {
    const bad: string[] = [];
    for (const f of readdirSync('public/data/values').filter((n) => n.endsWith('.json'))) {
      const d = JSON.parse(readFileSync(`public/data/values/${f}`, 'utf8')) as Values;
      const yi = d.years.length - 1;
      for (const len of [2, 4, 7]) {
        const vals = Object.entries(d.values)
          .filter(([t]) => t.length === len)
          .map(([, a]) => a[yi])
          .filter((v): v is number => typeof v === 'number');
        if (vals.length < 15) continue;
        const breaks = legendBreaks(vals);
        const scheme = schemeFor(vals);
        const items = buildLegend({ breaks, scheme });
        for (const v of vals) {
          const c = classify(v, breaks);
          if (c === 'no-data') continue;
          const item = items[c];
          const inside =
            (item.from === null || v >= item.from) &&
            (item.to === null || v < item.to || (item.from === item.to && v === item.from));
          if (!inside || item.token !== classColorToken(c, breaks.length + 1, scheme, breaks)) {
            bad.push(`${f} ${len} ${v} klasa ${c} ${item.label}`);
            break;
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
