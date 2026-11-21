import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// C09: strażnik wytycznych STYL (§5, §12) w kodzie widoków. Każda reguła to czysta funkcja
// sprawdzona na sztucznym wejściu (musi zawieść) i na prawdziwych plikach.

type Hit = { line: number; text: string };

/** Usuwa komentarze, zostawiając numery wierszy. */
function strip(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .split('\n')
    .map((l) => l.replace(/^\s*\/\/.*$/, ''))
    .join('\n');
}

/** Szuka wzorca tylko wewnątrz literałów tekstowych ("...", '...', `...`): zmienna o nazwie `rounded` nie jest klasą. */
function scan(src: string, re: RegExp): Hit[] {
  const code = strip(src);
  const out: Hit[] = [];
  for (const lit of code.matchAll(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g)) {
    const start = lit.index ?? 0;
    for (const m of lit[0].matchAll(re)) {
      const line = code.slice(0, start + (m.index ?? 0)).split('\n').length;
      out.push({ line, text: m[0] });
    }
  }
  return out;
}

const CLASS_TAIL = String.raw`(?:-[\w\[\]./%-]+)?(?![\w-])`;
/** `rounded`, `rounded-xl`, `rounded-[3px]` itd. Dozwolone tylko `rounded-none` (promień 0). */
const findRounded = (src: string) =>
  scan(src, new RegExp(String.raw`(?<![\w-])(?:[\w-]+:)*rounded${CLASS_TAIL}`, 'g')).filter((h) => !/rounded-none$/.test(h.text));
/** `shadow`, `shadow-md`, `drop-shadow-*`. Dozwolone tylko `shadow-none`. */
const findShadow = (src: string) =>
  scan(src, new RegExp(String.raw`(?<![\w-])(?:[\w-]+:)*(?:drop-)?shadow${CLASS_TAIL}`, 'g')).filter((h) => !/shadow-none$/.test(h.text));
const findBlur = (src: string) => scan(src, new RegExp(String.raw`(?<![\w-])(?:[\w-]+:)*backdrop-blur${CLASS_TAIL}`, 'g'));
/** Odwołania do dawnej Biblioteki: ścieżka `/biblioteka`. */
const findLibraryRefs = (src: string) => scan(src, /\/biblioteka(?![\w-])/g);
/** Nazwy plików logo (faktografia-logo/znak/favicon) razem ze ścieżką. */
const findLogoRefs = (src: string) => scan(src, /[\w./-]*faktografia-(?:logo|znak|favicon)[\w-]*\.(?:svg|png)/g);

function files(dir: string, exts = ['.ts', '.tsx', '.css']): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...files(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p.split('\\').join('/'));
  }
  return out;
}

const VIEW = files('src/view');
const UI = files('src/components/ui');
const ALL_SRC = files('src');
const read = (p: string) => readFileSync(p, 'utf8');
const where = (rule: (s: string) => Hit[], list: string[]) =>
  list.flatMap((f) => rule(read(f)).map((h) => `${f}:${h.line} ${h.text}`));

describe('C09: reguły na sztucznym wejściu (muszą zawieść)', () => {
  it('rounded: łapie warianty, przepuszcza rounded-none', () => {
    expect(findRounded('<div className="rounded-xl" />')).toHaveLength(1);
    expect(findRounded('<div className="rounded" />')).toHaveLength(1);
    expect(findRounded('<div className="md:rounded-[3px]" />')).toHaveLength(1);
    expect(findRounded('<div className="rounded-none border" />')).toHaveLength(0);
    expect(findRounded('// rounded-xl w komentarzu')).toHaveLength(0);
    expect(findRounded('const rounded = Math.round(x);')).toHaveLength(0);
  });
  it('shadow: łapie warianty, przepuszcza shadow-none', () => {
    expect(findShadow('"shadow-md"')).toHaveLength(1);
    expect(findShadow('"hover:shadow-lg"')).toHaveLength(1);
    expect(findShadow('"drop-shadow-xl"')).toHaveLength(1);
    expect(findShadow('"shadow-none"')).toHaveLength(0);
  });
  it('backdrop-blur: łapie każdy wariant', () => {
    expect(findBlur('"backdrop-blur-sm"')).toHaveLength(1);
    expect(findBlur('"backdrop-blur"')).toHaveLength(1);
    expect(findBlur('"bg-arkusz"')).toHaveLength(0);
  });
  it('/biblioteka: łapie link i literał, nie łapie innych adresów', () => {
    expect(findLibraryRefs('<Link to={`/biblioteka/${id}`} />')).toHaveLength(1);
    expect(findLibraryRefs("navigate('/biblioteka')")).toHaveLength(1);
    expect(findLibraryRefs("'/mapa?menu=dane'")).toHaveLength(0);
  });
  it('logo: wykrywa ścieżkę spoza /brand/', () => {
    const bad = findLogoRefs('src="/img/faktografia-logo-granat.svg"');
    expect(bad).toHaveLength(1);
    expect(bad[0].text.includes('/brand/')).toBe(false);
    expect(findLogoRefs('src="/brand/faktografia-logo-granat.svg"')[0].text).toContain('/brand/');
  });
});

describe('C09: wytyczne STYL w kodzie', () => {
  it('src/view: brak rounded-* (poza rounded-none)', () => {
    expect(where(findRounded, VIEW)).toEqual([]);
  });
  it('src/view: brak shadow-* (poza shadow-none)', () => {
    expect(where(findShadow, VIEW)).toEqual([]);
  });
  it('src/view: brak backdrop-blur', () => {
    expect(where(findBlur, VIEW)).toEqual([]);
  });
  it('src/components/ui (po shadcn add): brak rounded-*, shadow-*, backdrop-blur', () => {
    expect(UI.length).toBeGreaterThan(0);
    expect([...where(findRounded, UI), ...where(findShadow, UI), ...where(findBlur, UI)]).toEqual([]);
  });
  it('brak odwołań do /biblioteka poza App.tsx i src/core/url/legacy-links.ts', () => {
    const allowed = ['src/App.tsx', 'src/core/url/legacy-links.ts'];
    expect(where(findLibraryRefs, ALL_SRC.filter((f) => !allowed.includes(f)))).toEqual([]);
  });
  it('logo tylko z /brand/ i tylko istniejące pliki', () => {
    const bad: string[] = [];
    for (const f of ALL_SRC) {
      for (const h of findLogoRefs(read(f))) {
        const m = h.text.match(/(?:^|\/)brand\/([^/]+)$/);
        if (!m || !existsSync(join('public/brand', m[1]))) bad.push(`${f}:${h.line} ${h.text}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
