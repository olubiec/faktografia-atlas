import { describe, expect, it } from 'vitest';
import { freshnessFetchAllowed } from '../../src/core/freshness/freshness-label';

describe('freshnessFetchAllowed', () => {
  it.each(['/biblioteka', '/biblioteka/', '/biblioteka/101'])('false dla %s', (p) => {
    expect(freshnessFetchAllowed(p)).toBe(false);
  });
  it.each(['/', '/rankingi', '/o-projekcie', '/bibliotekarz'])('true dla %s', (p) => {
    expect(freshnessFetchAllowed(p)).toBe(true);
  });
});
