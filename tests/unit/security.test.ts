import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Vercel Security Headers', () => {
  it('vercel.json contains required security headers', () => {
    const vercelJsonPath = path.resolve('vercel.json');
    const content = fs.readFileSync(vercelJsonPath, 'utf-8');
    const json = JSON.parse(content);

    expect(json).toHaveProperty('headers');
    const globalHeaderRule = json.headers.find((rule: any) => rule.source === '/(.*)');
    expect(globalHeaderRule).toBeDefined();

    const headerKeys = globalHeaderRule.headers.map((h: any) => h.key);
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Strict-Transport-Security',
    ];

    requiredHeaders.forEach((header) => {
      expect(headerKeys).toContain(header);
    });
  });
});
