async function searchVars(query) {
  const url = 'https://bdl.stat.gov.pl/api/v1/variables/search?name=' + encodeURIComponent(query) + '&page-size=100&format=json&lang=pl';
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
  await searchVars('udział bezrobotnych zarejestrowanych w');
  await searchVars('ludności w wieku produkcyjnym');
  await searchVars('przeciętne miesięczne wynagrodzenie brutto');
  await searchVars('wynagrodzenia brutto');
  await searchVars('dochody na 1 mieszkańca');
  await searchVars('wydatki na 1 mieszkańca');
}
main();
