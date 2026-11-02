import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

function getFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

// Pliki istniejące przed wprowadzeniem twardego limitu 220 linii (stopniowo refaktoryzowane)
const GRANDFATHERED_LINE_COUNT: Record<string, number> = {
  'src/view/design/DesignPage.tsx': 1000,
  'src/view/pages/DesignPage.tsx': 1000,
  'src/view/map/AtlasMap.tsx': 500,
  'src/view/profile/ProfileCompare.tsx': 500,
  'src/view/pages/LibraryVariable.tsx': 450,
  'src/view/map/hooks/useMapViewState.ts': 450,
  'src/view/profile/ProfileOverview.tsx': 400,
  'src/view/profile/ProfileSheet.tsx': 350,
  'src/view/controls/IndicatorPicker.tsx': 350,
  'src/view/share/ShareDialog.tsx': 350,
  'src/view/tune/TunePanel.tsx': 350,
  'src/core/library/query.ts': 350,
  'src/view/map/layers/admin.ts': 350,
  'src/view/profile/CompareMaps.tsx': 350,
  'src/view/explain/ContextBlock.tsx': 350,
  'src/view/pages/Library.tsx': 300,
  'src/view/profile/ProfileCompareTable.tsx': 300,
  'src/view/share/useShareData.ts': 300,
  'src/core/search/index.ts': 300,
  'src/view/map/layers/choropleth.ts': 300,
  'src/view/search/SearchDialog.tsx': 300,
  'src/core/library/load-library.ts': 300,
  'src/view/Header.tsx': 300,
};

describe('style-guard (T03)', () => {
  const viewFiles = getFiles(path.resolve(process.cwd(), 'src/view'));
  const coreFiles = getFiles(path.resolve(process.cwd(), 'src/core'));
  const allFiles = [...viewFiles, ...coreFiles];

  it('weryfikuje brak zakazanych klas wizualnych (shadow, backdrop-blur, globalny rounded)', () => {
    const violations: string[] = [];

    for (const file of viewFiles) {
      const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
      if (rel.includes('DesignPage.tsx')) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        // zakaz shadow-* poza shadow-none
        if (/\b(?:drop-)?shadow-(?:sm|md|lg|xl|2xl|inner)\b/.test(line)) {
          // Wyjątek dla pojedynczego elementu na stronie głównej
          if (!rel.includes('Home.tsx')) {
            violations.push(`${rel}:${idx + 1} - znaleziona zakazana klasa shadow: "${line.trim()}"`);
          }
        }
        // zakaz backdrop-blur-*
        if (/\bbackdrop-blur\b/.test(line)) {
          violations.push(`${rel}:${idx + 1} - znaleziona zakazana klasa backdrop-blur: "${line.trim()}"`);
        }
        // zakaz klas rounded poza rounded-none
        if (/\brounded-(?:sm|md|lg|xl|2xl|3xl|full)\b/.test(line) && !line.includes('rounded-none')) {
          violations.push(`${rel}:${idx + 1} - znaleziona zakazana klasa zaokrąglenia rounded: "${line.trim()}"`);
        }
      });
    }

    expect(violations).toEqual([]);
  });

  it('weryfikuje brak tagów <style> z !important oraz hacków renderowania', () => {
    const violations: string[] = [];

    for (const file of allFiles) {
      const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8');

      if (content.includes('<style') && content.includes('!important')) {
        violations.push(`${rel} - tag <style> z !important`);
      }
      if (content.includes('window.__render')) {
        violations.push(`${rel} - zakazany globalny hack window.__render`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('pilnuje limitu ~200 linii kodu na plik', () => {
    const violations: string[] = [];

    for (const file of allFiles) {
      const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;

      const maxAllowed = GRANDFATHERED_LINE_COUNT[rel] ?? 220;

      if (lineCount > maxAllowed) {
        violations.push(`${rel} przekracza limit linii (${lineCount} > ${maxAllowed})`);
      }
    }

    expect(violations).toEqual([]);
  });
});
