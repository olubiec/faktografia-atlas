import { describe, it, expect } from 'vitest';
import unitsData from '../../public/data/units.json';
import { buildIndex } from '../../src/core/units/units';
import { selectedFromUrl, wantsFullSheet } from '../../src/core/url/selection';
import type { Unit } from '../../src/core/units/types';

const index = buildIndex(unitsData as Unit[]);

describe('selectedFromUrl: wybrana jednostka z adresu (także z samego ?c=)', () => {
  it('?u= ma pierwszeństwo przed ?c=', () => {
    expect(selectedFromUrl('?u=02&c=12,14', index)).toBe('02');
  });

  it('link „Porównaj z sąsiadem” (/mapa?c=a,b bez u) wybiera miejsce A, więc profil i porównanie się otwierają', () => {
    expect(selectedFromUrl('?c=12,14', index)).toBe('12');
  });

  it('?c= z nieznanym kodem nic nie wybiera', () => {
    expect(selectedFromUrl('?c=12,9999999', index)).toBeNull();
  });

  it('bez ?u= i ?c= zwraca null', () => {
    expect(selectedFromUrl('?e2e=1', index)).toBeNull();
  });
});

describe('wantsFullSheet: wysokość arkusza profilu na telefonie', () => {
  it('porównanie ?c=a,b otwiera arkusz na całą wysokość', () => {
    expect(wantsFullSheet('?c=12,14', index)).toBe(true);
  });

  it('?sheet=full też', () => {
    expect(wantsFullSheet('?u=12&sheet=full', index)).toBe(true);
  });

  it('zwykły profil (?u=) zostaje na niskiej wysokości', () => {
    expect(wantsFullSheet('?u=12', index)).toBe(false);
  });
});
