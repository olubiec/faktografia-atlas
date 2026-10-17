import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tokens CSS Generation', () => {
  let cssContent = '';
  let tokens = null;

  beforeAll(() => {
    // Generujemy na świeżo, by mieć pewność
    const cssPath = path.resolve('src/styles/tokens.css');
    cssContent = fs.readFileSync(cssPath, 'utf-8');

    const tokensPath = path.resolve('config/tokens.json');
    tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
  });

  const kebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

  it('contains all light theme colors', () => {
    Object.keys(tokens.color.light).forEach(key => {
      const varName = `--${kebabCase(key)}`;
      expect(cssContent).toContain(varName);
    });
  });

  it('contains all dark theme colors in the dark scope', () => {
    const darkSection = cssContent.split('data-theme="dark"')[1];
    expect(darkSection).toBeDefined();

    Object.keys(tokens.color.dark).forEach(key => {
      const varName = `--${kebabCase(key)}`;
      expect(darkSection).toContain(varName);
    });
  });

  it('contains the prefers-reduced-motion block with 0ms motion', () => {
    const motionSection = cssContent.split('prefers-reduced-motion')[1];
    expect(motionSection).toBeDefined();
    expect(motionSection).toContain('--motion-fast: 0ms;');
    expect(motionSection).toContain('--motion-base: 0ms;');
    expect(motionSection).toContain('--motion-slow: 0ms;');
  });
});
