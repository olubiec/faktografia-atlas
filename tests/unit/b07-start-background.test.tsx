import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { buildStart } from '../../scripts/data/start.mjs';
import { bindVisibility, createStartLoop, CYCLE_MS, outlineCells, type Frame } from '../../src/core/start/outline';
import { captionFor, type StartFile } from '../../src/core/start/start-data';
import { StartBackground } from '../../src/view/start/StartBackground';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const fixture = JSON.parse(read('tests/fixtures/start/values-sample.json'));
const start = buildStart(fixture.indicators, fixture.values, '2026-01-01T00:00:00.000Z') as StartFile;
const outline = JSON.parse(read('public/geo/start-outline.json'));
const cells = outlineCells(outline);

/** Sztuczny zegar i requestAnimationFrame: klatka co 16 ms. */
function harness() {
  let now = 0;
  let nextId = 1;
  let pending: { id: number; cb: (t: number) => void } | null = null;
  const frames: Frame[] = [];
  const loop = createStartLoop({
    cells,
    count: start.indicators.length,
    reduced: false,
    env: {
      now: () => now,
      raf: (cb) => {
        pending = { id: nextId++, cb };
        return pending.id;
      },
      caf: (id) => {
        if (pending?.id === id) pending = null;
      },
      rand: () => 0.5,
    },
    onFrame: (f) => frames.push(f),
  });
  const advance = (ms: number) => {
    const end = now + ms;
    while (now < end && pending) {
      now += 16;
      const p = pending;
      pending = null;
      p.cb(now);
    }
    if (!pending) now = end;
  };
  return { loop, frames, advance, last: () => frames[frames.length - 1], pending: () => pending !== null };
}

describe('B07 StartBackground', () => {
  it('opis dla czytników ekranu to „Mapa Polski: <wskaźnik>”, 16 pól, pierwszy kadr = ludność', () => {
    const html = renderToString(<StartBackground initial={{ outline, start }} />);
    expect(html).toContain('aria-label="Mapa Polski: Liczba ludności"');
    expect(html).toContain('data-indicator="population"');
    expect(html.match(/<path /g)).toHaveLength(16);
    // M4b: pionowe przewijanie palcem nad obrysem działa (touch-action: pan-y), wcześniej było touch-none.
    expect(html).toContain('touch-pan-y');
    // Bez reakcji nie ma podpisu z województwem.
    expect(html).not.toContain('mazowieckie');
  });

  it('bez zdarzeń wskaźnik zmienia się co 5 s (ludność → bezrobocie → … → znów ludność)', () => {
    const h = harness();
    h.loop.start();
    expect(h.last().index).toBe(0);
    h.advance(CYCLE_MS - 200);
    expect(h.last().index).toBe(0);
    h.advance(400);
    expect(h.last().index).toBe(1);
    h.advance(CYCLE_MS);
    expect(h.last().index).toBe(2);
    h.advance(CYCLE_MS * 2);
    expect(h.last().index).toBe(0);
  });

  it('ruch kursora zatrzymuje cykl i daje podpis z nazwą województwa i wartością', () => {
    const h = harness();
    h.loop.start();
    h.advance(1000);
    const c = cells.find((x) => x.teryt === '14')!;
    h.loop.pointer(c.center);
    h.advance(2000);
    expect(h.last().mode).toBe('react');
    expect(h.last().nearest).toBe('14');
    const frozen = h.last().index;
    const text = captionFor(start.indicators[frozen], h.last().nearest!)!;
    expect(text).toContain('mazowieckie: ');
    // Dalsze ruchy co 1 s przez 12 s: cykl stoi.
    for (let i = 0; i < 12; i++) {
      h.loop.pointer(c.center);
      h.advance(1000);
    }
    expect(h.last().index).toBe(frozen);
  });

  it('po 4 s bezruchu wraca tryb losowy i cykl rusza dalej', () => {
    const h = harness();
    h.loop.start();
    h.loop.pointer([0.3, 0.3]);
    h.advance(500);
    expect(h.last().mode).toBe('react');
    h.advance(4500);
    expect(h.last().mode).toBe('random');
    const idx = h.last().index;
    h.advance(CYCLE_MS + 100);
    expect(h.last().index).not.toBe(idx);
  });

  it('ukrycie karty zatrzymuje pętlę, powrót ją wznawia (jedna pętla)', () => {
    const h = harness();
    const doc = Object.assign(new EventTarget(), { hidden: false });
    const unbind = bindVisibility(doc as never, h.loop);
    h.loop.start();
    expect(h.pending()).toBe(true);
    doc.hidden = true;
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(h.loop.running()).toBe(false);
    expect(h.pending()).toBe(false);
    const count = h.frames.length;
    h.advance(1000);
    expect(h.frames).toHaveLength(count);
    doc.hidden = false;
    doc.dispatchEvent(new Event('visibilitychange'));
    expect(h.pending()).toBe(true);
    h.loop.setPaused('offscreen', true); // tło poza ekranem też zatrzymuje
    expect(h.pending()).toBe(false);
    h.loop.setPaused('offscreen', false);
    expect(h.pending()).toBe(true);
    unbind();
  });
});
