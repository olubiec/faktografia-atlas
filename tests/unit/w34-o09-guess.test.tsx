import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { buildGuess, guessStart, pick, reveal } from '../../src/core/facts/guess';
import { findViolations } from '../../src/core/facts/tone-guard';
import { GuessReveal } from '../../src/view/start/GuessReveal';

const input = { teryt: '3204033', subject: 'Czytelnicy bibliotek publicznych', placePhrase: 'gminie Maszewo', value: 32, unit: 'na 1000' };
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('W34-O09 pytanie przed wynikiem', () => {
  it('poprawna odpowiedź jest jedną z trzech i ma stabilną pozycję dla tego samego TERYT', () => {
    const a = buildGuess(input)!;
    expect(a.options).toHaveLength(3);
    expect(a.options.filter((o) => o.correct)).toHaveLength(1);
    expect(a.options.find((o) => o.correct)?.label).toBe('1 na 31');
    expect(buildGuess(input)).toEqual(a);
    const positions = new Set(['1000001', '3204033', '1219053', '0201011', '2611032'].map((t) => buildGuess({ ...input, teryt: t })!.options.findIndex((o) => o.correct)));
    expect(positions.size).toBeGreaterThan(1);
  });
  it('procenty też dają trzy odpowiedzi; skala spoza „1 na N” i % = brak pytania', () => {
    expect(buildGuess({ ...input, value: 65, unit: '%' })?.options).toHaveLength(3);
    expect(buildGuess({ ...input, value: 1161, unit: 'zł' })).toBeNull();
    expect(buildGuess({ ...input, value: 0, unit: 'na 1000' })).toBeNull();
  });
  it('„Pokaż wynik” odsłania wynik bez wyboru; po wyborze widać „Twoja odpowiedź”', () => {
    const g = buildGuess(input)!;
    const render = (initial = guessStart) => text(renderToString(<GuessReveal guess={g} initial={initial}><p>WYNIK 1 na 31</p></GuessReveal>));
    const before = render();
    expect(before).toContain('Zanim zobaczysz wynik:');
    expect(before).toContain('Pokaż wynik');
    expect(before).not.toContain('WYNIK');
    const shown = render(reveal(guessStart));
    expect(shown).toContain('WYNIK');
    expect(shown).not.toContain('Twoja odpowiedź');
    const picked = render(pick(guessStart, 0));
    expect(picked).toContain(`Twoja odpowiedź: ${g.options[0].label}. Wynik:`);
    expect(picked).toContain('WYNIK');
  });
  it('bez pytania karta pokazuje wynik od razu', () => {
    expect(text(renderToString(<GuessReveal guess={null}><p>WYNIK</p></GuessReveal>))).toContain('WYNIK');
  });
  it('żaden tekst nie łamie tonu ani nie chwali', () => {
    const g = buildGuess(input)!;
    const t = [g.question, ...g.options.map((o) => o.label), 'Pokaż wynik', 'Twoja odpowiedź: 1 na 10. Wynik:'].join(' ');
    expect(findViolations(t)).toEqual([]);
    expect(t).not.toMatch(/Brawo|Trafi|punkt|odznak/i);
  });
  it('zero żądań sieciowych i zapisów w localStorage', () => {
    for (const f of ['src/core/facts/guess.ts', 'src/view/start/GuessReveal.tsx']) {
      expect(readFileSync(f, 'utf8')).not.toMatch(/fetch\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon/);
    }
  });
});
