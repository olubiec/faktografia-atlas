import { Pane } from 'tweakpane';
import tokensJson from '../../../config/tokens.json';
import { tokensMap, diffTokens } from './tokens-map';

interface TuneButton {
  on(event: 'click', handler: () => void): TuneButton;
}

interface TuneFolder {
  addFolder(params: { title: string; expanded?: boolean }): TuneFolder;
  addBinding(target: object, key: string | number, params?: object): unknown;
  addButton(params: { title: string }): TuneButton;
}

interface TuneTabPage {
  addFolder(params: { title: string; expanded?: boolean }): TuneFolder;
  addBinding(target: object, key: string | number, params?: object): unknown;
  addButton(params: { title: string }): TuneButton;
}

interface TuneTab {
  pages: TuneTabPage[];
}

interface TunePane {
  addTab(params: { pages: Array<{ title: string }> }): TuneTab;
  addFolder(params: { title: string; expanded?: boolean }): TuneFolder;
  addBinding(target: object, key: string | number, params?: object): unknown;
  addButton(params: { title: string }): TuneButton;
  on(event: 'change', handler: () => void): void;
  refresh(): void;
  dispose(): void;
  expanded: boolean;
}

/**
 * Uzupełnia atrybuty aria-label w elementach input i button Tweakpane dla zachowania dostępności (axe).
 */
function fixAccessibility(container: HTMLElement): void {
  const rows = container.querySelectorAll('.tp-lblv');
  rows.forEach((row) => {
    const labelElem = row.querySelector('.tp-lblv_l');
    const labelText = labelElem?.textContent?.trim() || 'Token';

    const inputElems = row.querySelectorAll('input');
    inputElems.forEach((input) => {
      if (!input.hasAttribute('aria-label')) {
        input.setAttribute('aria-label', labelText);
      }
    });

    const buttonElems = row.querySelectorAll('button');
    buttonElems.forEach((button) => {
      if (!button.hasAttribute('aria-label') && !button.textContent?.trim()) {
        button.setAttribute('aria-label', `Próbnik koloru ${labelText}`);
      }
    });
  });

  container.querySelectorAll('input:not([aria-label])').forEach((input) => {
    input.setAttribute('aria-label', 'Wartość tokenu');
  });

  container.querySelectorAll('button:not([aria-label])').forEach((button) => {
    const text = button.textContent?.trim();
    if (!text) {
      button.setAttribute('aria-label', 'Przycisk panelu');
    }
  });
}

/**
 * Zwraca aktywny motyw strony ('light' lub 'dark').
 */
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const dataTheme = document.documentElement.getAttribute('data-theme');
  if (dataTheme === 'dark' || dataTheme === 'light') {
    return dataTheme;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Aplikuje zmienne CSS na elemencie documentElement dla podanego stanu tokenów.
 */
export function applyCssVariables(
  currentTokens: typeof tokensJson,
  theme: 'light' | 'dark' = getCurrentTheme(),
): void {
  if (typeof document === 'undefined') return;
  const rootStyle = document.documentElement.style;

  // 1. Kolory podstawowe
  const colorObj = currentTokens.color[theme];
  const colorMap = tokensMap.color[theme];
  for (const [key, cssVar] of Object.entries(colorMap)) {
    const val = colorObj[key as keyof typeof colorObj];
    if (typeof val === 'string') {
      rootStyle.setProperty(cssVar, val);
    }
  }

  // 2. Dane sekwencyjne
  const seqArr = currentTokens.data.sequential[theme];
  const seqMap = tokensMap.data.sequential[theme];
  seqArr.forEach((val, idx) => {
    if (seqMap[idx]) {
      rootStyle.setProperty(seqMap[idx], val);
    }
  });

  // 3. Dane dywergentne
  const divArr = currentTokens.data.diverging[theme];
  const divMap = tokensMap.data.diverging[theme];
  divArr.forEach((val, idx) => {
    if (divMap[idx]) {
      rootStyle.setProperty(divMap[idx], val);
    }
  });

  // 4. Brak danych
  const noDataVal = currentTokens.data.noData[theme];
  const noDataVar = tokensMap.data.noData[theme];
  if (typeof noDataVal === 'string') {
    rootStyle.setProperty(noDataVar, noDataVal);
  }
}

/**
 * Przywraca pierwotne wartości tokenów z pliku konfiguracyjnego.
 */
export function resetTokens(
  currentTokens: typeof tokensJson,
  originalTokens: typeof tokensJson = tokensJson,
): void {
  currentTokens.color.light = { ...originalTokens.color.light };
  currentTokens.color.dark = { ...originalTokens.color.dark };
  currentTokens.data.sequential.light = [...originalTokens.data.sequential.light];
  currentTokens.data.sequential.dark = [...originalTokens.data.sequential.dark];
  currentTokens.data.diverging.light = [...originalTokens.data.diverging.light];
  currentTokens.data.diverging.dark = [...originalTokens.data.diverging.dark];
  currentTokens.data.noData.light = originalTokens.data.noData.light;
  currentTokens.data.noData.dark = originalTokens.data.noData.dark;
}

/**
 * Inicjalizuje panel Tweakpane do dostrajania kolorów tokenów (?tune).
 */
export function initTunePanel(): () => void {
  if (typeof document === 'undefined') return () => {};

  let container = document.getElementById('tune-panel-container');
  if (!container) {
    container = document.createElement('aside');
    container.id = 'tune-panel-container';
    container.setAttribute('aria-label', 'Panel dostrajania');
    container.style.position = 'fixed';
    container.style.top = '80px';
    container.style.right = '16px';
    container.style.zIndex = '9999';
    container.style.maxHeight = 'calc(100vh - 96px)';
    container.style.overflowY = 'auto';
    container.style.width = '300px';
    document.body.appendChild(container);
  }

  const currentTokens = structuredClone(tokensJson);
  const pane = new Pane({ container, title: 'Tune', expanded: true }) as unknown as TunePane;

  const tab = pane.addTab({
    pages: [{ title: 'Kolory' }],
  });
  const colorsPage = tab.pages[0];

  // Sekcja Jasny (Light)
  const lightFolder = colorsPage.addFolder({ title: 'Jasny (Light)', expanded: true });
  for (const key of Object.keys(tokensMap.color.light) as Array<keyof typeof tokensMap.color.light>) {
    lightFolder.addBinding(currentTokens.color.light, key, { label: key });
  }
  const lightSeqFolder = lightFolder.addFolder({ title: 'Sekwencyjne', expanded: false });
  currentTokens.data.sequential.light.forEach((_, idx) => {
    lightSeqFolder.addBinding(currentTokens.data.sequential.light, idx, { label: `seq-${idx + 1}` });
  });
  const lightDivFolder = lightFolder.addFolder({ title: 'Dywergentne', expanded: false });
  currentTokens.data.diverging.light.forEach((_, idx) => {
    lightDivFolder.addBinding(currentTokens.data.diverging.light, idx, { label: `div-${idx + 1}` });
  });
  lightFolder.addBinding(currentTokens.data.noData, 'light', { label: 'noData' });

  // Sekcja Ciemny (Dark)
  const darkFolder = colorsPage.addFolder({ title: 'Ciemny (Dark)', expanded: false });
  for (const key of Object.keys(tokensMap.color.dark) as Array<keyof typeof tokensMap.color.dark>) {
    darkFolder.addBinding(currentTokens.color.dark, key, { label: key });
  }
  const darkSeqFolder = darkFolder.addFolder({ title: 'Sekwencyjne', expanded: false });
  currentTokens.data.sequential.dark.forEach((_, idx) => {
    darkSeqFolder.addBinding(currentTokens.data.sequential.dark, idx, { label: `seq-${idx + 1}` });
  });
  const darkDivFolder = darkFolder.addFolder({ title: 'Dywergentne', expanded: false });
  currentTokens.data.diverging.dark.forEach((_, idx) => {
    darkDivFolder.addBinding(currentTokens.data.diverging.dark, idx, { label: `div-${idx + 1}` });
  });
  darkFolder.addBinding(currentTokens.data.noData, 'dark', { label: 'noData' });

  // Reakcja na zmiany wartości w panelu
  pane.on('change', () => {
    applyCssVariables(currentTokens);
  });

  // Przycisk "Kopiuj JSON"
  colorsPage.addButton({ title: 'Kopiuj JSON' }).on('click', () => {
    const diff = diffTokens(tokensJson, currentTokens);
    const jsonStr = JSON.stringify(diff, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      void navigator.clipboard.writeText(jsonStr);
    }
  });

  // Przycisk "Przywróć"
  colorsPage.addButton({ title: 'Przywróć' }).on('click', () => {
    resetTokens(currentTokens, tokensJson);
    pane.refresh();
    applyCssVariables(currentTokens);
  });

  // Reakcja na zmianę motywu w przeglądarce / HTML
  const themeObserver = new MutationObserver(() => {
    applyCssVariables(currentTokens);
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Uzupełnianie aria-label w poszczególnych kontrolkach
  const containerObserver = new MutationObserver(() => {
    fixAccessibility(container!);
  });
  containerObserver.observe(container, { childList: true, subtree: true });
  fixAccessibility(container);

  // Zwinięcie z klawiatury (Escape)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      pane.expanded = !pane.expanded;
    }
  };
  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    themeObserver.disconnect();
    containerObserver.disconnect();
    pane.dispose();
    container?.remove();
  };
}
