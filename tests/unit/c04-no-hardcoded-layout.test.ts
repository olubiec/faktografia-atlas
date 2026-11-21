import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const FILES = ['src/view/ui/Window.tsx', 'src/view/ui/PageSection.tsx', 'src/view/ui/LinkList.tsx'];

describe('C04 układ bez wartości na sztywno', () => {
  it.each(FILES)('%s: bez rounded-*, shadow-*, backdrop-blur i kolorów #', (file) => {
    const src = read(file);
    expect(src).not.toMatch(/rounded-(?!none)|shadow-|backdrop-blur/);
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
  it.each(FILES)('%s: bez wymiarów w px poza polem dotykowym 44 px i wysokością okna', (file) => {
    const px = (read(file).match(/\[\d+px\]/g) ?? []).filter((v) => v !== '[44px]');
    expect(px).toEqual([]);
  });
  it('warstwa i odstęp okna są zdefiniowane w jednym miejscu', () => {
    const src = read('src/view/ui/Window.tsx');
    expect(src.match(/z-\[10000\]/g)).toHaveLength(1);
    expect(src.match(/p-4 md:p-6/g)).toHaveLength(1);
  });
  it('DataMenuWindow używa Window i nie ma własnego z-index', () => {
    const src = read('src/view/data-menu/DataMenuWindow.tsx');
    expect(src).toContain("from '@/view/ui/Window'");
    expect(src).not.toMatch(/z-\[/);
  });
});
