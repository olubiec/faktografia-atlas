import { describe, expect, it } from 'vitest';
import { parseDiag } from '@/core/map/diag';

const none = { notrans: false, nohatch: false, nooutline: false };

describe('parseDiag (W20-CN05)', () => {
  it('puste i brak parametru: same false', () => {
    expect(parseDiag('')).toEqual(none);
    expect(parseDiag('?diag=')).toEqual(none);
    expect(parseDiag('?e2e=1')).toEqual(none);
  });
  it('pojedyncza wartość', () => {
    expect(parseDiag('?diag=notrans')).toEqual({ ...none, notrans: true });
    expect(parseDiag('?diag=nohatch')).toEqual({ ...none, nohatch: true });
    expect(parseDiag('?diag=nooutline')).toEqual({ ...none, nooutline: true });
  });
  it('kilka po przecinku', () => {
    expect(parseDiag('?diag=notrans,nooutline')).toEqual({ notrans: true, nohatch: false, nooutline: true });
    expect(parseDiag('?x=1&diag=notrans,nohatch,nooutline')).toEqual({ notrans: true, nohatch: true, nooutline: true });
  });
  it('śmieci są ignorowane', () => {
    expect(parseDiag('?diag=foo,,bar')).toEqual(none);
    expect(parseDiag('?diag=foo,nohatch')).toEqual({ ...none, nohatch: true });
  });
  it('wielkość liter nie ma znaczenia', () => {
    expect(parseDiag('?diag=NoTrans,NOHATCH')).toEqual({ ...none, notrans: true, nohatch: true });
  });
});
