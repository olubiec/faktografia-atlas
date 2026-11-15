import { describe, it, expect, vi } from 'vitest';
import { startupPrefetch } from '../../src/core/data/startup-prefetch';

function makeDeps() {
  return {
    loadUnits: vi.fn<() => Promise<unknown>>(() => Promise.resolve([])),
    loadAdminTopo: vi.fn<() => Promise<unknown>>(() => Promise.resolve({})),
    loadProfileShard: vi.fn<(woj: string) => Promise<unknown>>(() => Promise.resolve({})),
  };
}

describe('startupPrefetch', () => {
  it('"/" pobiera units i topo, bez profilu', () => {
    const d = makeDeps();
    const r = startupPrefetch({ pathname: '/', search: '' }, d);
    expect(d.loadUnits).toHaveBeenCalledTimes(1);
    expect(d.loadAdminTopo).toHaveBeenCalledTimes(1);
    expect(d.loadProfileShard).not.toHaveBeenCalled();
    expect(r).toEqual(['loadUnits', 'loadAdminTopo']);
  });

  it('?u=12 pobiera profil 12', () => {
    const d = makeDeps();
    const r = startupPrefetch({ pathname: '/', search: '?u=12' }, d);
    expect(d.loadProfileShard).toHaveBeenCalledWith('12');
    expect(r).toContain('loadProfileShard');
  });

  it('?u=1261011 pobiera profil 12', () => {
    const d = makeDeps();
    startupPrefetch({ pathname: '/', search: '?u=1261011' }, d);
    expect(d.loadProfileShard).toHaveBeenCalledWith('12');
  });

  it.each(['?u=abc', '?u=99', '?u=13', '?u=123', '?u=1'])('%s nie pobiera profilu', (search) => {
    const d = makeDeps();
    startupPrefetch({ pathname: '/', search }, d);
    expect(d.loadProfileShard).not.toHaveBeenCalled();
  });

  it('/rankingi?u=12 nic nie pobiera', () => {
    const d = makeDeps();
    const r = startupPrefetch({ pathname: '/rankingi', search: '?u=12' }, d);
    expect(r).toEqual([]);
    expect(d.loadUnits).not.toHaveBeenCalled();
    expect(d.loadAdminTopo).not.toHaveBeenCalled();
    expect(d.loadProfileShard).not.toHaveBeenCalled();
  });

  it('odrzucona obietnica nie daje nieobsłużonego błędu', async () => {
    const unhandled = vi.fn<() => void>();
    process.on('unhandledRejection', unhandled);
    const d = {
      loadUnits: vi.fn<() => Promise<unknown>>(() => Promise.reject(new Error('x'))),
      loadAdminTopo: vi.fn<() => Promise<unknown>>(() => Promise.reject(new Error('y'))),
      loadProfileShard: vi.fn<(woj: string) => Promise<unknown>>(() => Promise.reject(new Error('z'))),
    };
    expect(() => startupPrefetch({ pathname: '/', search: '?u=12' }, d)).not.toThrow();
    await new Promise((res) => setTimeout(res, 20));
    process.off('unhandledRejection', unhandled);
    expect(unhandled).not.toHaveBeenCalled();
  });
});
