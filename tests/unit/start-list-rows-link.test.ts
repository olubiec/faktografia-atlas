import { describe, expect, it } from 'vitest';
import { listView } from '../../src/core/start/discoveries';
import factsConfig from '../../config/facts.json';

// Zestawienia na starcie: każdy wiersz prowadzi do mapy z tą jednostką (otwiera się jej profil).
describe('zestawienia startu: wiersz jest linkiem do jednostki', () => {
  it('adres wiersza ma wskaźnik, rok, TERYT jednostki i poziom', () => {
    const cfg = factsConfig.start.lists[0] as { indicatorId: string; level: 'woj' | 'pow' | 'gmi'; dir: 1 | -1 };
    const list = { ...cfg, year: 2025, top: [['1465011', 'Warszawa', 100], ['2262011', 'Gdańsk', 90]] as [string, string, number][] };
    const view = listView(list)!;
    expect(view.rows).toHaveLength(2);
    view.rows.forEach((r) => {
      expect(r.href).toContain(`i=${encodeURIComponent(list.indicatorId)}`);
      expect(r.href).toContain('y=2025');
      expect(r.href).toContain(`u=${r.teryt}`);
      expect(r.href).toContain(`l=${list.level}`);
    });
  });
});
