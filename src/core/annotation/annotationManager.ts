// Menedżer stanu zakreśleń - pilnuje, aby na ekranie było najwyżej jedno aktywne zakreślenie.

type Unsubscribe = () => void;
type HideCallback = () => void;

export class AnnotationManager {
  private activeId: string | null = null;
  private listeners: Map<string, HideCallback> = new Map();

  getActiveId(): string | null {
    return this.activeId;
  }

  subscribe(id: string, onHide: HideCallback): Unsubscribe {
    this.listeners.set(id, onHide);
    return () => {
      this.listeners.delete(id);
      if (this.activeId === id) {
        this.activeId = null;
      }
    };
  }

  setActive(id: string): void {
    if (this.activeId && this.activeId !== id) {
      const previousOnHide = this.listeners.get(this.activeId);
      if (previousOnHide) {
        previousOnHide();
      }
    }
    this.activeId = id;
  }

  clearActive(id: string): void {
    if (this.activeId === id) {
      this.activeId = null;
    }
  }
}
