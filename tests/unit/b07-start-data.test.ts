import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildStart } from '../../scripts/data/start.mjs';
import { createStartLoop, loadOutline, OUTLINE_URL, outlineCells, type Frame } from '../../src/core/start/outline';
import { captionFor, loadStart, startFields, START_URL, type StartFile } from '../../src/core/start/start-data';

// B07: z start.json powstaje 16 pól w 5 klasach kolorów; pierwszy kadr to ludność.
const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const fixture = JSON.parse(read('tests/fixtures/start/values-sample.json'));
const start = buildStart(fixture.indicators, fixture.values, '2026-01-01T00:00:00.000Z') as StartFile;
const outline = JSON.parse(read('public/geo/start-outline.json'));

describe('B07 pola w kolorach 5 klas', () => {
  it('16 pól, każde w jednej z klas --seq-1…5, wszystkie 5 klas użyte', () => {
    const fields = startFields(start.indicators[0]);
    expect(fields).toHaveLength(16);
    for (const f of fields) expect(f.color).toMatch(/^var\(--seq-[1-5]\)$/);
    expect(new Set(fields.map((f) => f.color)).size).toBe(5);
    expect(fields.map((f) => f.teryt).sort()).toEqual(outline.paths.map((p: { teryt: string }) => p.teryt).sort());
  });

  it('pierwszy wskaźnik (pierwszy kadr) to ludność', () => {
    expect(start.indicators[0].id).toBe('population');
  });

  it('podpis ma nazwę województwa i wartość z jednostką', () => {
    const unemployment = start.indicators.find((i) => i.id === 'unemployment-rate')!;
    const v = unemployment.values['14'];
    const text = captionFor(unemployment, '14')!;
    expect(text).toContain(`Stopa bezrobocia, ${unemployment.year} · mazowieckie: `);
    expect(text).toContain(v.toLocaleString('pl-PL', { maximumFractionDigits: 1 }));
    expect(text.endsWith(' %')).toBe(true);
    expect(captionFor(unemployment, '99')).toBeNull();
  });

  it('wczytanie to dokładnie dwa żądania: obrys i start.json', async () => {
    const urls: string[] = [];
    const fake = (async (url: string) => {
      urls.push(url);
      return { ok: true, json: async () => (url === START_URL ? start : outline) };
    }) as unknown as typeof fetch;
    await Promise.all([loadOutline(fake), loadStart(fake)]);
    expect(urls.sort()).toEqual([OUTLINE_URL, START_URL].sort());
  });
});

describe('B07 prefers-reduced-motion', () => {
  it('brak pętli, brak cyklu i brak zmian koloru w 6 s; kadr to ludność', () => {
    const cells = outlineCells(outline);
    const frames: Frame[] = [];
    let now = 0;
    let rafCalls = 0;
    const loop = createStartLoop({
      cells,
      count: start.indicators.length,
      reduced: true,
      env: { now: () => now, raf: () => ++rafCalls, caf: () => undefined, rand: () => 0.5 },
      onFrame: (f) => frames.push(f),
    });
    loop.start();
    const colorsAt = () => startFields(start.indicators[frames[frames.length - 1].index]).map((f) => f.color).join();
    const before = colorsAt();
    now = 6000;
    loop.pointer([0.5, 0.5]); // ruch kursora też nic nie zmienia
    expect(rafCalls).toBe(0);
    expect(loop.running()).toBe(false);
    expect(frames).toHaveLength(1);
    expect(frames[0].index).toBe(0);
    expect(frames[0].mode).toBe('static');
    expect(colorsAt()).toBe(before);
  });
});
