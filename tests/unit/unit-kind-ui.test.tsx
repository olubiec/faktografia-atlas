import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { UnitKindsGlossary } from '@/view/pages/UnitKindsGlossary';
import { UnitKindHint } from '@/view/profile/UnitKindHint';
import { UNIT_KINDS } from '@/core/units/kinds';

describe('słownik jednostek w interfejsie', () => {
  it('słownik ma kotwicę na każdy rodzaj i opisuje miasto na prawach powiatu', () => {
    const html = renderToStaticMarkup(<UnitKindsGlossary />);
    for (const k of UNIT_KINDS) expect(html).toContain(`id="${k.id}"`);
    expect(html).toContain('Szczecin');
    expect(html).toContain('powiat grodzki');
  });

  it('znak „?” ma dostępną nazwę i wskazuje rodzaj jednostki', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <UnitKindHint unit={{ teryt: '3262', bdlId: null, name: 'powiat Szczecin', level: 'pow', parent: '32', bbox: [0, 0, 0, 0], centroid: [0, 0] }} />
      </MemoryRouter>,
    );
    expect(html).toContain('Co to znaczy: Miasto na prawach powiatu');
  });
});
