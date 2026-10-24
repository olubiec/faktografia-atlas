import { describe, expect, it } from 'vitest';
import { SHARE_FORMATS, type ShareFormatKey } from '../../src/core/share/formats';

describe('SHARE_FORMATS', () => {
  it('definiuje dokładnie 4 formaty z poprawnymi identyfikatorami', () => {
    const keys = Object.keys(SHARE_FORMATS) as ShareFormatKey[];
    expect(keys).toEqual(['post', 'square', 'story', 'wide']);
  });

  it('ma dokładne wymiary dla każdego formatu', () => {
    expect(SHARE_FORMATS.post.width).toBe(1080);
    expect(SHARE_FORMATS.post.height).toBe(1350);

    expect(SHARE_FORMATS.square.width).toBe(1080);
    expect(SHARE_FORMATS.square.height).toBe(1080);

    expect(SHARE_FORMATS.story.width).toBe(1080);
    expect(SHARE_FORMATS.story.height).toBe(1920);

    expect(SHARE_FORMATS.wide.width).toBe(1600);
    expect(SHARE_FORMATS.wide.height).toBe(900);
  });

  it('posiada marginesy safe w obrębie każdego obrazka dla story', () => {
    const { safe, width, height } = SHARE_FORMATS.story;

    expect(safe.top).toBe(155);
    expect(safe.bottom).toBe(155);
    expect(safe.left).toBe(64);
    expect(safe.right).toBe(64);

    expect(safe.left + safe.right).toBeLessThan(width);
    expect(safe.top + safe.bottom).toBeLessThan(height);
  });

  it('posiada marginesy safe w obrębie każdego obrazka dla post, square, wide', () => {
    const keys: ShareFormatKey[] = ['post', 'square', 'wide'];
    for (const key of keys) {
      const format = SHARE_FORMATS[key];
      const { safe, width, height } = format;

      expect(safe.top).toBeGreaterThanOrEqual(64);
      expect(safe.bottom).toBeGreaterThanOrEqual(64);
      expect(safe.left).toBeGreaterThanOrEqual(64);
      expect(safe.right).toBeGreaterThanOrEqual(64);

      expect(safe.left + safe.right).toBeLessThan(width);
      expect(safe.top + safe.bottom).toBeLessThan(height);
    }
  });
});
