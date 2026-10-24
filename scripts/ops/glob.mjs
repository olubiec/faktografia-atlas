// Proste dopasowanie ścieżek do wzorców (bez pakietów).
// `**` = dowolna liczba katalogów, `*` = dowolne znaki poza `/`, `?` = jeden znak poza `/`.
// Wzorzec bez `/` i bez `**` (np. `*.mjs`) pasuje tylko do plików w katalogu głównym repo.

const cache = new Map();

export function globToRegExp(glob) {
  if (cache.has(glob)) return cache.get(glob);
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        // `**/` = zero lub więcej katalogów; `**` na końcu = wszystko
        if (glob[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  const out = new RegExp(`^${re}$`);
  cache.set(glob, out);
  return out;
}

export function matchesGlob(path, glob) {
  return globToRegExp(glob).test(path);
}

export function matchesAny(path, globs) {
  return globs.some((g) => matchesGlob(path, g));
}
