import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { IndicatorPanel } from '../../src/view/main/IndicatorPanel';
import { DataMenuWindow } from '../../src/view/data-menu/DataMenuWindow';
import type { Indicator } from '../../src/core/profile/profile';
import indicatorsData from '../../config/indicators.json';

vi.mock('../../src/view/share/useShareData', () => ({ useShareData: () => null }));
vi.mock('../../src/view/share/LazyShareDialog', () => ({ LazyShareDialog: () => null }));

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const ALL = indicatorsData as Indicator[];
const current = ALL[0];

const panel = (inSheet: boolean) =>
  renderToString(
    <IndicatorPanel
      view={{ indicator: current, indicators: ALL, values: null, year: 2023, years: [], level: 'woj', setIndicator: () => {}, setYear: () => {}, setLevel: () => {} } as never}
      choropleth={null}
      ranking={null}
      index={{ byTeryt: new Map() } as never}
      selectedTeryt={null}
      onSelectUnit={() => {}}
      inSheet={inSheet}
    />,
  ).replace(/<!-- -->/g, '');

describe('C01 okno „Wybierz dane”', () => {
  it('przycisk otwarcia: etykieta „Wybierz dane”, pod nią wskaźnik i rok, pole ≥ 44 px', () => {
    const html = renderToString(<DataMenuWindow indicatorId={current.id} indicatorName={current.name} year={2023} onSelect={() => {}} />).replace(/<!-- -->/g, '');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('Wybierz dane');
    expect(html).toContain(`${current.name}, 2023`);
    expect(html).toContain('min-h-[44px]');
  });

  it('okno na cały ekran, bez zaokrągleń i cieni; zamykanie ≥ 44 px (przycisk Dialogu 44 px)', () => {
    const src = read('src/view/data-menu/DataMenuWindow.tsx');
    expect(src).toMatch(/h-dvh/);
    expect(src).toMatch(/w-screen/);
    expect(src).not.toMatch(/rounded-(?!none)|shadow-/);
    expect(read('src/components/ui/dialog.tsx')).toMatch(/h-11 w-11/);
  });

  it('wybór woła onSelect i zamyka okno (menu zamyka się po wyborze)', () => {
    const src = read('src/view/data-menu/DataMenuWindow.tsx');
    expect(src).toMatch(/onSelect=\{onSelect\}/);
    expect(src).toMatch(/onClose=\{\(\) => change\(false\)\}/);
    expect(read('src/view/data-menu/DataMenu.tsx')).toMatch(/onSelect\(id\);\s*onClose\(\);/);
  });

  it.each([true, false])('panel (telefon=%s) nie ma „Moich wskaźników”, a nazwa wskaźnika jest raz', (inSheet) => {
    const html = panel(inSheet);
    expect(html).not.toContain('Moje wskaźniki');
    const visible = html.replace(/<[^>]+>/g, '|');
    expect(visible.split(current.name).length - 1).toBe(1);
  });

  it('dolny pasek na telefonie jest podniesiony odstępem z tokenu skali (mb-3 = 12 px)', () => {
    const src = read('src/view/main/MobileIndicatorBar.tsx');
    expect(src).toMatch(/data-slot="mobile-indicator-bar"[\s\S]{0,200}mb-3/);
    expect(src).not.toContain('MyIndicatorsManager all=');
  });
});
