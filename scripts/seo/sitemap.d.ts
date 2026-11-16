// Typy eksportów generatora sitemap.mjs (używane przez testy).
export const DOMAIN: string;
export const INCLUDE_UNITS: boolean;
export function readPublicRoutes(appSource: string): string[];
export function unitUrls(
  units: ReadonlyArray<{ level: string; teryt: string | number }>,
  options: { levels: readonly string[] },
): string[];
export function buildSitemap(args: { domain: string; routes: readonly string[]; unitPaths?: readonly string[] }): string;
