const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchWord(word, page = 0) {
  await sleep(300);
  const url = `https://bdl.stat.gov.pl/api/v1/variables/search?name=${encodeURIComponent(word)}&page-size=100&page=${page}&format=json&lang=pl`;
  const res = await fetch(url);
  return await res.json();
}

async function searchAllPages(word) {
  let page = 0;
  let total = 0;
  const results = [];
  do {
    const data = await searchWord(word, page);
    total = data.totalRecords || 0;
    if (data.results) {
      results.push(...data.results);
    }
    page++;
  } while (results.length < total && page < 10);
  return results;
}

async function main() {
  console.log('=== Searching "dochody" ===');
  const dochody = await searchAllPages('dochody');
  for (const r of dochody) {
    const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
    if (name.toLowerCase().includes('mieszkańca') || name.toLowerCase().includes('osobę') || name.toLowerCase().includes('1')) {
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }

  console.log('\n=== Searching "wydatki" ===');
  const wydatki = await searchAllPages('wydatki');
  for (const r of wydatki) {
    const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
    if (name.toLowerCase().includes('mieszkańca') || name.toLowerCase().includes('osobę')) {
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }

  console.log('\n=== Searching "wynagrodzenia" ===');
  const wynagrodzenia = await searchAllPages('wynagrodzenia');
  for (const r of wynagrodzenia) {
    const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
    console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
  }
}
main();
