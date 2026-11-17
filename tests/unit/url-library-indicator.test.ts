import { describe, it, expect, afterEach, vi } from 'vitest';
import { readUrlState, writeUrlState } from '../../src/core/url/state';

describe('Adres przyjmuje wskaźnik z biblioteki (QC605)', () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    if (originalWindow !== undefined) {
      (globalThis as any).window = originalWindow;
    } else {
      delete (globalThis as any).window;
    }
  });

  it('przyjmuje ?i=b60614', () => {
    expect(readUrlState('?i=b60614').i).toBe('b60614');
  });

  it.each(['?i=bxyz', '?i=b', '?i=B60614', '?i=nie-ma'])(
    'odrzuca nieprawidłowy kształt %s',
    (search) => {
      expect(readUrlState(search).i).toBeUndefined();
    }
  );

  it('główny wskaźnik działa bez zmian', () => {
    expect(readUrlState('?i=density').i).toBe('density');
  });

  it('isKnownIndicator nadpisuje regułę: false odrzuca, true przyjmuje', () => {
    expect(readUrlState('?i=b60614', undefined, () => false).i).toBeUndefined();
    expect(readUrlState('?i=b60614', undefined, () => true).i).toBe('b60614');
  });

  it('isKnownIndicator dostaje identyfikator z adresu', () => {
    const known = vi.fn<(id: string) => boolean>(() => true);
    readUrlState('?i=b60614', undefined, known);
    expect(known).toHaveBeenCalledWith('b60614');
  });

  it('writeUrlState zapisuje ?i=b60614', () => {
    const replaceState = vi.fn<(data: unknown, unused: string, url?: string) => void>();
    (globalThis as any).window = {
      location: new URL('http://localhost/?e2e=1'),
      history: { replaceState },
    };
    writeUrlState({ i: 'b60614' });
    expect(replaceState).toHaveBeenCalledWith(null, '', 'http://localhost/?e2e=1&i=b60614');
  });

  it('okrągłość: odczyt zapisanego daje ten sam stan', () => {
    const replaceState = vi.fn<(data: unknown, unused: string, url?: string) => void>();
    (globalThis as any).window = {
      location: new URL('http://localhost/'),
      history: { replaceState },
    };
    writeUrlState({ i: 'b60614', y: 2022, l: 'pow' });
    const written = new URL(replaceState.mock.calls[0][2] as string);
    expect(readUrlState(written.search)).toEqual({ i: 'b60614', y: 2022, l: 'pow' });
  });
});
