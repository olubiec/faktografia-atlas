import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { OrderButton } from '../../src/view/library/OrderButton';
import { orderIssueUrl } from '../../src/core/library/order';
import type { LibraryVariable } from '../../src/core/library/query';

describe('OrderButton Unit Tests (@S21)', () => {
  const sampleVariable: LibraryVariable = {
    id: '60559',
    name: 'Gęstość zaludnienia os./km²',
    cat: 'Ludność > Demografia',
    level: 5,
  };

  it('generuje adres URL zgodny z orderIssueUrl', () => {
    const expectedUrl = orderIssueUrl({
      id: sampleVariable.id,
      name: sampleVariable.name,
      categoryPath: 'Ludność > Demografia',
      level: '5',
    });

    const html = renderToString(<OrderButton variable={sampleVariable} />);
    expect(html).toContain(`href="${expectedUrl.replace(/&/g, '&amp;')}"`);
  });

  it('ustawia rel="noopener noreferrer" oraz target="_blank"', () => {
    const html = renderToString(<OrderButton variable={sampleVariable} />);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('wyświetla widoczny tekst informacji o zgłoszeniu na GitHubie', () => {
    const html = renderToString(<OrderButton variable={sampleVariable} />);
    const expectedInfoText =
      'Otworzy się zgłoszenie na GitHubie (wymaga konta). Nic nie wysyłamy bez Twojej zgody. Zgłoszenie dostanie etykietę dopiero po sprawdzeniu przez nas (osoby bez uprawnień nie mogą jej ustawić).';
    expect(html).toContain(expectedInfoText);
    expect(html).toContain('Zamów ten wskaźnik');
  });

  it('zapewnia pole dotykowe o wysokości min. 44 px (min-h-[44px])', () => {
    const html = renderToString(<OrderButton variable={sampleVariable} />);
    expect(html).toContain('min-h-[44px]');
  });

  it('nie zawiera kodów kolorów pisanych na sztywno (używa tokenów)', () => {
    const html = renderToString(<OrderButton variable={sampleVariable} />);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});
