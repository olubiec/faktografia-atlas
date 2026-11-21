import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LevelSwitch } from '@/view/main/LevelSwitch';

describe('LevelSwitch: poziomy z danymi', () => {
  it('wyłącza poziom bez danych, nawet gdy minLevel by go dopuszczał', () => {
    render(<LevelSwitch value="pow" minLevel="gmi" levels={['pow', 'gmi']} onChange={vi.fn()} />);
    expect((screen.getByRole('button', { name: 'Województwa' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Powiaty' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('bez listy poziomów działa jak dotąd (województwa zawsze)', () => {
    render(<LevelSwitch value="woj" minLevel="pow" onChange={vi.fn()} />);
    expect((screen.getByRole('button', { name: 'Województwa' }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: 'Gminy' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
