import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import type { RankedUnit } from '../../src/core/ranking/ranking';
import type { Unit } from '../../src/core/units/types';
import { RankingsList } from '../../src/view/ranking/RankingsList';

const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { useGrouping: 'always' }).format(n);

function makeUnits(n: number) {
  const items: RankedUnit[] = [];
  const unitsByTeryt = new Map<string, Unit>();
  for (let i = 0; i < n; i++) {
    const teryt = String(3000000 + i * 10 + 1);
    items.push({ teryt, name: `Gmina${i}`, value: 5000 - i, rank: i + 1, total: n });
    unitsByTeryt.set(teryt, {
      teryt, bdlId: null, name: `Miasto${i}`, level: 'gmi', parent: null,
      bbox: [0, 0, 0, 0], centroid: [0, 0],
    });
  }
  return { items, unitsByTeryt };
}

type Props = Parameters<typeof RankingsList>[0];

function html(props: Partial<Props> & Pick<Props, 'items' | 'unitsByTeryt'>) {
  // React SSR wstawia znaczniki <!-- --> między sąsiednie teksty; usuwamy je do porównań
  return renderToString(
    <MemoryRouter>
      <RankingsList
        unit="os./km²"
        indicatorId="density"
        level="gmi"
        year={2024}
        format={fmt}
        {...props}
      />
    </MemoryRouter>,
  ).replace(/<!-- -->/g, '');
}

const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe('RankingsList (@S21)', () => {
  it('120 pozycji → 50 wierszy i przycisk „Pokaż więcej (jeszcze 70)”', () => {
    const out = html(makeUnits(120));
    expect(count(out, /<li[ >]/g)).toBe(50);
    expect(out).toContain('Pokaż więcej (jeszcze 70)');
  });

  it('pageSize steruje liczbą widocznych wierszy i licznikiem „jeszcze N”', () => {
    // Kliknięcia nie da się tu wykonać (brak DOM w środowisku node); sprawdzamy stan wyjściowy dla różnych pageSize.
    const out = html({ ...makeUnits(120), pageSize: 100 });
    expect(count(out, /<li[ >]/g)).toBe(100);
    expect(out).toContain('Pokaż więcej (jeszcze 20)');
  });

  it('własny pageSize i brak przycisku, gdy wszystko się mieści', () => {
    const out = html({ ...makeUnits(10), pageSize: 50 });
    expect(count(out, /<li[ >]/g)).toBe(10);
    expect(out).not.toContain('Pokaż więcej');
    expect(count(html({ ...makeUnits(30), pageSize: 20 }), /<li[ >]/g)).toBe(20);
  });

  it('żaden wiersz nie jest samym kodem; brak nazwy daje „Jednostka <teryt>”', () => {
    const { items, unitsByTeryt } = makeUnits(3);
    unitsByTeryt.delete(items[0].teryt);
    const out = html({ items, unitsByTeryt });
    expect(out).toContain(`Jednostka ${items[0].teryt}`);
    expect(out).toContain('Miasto1 (miasto)');
    const nameSpans = [...out.matchAll(/<span class="text-sm[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
    expect(nameSpans).toHaveLength(3);
    for (const t of nameSpans) {
      expect(t.trim()).not.toBe('');
      expect(t).not.toMatch(/^\d{7,12}$/);
    }
  });

  it('link prowadzi na mapę, z rokiem lub bez', () => {
    const data = makeUnits(2);
    expect(html(data)).toContain('href="/mapa?u=3000001&amp;i=density&amp;l=gmi&amp;y=2024"');
    const noYear = html({ ...data, year: null });
    expect(noYear).toContain('href="/mapa?u=3000001&amp;i=density&amp;l=gmi"');
    expect(noYear).not.toContain('&amp;y=');
  });

  it('pokazuje wartość z jednostką, np. „3 465 os./km²”', () => {
    const { items, unitsByTeryt } = makeUnits(1);
    items[0].value = 3465;
    const text = html({ items, unitsByTeryt }).replace(/&nbsp;| | /g, ' ');
    expect(text).toContain('3 465 os./km²');
  });

  it('ujemna wartość nie psuje szerokości słupka (0–100%)', () => {
    const { items, unitsByTeryt } = makeUnits(3);
    items[0].value = 200;
    items[1].value = -50;
    items[2].value = -300;
    const out = html({ items, unitsByTeryt, unit: 'osoba', indicatorId: 'migration', year: null });
    const bars = [...out.matchAll(/data-negative="(true|false)"[^>]*style="left:([\d.]+)%;width:([\d.]+)%"/g)];
    expect(bars).toHaveLength(3);
    for (const [, , left, width] of bars) {
      expect(+width).toBeGreaterThanOrEqual(0);
      expect(+width).toBeLessThanOrEqual(100);
      expect(+left + +width).toBeLessThanOrEqual(100.0001);
    }
    expect(bars.map((b) => b[1])).toEqual(['false', 'true', 'true']);
    expect(out).toContain('aria-hidden="true"');
  });

  it('pusta lista pokazuje komunikat (role=status)', () => {
    const out = html({ items: [], unitsByTeryt: new Map() });
    expect(out).toContain('role="status"');
    expect(out).toContain('Brak danych dla tego wyboru');
    expect(out).not.toContain('<ol');
  });

  it('ma semantykę ol/li, a miejsce jest czytelne dla czytnika ekranu', () => {
    const out = html(makeUnits(3));
    expect(out).toContain('<ol');
    expect(count(out, /<li[ >]/g)).toBe(3);
    expect(out).toContain('1.<span class="sr-only"> miejsce 1</span>');
  });

  it('renderuje 2 500 wierszy w rozsądnym czasie', () => {
    const data = makeUnits(2500);
    const t0 = performance.now();
    const out = html({ ...data, pageSize: 2500 });
    const ms = performance.now() - t0;
    expect(count(out, /<li[ >]/g)).toBe(2500);
    expect(ms).toBeLessThan(5000);
  });
});
