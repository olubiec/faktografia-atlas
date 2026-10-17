const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchVars(query, yearFilter = null) {
  await sleep(300);
  const url = 'https://bdl.stat.gov.pl/api/v1/variables/search?name=' + encodeURIComponent(query) + '&page-size=50&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log(`\n=== Query: "${query}" (total: ${data.totalRecords || 0}) ===`);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }
}

async function main() {
  await searchVars('dochody na 1 mieszkańca');
  await searchVars('dochody ogółem na 1 mieszkańca');
  await searchVars('wydatki na 1 mieszkańca');
  await searchVars('wydatki ogółem na 1 mieszkańca');
  await searchVars('przeciętne miesięczne wynagrodzeni');
  await searchVars('przeciętne miesięczne wynagrodzenia');
  await searchVars('udział bezrobotnych');
  await searchVars('bezrobotnych w wieku produkcyjnym');
}
main();
