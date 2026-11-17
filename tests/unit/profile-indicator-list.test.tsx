import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { buildProfile } from '../../src/core/profile/profile';
import { ProfileIndicatorList } from '../../src/view/profile/ProfileIndicatorList';
import { BASIC_INDICATORS } from '../../src/core/my-indicators/my-indicators';
import indicators from '../../config/indicators.json';
import profileSample from '../fixtures/synthetic/profile-sample.json';

const profile = buildProfile('0201011', profileSample.indicators as never, profileSample.valuesById as never, profileSample.units as never);
// Wskaźniki z prawdziwego rejestru, żeby część była na liście podstawowej, a część nie.
const items = (indicators as { id: string; name: string; group: string }[]).map((indicator, i) => ({
  ...profile.indicators[0],
  indicatorId: indicator.id,
  indicator: indicator as never,
  rankNational: i,
}));

describe('lista wskaźników w profilu (FIX3)', () => {
  it('domyślnie pokazuje tylko zestaw podstawowy i przyciski usuwania (>= 44 px)', () => {
    const html = renderToString(<ProfileIndicatorList items={items as never} units={[]} footnotes={[]} />);
    const removes = html.match(/aria-label="Usuń wskaźnik:/g) ?? [];
    expect(removes.length).toBe(BASIC_INDICATORS.length);
    expect(removes.length).toBeLessThan(items.length);
    expect(html).toContain('Dodaj wskaźnik');
    expect(html).toContain('min-h-[44px] min-w-[44px]');
  });
  it('bez wyboru (personalize=false) pokazuje wszystko i bez przycisków edycji', () => {
    const html = renderToString(<ProfileIndicatorList items={items as never} units={[]} footnotes={[]} personalize={false} />);
    expect(html).not.toContain('Usuń wskaźnik');
    expect(html).not.toContain('Dodaj wskaźnik');
  });
});
