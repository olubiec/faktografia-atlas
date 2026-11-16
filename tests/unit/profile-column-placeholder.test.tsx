import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { renderToString } from 'react-dom/server';
import { findHardcodedColors } from '../../scripts/ci/color-rules.mjs';
import { ProfileColumnPlaceholder } from '@/view/map/ProfileColumnPlaceholder';

describe('ProfileColumnPlaceholder', () => {
  it('ma role="status" i tekst „Wczytywanie profilu”', () => {
    const html = renderToString(<ProfileColumnPlaceholder />);
    expect(html).toContain('role="status"');
    expect(html).toContain('Wczytywanie profilu');
  });

  it('pokazuje nazwę jednostki, gdy podana', () => {
    const html = renderToString(<ProfileColumnPlaceholder name="małopolskie" />);
    expect(html).toContain('małopolskie');
  });

  it('bez nazwy nie renderuje nagłówka', () => {
    const html = renderToString(<ProfileColumnPlaceholder name={null} />);
    expect(html).not.toContain('<h2');
  });

  it('wyłącza ruch przy prefers-reduced-motion', () => {
    const html = renderToString(<ProfileColumnPlaceholder />);
    expect(html).toContain('motion-reduce:animate-none');
  });

  it('nie ma kolorów wpisanych na sztywno', () => {
    const file = path.resolve(process.cwd(), 'src/view/map/ProfileColumnPlaceholder.tsx');
    const found = findHardcodedColors(file, fs.readFileSync(file, "utf8"));
    expect(found).toEqual([]);
  });
});
