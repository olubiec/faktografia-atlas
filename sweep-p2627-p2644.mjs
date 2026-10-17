async function testVar(id) {
  try {
    const res = await fetch(`https://bdl.stat.gov.pl/api/v1/variables/${id}?format=json&lang=pl`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.id) return data;
  } catch {}
  return null;
}

async function main() {
  console.log('Sweeping IDs 76950..77020 for P2627...');
  for (let id = 76950; id <= 77020; id++) {
    const v = await testVar(id);
    if (v) {
      const name = [v.n1, v.n2, v.n3, v.n4, v.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${v.id} | Subject: ${v.subjectId} | Level: ${v.level} | Unit: ${v.measureUnitName} | ${name}`);
    }
  }

  console.log('\nSweeping IDs 634120..634150 for P2644...');
  for (let id = 634120; id <= 634150; id++) {
    const v = await testVar(id);
    if (v) {
      const name = [v.n1, v.n2, v.n3, v.n4, v.n5].filter(Boolean).join(' -> ');
      console.log(`ID: ${v.id} | Subject: ${v.subjectId} | Level: ${v.level} | Unit: ${v.measureUnitName} | ${name}`);
    }
  }
}
main();
