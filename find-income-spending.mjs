const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function search(phrase) {
  await sleep(300);
  const url = `https://bdl.stat.gov.pl/api/v1/variables/search?name=${encodeURIComponent(phrase)}&page-size=100&format=json&lang=pl`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`=== Search: "${phrase}" (total: ${data.totalRecords}) ===`);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${r.id} | Subject: ${r.subjectId} | Level: ${r.level} | Unit: ${r.measureUnitName} | ${name}`);
    }
  }
}

async function main() {
  await search('dochody');
  await search('wydatki');
}
main();
