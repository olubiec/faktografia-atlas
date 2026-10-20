import { describe, it, expect } from 'vitest';
import { findHardcodedColors } from '../../scripts/ci/color-rules.mjs';

describe('color-rules (findHardcodedColors)', () => {
  describe('wykrywa kolory wpisane na sztywno', () => {
    it('wykrywa hexy 3-, 6- i 8-cyfrowe (#abc, #aabbcc, #aabbccdd)', () => {
      const text = `
        const c1 = '#abc';
        const c2 = '#aabbcc';
        const c3 = '#aabbccdd';
      `;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toHaveLength(3);
      expect(res[0]).toEqual({ line: 2, match: '#abc' });
      expect(res[1]).toEqual({ line: 3, match: '#aabbcc' });
      expect(res[2]).toEqual({ line: 4, match: '#aabbccdd' });
    });

    it('wykrywa funkcje rgb(, rgba(, hsl(, hsla( z liczbami w środku', () => {
      const text = `
        const c1 = 'rgb(255, 0, 0)';
        const c2 = 'rgba(0, 0, 0, 0.5)';
        const c3 = 'hsl(120, 100%, 50%)';
        const c4 = 'hsla(120, 100%, 50%, 0.3)';
      `;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toHaveLength(4);
      expect(res[0].match).toBe('rgb(255, 0, 0)');
      expect(res[1].match).toBe('rgba(0, 0, 0, 0.5)');
      expect(res[2].match).toBe('hsl(120, 100%, 50%)');
      expect(res[3].match).toBe('hsla(120, 100%, 50%, 0.3)');
    });

    it('wykrywa klasy Tailwind z dowolną wartością -[#...] oraz -[rgb...]', () => {
      const text = `
        const cls1 = 'bg-[#123456]';
        const cls2 = 'text-[#abc]';
        const cls3 = '-[rgb(255,0,0)]';
      `;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toHaveLength(3);
      expect(res[0].match).toBe('bg-[#123456]');
      expect(res[1].match).toBe('text-[#abc]');
      expect(res[2].match).toBe('-[rgb(255,0,0)]');
    });

    it('wykrywa tablicę 3–4 liczb we właściwości o nazwie kończącej się na Color/color', () => {
      const text = `
        const p1 = { getFillColor: [200, 10, 10] };
        const p2 = { getLineColor: () => [0, 0, 0, 255] };
        const p3 = { color: [255, 255, 255] };
      `;
      const res = findHardcodedColors('src/view/layer.ts', text);
      expect(res).toHaveLength(3);
      expect(res[0].match).toBe('getFillColor: [200, 10, 10]');
      expect(res[1].match).toBe('getLineColor: () => [0, 0, 0, 255]');
      expect(res[2].match).toBe('color: [255, 255, 255]');
    });

    it('dostaje dokładnie 3 trafienia dla danych testowych w trzech formach (klasa, CSS, getFillColor)', () => {
      const text = `
        const className = 'bg-[#123456]';
        const css = 'color: #E3242B;';
        const deckProps = { getFillColor: [200, 10, 10] };
      `;
      const res = findHardcodedColors('src/view/example.tsx', text);
      expect(res).toHaveLength(3);
      expect(res[0].line).toBe(2);
      expect(res[1].line).toBe(3);
      expect(res[2].line).toBe(4);
    });
  });

  describe('nie wykrywa prawidłowych konstrukcji i dozwolonych przypadków', () => {
    it('nie wykrywa szablonu z tokenów rgb(${c[0]}, ${c[1]}, ${c[2]})', () => {
      const text = `const kalkaRgb = c ? \`rgb(\${c[0]}, \${c[1]}, \${c[2]})\` : tokensJson.color.light.kalka;`;
      const res = findHardcodedColors('src/view/map/AtlasMap.tsx', text);
      expect(res).toEqual([]);
    });

    it('nie wykrywa zmiennych CSS var(--kalka)', () => {
      const text = `const style = { backgroundColor: 'var(--kalka)', color: 'var(--tusz)' };`;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toEqual([]);
    });

    it('nie wykrywa kolorów w komentarzach // oraz /* ... */', () => {
      const text = `
        // const old = '#E3242B';
        /*
          bg-[#123456]
          getFillColor: [255, 0, 0]
        */
      `;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toEqual([]);
    });

    it('nie wykrywa kotwic i selektorów (#main, #footnote-1, #u=1217011, #i=60559, #y=2023)', () => {
      const text = `
        const anchor = '#main';
        const footnote = '#footnote-1';
        const urlParam1 = '#u=1217011';
        const urlParam2 = '#i=60559';
        const urlParam3 = '#y=2023';
        const terytCode = '#1217011';
      `;
      const res = findHardcodedColors('src/view/component.tsx', text);
      expect(res).toEqual([]);
    });

    it('zwraca pustą tablicę dla plików dozwolonych oraz ścieżek z katalogu tests/', () => {
      const text = `const hardcoded = '#E3242B';`;
      expect(findHardcodedColors('config/tokens.json', text)).toEqual([]);
      expect(findHardcodedColors('src/styles/tokens.css', text)).toEqual([]);
      expect(findHardcodedColors('scripts/tokens.mjs', text)).toEqual([]);
      expect(findHardcodedColors('tests/unit/some.test.ts', text)).toEqual([]);
    });
  });
});
