import { describe, it, expect } from 'vitest';
import { dismissReason } from '../../src/view/hooks/useMenuDismiss';

// Atrapy elementów: tylko `contains`, bo tyle potrzebuje czysta funkcja.
function el(children: unknown[] = []) {
  const self = { contains: (n: unknown) => n === self || children.includes(n) };
  return self;
}

describe('dismissReason (menu telefonu)', () => {
  const inside = {};
  const menuEl = el([inside]);
  const triggerEl = el();
  const els = { menuEl, triggerEl };

  it('Escape zamyka menu', () => {
    expect(dismissReason({ type: 'keydown', key: 'Escape', target: null }, els)).toBe('escape');
  });

  it('inny klawisz nie zamyka', () => {
    expect(dismissReason({ type: 'keydown', key: 'a', target: null }, els)).toBeNull();
    expect(dismissReason({ type: 'keydown', key: 'Enter', target: null }, els)).toBeNull();
  });

  it('dotknięcie w menu nie zamyka', () => {
    expect(dismissReason({ type: 'pointerdown', target: inside }, els)).toBeNull();
    expect(dismissReason({ type: 'pointerdown', target: menuEl }, els)).toBeNull();
  });

  it('dotknięcie w przycisk Menu nie zamyka (przycisk sam przełącza)', () => {
    expect(dismissReason({ type: 'pointerdown', target: triggerEl }, els)).toBeNull();
  });

  it('dotknięcie obok zamyka', () => {
    expect(dismissReason({ type: 'pointerdown', target: {} }, els)).toBe('outside');
  });

  it('brak elementów (przed montażem) nie zamyka dotknięciem', () => {
    expect(dismissReason({ type: 'pointerdown', target: {} }, { menuEl: null, triggerEl: null })).toBe('outside');
  });
});
