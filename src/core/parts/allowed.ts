import partsConfig from '../../../config/parts.json';

const partsSet = new Set<string>(partsConfig);

export function partsIndicatorIds(): string[] {
  return [...partsConfig];
}

export function isPartsIndicator(id: string): boolean {
  return partsSet.has(id);
}
