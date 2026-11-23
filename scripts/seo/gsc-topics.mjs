// Mnożniki tematów z Search Console (W26-F06, docs/KONCEPT-ODKRYCIA.md §7a–§7b).
// Wyświetlenia zapytań z 7 dni vs poprzednie 7 → temat ze słownika config/topic-keywords.json →
// config/facts.json → trendBoost (1,0–1,5). Zmienia tylko kolejność istniejących faktów; zapis trafia
// do PR robota (workflow gsc-trend-boost.yml), nic nie jest publikowane bez człowieka.
// Sekret GSC_SERVICE_ACCOUNT – tylko ze zmiennej środowiska, nigdy w logu (gsc-client.mjs).
//
// Użycie: node scripts/seo/gsc-topics.mjs [--write]
//   bez flag  wypisuje tabelę tematów (Markdown)
//   --write   zapisuje trendBoost w config/facts.json (tylko gdy się zmienił)
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { accessToken, loadAccount, searchAnalytics } from './gsc-client.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const factsPath = path.join(root, 'config/facts.json');
const { values: args } = parseArgs({ options: { write: { type: 'boolean', default: false } } });

// Brak sekretu → komunikat i kod 0; config/facts.json bez zmian.
const account = loadAccount('mnożniki tematów pominięte, config/facts.json bez zmian');

const { createServer } = await import('vite');
const vite = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } });
try {
  const { reportWindow } = await vite.ssrLoadModule('/src/core/seo/gsc-report.ts');
  const trend = await vite.ssrLoadModule('/src/core/facts/trend-boost.ts');
  const { renderSignals } = await vite.ssrLoadModule('/src/core/facts/topic-candidates.ts');
  const keywords = JSON.parse(await readFile(path.join(root, 'config/topic-keywords.json'), 'utf8'));

  const range = reportWindow(new Date());
  const token = await accessToken(account);
  const current = await searchAnalytics(token, range.current, ['query']);
  const previous = await searchAnalytics(token, range.previous, ['query']);
  const trends = trend.topicTrends(current, previous, keywords);
  const boost = trend.trendBoostMap(trends);

  // tylko druga część sekcji (tabela tematów); kandydaci są w raporcie tygodniowym
  const table = renderSignals(trends, []).split('## Tematy w górę')[1] ?? '';
  const summary = `## Tematy w górę${table}\nZapis: ${JSON.stringify(boost)}\n`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);

  if (args.write) {
    const before = await readFile(factsPath, 'utf8');
    const after = trend.replaceTrendBoost(before, boost);
    if (after === before) console.log('trendBoost bez zmian.');
    else {
      await writeFile(factsPath, after);
      console.log('Zapisano trendBoost w config/facts.json.');
    }
  }
} finally {
  await vite.close();
}
