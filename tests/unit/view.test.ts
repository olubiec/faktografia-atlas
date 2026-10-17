import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getAllTsxFiles(dirPath: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dirPath);
  list.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTsxFiles(fullPath));
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

describe('View Components Code Quality', () => {
  const viewDir = path.resolve('src/view');
  const files = getAllTsxFiles(viewDir);

  it('contains no arbitrary text-[...px] classes in src/view/**/*.tsx', () => {
    const textPxRegex = /text-\[\d+px\]/;
    const violations: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (textPxRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    });

    expect(violations).toEqual([]);
  });

  it('contains no hex colors in src/view/**/*.tsx', () => {
    const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/;
    const violations: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (hexColorRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    });

    expect(violations).toEqual([]);
  });
});
