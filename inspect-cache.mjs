import fs from 'node:fs';

const cache = JSON.parse(fs.readFileSync('tests/fixtures/bdl/discover-cache.json', 'utf8'));
console.log('Total cached URLs:', Object.keys(cache).length);

for (const [url, data] of Object.entries(cache)) {
  if (!data) continue;
  if (data.results && Array.isArray(data.results)) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5, r.name].filter(Boolean).join(' -> ');
      console.log(`URL: ${url}`);
      console.log(`  -> Result: ID=${r.id}, Level=${r.level}, Name=${name}`);
    }
  } else if (data.id) {
    const name = [data.n1, data.n2, data.n3, data.n4, data.n5].filter(Boolean).join(' -> ');
    console.log(`URL: ${url}`);
    console.log(`  -> Single: ID=${data.id}, Level=${data.level}, Name=${name}`);
  }
}
