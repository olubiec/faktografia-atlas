import { describe, expect, it } from 'vitest';
import { createDeferQueue } from '../../src/core/map/defer-queue';

// Sztuczny timer: wykonujemy zaległe odliczanie ręcznie, bez prawdziwego czasu.
function setup() {
  let cb: (() => void) | null = null;
  let started = 0;
  const q = createDeferQueue({
    settleMs: 120,
    setTimer: (fn) => {
      cb = fn;
      started++;
      return started;
    },
    clearTimer: () => {
      cb = null;
    },
  });
  return { q, fire: () => cb?.(), armed: () => cb !== null };
}

describe('kolejka odroczeń (PM01)', () => {
  it('bez ruchu zadanie wykonuje się od razu', () => {
    const { q } = setup();
    const out: string[] = [];
    q.run('a', () => out.push('a'));
    expect(out).toEqual(['a']);
  });
  it('w ruchu czekają; po ustaniu wykonują się raz, w kolejności zgłoszenia', () => {
    const { q, fire } = setup();
    const out: string[] = [];
    q.setMoving(true);
    q.run('a', () => out.push('a'));
    q.run('b', () => out.push('b'));
    expect(q.pending()).toBe(2);
    q.setMoving(false);
    expect(out).toEqual([]);
    fire();
    expect(out).toEqual(['a', 'b']);
    expect(q.pending()).toBe(0);
  });
  it('to samo zadanie pod jednym kluczem: wykona się tylko ostatnie', () => {
    const { q, fire } = setup();
    const out: number[] = [];
    q.setMoving(true);
    q.run('k', () => out.push(1));
    q.run('k', () => out.push(2));
    expect(q.pending()).toBe(1);
    q.setMoving(false);
    fire();
    expect(out).toEqual([2]);
  });
  it('ruch w trakcie odliczania anuluje wykonanie; kolejny koniec ruchu wznawia', () => {
    const { q, fire, armed } = setup();
    const out: string[] = [];
    q.setMoving(true);
    q.run('a', () => out.push('a'));
    q.setMoving(false);
    expect(armed()).toBe(true);
    q.setMoving(true);
    expect(armed()).toBe(false);
    expect(out).toEqual([]);
    q.setMoving(false);
    fire();
    expect(out).toEqual(['a']);
  });
  it('wyjątek w zadaniu nie zatrzymuje następnych', () => {
    const { q, fire } = setup();
    const out: string[] = [];
    q.setMoving(true);
    q.run('a', () => {
      throw new Error('boom');
    });
    q.run('b', () => out.push('b'));
    q.setMoving(false);
    fire();
    expect(out).toEqual(['b']);
  });
});
