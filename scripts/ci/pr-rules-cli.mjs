import fs from 'node:fs';
import { checkPr } from './pr-rules.mjs';

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Błąd: Nie podano pliku wejściowego JSON.');
  console.error('Użycie: node scripts/ci/pr-rules-cli.mjs <wejście.json>');
  process.exit(1);
}

try {
  const content = fs.readFileSync(inputFile, 'utf8');
  const input = JSON.parse(content);

  const result = checkPr(input);

  if (result.warnings.length > 0) {
    console.log('Ostrzeżenia:');
    for (const warning of result.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (!result.ok) {
    console.error('Błędy reguł PR:');
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('Reguły PR spełnione.');
  process.exit(0);
} catch (err) {
  console.error(`Błąd odczytu lub przetwarzania pliku ${inputFile}: ${err.message}`);
  process.exit(1);
}
