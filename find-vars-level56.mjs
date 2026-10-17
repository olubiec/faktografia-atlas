const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchWord(word, page = 0) {
  await sleep(250);
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
  console.log('=== Dochody / Wydatki / Wynagrodzenia / Bezrobotni dla Poziom 5 i 6 ===');

  const terms = ['dochody', 'wydatki', 'wynagrodzen', 'bezrobotn'];
  for (const term of terms) {
    const list = await searchAllPages(term);
    for (const r of list) {
      if (r.level === 5 || r.level === 6) {
        const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
        console.log(`[Term: ${term}] ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
      }
    }
  }
}
main();
