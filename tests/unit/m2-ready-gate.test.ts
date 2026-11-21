import { describe, expect, it, vi } from 'vitest';
import { createReadyGate, ATLAS_READY_EVENT } from '@/core/map/ready-gate';

describe('M2 · sygnał „mapa gotowa”', () => {
  it('nie odpala, dopóki mapa nie jest bezczynna ORAZ pokolorowana', () => {
    const fire = vi.fn<() => void>();
    const gate = createReadyGate(fire);
    gate.setIdle();
    expect(fire).not.toHaveBeenCalled();
    gate.setColored(true);
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('kolejność odwrotna też działa', () => {
    const fire = vi.fn<() => void>();
    const gate = createReadyGate(fire);
    gate.setColored(true);
    gate.setIdle();
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('odpala tylko raz', () => {
    const fire = vi.fn<() => void>();
    const gate = createReadyGate(fire);
    gate.setColored(true);
    gate.setIdle();
    gate.setIdle();
    gate.setColored(true);
    expect(fire).toHaveBeenCalledTimes(1);
  });

  it('brak kolorów (false) nie liczy się jako gotowość', () => {
    const fire = vi.fn<() => void>();
    const gate = createReadyGate(fire);
    gate.setIdle();
    gate.setColored(false);
    expect(fire).not.toHaveBeenCalled();
  });

  it('nazwa zdarzenia jest stała', () => {
    expect(ATLAS_READY_EVENT).toBe('atlas:ready');
  });
});
