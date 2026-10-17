async function search(phrase) {
  const url = 'https://bdl.stat.gov.pl/api/v1/variables/search?name=' + encodeURIComponent(phrase) + '&page-size=50&format=json&lang=pl';
  const res = await fetch(url);
  const data = await res.json();
  console.log('=== Search:', phrase, 'Total:', data.totalRecords);
  if (data.results) {
    for (const r of data.results) {
      const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} (${r.measureUnitId}) | ${name}`);
    }
  }
}

async function main() {
  await search('udział bezrobotnych');
  await search('w wieku produkcyjnym');
  await search('wynagrodzenie');
  await search('wynagrodzenia');
  await search('dochody');
  await search('wydatki');
  await search('kanalizacja');
  await search('instalacji w %');
}
main();
