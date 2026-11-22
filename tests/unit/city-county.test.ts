import { describe, expect, it } from 'vitest';
import { cityCountyNote, isCityCounty, unitLabel, unitTitle } from '@/core/units/label';
import type { Unit } from '@/core/units/types';

const mk = (teryt: string, name: string, level: Unit['level']): Unit => ({
  teryt, name, level, bdlId: null, parent: null, bbox: [0, 0, 0, 0], centroid: [0, 0],
});

describe('miasta na prawach powiatu', () => {
  it('rozpoznaje powiaty grodzkie po numerze powiatu od 61, także 2470–2479', () => {
    expect(isCityCounty('3262')).toBe(true);
    expect(isCityCounty('3262011')).toBe(true);
    expect(isCityCounty('2479')).toBe(true);
    expect(isCityCounty('2470')).toBe(true);
    expect(isCityCounty('3217')).toBe(false);
    expect(isCityCounty('3215011')).toBe(false);
    expect(isCityCounty('32')).toBe(false);
  });

  it('Szczecin jako powiat to „miasto na prawach powiatu”, nie zwykły powiat', () => {
    const pow = mk('3262', 'powiat Szczecin', 'pow');
    expect(unitLabel(pow)).toBe('Szczecin (miasto na prawach powiatu)');
    expect(unitTitle(pow)).toBe('Miasto na prawach powiatu Szczecin');
    expect(unitTitle(mk('3262011', 'Szczecin', 'gmi'))).toBe('Gmina miejska Szczecin');
  });

  it('zwykły powiat zostaje powiatem', () => {
    expect(unitTitle(mk('3217', 'powiat wałecki', 'pow'))).toBe('Powiat wałecki');
  });

  it('wyjaśnienie jest dla powiatu grodzkiego i jego gminy, nie dla reszty', () => {
    expect(cityCountyNote(mk('3262', 'powiat Szczecin', 'pow'))).toContain('Szczecin to miasto na prawach powiatu');
    expect(cityCountyNote(mk('3262011', 'Szczecin', 'gmi'))).toContain('gminą miejską i powiatem');
    expect(cityCountyNote(mk('3217', 'powiat wałecki', 'pow'))).toBeNull();
    expect(cityCountyNote(mk('32', 'zachodniopomorskie', 'woj'))).toBeNull();
  });
});

describe('przypis dla gminy miasta na prawach powiatu', () => {
  it('wyjaśnia, że dane powiatowe są danymi całego miasta', async () => {
    const { formatParentFootnoteText } = await import('@/core/profile/footnotes');
    const units = [mk('3262', 'powiat Szczecin', 'pow')];
    const text = formatParentFootnoteText('3262', units);
    expect(text).toContain('Szczecin jest miastem na prawach powiatu');
    expect(text).toContain('dane całego miasta');
  });
});

describe('nazwy na listach i rankingach', () => {
  it('powiat ziemski bez słowa „powiat”, miasto na prawach powiatu z dopiskiem', async () => {
    const { listName } = await import('@/core/units/label');
    const { unitKindLine } = await import('@/core/units/kinds');
    expect(listName(mk('3217', 'powiat wałecki', 'pow'))).toBe('wałecki');
    expect(listName(mk('3262', 'powiat Szczecin', 'pow'))).toBe('Szczecin (miasto na prawach powiatu)');
    expect(listName(mk('3217011', 'Wałcz', 'gmi'))).toBe('Wałcz (miasto)');
    expect(unitKindLine(mk('3262', 'powiat Szczecin', 'pow'))).toBe('Miasto na prawach powiatu – miasto i powiat w jednym');
    expect(unitKindLine(mk('3217', 'powiat wałecki', 'pow'))).toBe('Powiat ziemski – związek kilku gmin');
  });
});
