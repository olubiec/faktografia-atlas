import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DataFreshness } from '../../src/view/layout/DataFreshness';
import type { DataStatus } from '../../src/core/data/load-status';

const now = new Date('2026-11-19T10:00:00Z');
const status = (checkedAt: string | null): DataStatus => ({ version: 1, checkedAt, values: null, library: null });
const text = (html: string) => html.replace(/<[^>]+>/g, '');

describe('DataFreshness (PU01)', () => {
  it('pokazuje datę danych i świeże sprawdzenie automatu', () => {
    const html = renderToString(<DataFreshness fetchedAt="2026-10-19T03:00:00Z" status={status('2026-11-18T03:00:00Z')} now={now} />);
    expect(text(html)).toContain('Dane z 19.10.2026');
    expect(text(html)).toContain('Sprawdzone przez automat: wczoraj');
    expect(html).not.toContain('role="status"');
  });
  it('bez statusu pokazuje tylko pierwszy człon', () => {
    const html = text(renderToString(<DataFreshness fetchedAt="2026-10-19T03:00:00Z" now={now} />));
    expect(html).toBe('Dane z 19.10.2026');
  });
  it('sprawdzenie sprzed 5 dni: słowo „uwaga” i role="status"', () => {
    const html = renderToString(<DataFreshness fetchedAt="2026-10-19T03:00:00Z" status={status('2026-11-14T03:00:00Z')} now={now} />);
    expect(text(html)).toContain('Uwaga');
    expect(html).toContain('role="status"');
  });
  it('bez żadnych dat nic nie renderuje', () => {
    expect(renderToString(<DataFreshness now={now} />)).toBe('');
    expect(renderToString(<DataFreshness status={status(null)} now={now} />)).toBe('');
  });
  it('bez wartości na sztywno w klasach', () => {
    const html = renderToString(<DataFreshness fetchedAt="2026-10-19T03:00:00Z" now={now} className="mt-2" />);
    expect(html).not.toMatch(/#[0-9a-f]{3,6}|\[\d+px\]|rgb\(/i);
  });
});
