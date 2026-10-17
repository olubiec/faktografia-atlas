import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function checkForHtmlInTooltip(content: string): boolean {
  // Matches getTooltip followed by returning an object containing html property
  // e.g. getTooltip = (...) => ({ html: ... }) or getTooltip: (...) => { return { html: ... } }
  const getTooltipHtmlRegex = /getTooltip[\s\S]*?\bhtml\s*:/;
  return getTooltipHtmlRegex.test(content);
}

function getAllSourceFiles(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;

  const list = fs.readdirSync(dirPath);
  list.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

describe('No HTML Tooltip Security Enforcement', () => {
  it('detects getTooltip returning html in sample violating code string', () => {
    const invalidCodeSample = `
      const layer = new GeoJsonLayer({
        id: 'test',
        getTooltip: ({ object }) => ({
          html: \`<div>\${object.name}</div>\`
        })
      });
    `;
    expect(checkForHtmlInTooltip(invalidCodeSample)).toBe(true);
  });

  it('allows getTooltip returning text or plain object without html property', () => {
    const validCodeSample = `
      const layer = new GeoJsonLayer({
        id: 'test',
        getTooltip: ({ object }) => ({
          text: object.name
        })
      });
    `;
    expect(checkForHtmlInTooltip(validCodeSample)).toBe(false);
  });

  it('ensures no file in src/ contains getTooltip returning html property', () => {
    const srcDir = path.resolve('src');
    const files = getAllSourceFiles(srcDir);
    const violations: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (checkForHtmlInTooltip(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    });

    expect(violations).toEqual([]);
  });
});
