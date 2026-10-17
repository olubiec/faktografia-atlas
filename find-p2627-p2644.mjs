const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getSubjectVars(subjectId) {
  // Let's search by name or fetch variables
  // Since search works, let's search with empty or name filter if possible, or sweep
  const url = `https://bdl.stat.gov.pl/api/v1/variables/search?name=${encodeURIComponent('mieszkańca')}&page-size=100&format=json&lang=pl`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results) {
    for (const r of data.results) {
      if (r.subjectId === 'P2627' || r.subjectId === 'P2644') {
        const name = [r.n1, r.n2, r.n3, r.n4, r.n5].filter(Boolean).join(' -> ');
        console.log(`ID: ${r.id} | Subject: ${r.subjectId} | Level: ${r.level} | Unit: ${r.measureUnitName} | ${name}`);
      }
    }
  }
}

async function main() {
  await getSubjectVars('P2627');
  await getSubjectVars('P2644');
}
main();
