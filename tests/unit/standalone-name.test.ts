import { describe, expect, it } from 'vitest';
import { standaloneName } from '../../src/core/catalog/standalone-name';

const path = 'Ludność > Stan i struktura > Ludność wg płci i wieku';
describe('standaloneName', () => {
  it('dopisuje temat do samej cechy', () => {
    expect(standaloneName('ogółem – 0', path)).toBe('Ludność wg płci i wieku – ogółem w wieku 0 lat');
    expect(standaloneName('mężczyźni – 5', path)).toBe('Ludność wg płci i wieku – mężczyźni w wieku 5 lat');
  });
  it('zostawia nazwę z podmiotem', () => {
    expect(standaloneName('Ludność ogółem', path)).toBe('Ludność ogółem');
  });
  it('bez ścieżki nic nie zmienia', () => {
    expect(standaloneName('ogółem', null)).toBe('Ogółem');
  });
});

describe('standaloneName – sprzątanie', () => {
  it('wiek zapisuje słowami z poprawną odmianą', () => {
    expect(standaloneName('mężczyźni – 1', path)).toBe('Ludność wg płci i wieku – mężczyźni w wieku 1 rok');
    expect(standaloneName('kobiety – 3', path)).toBe('Ludność wg płci i wieku – kobiety w wieku 3 lata');
    expect(standaloneName('ogółem – 12', path)).toBe('Ludność wg płci i wieku – ogółem w wieku 12 lat');
  });
  it('usuwa powtórzone „ogółem” i „stan w dniu 31 grudnia”', () => {
    expect(standaloneName('Zgony ogółem – ogółem', null)).toBe('Zgony ogółem');
    expect(standaloneName('dzieci ogółem stan w dniu 31 grudnia', null)).toBe('Dzieci ogółem');
    expect(standaloneName('ogółem – powierzchnia użytkowa mieszkań', null)).toBe('Powierzchnia użytkowa mieszkań');
  });
  it('naprawia „1000*mieszkańców”', () => {
    expect(standaloneName('liczba dodatków na 1000*mieszkańców', null)).toBe('Liczba dodatków na 1000 mieszkańców');
  });
});

describe('standaloneName – działy budżetu', () => {
  const base = 'FINANSE PUBLICZNE > WYDATKI BUDŻETÓW GMIN > Wydatki w Dziale ';
  it('dopisuje dział, żeby powtarzające się wskaźniki były rozróżnialne', () => {
    const a = standaloneName('wydatki bieżące na wynagrodzenia', `${base}900 - Gospodarka komunalna i ochrona środowiska`);
    const b = standaloneName('wydatki bieżące na wynagrodzenia', `${base}851- Ochrona zdrowia`);
    expect(a).toBe('Wydatki bieżące na wynagrodzenia (dział: gospodarka komunalna i ochrona środowiska)');
    expect(b).toBe('Wydatki bieżące na wynagrodzenia (dział: ochrona zdrowia)');
    expect(a).not.toBe(b);
  });
});

describe('podmiot z tematu „X wg Y”', () => {
  it('„pracownicy biurowi” wśród radnych dostaje podmiot', () => {
    expect(standaloneName('pracownicy biurowi', 'SAMORZĄD TERYTORIALNY > ORGANY GMINY > Radni gminy wg grup zawodów')).toBe(
      'Radni gminy – pracownicy biurowi'
    );
  });
  it('nazwa ze słowem z podmiotu zostaje bez zmian', () => {
    expect(standaloneName('Radni ogółem', 'X > Y > Radni gminy wg płci')).toBe('Radni ogółem');
  });
});
