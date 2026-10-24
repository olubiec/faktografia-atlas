import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractSection, filesCollide } from '../../scripts/ops/plan.mjs';

// Kolejka automatu musi zgadzać się z docs/ARCHITEKTURA.md (§3 zadania, §4 fale).
const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
const arch = readFileSync('docs/ARCHITEKTURA.md', 'utf8');
type Task = { id: string; wave: number; dependsOn: string[]; checkpoint: string; files: { path: string; mode: string; maxLines?: number }[]; testsAppend: string[]; testsChange: string[]; deletions: string[] };
const tasks: Task[] = queue.tasks;
const allIds = new Set([...tasks.map((t) => t.id), ...queue.doneBefore]);

describe('automat-kolejka.json', () => {
  it('każde zadanie i każde „zrobione wcześniej” ma sekcję w ARCHITEKTURA §3', () => {
    expect([...allIds].filter((id) => extractSection(arch, id) === null)).toEqual([]);
  });

  it('każda ścieżka zadania występuje w jego sekcji (bez zgadywania plików)', () => {
    const missing = tasks.flatMap((t) => {
      const section = extractSection(arch, t.id) ?? '';
      return [...t.files.map((f) => f.path), ...t.testsAppend, ...t.testsChange, ...t.deletions].filter((p) => {
        const stem = p.split('*')[0].replace(/\/$/, '');
        const name = stem.split('/').pop() ?? stem;
        return !section.includes(stem) && !section.includes(name);
      }).map((p) => `${t.id}: ${p}`);
    });
    expect(missing).toEqual([]);
  });

  it('zależności istnieją i wskazują na wcześniejsze fale', () => {
    const wave = new Map(tasks.map((t) => [t.id, t.wave]));
    const bad = tasks.flatMap((t) => t.dependsOn.filter((d) => !allIds.has(d) || (wave.get(d) ?? 0) >= t.wave).map((d) => `${t.id} → ${d}`));
    expect(bad).toEqual([]);
  });

  it('w jednej fali pliki zadań są rozłączne', () => {
    const clashes = tasks.flatMap((a) => tasks.filter((b) => a.id < b.id && a.wave === b.wave && filesCollide(a, b)).map((b) => `F${a.wave}: ${a.id} × ${b.id}`));
    expect(clashes).toEqual([]);
  });

  it('fala zadania zgadza się z nagłówkiem sekcji („· fala F…”)', () => {
    const name = (w: number) => (w <= 3 ? `F${w}′` : `F${w}`);
    expect(tasks.filter((t) => !(extractSection(arch, t.id) ?? '').split('\n')[0].includes(`fala ${name(t.wave)}`)).map((t) => t.id)).toEqual([]);
  });

  it('pliki „partial” mają limit linii; punkty kontrolne istnieją', () => {
    const cps = new Set(queue.checkpoints.map((c: { id: string }) => c.id));
    expect(tasks.filter((t) => !cps.has(t.checkpoint)).map((t) => t.id)).toEqual([]);
    const noLimit = tasks.flatMap((t) => t.files.filter((f) => f.mode === 'partial' && !(Number(f.maxLines) > 0)).map((f) => `${t.id}: ${f.path}`));
    expect(noLimit).toEqual([]);
  });

  it('automat nie może przepuścić zmian w samym sobie ani w CI', () => {
    expect(queue.settings.neverTouch).toEqual(expect.arrayContaining(['scripts/ops/**', '.github/**', 'docs/STAN.md']));
  });
});
