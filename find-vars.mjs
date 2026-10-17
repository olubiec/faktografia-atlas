async function searchVars(query) {
  const url = 'https://bdl.stat.gov.pl/api/v1/variables/search?name=' + encodeURIComponent(query) + '&page-size=50&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log(`\n=== Search: "${query}" (total: ${data.totalRecords || 0}) ===`);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }
}

async function searchVarsBySubject(subjectId) {
  const url = 'https://bdl.stat.gov.pl/api/v1/variables?subject-id=' + subjectId + '&page-size=100&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log(`\n=== Subject Variables: "${subjectId}" (total: ${data.totalRecords || 0}) ===`);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }
}

async function main() {
  await searchVarsBySubject('P2433'); // Korzystający z instalacji w % ogółu ludności
  await searchVars('udział bezrobotnych zarejestrowanych');
  await searchVars('bezrobotnych zarejestrowanych w liczbie ludności w wieku produkcyjnym');
  await searchVars('przeciętne miesięczne wynagrodzen');
  await searchVars('przeciętne miesięczne wynagrodzenie');
  await searchVars('dochody ogółem na 1 mieszkańca');
  await searchVars('wydatki ogółem na 1 mieszkańca');
}
main();
