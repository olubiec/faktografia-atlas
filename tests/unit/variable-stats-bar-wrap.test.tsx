import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VariableStatsBar } from '../../src/view/library/VariableStatsBar';
import type { RankedUnit } from '../../src/core/ranking/ranking';

// Długie liczby (miliony) z jednostką – tak wyglądają prawdziwe dane.
const values = [1234567.5, 2345678.25, 3456789.75, 4567890.5, 5678901.25, 6789012.75, 7890123.5];
const items = values.map((value, i) => ({ id: String(i), name: `J${i}`, value })) as unknown as RankedUnit[];

function render(): string {
  return renderToString(
    <VariableStatsBar rankedItems={items} years={[2020, 2021]} selectedYear={2021} unit="osoba na km²" />,
  );
}

// Klasy elementów, których tekst zawiera liczbę zapisaną z separatorem tysięcy.
function classesOfNumberElements(html: string): string[] {
  const out: string[] = [];
  const re = /<(span|div)\s+class="([^"]*)"[^>]*>([^<]*)(?=<)/g;
  for (const m of html.matchAll(re)) {
    if (/\d\D\d{3}/.test(m[3]) && m[3].includes('km²')) out.push(m[2]);
  }
  return out;
}

describe('VariableStatsBar – liczby w kafelkach nie są ucinane', () => {
  it('żaden element z liczbą nie ma klasy truncate i ma klasę zawijania', () => {
    const classes = classesOfNumberElements(render());
    expect(classes.length).toBeGreaterThan(0);
    for (const c of classes) {
      expect(c.split(/\s+/)).not.toContain('truncate');
      expect(c).toMatch(/break-words|break-all|wrap-anywhere|text-wrap/);
    }
  });

  it('cały HTML nie zawiera klasy truncate', () => {
    expect(render().split(/[\s"]+/)).not.toContain('truncate');
  });

  it('długa wartość min–max, mediana i klasy są w DOM w całości', () => {
    const text = render().replace(/<[^>]*>/g, '');
    expect(text).toMatch(/1\D234\D567,5/);
    expect(text).toMatch(/7\D890\D123,5/);
    expect(text).toMatch(/Q5:/);
  });
});
