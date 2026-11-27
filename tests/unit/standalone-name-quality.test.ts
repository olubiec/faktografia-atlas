import { describe, expect, it } from 'vitest';
import rows from '../fixtures/library-names.json';
import { standaloneName } from '../../src/core/catalog/standalone-name';

// Nagrane z biblioteki GUS wiersze (nazwa surowa, jednostka, ścieżka) – po jednym–dwa na temat.
type Row = { n: string; u: string; c: string };
const names = (rows as Row[]).map((r) => ({ ...r, name: standaloneName(r.n, r.c) }));
const topic = (c: string) => c.split(' > ').slice(-1)[0];
const find = (n: string, t: string) => names.find((r) => r.n.toLowerCase() === n.toLowerCase() && topic(r.c)!.startsWith(t))?.name;

describe('nazwy wskaźników – wymagania ogólne (cała próbka)', () => {
  it('żadna nazwa nie jest pojedynczym ogólnym słowem', () => {
    const lone = names.filter((r) => r.name.split(/\s+/).length < 2);
    expect(lone.map((r) => r.name)).toEqual([]);
  });
  it('nie zostają śmieci z GUS: „wartość liczbowa”, „stan w dniu”, wiszące myślniki, podwójne spacje', () => {
    const bad = names.filter((r) => /wartość liczbowa|stan w dniu|\s[-–]\s*$|\s{2,}|^\s|\s$/i.test(r.name));
    expect(bad.map((r) => r.name)).toEqual([]);
  });
  it('zaczyna wielką literą i skróty nie są zamieniane na małe (JST, UE)', () => {
    const bad = names.filter((r) => r.name.charAt(0) !== r.name.charAt(0).toLocaleUpperCase('pl') || /\b(jst|ue)\b/.test(r.name));
    expect(bad.map((r) => r.name)).toEqual([]);
  });
  it('dopisany temat nie rozdyma nazwy ponad rozsądek (surowe nazwy GUS bywają długie, to nie nasza wina)', () => {
    expect(names.filter((r) => r.name.length > Math.max(r.n.length + 75, topic(r.c)!.length + 25)).map((r) => r.name)).toEqual([]);
  });
});

describe('nazwy wskaźników – przypadki z zestawień', () => {
  it('choroba dostaje temat: „Krztusiec – zachorowania”', () => {
    expect(find('krztusiec', 'Zachorowania')).toBe('Krztusiec – zachorowania');
  });
  it('ocena sytuacji materialnej brzmi jak zdanie', () => {
    expect(find('dobra', 'Subiektywna')).toBe('Sytuacja materialna gospodarstw oceniana jako dobra');
    expect(standaloneName('raczej zła', 'LUDNOŚĆ > GOSPODARSTWA DOMOWE > Subiektywna ocena sytuacji materialnej gospodarstw domowych')).toBe('Sytuacja materialna gospodarstw oceniana jako raczej zła');
  });
  it('„uczniowie” wiedzą, z jakiej szkoły', () => {
    expect(find('uczniowie', 'Szkoły podstawowe')).toBe('Szkoły podstawowe – uczniowie');
  });
  it('odpady biodegradowalne w relacji do ogółu mają pełną nazwę', () => {
    expect(find('biodegradowalne', 'Odpady zebrane selektywnie w relacji')).toBe('Odpady zebrane selektywnie (% ogółu odpadów) – biodegradowalne');
  });
  it('granice ubóstwa i sekcje PKD czytelne', () => {
    expect(find('relatywnej granicy ubóstwa', 'Wskaźniki zasięgu')).toBe('Odsetek osób poniżej relatywnej granicy ubóstwa');
    expect(find('Sekcja J', 'Przeciętne miesięczne wynagrodzenia')).toBe('Przeciętne wynagrodzenie brutto: informacja i komunikacja (sekcja J)');
  });
  it('budżety powiatów i województw da się odróżnić', () => {
    const a = standaloneName('dochody własne', 'FINANSE PUBLICZNE > DOCHODY BUDŻETÓW POWIATÓW > Dochody na 1 mieszkańca');
    const b = standaloneName('dochody własne', 'FINANSE PUBLICZNE > DOCHODY BUDŻETÓW WOJEWÓDZTW > Dochody na 1 mieszkańca');
    expect(a).not.toBe(b);
  });
  it('okruch zdania dostaje temat: „w % ludności aktywnej zawodowo”', () => {
    expect(standaloneName('w % ludności aktywnej zawodowo', 'RYNEK PRACY > BEZROBOCIE REJESTROWANE > Bezrobotni zarejestrowani pozostający bez pracy dłużej niż 1 rok')).toMatch(/^Bezrobotni zarejestrowani/);
  });
  it('samo „wartość liczbowa” zamienia się w temat', () => {
    expect(standaloneName('wartość liczbowa', 'RYNEK PRACY > BAEL > Wskaźnik zatrudnienia kobiet')).toBe('Wskaźnik zatrudnienia kobiet');
  });
});
