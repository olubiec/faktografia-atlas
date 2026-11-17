import { describe, expect, it } from 'vitest';
import { homeSearch } from '../../src/core/url/home';

describe('adres strony głównej po kliknięciu w logo (FIX3)', () => {
  it('usuwa wybraną jednostkę, wskaźnik, rok, poziom i porównanie', () => {
    expect(homeSearch('?u=12&i=density&y=2023&l=pow&c=12,14')).toBe('');
  });
  it('zachowuje tryb testowy i wariant logo', () => {
    expect(homeSearch('?e2e&u=12')).toBe('?e2e');
    expect(homeSearch('?u=12&logo=znak&e2e')).toBe('?e2e&logo=znak');
  });
  it('pusty adres zostaje pusty', () => {
    expect(homeSearch('')).toBe('');
  });
});
