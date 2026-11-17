import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Privacy } from '../../src/view/pages/Privacy';

// Klucz wpisany na sztywno: moduł storage.ts (MY_INDICATORS_KEY) powstaje w W2-QC502.
// TODO(QC502): zamienić na import MY_INDICATORS_KEY z src/core/my-indicators/storage.
const MY_INDICATORS_KEY = 'faktografia-my-indicators';

function renderPrivacy(): string {
  return renderToString(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>,
  );
}

describe('Prywatność: Moje wskaźniki (QC510)', () => {
  it('zawiera nazwę klucza w pamięci przeglądarki, w elemencie <code>', () => {
    const html = renderPrivacy();
    expect(html).toContain(`>${MY_INDICATORS_KEY}</code>`);
  });

  it('mówi wprost, że lista nie jest wysyłana', () => {
    const html = renderPrivacy();
    expect(html).toContain('nie wysyłamy');
    expect(html).toContain('Moje wskaźniki');
  });

  it('nie zmienia istniejących wpisów o motywie i zgodzie', () => {
    const html = renderPrivacy();
    expect(html).toContain('faktografia-theme');
    expect(html).toContain('fa-consent-v1');
  });
});
