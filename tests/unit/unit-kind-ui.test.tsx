import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { UnitKindsGlossary } from '@/view/pages/UnitKindsGlossary';
import { UnitKindHint } from '@/view/profile/UnitKindHint';
import { UnitKindInfo } from '@/view/profile/UnitKindInfo';
import { UNIT_KINDS } from '@/core/units/kinds';

describe('słownik jednostek w interfejsie', () => {
  it('słownik ma kotwicę na każdy rodzaj i opisuje miasto na prawach powiatu', () => {
    const html = renderToStaticMarkup(<UnitKindsGlossary />);
    for (const k of UNIT_KINDS) expect(html).toContain(`id="${k.id}"`);
    expect(html).toContain('Szczecin');
    expect(html).toContain('powiat grodzki');
  });

  const szczecin = { teryt: '3262', bdlId: null, name: 'powiat Szczecin', level: 'pow', parent: '32', bbox: [0, 0, 0, 0], centroid: [0, 0] } as const;

  it('linijka pod nazwą pokazuje rodzaj i krótką definicję', () => {
    const html = renderToStaticMarkup(<UnitKindHint unit={szczecin} />);
    expect(html).toContain('Miasto na prawach powiatu');
    expect(html).toContain('miasto i powiat w jednym');
  });

  it('znak „?” jest takim samym przyciskiem jak przy wskaźnikach: 44 px, dostępna nazwa', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter><UnitKindInfo unit={szczecin} /></MemoryRouter>,
    );
    expect(html).toContain('aria-label="Co to znaczy: Miasto na prawach powiatu"');
    expect(html).toContain('min-w-[44px] min-h-[44px]');
  });

  it('dla gminy miejsko-wiejskiej też jest znak „?”', () => {
    const goleniow = { teryt: '3203023', bdlId: null, name: 'Goleniów', level: 'gmi', parent: '3203', bbox: [0, 0, 0, 0], centroid: [0, 0] } as const;
    const html = renderToStaticMarkup(<MemoryRouter><UnitKindInfo unit={goleniow} /></MemoryRouter>);
    expect(html).toContain('Co to znaczy: Gmina miejsko-wiejska');
  });
});
