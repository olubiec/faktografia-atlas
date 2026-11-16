import { describe, expect, it } from 'vitest';
import { changeSentence } from '../../src/core/story/change-sentence';

const ctx = { unitName: 'powiat testowy', indicatorUnit: 'os./km²', fromYear: 2015, toYear: 2025, share: 80 };
const mk = (from: number, to: number) => ({
  teryt: '1201', from, to, delta: to - from, deltaPercent: from === 0 ? null : ((to - from) / from) * 100,
});

describe('changeSentence', () => {
  it('wzrost: oba lata, przecinek dziesiętny, „wzrosła”', () => {
    const s = changeSentence(mk(100, 106.2), ctx);
    expect(s).toContain('2015');
    expect(s).toContain('2025');
    expect(s).toContain('wzrosła');
    expect(s).toContain('6,2%');
    expect(s).toContain('80%');
  });

  it('spadek: „spadła”', () => {
    const s = changeSentence(mk(100, 90), ctx);
    expect(s).toContain('spadła');
    expect(s).toContain('10,0%');
  });

  it('zero: „nie zmieniła się”', () => {
    expect(changeSentence(mk(5, 5), ctx)).toContain('nie zmieniła się');
  });

  it('from = 0 używa zmiany bezwzględnej z jednostką; bez share brak porównania', () => {
    const s = changeSentence(mk(0, 2.5), { ...ctx, share: null });
    expect(s).toContain('2,5');
    expect(s).not.toContain('jednostek');
  });
});
