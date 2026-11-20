import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AddToMineButton, STATUS_MS } from '../../src/view/library/AddToMineButton';

const mineButtonView = AddToMineButton.view;
const runMineAction = AddToMineButton.run;

describe('AddToMineButton: logika przycisku (@S21)', () => {
  it('niedodany: etykieta dodawania, aria-pressed=false, komunikat „Dodano”', () => {
    const v = mineButtonView(false, 'X');
    expect(v.ariaLabel).toBe('Dodaj do Moich wskaźników: X');
    expect(v.pressed).toBe(false);
    expect(v.text).toBe('+ Dodaj do Moich wskaźników');
    expect(v.statusAfterClick).toBe('Dodano do Moich wskaźników');
  });

  it('dodany: etykieta usuwania, aria-pressed=true, komunikat „Usunięto”', () => {
    const v = mineButtonView(true, 'X');
    expect(v.ariaLabel).toBe('Usuń z Moich wskaźników: X');
    expect(v.pressed).toBe(true);
    expect(v.text).toBe('Dodano do Moich · usuń');
    expect(v.statusAfterClick).toBe('Usunięto z Moich wskaźników');
  });

  it('akcja: niedodany wywołuje add, dodany wywołuje remove', () => {
    const add = vi.fn<(id: string) => void>();
    const remove = vi.fn<(id: string) => void>();
    runMineAction(false, 'a', { add, remove });
    expect(add).toHaveBeenCalledWith('a');
    expect(remove).not.toHaveBeenCalled();
    runMineAction(true, 'b', { add, remove });
    expect(remove).toHaveBeenCalledWith('b');
    expect(add).toHaveBeenCalledTimes(1);
  });

  it('czas komunikatu to 3000 ms', () => {
    expect(STATUS_MS).toBe(3000);
  });

  it('render początkowy: przycisk z etykietą i pusty region role="status"', () => {
    const html = renderToString(<AddToMineButton varId="1" name="X" />);
    expect(html).toContain('Dodaj do Moich wskaźników: X');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toMatch(/<span role="status"[^>]*><\/span>/);
  });
});
