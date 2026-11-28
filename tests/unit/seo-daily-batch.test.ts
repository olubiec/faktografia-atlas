import { describe, expect, it } from 'vitest';
import { issueTitle, issueTitleUpdated, parseCheckedUrls, pickDailyBatch, renderIssueBody } from '../../src/core/seo/daily-batch';

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

describe('S18b stałe zgłoszenie: sekcja Zrobione', () => {
  it('renderuje sekcję Zrobione z odhaczonymi adresami i tytuł z datą aktualizacji', () => {
    const body = renderIssueBody([`${S}/a`], '2026-11-30', [`${S}/x`, `${S}/y`, `${S}/x`, `${S}/a`]);
    expect(body).toContain('## Zrobione');
    expect(body).toContain(`- [x] ${S}/x`);
    expect(body.match(new RegExp(`- \\[x\\] ${S}/x`, 'g'))?.length).toBe(1);
    expect(body).not.toContain(`- [x] ${S}/a`);
    expect(body).toContain(`- [ ] ${S}/a`);
    expect(renderIssueBody([`${S}/a`], '2026-11-30')).not.toContain('## Zrobione');
    expect(issueTitleUpdated('2026-11-30')).toBe('SEO – do zgłoszenia w Google (aktualizacja 2026-11-30)');
  });

  it('parser czyta listę dnia i sekcję Zrobione, bez duplikatów', () => {
    const body = [`- [x] ${S}/a`, '', '## Zrobione', '', `- [x] ${S}/b`, `- [x] ${S}/a`, `- [ ] ${S}/c`].join('\n');
    expect(parseCheckedUrls(body)).toEqual([`${S}/a`, `${S}/b`]);
  });

  it('po nadpisaniu treści odhaczone adresy nie przepadają (kilka dni z rzędu)', () => {
    const day1 = renderIssueBody([`${S}/a`, `${S}/b`], '2026-11-29');
    const afterTicking = day1.replace(`- [ ] ${S}/a`, `- [x] ${S}/a`);
    const done1 = parseCheckedUrls(afterTicking);
    const day2 = renderIssueBody([`${S}/b`, `${S}/c`], '2026-11-30', done1);
    expect(parseCheckedUrls(day2)).toEqual([`${S}/a`]);
    const afterTicking2 = day2.replace(`- [ ] ${S}/c`, `- [x] ${S}/c`);
    const day3 = renderIssueBody([`${S}/b`], '2026-12-01', parseCheckedUrls(afterTicking2));
    expect(parseCheckedUrls(day3).sort()).toEqual([`${S}/a`, `${S}/c`]);
    expect(day3).toContain(`- [ ] ${S}/b`);
  });
});
