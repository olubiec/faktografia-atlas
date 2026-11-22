import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { IndicatorPanel } from '../../src/view/main/IndicatorPanel';
import { MyIndicatorsManager } from '../../src/view/main/MobileIndicatorBar';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import type { Indicator } from '../../src/core/profile/profile';
import indicatorsData from '../../config/indicators.json';

vi.mock('../../src/view/share/useShareData', () => ({ useShareData: () => null }));
vi.mock('../../src/view/share/LazyShareDialog', () => ({ LazyShareDialog: () => null }));

// Panel domyślnie ma sekcję zwiniętą (renderToString nie klika), więc podglądamy
// propsy przekazane do MyIndicatorsManager i wymuszamy rozwinięcie.
const seen: { activeId?: string | null }[] = [];
vi.mock('../../src/view/main/MobileIndicatorBar', async () => {
  const actual = await vi.importActual<typeof import('../../src/view/main/MobileIndicatorBar')>(
    '../../src/view/main/MobileIndicatorBar',
  );
  return {
    ...actual,
    MyIndicatorsManager: (props: Parameters<typeof actual.MyIndicatorsManager>[0]) => {
      seen.push({ activeId: props.activeId });
      return actual.MyIndicatorsManager({ ...props, defaultOpen: true });
    },
  };
});

const ALL = indicatorsData as Indicator[];

const renderManager = (activeId?: string | null) =>
  renderToString(<MyIndicatorsManager all={ALL} onPick={() => {}} defaultOpen={true} activeId={activeId} />).replace(/<!-- -->/g, '');

const currentRows = (html: string) =>
  [...html.matchAll(/<[^>]*aria-current="true"[^>]*>/g)].map((m) => m[0]);

const renderPanel = (currentId: string) => {
  const view = {
    indicator: ALL.find((i) => i.id === currentId)!,
    indicators: ALL,
    values: null,
    year: null,
    years: [],
    level: 'woj',
    setIndicator: () => {},
    setYear: () => {},
    setLevel: () => {},
  };
  return renderToString(
    <IndicatorPanel
      view={view as never}
      choropleth={null}
      ranking={null}
      index={{ byTeryt: new Map() } as never}
      selectedTeryt={null}
      onSelectUnit={() => {}}
      inSheet={true}
    />,
  ).replace(/<!-- -->/g, '');
};

describe('Panel mapy: aktywny wiersz „Moich wskaźników” (QC506)', () => {
  beforeEach(() => {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      clear: () => data.clear(),
    });
    seen.length = 0;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('activeId z listy: dokładnie jeden wiersz ma aria-current i jest to ten wskaźnik', () => {
    const id = BASIC_INDICATORS[0];
    const rows = currentRows(renderManager(id));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toContain(`data-row-id="${id}"`);
  });

  it('bez activeId (lub null) żaden wiersz nie ma aria-current', () => {
    expect(currentRows(renderManager())).toHaveLength(0);
    expect(currentRows(renderManager(null))).toHaveLength(0);
  });

  it('activeId spoza listy: brak aria-current i brak wyjątku', () => {
    expect(() => renderManager('b999')).not.toThrow();
    expect(currentRows(renderManager('b999'))).toHaveLength(0);
  });

  it('cały panel mapy nie pokazuje już „Moich wskaźników” (C01: tylko w Porównaj)', () => {
    const id = BASIC_INDICATORS[1];
    const html = renderPanel(id);
    expect(seen).toHaveLength(0);
    expect(currentRows(html)).toHaveLength(0);
  });
});
