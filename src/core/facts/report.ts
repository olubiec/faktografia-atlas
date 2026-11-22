// Raport liczności faktów i próbka 50 losowych gmin (docs/research/F01-przeglad-faktow.md).
// Losowanie z ziarnem – ten sam raport przy tych samych danych.
import { unitHeading } from '../seo/sentences';
import type { FactsBuild, FactsShard } from './build';
import type { FactsContext } from './context';
import { factSentence } from './sentences';
import type { Fact, FactType, Level } from './types';

const TYPES: FactType[] = ['F1', 'F2', 'F4', 'F5', 'F9'];
const LABEL: Record<FactType, string> = {
  F1: 'F1 skrajność w Polsce (1% górny/dolny w poziomie)',
  F2: 'F2 miejsce 1–3 / 3 ostatnie w województwie (≥ 15 jednostek)',
  F4: 'F4 zmiana 10 lat (2% górne/dolne, bez zmian granic)',
  F5: 'F5 rekord względem mediany kraju (> 15%)',
  F9: 'F9 typowość (pozycja wobec mediany)',
};

/** Zdanie faktu w kontekście danych (nazwa wskaźnika, poziom, województwo). */
export function sentenceFor(ctx: FactsContext, f: Fact): string | null {
  const unit = ctx.units.get(f.teryt);
  const indicator = ctx.indicators.get(f.indicatorId);
  if (!unit || !indicator) return null;
  const voivodeshipName = ctx.units.get(f.teryt.slice(0, 2))?.name;
  return factSentence(f, { indicator, level: unit.level, voivodeshipName, typicalBand: ctx.input.config.thresholds.typicalBand });
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pct = (n: number, d: number) => `${d ? ((n / d) * 100).toFixed(1).replace('.', ',') : '0'}%`;

export function renderReport(build: FactsBuild, shards: Record<string, FactsShard>, startBytes: number): string {
  const { ctx, byUnit } = build;
  const units = ctx.input.units;
  const total = units.length;
  const lines: string[] = [];
  lines.push('# F01 – przegląd faktów (raport robota)', '');
  lines.push(`Wygenerowane przez \`node scripts/data/build-facts.mjs --report docs/research/F01-przeglad-faktow.md\` z \`public/data\` (dane z ${Object.values(shards)[0]?.generatedAt.slice(0, 10) ?? '?'}). Jednostek: ${total}.`, '');
  lines.push('## Liczność kandydatów (przed doborem)', '', '| Rama | Faktów | Jednostek z ≥ 1 | Udział jednostek |', '|---|---:|---:|---:|');
  for (const t of TYPES) {
    let facts = 0;
    let withAny = 0;
    for (const u of byUnit.values()) {
      facts += u.counts[t] ?? 0;
      if (u.counts[t]) withAny++;
    }
    lines.push(`| ${LABEL[t]} | ${facts} | ${withAny} | ${pct(withAny, total)} |`);
  }
  lines.push('', '## Pokrycie po doborze (3 fakty, ≤ 1 na wskaźnik, ≤ 2 na grupę)', '', '| Poziom | Jednostek | ≥ 3 kandydatów F1–F5 | ≥ 3 fakty | 3 fakty bez F9 | ≥ 1 fakt F1/F2/F4/F5 | tylko F9 |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const level of ['woj', 'pow', 'gmi', 'razem'] as const) {
    const list = level === 'razem' ? units : units.filter((u) => u.level === (level as Level));
    const sel = list.map((u) => byUnit.get(u.teryt)?.selected ?? []);
    const strong = (s: Fact[]) => s.filter((f) => f.type !== 'F9').length;
    const cand = list.filter((u) => {
      const c = byUnit.get(u.teryt)?.counts ?? {};
      return (c.F1 ?? 0) + (c.F2 ?? 0) + (c.F4 ?? 0) + (c.F5 ?? 0) >= 3;
    }).length;
    lines.push(
      `| ${level} | ${list.length} | ${pct(cand, list.length)} | ${pct(sel.filter((s) => s.length >= 3).length, list.length)} | ${pct(sel.filter((s) => strong(s) >= 3).length, list.length)} | ${pct(sel.filter((s) => strong(s) >= 1).length, list.length)} | ${pct(sel.filter((s) => strong(s) === 0).length, list.length)} |`,
    );
  }
  const shown = new Map<FactType, number>();
  for (const u of byUnit.values()) for (const f of u.selected) shown.set(f.type, (shown.get(f.type) ?? 0) + 1);
  lines.push('', `Pokazane fakty wg ramy: ${TYPES.map((t) => `${t} ${shown.get(t) ?? 0}`).join(' · ')}.`, '');
  lines.push(
    'Uwagi do liczb (różnice wobec prototypu z §2 koncepcji):',
    '- Rekord względny (F5) liczy się tylko wtedy, gdy rekordem jest **ostatni** rok – fakt mówi o teraz, nie o 2009 r. Prototyp liczył rekord w dowolnym roku, stąd u niego więcej F5.',
    '- Skrajność (F1, F2, F4) wymaga, by cała grupa remisu zmieściła się w progu (100 gmin z 0% kanalizacji to nie skrajność).',
    '- Gminy < 5 tys. mieszkańców: wskaźniki „na 1000” i „na 10 tys.” jako średnia 3 lat (zdanie mówi „średnio … w latach …”).',
    '- Rama „sąsiedzi” (F3) i F6–F8 nie są w tym PR (zadanie F01: F1, F2, F4, F5, F9). F3 podniosłaby udział gmin z 3 faktami bez F9 (prototyp: 93,5%).',
    '- F9 (typowość) to ostatnia deska: pozycja wobec mediany kraju, zawsze z liczbą i rokiem.',
    '',
  );

  const boundary = units.filter((u) => ctx.boundaryYears(u.teryt).length > 0);
  const pairs = boundary.reduce((n, u) => n + ctx.boundaryYears(u.teryt).length, 0);
  lines.push('## Zmiany granic (powierzchnia = ludność ÷ gęstość, skok > 3% r/r)', '');
  lines.push(`${pairs} skoków w ${boundary.length} jednostkach. Okno 10 lat z takim rokiem nie daje faktu F4; rekord F5 dla ludności i gęstości też nie.`, '');
  const known = ['Opole', 'Dobrzeń Wielki', 'Zielona Góra', 'Supraśl', 'Hel'];
  for (const name of known) {
    const hits = boundary.filter((u) => u.name === name).map((u) => `${u.teryt} (${ctx.boundaryYears(u.teryt).join(', ')})`);
    lines.push(`- ${name}: ${hits.length ? hits.join('; ') : 'nie wykryto'}`);
  }
  lines.push('', '## Rozmiary plików', '', '| Plik | Jednostek | Bajtów |', '|---|---:|---:|');
  for (const [woj, shard] of Object.entries(shards)) lines.push(`| facts/${woj}.json | ${Object.keys(shard.units).length} | ${JSON.stringify(shard).length} |`);
  lines.push(`| facts-start.json | – | ${startBytes} |`, '');

  const rnd = mulberry32(26);
  const gminy = units.filter((u) => u.level === 'gmi');
  const sample = new Set<number>();
  while (sample.size < Math.min(50, gminy.length)) sample.add(Math.floor(rnd() * gminy.length));
  lines.push('## 50 losowych gmin – po 3 fakty (do przeglądu)', '');
  for (const i of [...sample].sort((a, b) => a - b)) {
    const g = gminy[i];
    const woj = ctx.units.get(g.teryt.slice(0, 2))?.name ?? '';
    lines.push(`### ${unitHeading(g, units)} (${g.teryt}, ${woj})`, '');
    for (const f of byUnit.get(g.teryt)?.selected ?? []) lines.push(`- [${f.type}] ${sentenceFor(ctx, f) ?? '(brak zdania)'}`);
    lines.push('');
  }
  return lines.join('\n');
}
