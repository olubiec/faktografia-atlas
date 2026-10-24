import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { taskStatuses, readyToStart, extractSection, issueBody, ownerCheck, pathsOverlap, filesCollide, checkpointReady } from '../../scripts/ops/plan.mjs';
import { parseMemory, renderMemory, emptyMemory, updateStanBlock, stanBlock } from '../../scripts/ops/state.mjs';
import { checksState, findTaskPr } from '../../scripts/ops/facts.mjs';

const queue = JSON.parse(readFileSync('scripts/ops/automat-kolejka.json', 'utf8'));
const arch = readFileSync('docs/ARCHITEKTURA.md', 'utf8');
const issue = (number: number, id: string, state = 'open', labels: string[] = ['zadanie']) => ({ number, title: `[${id}] x`, state, labels });
const ids = (tasks: { id: string }[]) => tasks.map((t) => t.id);

describe('readyToStart – fale liczone na bieżąco', () => {
  it('na starcie: cała fala F1 (8 zadań bez zależności), bez zadań czekających na W2.1', () => {
    const st = taskStatuses(queue, [], emptyMemory());
    const ready = ids(readyToStart(queue, st));
    expect([...ready].sort()).toEqual(['W0.1', 'W1.10', 'W1.12', 'W1.13', 'W1.2', 'W2.1', 'W2.13', 'W3.3']);
    expect(ready).not.toContain('W2.2'); // czeka na W2.1
  });

  it('zadania w toku zajmują miejsca i pliki; zależność scalona → zadanie wchodzi', () => {
    const mem = emptyMemory();
    mem.tasks['W2.1'] = { merged: 301 } as never;
    const st = taskStatuses(queue, [issue(1, 'W0.1', 'open', ['zadanie', 'jules']), issue(2, 'W2.1', 'closed', ['zadanie', 'scalone'])], mem);
    const ready = ids(readyToStart(queue, st));
    expect(ready).toContain('W2.2');
    expect(ready).not.toContain('W0.1');
    expect(ready.length).toBeLessThanOrEqual(queue.settings.maxParallel - 1);
  });

  it('nie startuje dwóch zadań z tym samym plikiem naraz', () => {
    const mem = emptyMemory();
    for (const id of ['W0.1', 'W1.2', 'W2.1', 'W2.2', 'W1.12', 'W1.13', 'W2.3', 'W3.1', 'W1.14']) mem.tasks[id] = { merged: 1 } as never;
    const st = taskStatuses(queue, [], mem);
    const ready = readyToStart(queue, st);
    expect(ready.length).toBeGreaterThan(1);
    const clashes = ready.flatMap((a: { id: string }) => ready.filter((b: { id: string }) => a !== b && filesCollide(a, b)).map((b: { id: string }) => `${a.id}×${b.id}`));
    expect(clashes).toEqual([]);
  });

  it('nie wybiega więcej niż waveLookahead fal do przodu', () => {
    const st = taskStatuses(queue, [], emptyMemory());
    for (const t of readyToStart(queue, st)) expect(t.wave).toBeLessThanOrEqual(1 + queue.settings.waveLookahead);
  });

  it('wymaga-decyzji i wymaga-naprawy blokują zadanie; limit 24 h zatrzymuje starty', () => {
    const st = taskStatuses(queue, [issue(5, 'W0.1', 'open', ['zadanie', 'wymaga-decyzji']), issue(6, 'W1.2', 'open', ['zadanie', 'wymaga-naprawy'])], emptyMemory());
    expect(st.get('W0.1').status).toBe('decision');
    expect(st.get('W1.2').status).toBe('repair');
    expect(ids(readyToStart(queue, st))).not.toContain('W0.1');
    expect(readyToStart(queue, st, { startsLast24h: queue.settings.maxStartsPer24h })).toEqual([]);
  });

  it('issue bez etykiety jules (np. od Naprawiacza) → „queued” i wraca do startu', () => {
    const st = taskStatuses(queue, [issue(9, 'W1.2')], emptyMemory());
    expect(st.get('W1.2').status).toBe('queued');
    expect(ids(readyToStart(queue, st))).toContain('W1.2');
  });
});

describe('pathsOverlap', () => {
  it('wzorce katalogów nakładają się z plikami w środku', () => {
    expect(pathsOverlap('src/view/share/**', 'src/view/share/useShareData.ts')).toBe(true);
    expect(pathsOverlap('src/view/share/**', 'src/view/main/IndicatorPanel.tsx')).toBe(false);
    expect(pathsOverlap('tests/fixtures/geo/**', 'tests/fixtures/geo/malopolskie.topo.json')).toBe(true);
  });
});

describe('treść issue', () => {
  it('wycina dokładnie sekcję zadania i dokleja dopisek z listą plików', () => {
    const section = extractSection(arch, 'W1.2');
    expect(section).toMatch(/^#### W1\.2 – /);
    expect(section).not.toContain('#### W1.3');
    const body = issueBody(queue.tasks.find((t: { id: string }) => t.id === 'W1.2'), section, readFileSync('scripts/ops/dopisek.md', 'utf8'), 'Wspólne');
    expect(body).toContain('JEDNO zadanie: W1.2');
    expect(body).toContain('`src/view/hooks/useIsMobile.ts`');
    expect(body).not.toContain('{PLIKI}');
    expect(ownerCheck(section)).toContain('✅');
  });
});

describe('pamięć automatu', () => {
  it('zapis i odczyt z komentarza (także z „-->” w tekście)', () => {
    const mem = emptyMemory();
    mem.events = ['a --> b'];
    mem.tasks['W1.2'] = { fixes: 1 } as never;
    const st = taskStatuses(queue, [], mem);
    const body = renderMemory(mem, st, queue, Date.parse('2026-10-24T10:00:00Z'));
    expect(body).toContain('| W1.2 |');
    expect(parseMemory(body).tasks['W1.2'].fixes).toBe(1);
    expect(parseMemory(body).events[0]).toBe('a --> b');
    expect(parseMemory('zwykły komentarz')).toEqual(emptyMemory());
  });

  it('blok w STAN.md podmieniany tylko między znacznikami', () => {
    const stan = readFileSync('docs/STAN.md', 'utf8');
    const st = taskStatuses(queue, [], emptyMemory());
    const out = updateStanBlock(stan, stanBlock(queue, st, emptyMemory(), Date.parse('2026-10-25T10:00:00Z')));
    expect(out).toContain('Aktualizacja automatu 2026-10-25');
    expect(out.split('<!-- automat:start -->')[0]).toBe(stan.split('<!-- automat:start -->')[0]);
    expect(out.split('<!-- automat:end -->')[1]).toBe(stan.split('<!-- automat:end -->')[1]);
    expect(() => updateStanBlock('brak', 'x')).toThrow('znaczników');
  });

  it('punkt kontrolny gotowy dopiero, gdy wszystkie jego zadania scalone', () => {
    const mem = emptyMemory();
    const k1 = queue.tasks.filter((t: { checkpoint: string }) => t.checkpoint === 'K1');
    for (const t of k1.slice(1)) mem.tasks[t.id] = { merged: 1 } as never;
    expect(checkpointReady(queue, taskStatuses(queue, [], mem), 'K1')).toBe(false);
    mem.tasks[k1[0].id] = { merged: 1 } as never;
    expect(checkpointReady(queue, taskStatuses(queue, [], mem), 'K1')).toBe(true);
  });
});

describe('fakty z GitHuba', () => {
  it('checksState: czerwony / w toku / zielony / brak', () => {
    const req = queue.settings.requiredChecks;
    const ok = (name: string) => ({ name, status: 'completed', conclusion: 'success' });
    expect(checksState([ok('testy'), ok('bezpieczenstwo')], req)).toBe('green');
    expect(checksState([ok('testy'), { name: 'bezpieczenstwo', status: 'completed', conclusion: 'failure' }], req)).toBe('red');
    expect(checksState([ok('testy'), { name: 'bezpieczenstwo', status: 'queued', conclusion: null }], req)).toBe('pending');
    expect(checksState([], req)).toBe('pending');
  });

  it('findTaskPr: z komentarza Julesa albo „Closes #issue”', () => {
    const prs = [{ number: 301, title: 'W1.2 – hook', body: 'Closes #40' }, { number: 302, title: 'inne', body: '' }];
    expect(findTaskPr(prs, 40, 'W1.2', [])).toBe(301);
    expect(findTaskPr(prs, 41, 'W9.9', [{ body: 'A [PR](https://github.com/o/r/pull/302) has been created.' }])).toBe(302);
    expect(findTaskPr(prs, 42, 'W9.9', [])).toBeNull();
  });
});
