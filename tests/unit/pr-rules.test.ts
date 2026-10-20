import { describe, expect, it } from 'vitest';
import { checkPr, findTaskId, matchGlob, parseScope } from '../../scripts/ci/pr-rules.mjs';
import cc74bFixture from '../fixtures/pr-rules/cc7.4b.json';

describe('pr-rules', () => {
  describe('findTaskId', () => {
    it('finds task ID from linkedIssue title when PR body has Fixes #N', () => {
      const input = {
        title: 'feat: add profile feature',
        body: 'Fixes #132',
        linkedIssue: {
          number: 132,
          title: 'CC7.4b – Przypisy i źródła w profilu',
          body: ''
        }
      };
      expect(findTaskId(input)).toBe('CC7.4b');
    });

    it('finds task ID from Zadanie: line in body when no linkedIssue', () => {
      const input = {
        title: 'feat: add profile feature',
        body: 'Zadanie: CC12.2 – logika reguł PR',
        linkedIssue: null
      };
      expect(findTaskId(input)).toBe('CC12.2');
    });

    it('finds task ID from anywhere in PR title', () => {
      const input = {
        title: 'feat(view): add YearSlider (CC8.3b)',
        body: 'Some description',
        linkedIssue: null
      };
      expect(findTaskId(input)).toBe('CC8.3b');
    });

    it('returns null when no task ID is present', () => {
      const input = {
        title: 'docs: update readme',
        body: 'Just updating docs',
        linkedIssue: null
      };
      expect(findTaskId(input)).toBeNull();
    });
  });

  describe('parseScope', () => {
    it('extracts path patterns in backticks under Zakres section', () => {
      const issueBody = `
Zakres (tylko te pliki):
- \`src/core/profile/footnotes.ts\` (nowy): \`collectFootnotes(items)\` → numerowana lista bez powtórzeń
- \`src/view/profile/Footnotes.tsx\` (nowy)
- \`src/view/profile/ProfileSheet.tsx\` (tylko: \`Footnotes\` na końcu \`ProfileBody\`), \`src/view/profile/ProfileIndicatorRow.tsx\` (tylko: numer przypisu)
- \`tests/unit/footnotes.test.ts\`, \`tests/unit/footnotes-view.test.tsx\` (nowe)
- \`docs/sessions/CC7.4b.md\`
      `;
      const scope = parseScope(issueBody);
      expect(scope).toEqual([
        'src/core/profile/footnotes.ts',
        'src/view/profile/Footnotes.tsx',
        'src/view/profile/ProfileSheet.tsx',
        'src/view/profile/ProfileIndicatorRow.tsx',
        'tests/unit/footnotes.test.ts',
        'tests/unit/footnotes-view.test.tsx',
        'docs/sessions/CC7.4b.md'
      ]);
    });

    it('handles directory paths ending with /', () => {
      const issueBody = `
Zakres:
- \`scripts/ci/\`
- \`src/view/map/\`
      `;
      expect(parseScope(issueBody)).toEqual(['scripts/ci/', 'src/view/map/']);
    });
  });

  describe('matchGlob', () => {
    it('matches exact path', () => {
      expect(matchGlob('src/core/math.ts', 'src/core/math.ts')).toBe(true);
      expect(matchGlob('src/core/math.ts', 'src/core/other.ts')).toBe(false);
    });

    it('matches single wildcard', () => {
      expect(matchGlob('src/*.ts', 'src/index.ts')).toBe(true);
      expect(matchGlob('src/*.ts', 'src/sub/index.ts')).toBe(false);
    });

    it('matches directory trailing slash pattern', () => {
      expect(matchGlob('scripts/ci/', 'scripts/ci/pr-rules.mjs')).toBe(true);
      expect(matchGlob('scripts/ci/', 'scripts/ops/merge.sh')).toBe(false);
    });

    it('matches snapshot pattern', () => {
      expect(matchGlob('*-snapshots/', 'tests/ui/foo-snapshots/bar.png')).toBe(true);
    });
  });

  describe('checkPr', () => {
    it('returns error when task ID is missing and no sprawdzone label', () => {
      const result = checkPr({
        title: 'random pr',
        body: 'no task id',
        labels: [],
        files: []
      });
      expect(result.ok).toBe(false);
      expect(result.errors).toContain(
        'Brak ID zadania. Dodaj w opisie PR linię Fixes #<numer issue> albo Zadanie: CCx.y (AGENTS.md, sekcja „Pull request”).'
      );
    });

    it('does not return missing task ID error if sprawdzone label is present', () => {
      const result = checkPr({
        title: 'random pr',
        body: 'no task id',
        labels: ['sprawdzone'],
        files: []
      });
      expect(result.errors).not.toContain(
        'Brak ID zadania. Dodaj w opisie PR linię Fixes #<numer issue> albo Zadanie: CCx.y (AGENTS.md, sekcja „Pull request”).'
      );
    });

    it('allows files in scope and session doc, flags files outside scope', () => {
      const result = checkPr({
        title: 'CC12.2 - pr rules',
        body: 'Zadanie: CC12.2',
        linkedIssue: {
          number: 12,
          title: 'CC12.2 - pr rules',
          body: 'Zakres:\n- `src/core/rules.ts`\n- `scripts/ci/`'
        },
        files: [
          { filename: 'src/core/rules.ts', status: 'modified' },
          { filename: 'scripts/ci/pr-rules.mjs', status: 'added' },
          { filename: 'docs/sessions/CC12.2.md', status: 'added' },
          { filename: 'src/view/unrelated.tsx', status: 'modified' }
        ]
      });

      expect(result.ok).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('src/view/unrelated.tsx');
    });

    it('flags removed files', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `src/old.ts`'
        },
        files: [{ filename: 'src/old.ts', status: 'removed' }]
      });

      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.includes('src/old.ts'))).toBe(true);
    });

    it('allows snapshot files outside scope but adds warning', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `src/view/Button.tsx`'
        },
        files: [
          { filename: 'src/view/Button.tsx', status: 'modified' },
          { filename: 'tests/ui/Button-snapshots/desktop.png', status: 'modified' }
        ]
      });

      expect(result.ok).toBe(true);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0]).toContain('Button-snapshots/desktop.png');
    });

    it('flags zapalne file without sprawdzone label', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `package.json`'
        },
        zapalne: ['package.json'],
        labels: [],
        files: [{ filename: 'package.json', status: 'modified' }]
      });

      expect(result.ok).toBe(false);
      expect(result.errors).toContain(
        'PR zmienia plik zapalny package.json. Potrzebny przegląd Sonneta; po przeglądzie dostanie etykietę sprawdzone.'
      );
    });

    it('allows zapalne file with sprawdzone label', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `package.json`'
        },
        zapalne: ['package.json'],
        labels: ['sprawdzone'],
        files: [{ filename: 'package.json', status: 'modified' }]
      });

      expect(result.ok).toBe(true);
    });

    it('flags new dependencies without nowa-zaleznosc label', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `package.json`'
        },
        labels: ['sprawdzone'],
        files: [{ filename: 'package.json', status: 'modified' }],
        packageJson: {
          base: JSON.stringify({ dependencies: { react: '^18.0.0' } }),
          head: JSON.stringify({ dependencies: { react: '^18.0.0', lodash: '^4.0.0' } })
        }
      });

      expect(result.ok).toBe(false);
      expect(result.errors).toContain("Nowa zależność 'lodash' w package.json bez etykiety nowa-zaleznosc.");
    });

    it('allows new dependencies with nowa-zaleznosc label', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `package.json`'
        },
        labels: ['sprawdzone', 'nowa-zaleznosc'],
        files: [{ filename: 'package.json', status: 'modified' }],
        packageJson: {
          base: JSON.stringify({ dependencies: { react: '^18.0.0' } }),
          head: JSON.stringify({ dependencies: { react: '^18.0.0', lodash: '^4.0.0' } })
        }
      });

      expect(result.ok).toBe(true);
    });

    it('allows dependency version bumps without nowa-zaleznosc label', () => {
      const result = checkPr({
        title: 'CC1.0 - test',
        body: 'Zadanie: CC1.0',
        linkedIssue: {
          number: 1,
          title: 'CC1.0 - test',
          body: 'Zakres:\n- `package.json`'
        },
        labels: ['sprawdzone'],
        files: [{ filename: 'package.json', status: 'modified' }],
        packageJson: {
          base: JSON.stringify({ dependencies: { react: '^18.0.0' } }),
          head: JSON.stringify({ dependencies: { react: '^18.3.0' } })
        }
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('cc7.4b.json fixture test', () => {
    it('produces exactly one error for src/view/design/DesignPage.tsx outside scope', () => {
      const result = checkPr(cc74bFixture);
      expect(result.ok).toBe(false);
      expect(result.taskId).toBe('CC7.4b');
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('src/view/design/DesignPage.tsx');
    });
  });
});
