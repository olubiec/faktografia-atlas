import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CopyLinkButton } from '../../src/view/layout/CopyLinkButton';

describe('B13: „Kopiuj link”', () => {
  const html = renderToString(<CopyLinkButton />);
  it('ma podpis i pole dotykowe co najmniej 44 px', () => {
    expect(html).toContain('Kopiuj link');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');
  });
  it('potwierdzenie „Skopiowano” jest ogłaszane czytnikom ekranu (aria-live)', () => {
    expect(html).toContain('aria-live="polite"');
  });
});
