const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function checkQuery(q) {
  await sleep(250);
  const url = `https://bdl.stat.gov.pl/api/v1/variables/search?name=${encodeURIComponent(q)}&page-size=10&format=json&lang=pl`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(`Query: "${q}" -> Total: ${data.totalRecords || 0}`);
  if (data.results && data.results.length > 0) {
    data.results.slice(0, 3).forEach(r => {
      console.log(`  ID: ${r.id} | Level: ${r.level} | Unit: ${r.measureUnitName} | ${[r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ')}`);
    });
  }
}

async function main() {
  await checkQuery('dochód');
  await checkQuery('dochody');
  await checkQuery('dochód na 1');
  await checkQuery('wydatek');
  await checkQuery('wydatki');
  await checkQuery('wydatki na 1');
  await checkQuery('wynagrodzenia');
  await checkQuery('wynagrodzenie');
  await checkQuery('przeciętne miesięczne');
  await checkQuery('miesięczne wynagrodzenie');
  await checkQuery('bezrobotni');
  await checkQuery('bezrobotnych');
  await checkQuery('wiek produkcyjny');
  await checkQuery('wieku produkcyjnym');
  await checkQuery('kanalizacja');
  await checkQuery('przedszkolnym');
}
main();
