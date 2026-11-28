import { describe, expect, it } from 'vitest';
import { issueTitle, parseCheckedUrls, pickDailyBatch, renderIssueBody } from '../../src/core/seo/daily-batch';

const S = 'https://faktografia.eu';
const many = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${S}${prefix}${i}`);
const sample = [
  `${S}/`,
  `${S}/mapa`,
  ...many('/wojewodztwo/w', 3),
  ...many('/powiat/p', 30),
  `${S}/miasto/wroclaw`,
  ...many('/ranking/ind/powiaty/', 4),
  `${S}/ranking/ind/gminy`,
  `${S}/ranking/ind/gminy/mazowieckie`,
  ...many('/temat/t', 3),
  `${S}/zestawienie/najszybciej-rosnace-gminy`,
  `${S}/zestawienie/najszybciej-rosnace-powiaty`,
  ...many('/gmina/g', 5),
  ...many('/miejscowosc/m', 5),
  ...many('/porownaj/a-vs-b', 2),
];

describe('S18 pickDailyBatch', () => {
  it('daje najwyżej 10 adresów, bez duplikatów', () => {
    const r = pickDailyBatch({ urls: [...sample, ...sample], date: '2026-11-29' });
    expect(r.length).toBe(10);
    expect(new Set(r).size).toBe(10);
  });

  it('nigdy nie bierze gmin, miejscowości, porównań ani rankingów i zestawień gmin', () => {
    const all = pickDailyBatch({ urls: sample, date: '2026-11-29', limit: 1000 });
    expect(all.length).toBeGreaterThan(40);
    for (const u of all) {
      expect(u).not.toMatch(/gmin|\/miejscowosc|\/porownaj/);
    }
    expect(all).not.toContain(`${S}/ranking/ind/gminy`);
    expect(all).not.toContain(`${S}/zestawienie/najszybciej-rosnace-gminy`);
  });

  it('trzyma kolejność: główna, województwa, powiaty, rankingi, tematy', () => {
    const all = pickDailyBatch({ urls: [...sample].reverse(), date: '2026-11-29', limit: 1000 });
    const rank = (u: string) =>
      u === `${S}/` || u === `${S}/mapa` ? 0 : u.includes('/wojewodztwo/') ? 1 : /\/(powiat|miasto)\//.test(u) ? 2 : u.includes('/ranking') ? 3 : 4;
    const ranks = all.map(rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(ranks)).toEqual(new Set([0, 1, 2, 3, 4]));
  });

  it('pomija odhaczone, a gdy zostaje mało, zwraca mniej', () => {
    const urls = [`${S}/`, `${S}/wojewodztwo/a`, `${S}/wojewodztwo/b`];
    expect(pickDailyBatch({ urls, done: [`${S}/`], date: '2026-11-29' }).sort()).toEqual([`${S}/wojewodztwo/a`, `${S}/wojewodztwo/b`]);
    expect(pickDailyBatch({ urls, done: urls, date: '2026-11-29' })).toEqual([]);
  });

  it('ta sama data daje to samo, inna datę przesuwa porcję w tej samej grupie', () => {
    const urls = many('/powiat/p', 30);
    const a = pickDailyBatch({ urls, date: '2026-11-29' });
    expect(pickDailyBatch({ urls, date: '2026-11-29' })).toEqual(a);
    const b = pickDailyBatch({ urls, date: '2026-11-30' });
    expect(b).not.toEqual(a);
    expect(b.filter((u) => a.includes(u))).toEqual([]);
  });
});

describe('S18 treść zgłoszenia i odczyt odhaczeń', () => {
  it('renderuje checklistę i instrukcję po polsku', () => {
    const body = renderIssueBody([`${S}/`, `${S}/mapa`], '2026-11-29');
    expect(body).toContain(`- [ ] ${S}/`);
    expect(body).toContain(`- [ ] ${S}/mapa`);
    expect(body).toMatch(/Search Console → Sprawdzanie adresu URL/);
    expect(body).toMatch(/Poproś o zindeksowanie/);
    expect(body).toMatch(/odznacz kratkę/);
    expect(issueTitle('2026-11-29')).toBe('SEO – dzień 2026-11-29');
  });

  it('czyta tylko odhaczone adresy (x i X), resztę ignoruje', () => {
    const body = ['tekst', `- [x] ${S}/a`, `- [X] ${S}/b`, `- [ ] ${S}/c`, `- [x] nie adres`, `  * [x] ${S}/d`].join('\n');
    expect(parseCheckedUrls(body)).toEqual([`${S}/a`, `${S}/b`, `${S}/d`]);
    expect(parseCheckedUrls(renderIssueBody([`${S}/`], '2026-11-29'))).toEqual([]);
  });

  it('wyrenderowana lista po odhaczeniu wraca do parsera', () => {
    const body = renderIssueBody([`${S}/x`, `${S}/y`], '2026-11-29').replace(`- [ ] ${S}/y`, `- [x] ${S}/y`);
    expect(parseCheckedUrls(body)).toEqual([`${S}/y`]);
  });
});
