import { describe, expect, it } from 'vitest';
import factsConfig from '../../config/facts.json';
import { listPlaceholders, listView } from '../../src/core/start/discoveries';
import { ALL_LISTS_HREF, listLinks } from '../../src/core/start/list-links';

// Zestawienia na starcie prowadzą do pełnych stron zestawień: ta sama lista i drugi koniec skali.
describe('zestawienia startu: pełna lista i drugi koniec skali', () => {
  it('najmłodsze gminy ↔ najstarsze gminy (mediana wieku)', () => {
    const l = listLinks('median-age', 'gmi', -1);
    expect(l.full?.href).toBe('/zestawienie/najmlodsze-gminy');
    expect(l.opposite?.href).toBe('/zestawienie/najstarsze-gminy');
    // Tytuł bez „w Polsce” – krótszy napis na telefonie.
    expect(l.opposite?.label).toBe('Najstarsze gminy – mediana wieku');
  });

  it('najbogatsze gminy ↔ gminy z najniższymi dochodami', () => {
    const l = listLinks('income-per-capita', 'gmi', 1);
    expect(l.full?.href).toBe('/zestawienie/najbogatsze-gminy');
    expect(l.opposite?.href).toBe('/zestawienie/gminy-z-najnizszymi-dochodami');
  });

  it('brak strony zestawienia = brak linku (np. inny poziom albo zestawienie zmiany)', () => {
    expect(listLinks('forest-cover', 'gmi', -1)).toEqual({ full: null, opposite: { href: '/zestawienie/najbardziej-zalesione-gminy', label: 'Najbardziej zalesione gminy' } });
    expect(listLinks('population', 'gmi', 1)).toEqual({ full: null, opposite: null });
  });

  it('karta zestawienia i karta zastępcza (przed pobraniem danych) mają te same linki', () => {
    const cfg = factsConfig.start.lists[3] as { indicatorId: string; level: 'gmi' | 'pow' | 'woj'; dir: 1 | -1 };
    const view = listView({ ...cfg, year: 2026, top: [['2205042', 'Sierakowice', 39]] })!;
    const placeholder = listPlaceholders().find((p) => p.key === view.key)!;
    expect(view.full).toEqual(placeholder.full);
    expect(view.opposite).toEqual(placeholder.opposite);
    expect(view.opposite).not.toBeNull();
  });

  it('spis wszystkich zestawień', () => {
    expect(ALL_LISTS_HREF).toBe('/zestawienia');
  });
});
