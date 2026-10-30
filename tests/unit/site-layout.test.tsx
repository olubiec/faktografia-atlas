import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { SiteLayout } from '@/view/layout/SiteLayout';

vi.mock('@/core/consent/consent', () => ({
  clearConsent: vi.fn<() => void>(),
}));

describe('SiteLayout & SiteFooter', () => {
  it('renders skip link and main content area', () => {
    const html = renderToString(
      <MemoryRouter>
        <SiteLayout>
          <div id="test-child">Test content</div>
        </SiteLayout>
      </MemoryRouter>
    );

    expect(html).toContain('Przejdź do treści');
    expect(html).toContain('href="#main-content"');
    expect(html).toContain('id="main-content"');
    expect(html).toContain('Test content');
  });

  it('renders all 4 footer columns', () => {
    const html = renderToString(
      <MemoryRouter>
        <SiteLayout>
          <div />
        </SiteLayout>
      </MemoryRouter>
    );

    // Column 1
    expect(html).toContain('Faktografia Atlas to prosta w obsłudze');
    expect(html).toContain('CC BY 4.0');

    // Column 2
    expect(html).toContain('Narzędzia');
    expect(html).toContain('Mapa Polski');

    // Column 3
    expect(html).toContain('Tematy');
    expect(html).toContain('Ludność ogółem');

    // Column 4
    expect(html).toContain('Projekt');
    expect(html).toContain('Prywatność i zgoda');
    expect(html).toContain('href="/prywatnosc"');
  });

  it('ensures all interactive elements in footer have min-h-[44px]', () => {
    const html = renderToString(
      <MemoryRouter>
        <SiteLayout>
          <div />
        </SiteLayout>
      </MemoryRouter>
    );

    // Basic regex check for min-h-[44px]
    const matches = html.match(/min-h-\[44px\]/g);
    expect(matches?.length).toBeGreaterThan(10);
  });
});
