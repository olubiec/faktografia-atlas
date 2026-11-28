import { describe, expect, it } from 'vitest';
import { sharedRegistry } from '@/core/indicators/shared-registry';
import type { AvailableFile } from '@/core/indicators/registry';
import type { Indicator } from '@/core/profile/profile';

const MAIN = [{ id: 'm1', name: 'Główny', unit: 'zł', description: '', group: 'g', higherIsBetter: null, minLevel: 'gmi' }] as unknown as Indicator[];
const AVAILABLE: AvailableFile = { version: 1, variables: [{ id: '5', n: 'Biblioteczny', u: 'os.', lv: ['woj', 'pow'], y: [2020] }] };

describe('sharedRegistry', () => {
  it('zwraca ten sam rejestr dla tych samych wejść (bez ponownego budowania)', () => {
    expect(sharedRegistry(MAIN, AVAILABLE)).toBe(sharedRegistry(MAIN, AVAILABLE));
  });
  it('buduje na nowo, gdy dojdzie spis biblioteki', () => {
    const before = sharedRegistry(MAIN, null);
    const after = sharedRegistry(MAIN, AVAILABLE);
    expect(after).not.toBe(before);
    expect(after.byId.get('b5')?.minLevel).toBe('pow');
  });
});
