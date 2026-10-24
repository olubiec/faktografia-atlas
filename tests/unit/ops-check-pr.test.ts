import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { evaluatePr } from '../../scripts/ops/check-pr.mjs';
import { matchesGlob } from '../../scripts/ops/glob.mjs';

// Nagrane odpowiedzi API prawdziwych PR-ów (tests/fixtures/ops) – dobre (#219, #212) i złe (#210, #215, #217).
const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
const settings = queue.settings;
const task = (id: string) => queue.tasks.find((t: { id: string }) => t.id === id);
const load = (n: number) => JSON.parse(readFileSync(`tests/fixtures/ops/pr-${n}.json`, 'utf8'));
const NOW = Date.parse('2026-10-24T12:00:00Z');
const green = settings.requiredChecks.map((name: string) => ({ name, status: 'completed', conclusion: 'success' }));

/** PR „na żywo”: otwarty, bez konfliktu, zielone CI, ostatni commit dawno. */
function live(n: number, patch: Record<string, unknown> = {}) {
  const d = load(n);
  d.pr = { ...d.pr, state: 'open', draft: false, mergeable: true, head: { ...d.pr.head, repo: { full_name: settings.repo } } };
  d.checkRuns = green;
  return { ...d, ...patch };
}

const W14 = {
  id: 'W1.4', files: [{ path: 'src/core/map/camera.ts', mode: 'new' }, { path: 'tests/unit/camera.test.ts', mode: 'new' }, { path: 'config/tokens.json', mode: 'change' }],
  testsAppend: [], testsChange: [], allowFixme: [], deletions: [], packages: { remove: [], add: [] }, snapshots: false,
};
const W17 = { ...W14, id: 'W1.7', files: [{ path: 'src/core/compare/compare.ts', mode: 'new' }, { path: 'tests/unit/compare.test.ts', mode: 'new' }] };
const codes = (r: { reasons: { code: string }[] }) => [...new Set(r.reasons.map((x) => x.code))];

describe('evaluatePr – dobre PR-y', () => {
  it('#219 (W1.4): tylko pliki zadania, zielone CI → SCAL', () => {
    const r = evaluatePr(live(219), W14, settings, NOW);
    expect(r.reasons).toEqual([]);
    expect(r.verdict).toBe('SCAL');
    expect(r.julesComment).toBeNull();
  });

  it('#212 (W1.7) bez STAN.md → SCAL; z STAN.md → POPRAW (R7)', () => {
    const d = live(212);
    expect(evaluatePr(d, W17, settings, NOW).verdict).toBe('POPRAW');
    expect(codes(evaluatePr(d, W17, settings, NOW))).toEqual(['R7']);
    const clean = { ...d, files: d.files.filter((f: { filename: string }) => f.filename !== 'docs/STAN.md') };
    expect(evaluatePr(clean, W17, settings, NOW).verdict).toBe('SCAL');
  });
});

describe('evaluatePr – złe PR-y z historii repo', () => {
  it('#210 (W3.1): STAN.md, zrzuty docs/shots, usunięty cudzy test, ProfileSheet → POPRAW z poleceniem', () => {
    const r = evaluatePr(live(210), task('W3.1'), settings, NOW);
    expect(r.verdict).toBe('POPRAW');
    expect(codes(r)).toEqual(expect.arrayContaining(['R7', 'R5', 'R6']));
    expect(r.reasons.some((x: { file?: string }) => x.file === 'tests/e2e/annotation-scroll.spec.ts')).toBe(true);
    // Usunięcia dozwolone w W3.1 nie są zgłaszane
    expect(r.reasons.some((x: { code: string; file?: string }) => x.code === 'R6' && x.file === 'src/core/profile/highlight.ts')).toBe(false);
    expect(r.julesComment).toMatch(/^@jules /);
  });

  it('#215 (W2.4): plik roboczy, skrypt .cjs, cudzy useIsMobile i goły return w teście → POPRAW', () => {
    const r = evaluatePr(live(215), task('W2.4'), settings, NOW);
    expect(r.verdict).toBe('POPRAW');
    expect(codes(r)).toEqual(expect.arrayContaining(['R8', 'R5', 'R7', 'R10']));
    expect(r.reasons.find((x: { file?: string }) => x.file === 'commit_message.txt')?.code).toBe('R8');
    expect(r.reasons.find((x: { file?: string }) => x.file === 'src/view/hooks/useIsMobile.ts')?.code).toBe('R5');
  });

  it('#217 (W2.6): druga wersja BottomSheet i useIsMobile spoza zadania → POPRAW (R5)', () => {
    const r = evaluatePr(live(217), task('W2.6'), settings, NOW);
    expect(r.verdict).toBe('POPRAW');
    const r5 = r.reasons.filter((x: { code: string }) => x.code === 'R5').map((x: { file?: string }) => x.file);
    expect(r5).toEqual(expect.arrayContaining(['src/view/ui/BottomSheet.tsx', 'src/view/hooks/useIsMobile.ts']));
  });
});

describe('evaluatePr – CI, konflikty, autorzy', () => {
  it('CI w toku → CZEKAJ; czerwone świeżo → CZEKAJ; czerwone po 20 min ciszy → POPRAW', () => {
    const running = live(219, { checkRuns: green.map((c: object, i: number) => (i === 0 ? { ...c, status: 'in_progress', conclusion: null } : c)) });
    expect(evaluatePr(running, W14, settings, NOW).verdict).toBe('CZEKAJ');
    const red = live(219, { checkRuns: green.map((c: object, i: number) => (i === 0 ? { ...c, conclusion: 'failure' } : c)) });
    const lastCommit = Math.max(...red.commits.map((c: { commit: { author: { date: string } } }) => Date.parse(c.commit.author.date)));
    expect(evaluatePr(red, W14, settings, lastCommit + 5 * 60_000).verdict).toBe('CZEKAJ');
    expect(evaluatePr(red, W14, settings, lastCommit + 40 * 60_000).verdict).toBe('POPRAW');
  });

  it('brak wymaganego checka → CZEKAJ', () => {
    expect(evaluatePr(live(219, { checkRuns: green.slice(1) }), W14, settings, NOW).verdict).toBe('CZEKAJ');
  });

  it('mergeable null → CZEKAJ, false → POPRAW z poleceniem git merge origin/main', () => {
    const d = live(219);
    expect(evaluatePr({ ...d, pr: { ...d.pr, mergeable: null } }, W14, settings, NOW).verdict).toBe('CZEKAJ');
    const conflict = evaluatePr({ ...d, pr: { ...d.pr, mergeable: false } }, W14, settings, NOW);
    expect(conflict.verdict).toBe('POPRAW');
    expect(conflict.julesComment).toContain('git merge origin/main');
  });

  it('commit obcego autora → ESKALUJ (wygrywa z POPRAW)', () => {
    const d = live(212);
    d.commits = [...d.commits, { sha: 'abcdef1234', author: { login: 'ktos-obcy' }, commit: { author: { date: '2026-10-24T08:00:00Z' } } }];
    expect(evaluatePr(d, W17, settings, NOW).verdict).toBe('ESKALUJ');
  });

  it('PR z forka albo szkic → ESKALUJ', () => {
    const d = live(219);
    expect(evaluatePr({ ...d, pr: { ...d.pr, head: { ...d.pr.head, repo: { full_name: 'obcy/faktografia-atlas' } } } }, W14, settings, NOW).verdict).toBe('ESKALUJ');
    expect(evaluatePr({ ...d, pr: { ...d.pr, draft: true } }, W14, settings, NOW).verdict).toBe('ESKALUJ');
  });
});

describe('evaluatePr – testy i pliki', () => {
  const base = live(219);
  const withFile = (f: object) => ({ ...base, files: [...base.files, f] });

  it('dopisywanie do istniejącego testu: same „+” → SCAL, linia „-” → POPRAW (R9)', () => {
    const t = { ...W14, testsAppend: ['tests/unit/url-state.test.ts'] };
    const ok = withFile({ filename: 'tests/unit/url-state.test.ts', status: 'modified', additions: 2, deletions: 0, patch: "@@ -1,2 +1,4 @@\n+  it('nowy', () => {\n+  });" });
    expect(evaluatePr(ok, t, settings, NOW).verdict).toBe('SCAL');
    const bad = withFile({ filename: 'tests/unit/url-state.test.ts', status: 'modified', additions: 1, deletions: 1, patch: "@@ -1 +1 @@\n-  expect(a).toBe(1);\n+  expect(a).toBe(2);" });
    expect(codes(evaluatePr(bad, t, settings, NOW))).toEqual(expect.arrayContaining(['R9', 'R10']));
  });

  it('skip/only/fixme i @ts-ignore w nowym teście → POPRAW (R10); fixme dozwolone tylko w allowFixme', () => {
    const f = { filename: 'tests/unit/camera.test.ts', status: 'added', additions: 1, deletions: 0, patch: "@@ -0,0 +1 @@\n+test.fixme('x', () => {});" };
    const d = { ...base, files: [base.files[0], base.files[1], f] };
    expect(codes(evaluatePr(d, W14, settings, NOW))).toContain('R10');
    expect(evaluatePr(d, { ...W14, allowFixme: ['tests/unit/camera.test.ts'] }, settings, NOW).verdict).toBe('SCAL');
  });

  it('scripts/ops, .github i docs/STAN.md nie przechodzą nawet z listy zadania (R7)', () => {
    const verdicts = ['scripts/ops/check-pr.mjs', '.github/workflows/ci.yml', 'docs/STAN.md'].map((filename) => {
      const t = { ...W14, files: [...W14.files, { path: filename, mode: 'change' }] };
      return evaluatePr(withFile({ filename, status: 'modified', additions: 1, deletions: 0, patch: '@@ -1 +1 @@\n+x' }), t, settings, NOW).verdict;
    });
    expect(verdicts).toEqual(['POPRAW', 'POPRAW', 'POPRAW']);
  });

  it('plik testu bez podglądu zmian → ESKALUJ (R11)', () => {
    const t = { ...W14, files: [...W14.files, { path: 'tests/unit/big.test.ts', mode: 'new' }] };
    expect(evaluatePr(withFile({ filename: 'tests/unit/big.test.ts', status: 'added', additions: 50, deletions: 0 }), t, settings, NOW).verdict).toBe('ESKALUJ');
  });

  it('za duża zmiana pliku „partial” → POPRAW (R12)', () => {
    const t = { ...W14, files: [...W14.files, { path: 'src/view/map/AtlasMap.tsx', mode: 'partial', maxLines: 10 }] };
    const r = evaluatePr(withFile({ filename: 'src/view/map/AtlasMap.tsx', status: 'modified', additions: 40, deletions: 20, patch: '@@ -1 +1 @@\n+a' }), t, settings, NOW);
    expect(codes(r)).toEqual(['R12']);
  });

  it('package.json: usunięcie pakietów z listy W0.1 → SCAL; nowy pakiet → POPRAW (R13)', () => {
    const w01 = task('W0.1');
    const rm = { filename: 'package.json', status: 'modified', additions: 0, deletions: 2, patch: '@@ -1,3 +1,1 @@\n-    "nuqs": "^2.10.2",\n-    "motion": "^14.3.0",\n     "p-throttle": "^8.1.1",' };
    const d = { ...base, files: [rm, { filename: 'pnpm-lock.yaml', status: 'modified', additions: 0, deletions: 9, patch: '@@ -1 +1 @@\n-x' }, { filename: 'docs/ELEMENTY.md', status: 'modified', additions: 1, deletions: 1, patch: '@@ -1 +1 @@\n-a\n+b' }] };
    expect(evaluatePr(d, w01, settings, NOW).verdict).toBe('SCAL');
    const add = { ...rm, patch: '@@ -1 +1,2 @@\n+    "lodash": "^4.17.21",' };
    expect(codes(evaluatePr({ ...d, files: [add, ...d.files.slice(1)] }, w01, settings, NOW))).toContain('R13');
  });

  it('brak „Po ludzku” → POPRAW (R14); sygnał zatrzymania → ESKALUJ (R17); nowy e2e bez @S → POPRAW (R16)', () => {
    expect(codes(evaluatePr({ ...base, pr: { ...base.pr, body: 'Opis' } }, W14, settings, NOW))).toEqual(['R14']);
    expect(evaluatePr({ ...base, pr: { ...base.pr, body: 'Po ludzku: przeszkadza istniejący test home.spec.ts' } }, W14, settings, NOW).verdict).toBe('ESKALUJ');
    const t = { ...W14, files: [...W14.files, { path: 'tests/e2e/x.spec.ts', mode: 'new' }] };
    const e2e = withFile({ filename: 'tests/e2e/x.spec.ts', status: 'added', additions: 1, deletions: 0, patch: "@@ -0,0 +1 @@\n+test('bez znacznika', () => {});" });
    expect(codes(evaluatePr(e2e, t, settings, NOW))).toEqual(['R16']);
  });

  it('odcisk: te same dane → ten sam; nowy SHA → inny', () => {
    const a = evaluatePr(base, W14, settings, NOW).fingerprint;
    expect(evaluatePr(live(219), W14, settings, NOW).fingerprint).toBe(a);
    expect(evaluatePr({ ...base, pr: { ...base.pr, head: { ...base.pr.head, sha: 'inny' } } }, W14, settings, NOW).fingerprint).not.toBe(a);
  });
});

describe('matchesGlob', () => {
  it('** i * działają jak w .gitignore; wzorzec bez / tylko w katalogu głównym', () => {
    expect(matchesGlob('tests/e2e/design.spec.ts-snapshots/x.png', '**/*-snapshots/**')).toBe(true);
    expect(matchesGlob('src/a.txt', '**/*.txt')).toBe(true);
    expect(matchesGlob('scripts/ops/x.mjs', '*.mjs')).toBe(false);
    expect(matchesGlob('get_dom2.cjs', '*.cjs')).toBe(true);
    expect(matchesGlob('src/view/share/CardSvg.tsx', 'src/view/share/**')).toBe(true);
    expect(matchesGlob('docs/STAN.md', 'docs/*.md')).toBe(true);
  });
});
