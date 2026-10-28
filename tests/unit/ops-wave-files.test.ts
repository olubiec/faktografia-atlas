import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileId, slug, taskFileName, waveFiles, waveProblems } from '../../scripts/ops/wave-files.mjs';

const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
const arch = readFileSync('docs/ARCHITEKTURA.md', 'utf8');
const footer = readFileSync('scripts/jules-loop/dopisek.md', 'utf8');
// Te same wyrażenia co w scripts/jules-loop/orchestrator.mjs (nazwa pliku fali i linie „Zmieniaj:” / „Wymagane:”).
const FILE_RE = /^W(\d+)-([A-Za-z0-9]+)(?:[-_].*)?\.md$/i;
const list = (text: string, key: string) => new RegExp(`^\\s*${key}:\\s*(.+)$`, 'im').exec(text)?.[1].split(',').map((s) => s.trim());
const waves = [...new Set(queue.tasks.map((t: { wave: number }) => t.wave))].sort((a, b) => (a as number) - (b as number)) as number[];

describe('wave-files – pliki fali dla Jules Loop', () => {
  it('nazwy: W2.24 → W224, polskie znaki znikają', () => {
    expect(fileId('W2.24')).toBe('W224');
    expect(slug('Biblioteka: wyszukiwarka wskaźników')).toBe('biblioteka-wyszukiwarka-wskaznikow');
  });

  it.each(waves.filter((w) => w >= 10))('F%i: pliki pasują do wyrażenia pętli, mają Zmieniaj i Wymagane z testami', (wave) => {
    expect(waveProblems(queue, wave)).toEqual([]);
    const files = waveFiles(queue, arch, footer, wave);
    expect(files.length).toBe(queue.tasks.filter((t: { wave: number }) => t.wave === wave).length);
    const ids = new Set<string>();
    for (const f of files) {
      const m = FILE_RE.exec(f.name);
      expect(m).not.toBeNull();
      expect(Number(m?.[1])).toBe(wave);
      ids.add(m?.[2] ?? '');
      const own = list(f.text, 'Zmieniaj') ?? [];
      expect(own.length).toBeGreaterThan(0);
      const need = list(f.text, 'Wymagane') ?? [];
      expect(need.every((n) => own.includes(n) && n.startsWith('tests/'))).toBe(true);
      expect(f.text).toContain('Weryfikacja: pnpm lint');
      expect(f.text).toContain(`[W${wave}-${m?.[2]}]`);
      expect(f.text.startsWith(`# ${f.id} – `)).toBe(true);
    }
    expect(ids.size).toBe(files.length);
  });

  it('plik wspólny z limitem linii dostaje ostrzeżenie o limicie (W2.33 → App.tsx)', () => {
    const f = waveFiles(queue, arch, footer, 10).find((x) => x.id === 'W2.33');
    expect(f?.text).toContain('src/App.tsx – najwyżej 4 linii zmiany');
  });

  it('zależność w tej samej fali odrzuca falę', () => {
    const bad = { ...queue, tasks: queue.tasks.map((t: { id: string; dependsOn: string[] }) => (t.id === 'W2.25' ? { ...t, dependsOn: ['W2.32'] } : t)) };
    expect(waveProblems(bad, 11).join(' ')).toContain('W2.25 zależy od W2.32');
  });

  it('nazwa pliku jednego zadania jest stabilna', () => {
    const t = queue.tasks.find((x: { id: string }) => x.id === 'W2.24');
    expect(taskFileName(t)).toBe('W10-W224-blok-miasto-i-obszar-wiejski-komponent.md');
  });
});
