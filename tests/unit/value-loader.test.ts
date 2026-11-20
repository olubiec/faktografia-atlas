import { describe, it, expect, vi } from 'vitest';
import { createValueLoader } from '@/view/share/valueLoader';
import type { IndicatorValues } from '@/core/profile/profile';

const vals = { years: [2020], values: { '02': [1] } } as unknown as IndicatorValues;
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('createValueLoader', () => {
  it('jedno wywołanie na wskaźnik: loading -> ready, ponowne żądania nie ponawiają', async () => {
    const load = vi.fn<() => Promise<IndicatorValues | null>>(async () => vals);
    const l = createValueLoader({ load, initialValues: new Map(), onChange: () => {} });
    l.request(['b101']);
    expect(l.statuses().get('b101')).toBe('loading');
    await flush();
    expect(l.statuses().get('b101')).toBe('ready');
    expect(l.values().get('b101')).toBe(vals);
    l.request(['b101']);
    l.request(['b101']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('wskaźnik z initialValues: zero wywołań, ready od razu', () => {
    const load = vi.fn<() => Promise<IndicatorValues | null>>(async () => vals);
    const l = createValueLoader({ load, initialValues: new Map([['a1', vals]]), onChange: () => {} });
    l.request(['a1']);
    expect(load).not.toHaveBeenCalled();
    expect(l.statuses().get('a1')).toBe('ready');
  });

  it('błąd lub null loadera -> error, bez rzucania, bez ponowienia', async () => {
    const load = vi.fn<(id: string) => Promise<IndicatorValues | null>>(async (id) => {
      if (id === 'e1') throw new Error('x');
      return null;
    });
    const l = createValueLoader({ load, initialValues: new Map(), onChange: () => {} });
    l.request(['e1', 'e2']);
    await flush();
    expect(l.statuses().get('e1')).toBe('error');
    expect(l.statuses().get('e2')).toBe('error');
    l.request(['e1']);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('dispose: spóźniona odpowiedź nie woła onChange', async () => {
    let resolve!: (v: IndicatorValues) => void;
    const load = () => new Promise<IndicatorValues>((r) => (resolve = r));
    const onChange = vi.fn<() => void>();
    const l = createValueLoader({ load, initialValues: new Map(), onChange });
    l.request(['b1']);
    await flush();
    const calls = onChange.mock.calls.length;
    l.dispose();
    resolve(vals);
    await flush();
    expect(onChange.mock.calls.length).toBe(calls);
    expect(l.values().has('b1')).toBe(false);
  });
});
