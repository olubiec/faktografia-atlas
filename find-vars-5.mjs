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

async function getVarDetails(id) {
  const url = `https://bdl.stat.gov.pl/api/v1/variables/${id}?format=json&lang=pl`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`\n=== Var Details ${id} ===`, data);
}

async function main() {
  await getVarDetails(1613094);
  await searchVars('przeciętne wynagrodzenie');
  await searchVars('wynagrodzenie brutto');
  await searchVars('dochody na 1');
  await searchVars('wydatki na 1');
  await searchVars('budżetów gmin');
}
main();
