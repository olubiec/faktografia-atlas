import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Strażnik PD02: oba roboty zapisują status, a awaria biblioteki jest zgłaszana (tylko odczyt plików workflowów).
const read = (f: string) =>
  fs
    .readFileSync(path.resolve(f), 'utf-8')
    .split('\n')
    .filter((l) => !l.trim().startsWith('#'))
    .join('\n');
const DATA = read('.github/workflows/fetch-data.yml');
const LIB = read('.github/workflows/fetch-library.yml');

describe('workflowy: status robota (PD02)', () => {
  it('oba workflowy wołają status.mjs i zapisują library/status.json', () => {
    for (const wf of [DATA, LIB]) {
      expect(wf).toMatch(/scripts\/data\/status\.mjs/);
      expect(wf).toMatch(/status\.json/);
    }
  });
  it('krok statusu działa zawsze i nie psuje przebiegu', () => {
    for (const wf of [DATA, LIB]) {
      const step = wf.split('- name: ').find((s) => s.includes('status.mjs')) ?? '';
      expect(step).toMatch(/if: always\(\)/);
      expect(step).toMatch(/continue-on-error: true/);
    }
  });
  it('fetch-library zgłasza błąd (bez duplikatów) i ma prawo zapisu zgłoszeń', () => {
    expect(LIB).toMatch(/if: failure\(\) && github\.event_name != 'workflow_dispatch'/);
    expect(LIB).toMatch(/Fetch library\) nie powiodło się/);
    expect(LIB).toMatch(/issues: write/);
  });
  it('zapis statusu nie dotyka main', () => {
    const step = DATA.split('- name: ').find((s) => s.includes('status.mjs')) ?? '';
    expect(step).toMatch(/refs\/heads\/\$LIB/);
    expect(step).not.toMatch(/origin main|refs\/heads\/main/);
  });
});
