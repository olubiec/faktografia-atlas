import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from '../../src/App';
import { ErrorBoundary, ErrorFallback } from '../../src/view/layout/ErrorBoundary';

function renderAt(path: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllEnvs());

describe('Trasy aplikacji', () => {
  it('nieznana ścieżka renderuje NotFound z noindex', () => {
    const html = renderAt('/nie-ma-takiej');
    expect(html).toContain('Błąd 404');
    expect(html).toContain('name="robots"');
    expect(html).toContain('noindex');
  });

  it('w trybie produkcyjnym /__test/x renderuje NotFound', () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    expect(renderAt('/__test/x')).toContain('Błąd 404');
  });

  it('znane trasy /kontakt i /zastrzezenie nie kończą na NotFound (lazy + fallback)', () => {
    for (const path of ['/kontakt', '/zastrzezenie']) {
      const html = renderAt(path);
      expect(html).not.toContain('Błąd 404');
      expect(html).toContain('data-testid="page-fallback"');
    }
  });
});

describe('ErrorBoundary', () => {
  it('po błędzie pokazuje komunikat z przyciskiem „Wczytaj ponownie” zamiast pustej strony', () => {
    const state = ErrorBoundary.getDerivedStateFromError();
    expect(state.hasError).toBe(true);
    const boundary = new ErrorBoundary({ children: null });
    boundary.state = state;
    const html = renderToString(boundary.render());
    expect(html).toContain('role="alert"');
    expect(html).toContain('Wczytaj ponownie');
    expect(renderToString(<ErrorFallback />)).toContain('min-h-[44px]');
  });

  it('bez błędu renderuje dzieci, a błąd loguje do console.error', () => {
    const boundary = new ErrorBoundary({ children: 'treść' });
    expect(boundary.render()).toBe('treść');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    boundary.componentDidCatch(new Error('x'), { componentStack: 'stos' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
