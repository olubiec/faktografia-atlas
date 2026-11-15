import { describe, it, expect } from 'vitest';
import { resolveKeyAction, type KeyLike } from '@/view/hooks/useKeyboardNavigation';

const key = (k: string, extra: Partial<KeyLike> = {}): KeyLike => ({
  key: k,
  code: '',
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  target: null,
  ...extra,
});

describe('resolveKeyAction', () => {
  it('+ przybliża, - oddala mapę', () => {
    expect(resolveKeyAction(key('+'))).toEqual({ type: 'zoom', delta: 1 });
    expect(resolveKeyAction(key('='))).toEqual({ type: 'zoom', delta: 1 });
    expect(resolveKeyAction(key('-'))).toEqual({ type: 'zoom', delta: -1 });
  });

  it('Escape zamyka profil lub okno', () => {
    expect(resolveKeyAction(key('Escape'))).toEqual({ type: 'close' });
  });

  it('Alt+1/2/3 zmienia szczebel woj/pow/gmi', () => {
    expect(resolveKeyAction(key('1', { altKey: true }))).toEqual({ type: 'level', level: 'woj' });
    expect(resolveKeyAction(key('2', { altKey: true }))).toEqual({ type: 'level', level: 'pow' });
    expect(resolveKeyAction(key('3', { altKey: true }))).toEqual({ type: 'level', level: 'gmi' });
    // Na układach, gdzie Alt zmienia znak, liczy się kod fizyczny klawisza.
    expect(resolveKeyAction(key('¡', { altKey: true, code: 'Digit1' }))).toEqual({ type: 'level', level: 'woj' });
  });

  it('cyfra bez Alt oraz Alt+4 nic nie robią', () => {
    expect(resolveKeyAction(key('1'))).toBeNull();
    expect(resolveKeyAction(key('4', { altKey: true }))).toBeNull();
  });

  it('+ z Ctrl lub Meta (zoom przeglądarki) jest pomijany', () => {
    expect(resolveKeyAction(key('+', { ctrlKey: true }))).toBeNull();
    expect(resolveKeyAction(key('-', { metaKey: true }))).toBeNull();
  });

  it('skróty są ignorowane, gdy fokus jest w polu tekstowym', () => {
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT']) {
      const target = { tagName: tag, isContentEditable: false };
      expect(resolveKeyAction(key('+', { target }))).toBeNull();
      expect(resolveKeyAction(key('1', { altKey: true, target }))).toBeNull();
      expect(resolveKeyAction(key('Escape', { target }))).toBeNull();
    }
    expect(resolveKeyAction(key('-', { target: { tagName: 'DIV', isContentEditable: true } }))).toBeNull();
    expect(resolveKeyAction(key('-', { target: { tagName: 'BUTTON', isContentEditable: false } }))).toEqual({
      type: 'zoom',
      delta: -1,
    });
  });
});
