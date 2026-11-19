import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileIndicatorList } from '../../src/view/profile/ProfileIndicatorList';
import { orderByList, stepsToNeighbor } from '../../src/core/profile/indicator-order';
import { MY_INDICATORS_KEY } from '../../src/core/my-indicators/storage';
import indicators from '../../config/indicators.json';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const profile = buildProfile('0201011', profileSample.indicators as never, profileSample.valuesById as never, profileSample.units as never);
const items = (indicators as { id: string; name: string; group: string }[]).map((indicator, i) => ({
  ...profile.indicators[0],
  indicatorId: indicator.id,
  indicator: indicator as never,
  rankNational: i,
}));
const render = (list: string[], personalize = true) => {
  vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(list), setItem: () => {} });
  return renderToString(<ProfileIndicatorList items={items as never} units={[]} footnotes={[]} personalize={personalize} />);
};
afterEach(() => vi.unstubAllGlobals());

describe('przesuwanie wskaźników w profilu (PX01)', () => {
  it('wiersze są w kolejności listy użytkownika, nie rejestru', () => {
    const html = render(['avg-wage', 'population']);
    expect(html.indexOf('Usuń wskaźnik: ' + items.find((i) => i.indicatorId === 'avg-wage')!.indicator.name)).toBeLessThan(
      html.indexOf('Usuń wskaźnik: ' + items.find((i) => i.indicatorId === 'population')!.indicator.name),
    );
    expect(orderByList(items as never, ['avg-wage', 'population']).map((i) => i.indicatorId)).toEqual(['avg-wage', 'population']);
  });
  it('każdy wiersz ma „Przesuń wyżej/niżej”; skrajne są wyłączone', () => {
    const list = ['population', 'density'];
    const html = render(list);
    expect((html.match(/aria-label="Przesuń wyżej:/g) ?? []).length).toBe(2);
    expect((html.match(/aria-label="Przesuń niżej:/g) ?? []).length).toBe(2);
    // population i density są w jednej grupie: pierwszy ma „wyżej” wyłączone, ostatni „niżej”.
    expect((html.match(/disabled=""[^>]*aria-label="Przesuń wyżej/g) ?? []).length).toBe(1);
    expect((html.match(/disabled=""[^>]*aria-label="Przesuń niżej/g) ?? []).length).toBe(1);
  });
  it('sąsiad liczony jest wśród widocznych: ukryty wskaźnik z listy jest pomijany', () => {
    const list = ['population', 'b60614', 'density'];
    expect(stepsToNeighbor(list, 'population', 'density')).toBe(2);
    expect(stepsToNeighbor(list, 'density', 'population')).toBe(2);
    expect(stepsToNeighbor(list, 'population', undefined)).toBe(0);
    expect(orderByList(items as never, list).map((i) => i.indicatorId)).toEqual(['population', 'density']);
  });
  it('przyciski mają cel dotykowy 44 px, a bez personalizacji ich nie ma', () => {
    expect(render(['population', 'density'])).toContain('min-h-[44px] min-w-[44px]');
    expect(render(['population', 'density'], false)).not.toContain('Przesuń wyżej');
  });
  it('zapis klucza listy nie jest tu ruszany (klucz stały)', () => {
    expect(MY_INDICATORS_KEY).toBe('faktografia-my-indicators');
  });
});
