import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import Contact from '../../src/view/pages/Contact';
import DataDisclaimer from '../../src/view/pages/DataDisclaimer';

function render(el: React.ReactElement): string {
  return renderToString(<MemoryRouter>{el}</MemoryRouter>);
}

const countH1 = (html: string) => (html.match(/<h1[\s>]/g) ?? []).length;

describe('Strony informacyjne', () => {
  it('Kontakt ma dokładnie jeden h1', () => {
    expect(countH1(render(<Contact />))).toBe(1);
  });

  it('Zastrzeżenie o danych ma dokładnie jeden h1', () => {
    expect(countH1(render(<DataDisclaimer />))).toBe(1);
  });

  it('Kontakt zawiera link mailto i link do zgłoszeń w repozytorium', () => {
    const html = render(<Contact />);
    expect(html).toContain('href="mailto:mateuszolubiec05@gmail.com"');
    expect(html).toContain('href="https://github.com/olubiec/faktografia-atlas/issues"');
  });

  it('Zastrzeżenie wymienia licencję CC BY 4.0, źródło GUS BDL i odsyła do Kontaktu', () => {
    const html = render(<DataDisclaimer />);
    expect(html).toContain('CC BY 4.0');
    expect(html).toContain('Bank Danych Lokalnych');
    expect(html).toContain('href="/kontakt"');
  });
});
