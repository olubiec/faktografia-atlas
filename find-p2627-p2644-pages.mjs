const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchPages(word) {
  for (let page = 0; page < 10; page++) {
    await sleep(250);
    const url = `https://bdl.stat.gov.pl/api/v1/variables/search?name=${encodeURIComponent(word)}&page-size=100&page=${page}&format=json&lang=pl`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results) break;
    for (const r of data.results) {
      if (r.subjectId === 'P2627' || r.subjectId === 'P2644') {
        const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
        console.log(`ID: ${r.id} | Subject: ${r.subjectId} | Level: ${r.level} | Unit: ${r.measureUnitName} | ${name}`);
      }
    }
  }
}

async function main() {
  console.log('Searching P2627 / P2644 in "dochody" pages...');
  await searchPages('dochody');
  console.log('Searching P2627 / P2644 in "wydatki" pages...');
  await searchPages('wydatki');
}
main();
