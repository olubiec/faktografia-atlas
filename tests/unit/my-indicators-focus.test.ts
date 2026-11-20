import { describe, it, expect } from 'vitest';
import { focusAfterChange } from '../../src/view/pages/myIndicatorsFocus';

describe('Moje wskaźniki: dokąd trafia fokus po zmianie', () => {
  it('po przesunięciu fokus zostaje na tym samym przycisku', () => {
    expect(focusAfterChange(['a', 'b', 'c'], 'a', 'down')).toEqual({ id: 'a', control: 'down' });
    expect(focusAfterChange(['a', 'b', 'c'], 'c', 'up')).toEqual({ id: 'c', control: 'up' });
  });

  it('na krawędzi, gdy przycisk się wyłączy, fokus idzie na przeciwny', () => {
    expect(focusAfterChange(['a', 'b'], 'b', 'up')).toEqual({ id: 'b', control: 'down' });
    expect(focusAfterChange(['a', 'b'], 'a', 'down')).toEqual({ id: 'a', control: 'up' });
  });

  it('po usunięciu fokus idzie na × następnego, a ostatniego – poprzedniego', () => {
    expect(focusAfterChange(['a', 'b', 'c'], 'b', 'remove')).toEqual({ id: 'c', control: 'remove' });
    expect(focusAfterChange(['a', 'b', 'c'], 'c', 'remove')).toEqual({ id: 'b', control: 'remove' });
  });

  it('po usunięciu jedynego wiersza fokus idzie na „+ Dodaj wskaźnik”', () => {
    expect(focusAfterChange(['a'], 'a', 'remove')).toBe('add');
  });
});
