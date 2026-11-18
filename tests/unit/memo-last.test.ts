import { describe, expect, it, vi } from 'vitest';
import { memoLast, sameRefs } from '@/core/map/memo-last';

describe('memoLast (W20-CN04)', () => {
  it('ten sam klucz: ta sama referencja wyniku i jedno wywołanie compute', () => {
    const compute = vi.fn<(a: object, n: number) => object>((a, n) => ({ a, n }));
    const memo = memoLast(compute, sameRefs);
    const obj = {};
    const r1 = memo(obj, 1);
    const r2 = memo(obj, 1);
    expect(r2).toBe(r1);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it('zmiana elementu klucza: nowy wynik', () => {
    const compute = vi.fn<(a: object) => object>((a) => ({ a }));
    const memo = memoLast(compute, sameRefs);
    const r1 = memo({});
    const r2 = memo({});
    expect(r2).not.toBe(r1);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('własny komparator decyduje o równości klucza', () => {
    const compute = vi.fn<(s: string) => object>((s) => ({ s }));
    const memo = memoLast(compute, (a, b) => a[0].toLowerCase() === b[0].toLowerCase());
    expect(memo('Ab')).toBe(memo('aB'));
    expect(compute).toHaveBeenCalledTimes(1);
  });
});
