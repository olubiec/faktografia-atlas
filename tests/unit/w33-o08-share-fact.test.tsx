import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { shareOrCopy, shareText, withRef } from '../../src/core/facts/share-text';
import { findViolations } from '../../src/core/facts/tone-guard';
import { ShareFact } from '../../src/view/start/ShareFact';

const card = {
  main: 'Czytelnicy bibliotek publicznych: 1 na 31 mieszkańców.',
  reference: 'W typowej gminie: 1 na 10 mieszkańców.',
  source: 'GUS BDL, 2025 · 32 na 1000',
};

describe('W33-O08 udostępnij kartę', () => {
  it('tekst zawiera nazwę, liczbę, odniesienie, rok i link z ref=karta; nie łamie tonu', () => {
    const t = shareText('Maszewo', card, 'https://faktografia.pl/gmina/maszewo');
    expect(t).toContain('Maszewo');
    expect(t).toContain('1 na 31');
    expect(t).toContain('W typowej gminie: 1 na 10');
    expect(t).toContain('2025');
    expect(t).toContain('https://faktografia.pl/gmina/maszewo?ref=karta');
    expect(findViolations(t)).toEqual([]);
  });
  it('link zachowuje istniejące parametry i nie zawiera danych osoby', () => {
    expect(withRef('/?u=3204033')).toBe('/?u=3204033&ref=karta');
  });
  it('bez navigator.share używa schowka, błąd schowka = wynik bez wyjątku', async () => {
    const writeText = vi.fn<(t: string) => Promise<void>>().mockResolvedValue(undefined);
    expect(await shareOrCopy({ clipboard: { writeText } }, 't', 'tekst')).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('tekst');
    const bad = vi.fn<(t: string) => Promise<void>>().mockRejectedValue(new Error('odmowa'));
    expect(await shareOrCopy({ clipboard: { writeText: bad } }, 't', 'x')).toBe('error');
    expect(await shareOrCopy({}, 't', 'x')).toBe('error');
  });
  it('anulowanie okna udostępniania nie jest błędem', async () => {
    const share = vi.fn<() => Promise<void>>().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }));
    expect(await shareOrCopy({ share }, 't', 'x')).toBe('cancelled');
    expect(await shareOrCopy({ share: vi.fn<() => Promise<void>>().mockResolvedValue(undefined) }, 't', 'x')).toBe('shared');
  });
  it('przycisk ma aria-label i pole dotykowe ≥ 44 px', () => {
    const html = renderToString(<ShareFact place="Maszewo" card={card} link="/?u=3204033" />);
    expect(html).toContain('aria-label="Udostępnij tę kartę"');
    expect(html).toMatch(/min-h-\[44px\]/);
  });
});
