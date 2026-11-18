import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Privacy } from '../../src/view/pages/Privacy';
import { MY_INDICATORS_KEY, saveMyIndicators } from '../../src/core/my-indicators/storage';

// Wiąże tekst strony Prywatność z prawdziwym kluczem (brakujący test 3 z QC510).
function renderPrivacy(): string {
  return renderToString(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>,
  );
}

describe('Prywatność: klucz „Moje wskaźniki” zgodny z kodem (PF06)', () => {
  it('strona zawiera klucz z eksportu MY_INDICATORS_KEY w elemencie <code>', () => {
    expect(renderPrivacy()).toContain(`>${MY_INDICATORS_KEY}</code>`);
  });

  it('strona zawiera zdanie o niewysyłaniu listy', () => {
    expect(renderPrivacy()).toContain('nie wysyłamy');
  });

  it('klucz nie jest pusty i ma prefiks faktografia-', () => {
    expect(MY_INDICATORS_KEY.length).toBeGreaterThan(0);
    expect(MY_INDICATORS_KEY.startsWith('faktografia-')).toBe(true);
  });

  it('klucz zapisywany przez saveMyIndicators jest tym samym, który podaje strona', () => {
    const keys: string[] = [];
    const storage = {
      getItem: () => null,
      setItem: (key: string) => {
        keys.push(key);
      },
    };
    saveMyIndicators(['101'], storage);
    expect(keys).toHaveLength(1);
    expect(renderPrivacy()).toContain(`>${keys[0]}</code>`);
  });
});
