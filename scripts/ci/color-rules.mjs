// Skrypt weryfikacji zasad użycia kolorów z tokenów
// Blokuje kolory wpisane na sztywno w kodzie w katalogu src/

const ALLOWED_FILES = new Set([
  'config/tokens.json',
  'src/styles/tokens.css',
  'scripts/tokens.mjs',
]);

/**
 * Sprawdza, czy plik jest na liście dozwolonych plików zawierających surowe wartości kolorów.
 */
export function isAllowedFile(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/').replace(/^\.\//, '');

  if (ALLOWED_FILES.has(normalized)) return true;

  if (
    normalized.startsWith('tests/') ||
    normalized.includes('/tests/') ||
    normalized.endsWith('config/tokens.json') ||
    normalized.endsWith('src/styles/tokens.css') ||
    normalized.endsWith('scripts/tokens.mjs')
  ) {
    return true;
  }

  return false;
}

/**
 * Usuwa komentarze (jednoliniowe // i wieloliniowe /* ... *\/), zachowując strukturę linii
 * i długość znaków.
 */
export function stripComments(text) {
  const chars = text.split('');
  let mode = 'code';

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];

    if (mode === 'code') {
      if (c === '/' && next === '/') {
        mode = 'line_comment';
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
      } else if (c === '/' && next === '*') {
        mode = 'block_comment';
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
      } else if (c === "'") {
        mode = 'single';
      } else if (c === '"') {
        mode = 'double';
      } else if (c === '`') {
        mode = 'template';
      }
    } else if (mode === 'single') {
      if (c === '\\') {
        i++;
      } else if (c === "'") {
        mode = 'code';
      }
    } else if (mode === 'double') {
      if (c === '\\') {
        i++;
      } else if (c === '"') {
        mode = 'code';
      }
    } else if (mode === 'template') {
      if (c === '\\') {
        i++;
      } else if (c === '`') {
        mode = 'code';
      }
    } else if (mode === 'line_comment') {
      if (c === '\n') {
        mode = 'code';
      } else {
        chars[i] = ' ';
      }
    } else if (mode === 'block_comment') {
      if (c === '*' && next === '/') {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i++;
        mode = 'code';
      } else if (c !== '\n') {
        chars[i] = ' ';
      }
    }
  }
  return chars.join('');
}

/**
 * Szuka kolorów wpisanych na sztywno w podanym pliku i jego treści.
 * Zwraca tablicę obiektów { line: numer_linii, match: dopasowany_fragment }.
 */
export function findHardcodedColors(filePath, text) {
  if (isAllowedFile(filePath)) {
    return [];
  }

  const cleanedText = stripComments(text);
  const lines = cleanedText.split('\n');
  const results = [];

  for (let l = 0; l < lines.length; l++) {
    const lineNum = l + 1;
    const lineText = lines[l];
    const masked = new Array(lineText.length).fill(false);

    const checkRegex = (regex, extractMatchFn) => {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(lineText)) !== null) {
        const fullMatch = m[0];
        const matchStr = extractMatchFn ? extractMatchFn(m) : fullMatch;
        if (!matchStr) continue;

        const matchIndex = m.index + fullMatch.indexOf(matchStr);
        const matchLength = matchStr.length;

        let isMasked = false;
        for (let i = matchIndex; i < matchIndex + matchLength; i++) {
          if (masked[i]) {
            isMasked = true;
            break;
          }
        }

        if (!isMasked) {
          for (let i = matchIndex; i < matchIndex + matchLength; i++) {
            masked[i] = true;
          }
          results.push({ line: lineNum, match: matchStr });
        }
      }
    };

    // 1. Klasy Tailwind -[#...] i -[rgb...]
    const tailwindRegex = /(?:^|[\s"'`])([\w:-]*-\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?)\([^\]]*\))\])/g;
    checkRegex(tailwindRegex, (m) => m[1]);

    // 2. Tablica liczb we właściwości o nazwie kończącej się na Color / color
    const colorPropRegex = /(\b\w*color\s*:\s*(?:\([^)]*\)\s*=>\s*|function\s*\([^)]*\)\s*\{?\s*return\s*)?\[\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\])/gi;
    checkRegex(colorPropRegex, (m) => m[1]);

    // 3. Funkcje kolorów rgb(, rgba(, hsl(, hsla( z liczbami
    const colorFuncRegex = /\b(rgba?|hsla?)\s*\(([^)]*)\)/gi;
    checkRegex(colorFuncRegex, (m) => {
      const args = m[2];
      const argsClean = args.replace(/\$\{[^}]*\}/g, '');
      if (/\d/.test(argsClean)) {
        return m[0];
      }
      return null;
    });

    // 4. Hex kolory w kodzie (#abc, #aabbcc, #aabbccdd)
    const hexRegex = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;
    checkRegex(hexRegex, (m) => m[0]);
  }

  return results;
}
