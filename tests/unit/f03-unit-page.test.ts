import { describe, expect, it } from 'vitest';
import indicators from '../../config/indicators.json';
import shardData from '../fixtures/facts/shard-12.json';
import profileData from '../fixtures/seo/profile-12.json';
import unitsData from '../fixtures/seo/units.json';
import { decodeFact } from '../../src/core/facts/codec';
import { factSentence } from '../../src/core/facts/sentences';
import { auditPages, readPage } from '../../src/core/seo/audit';
import { shortIndicatorName } from '../../src/core/seo/sentences';
import type { PageFacts } from '../../src/core/seo/fact-lead';
import { renderUnitPage } from '../../src/core/seo/page-template';
import { buildUnitPaths, type SlugUnit } from '../../src/core/seo/slug';
import { buildUnitPage, type PageProfile } from '../../src/core/seo/unit-page';

// Wycinki prawdziwych plików: profil i fakty województwa małopolskiego (opis w polach $opis).
const profile = profileData as unknown as PageProfile;
const units = unitsData as SlugUnit[];
const facts = shardData as unknown as PageFacts;
const paths = buildUnitPaths(units);
const ctx = { units, paths, indicators, facts };
const unit = (teryt: string) => units.find((u) => u.teryt === teryt)!;
const page = (teryt: string) => buildUnitPage(unit(teryt), profile, ctx);
const html = (teryt: string) =>
  renderUnitPage({ ...page(teryt), level: unit(teryt).level, centroid: null }, { css: ['/assets/a.css'] });

const PAGES = ['12', '1206', '1219', '1261', '1201011', '1206162', '1219022', '1219053'];
const known = new Set(paths.pathByTeryt.values());

describe('F03 strona miejsca z faktami', () => {
  it('lead ma ≥ 3 zdania faktów z pliku robota (po zdaniu o ludności)', () => {
    for (const t of PAGES) {
      const p = page(t);
      const own = facts.units[p.teryt].map((e) => decodeFact(p.teryt, e));
      expect(own.length).toBeGreaterThanOrEqual(3);
      expect(p.templates).toHaveLength(own.length);
      const level = unit(p.teryt).level;
      const expected = own.map((f) => {
        const ind = indicators.find((i) => i.id === f.indicatorId)!;
        return factSentence(f, { indicator: ind, level, voivodeshipName: 'małopolskie', typicalBand: 10 });
      });
      const inLead = expected.filter((s) => s !== null && p.lead.includes(s));
      expect(inLead.length).toBeGreaterThanOrEqual(3);
      expect(p.lead[0]).toMatch(/mieszka/);
    }
  });

  it('lead bez powtórzeń: żadne zdanie dwa razy, zdania S06 nie powtarzają wskaźnika z faktów', () => {
    for (const t of PAGES) {
      const p = page(t);
      expect(new Set(p.lead).size).toBe(p.lead.length);
      const ids = facts.units[p.teryt].map((e) => String(e[1]));
      expect(ids.includes('population') && p.lead.some((s) => s.startsWith('Pod względem liczby ludności'))).toBe(false);
      for (const s of p.lead.filter((x) => /^Najlepsze|^Najsłabsze/.test(x))) {
        const name = s.match(/„([^”]+)”/)![1];
        const ind = indicators.find((i) => name === shortIndicatorName(i.name, i.unit));
        expect(ind).toBeDefined();
        expect(ids).not.toContain(ind!.id);
      }
    }
  });

  it('strona linkuje do sąsiadów i bliźniaka – tylko istniejące adresy', () => {
    const p = page('1219053');
    expect(p.links.around!.length).toBeGreaterThanOrEqual(4);
    for (const l of p.links.around!) expect(known.has(l.path)).toBe(true);
    expect(p.links.around!.map((l) => l.path)).not.toContain(p.path);
    const twin = p.links.twin!;
    expect(known.has(twin.path)).toBe(true);
    expect(twin.teryt.slice(0, 2)).not.toBe('12');
    const doc = html('1219053');
    expect(doc).toContain(`href="${p.links.around![0].path}"`);
    expect(doc).toContain(`href="${twin.path}"`);
    expect(doc).toMatch(/Bliźniak w innym województwie/);
    expect(doc).toMatch(/Najbardziej podobne miejsce w innym województwie według \d+ wskaźników GUS \(\d{4} r\.\)/);
    expect(doc).not.toMatch(/undefined|NaN/);
  });

  it('miasto na prawach powiatu: sąsiedzi bez własnego adresu i bez powtórzeń', () => {
    const p = page('1261011');
    const around = p.links.around!.map((l) => l.path);
    expect(around).not.toContain(p.path);
    expect(new Set(around).size).toBe(around.length);
  });

  it('bez pliku faktów strona zostaje przy zdaniach S06 (bez szablonów i linków F03)', () => {
    const p = buildUnitPage(unit('1219053'), profile, { units, paths, indicators });
    expect(p.templates).toBeUndefined();
    expect(p.links.around).toBeUndefined();
    expect(p.links.twin).toBeUndefined();
  });

  it('audyt S08 dostaje szablony zdań ze stron i ostrzega przy > 30% stron z tym samym szablonem', () => {
    const list = PAGES.filter((t) => t.length <= 4).map((t) => readPage(page(t).path, html(t), page(t).templates));
    for (const a of list) expect(a.templates!.length).toBeGreaterThanOrEqual(3);
    const issues = auditPages(list, [], { knownPaths: known }).filter((i) => i.code === 'template-share');
    const usage = new Map<string, number>();
    for (const a of list) for (const t of new Set(a.templates)) usage.set(t, (usage.get(t) ?? 0) + 1);
    const over = [...usage].filter(([, n]) => n / list.length > 0.3).map(([t]) => t).sort();
    expect(over.length).toBeGreaterThan(0);
    expect(issues.map((i) => i.path).sort()).toEqual(over);
    for (const i of issues) expect(i.level).toBe('warning');
  });
});
