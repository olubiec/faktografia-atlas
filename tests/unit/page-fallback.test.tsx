import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PageFallback } from '../../src/App';

describe('PageFallback (ekran ładowania podstrony)', () => {
  const html = renderToString(<PageFallback />);

  it('jest landmarkiem main, żeby dokument nigdy nie był bez main', () => {
    expect(html).toContain('<main');
    expect(html).toContain('id="main-content"');
  });

  it('zachowuje znaczniki ładowania i identyfikator testowy', () => {
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-testid="page-fallback"');
  });

  it('ma nagłówek h1 „Wczytywanie strony” dla czytnika ekranu', () => {
    expect(html).toMatch(/<h1[^>]*>Wczytywanie strony/);
  });

  it('ogłasza stan ładowania przez role=status', () => {
    expect(html).toContain('role="status"');
  });
});
