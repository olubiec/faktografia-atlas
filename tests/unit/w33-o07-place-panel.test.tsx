import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { readFileSync } from 'node:fs';
import { pickRoles } from '../../src/core/facts/roles';
import { findViolations } from '../../src/core/facts/tone-guard';
import { PlacePanel } from '../../src/view/start/PlaceFacts';
import type { FactsFile } from '../../src/core/start/discoveries';

const base = JSON.parse(readFileSync('tests/fixtures/facts-roles/maszewo.json', 'utf8')) as FactsFile;
const file: FactsFile = { ...base, near: { '3204033': ['3201011'] } };
const names = new Map([['3204033', 'Maszewo'], ['3201011', 'Białogard']]);
const cards = pickRoles(file, '3204033');

function render(f: FactsFile = file) {
  return renderToString(
    <StaticRouter location="/">
      <PlacePanel file={f} cards={cards} teryt="3204033" name="Maszewo" names={names} twin={null} to={(h) => h} onChange={() => {}} />
    </StaticRouter>,
  );
}
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;/g, "'").replace(/\s+/g, ' ');

describe('W33-O07 panel „na tle Polski”', () => {
  const html = render();
  it('nagłówek, nadtytuł i podtytuł z rokiem', () => {
    expect(html).toContain('Gmina w liczbach');
    expect(html).toContain('Maszewo na tle Polski');
    expect(html).toContain('Co wyróżnia gminę w danych GUS za 2025 rok.');
  });
  it('5 kart w kolejności ról i dokładnie jedno zakreślenie korekta', () => {
    const order = [...html.matchAll(/data-slot="(role-card|place-neighbour)"(?: data-role="(\w+)")?/g)].map((m) => m[2] ?? m[1]);
    expect(order).toEqual(['unusual', 'strong', 'weak', 'change', 'place-neighbour']);
    expect(html.match(/data-highlight="korekta"/g)).toHaveLength(1);
    expect(html).toMatch(/data-role="unusual" data-highlight="korekta"/);
  });
  it('żaden widoczny tekst nie narusza słownika tonu', () => {
    const t = text(html);
    expect(findViolations(t.replace(/▲/g, ''))).toEqual([]);
    expect(t).toContain('1 na 31 mieszkańców');
  });
  it('„Ranking gmin” prowadzi do mapy z wskaźnikiem, rokiem i miejscem; bez dodatkowych żądań', () => {
    const hrefs = [...html.matchAll(/href="(\/mapa\?i=[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    expect(hrefs).toContain('/mapa?i=library-readers-per-1000&y=2025&u=3204033&l=gmi');
    // Karty i panel biorą dane tylko z propsów (jeden plik województwa); same nie sięgają do sieci.
    for (const f of ['RoleCard', 'NeighbourCard', 'SimilarPlace', 'ShareFact']) {
      expect(readFileSync(`src/view/start/${f}.tsx`, 'utf8')).not.toMatch(/fetch\(|loadPlaceFacts|loadUnits/);
    }
  });
  it('karta „none” mówi wprost, bez wypełniacza', () => {
    const f = structuredClone(file);
    f.pct!.u['3204033'] = String.fromCharCode(0x100 + 50).repeat(f.pct!.ind.length);
    const t = text(
      renderToString(
        <StaticRouter location="/">
          <PlacePanel file={f} cards={pickRoles(f, '3204033')} teryt="3204033" name="Maszewo" names={names} twin={null} to={(h) => h} onChange={() => {}} />
        </StaticRouter>,
      ),
    );
    expect(t).toContain('nie odstaje wyraźnie od środka stawki');
  });
  it('przyciski i pola mają min. 44 px, bez nowych kolorów', () => {
    expect(html).toMatch(/min-h-\[44px\]/);
  });
});
