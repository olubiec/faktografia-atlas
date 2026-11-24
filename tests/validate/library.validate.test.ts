// Kontrola spójności całej biblioteki GUS. Uruchamiana przez nocny robot po imporcie:
//   LIBRARY_DIR=lib-wt/library pnpm vitest run tests/validate
// Bez LIBRARY_DIR pomijana (powód środowiskowy: dane biblioteki są na gałęzi data/library).
// Domyślnie tylko raportuje; VALIDATE_STRICT=1 powoduje niepowodzenie przy błędach.
import { existsSync, readdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkLevel, type Finding } from '../../src/core/validate/consistency';

const dir = process.env.LIBRARY_DIR;
const run = dir && existsSync(path.join(dir, 'values')) ? describe : describe.skip;

run('biblioteka GUS – spójność danych', () => {
  it('przechodzi reguły (raport w validate-report.json)', { timeout: 900_000 }, () => {
    const root = dir as string;
    const index = JSON.parse(readFileSync(path.join(root, 'index.json'), 'utf8')) as {
      variables?: { id: number | string; u?: number }[];
      units?: string[];
    };
    const unitOf = new Map<string, string>();
    for (const v of index.variables ?? []) unitOf.set(String(v.id), index.units?.[v.u ?? -1] ?? '');
    const report: { varId: string; level: string; finding: Finding }[] = [];
    const files = readdirSync(path.join(root, 'values')).filter((n) => n.endsWith('.json'));
    for (const name of files) {
      const file = JSON.parse(readFileSync(path.join(root, 'values', name), 'utf8')) as Record<string, unknown>;
      const varId = name.replace(/\.json$/, '');
      for (const level of ['l5', 'l6'] as const) {
        const lv = file[level] as { y?: (number | string)[]; d?: Record<string, (number | null)[]> } | undefined;
        if (!lv?.d) continue;
        const findings = checkLevel({
          varId,
          unit: unitOf.get(varId) ?? '',
          level,
          data: { years: (lv.y ?? []).map(Number), rows: lv.d },
        });
        for (const finding of findings) report.push({ varId, level, finding });
      }
    }
    const errors = report.filter((r) => r.finding.severity === 'error');
    const byRule = new Map<string, number>();
    for (const r of report) byRule.set(r.finding.rule, (byRule.get(r.finding.rule) ?? 0) + 1);
    writeFileSync('validate-report.json', JSON.stringify({ files: files.length, byRule: Object.fromEntries(byRule), report }, null, 1));
    const lines = [`### Kontrola spójności biblioteki`, `Sprawdzono plików: ${files.length}; błędów: ${errors.length}; uwag: ${report.length - errors.length}`, '', '| reguła | liczba |', '|---|---|', ...[...byRule].map(([k, n]) => `| ${k} | ${n} |`)];
    console.log(lines.join('\n'));
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
    if (process.env.VALIDATE_STRICT === '1') expect(errors).toEqual([]);
  });
});
