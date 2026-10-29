const fs = require('fs');
let code = fs.readFileSync('tests/unit/legend-no-data-swatch.test.tsx', 'utf-8');

code = code.replace(
  "expect(html).toContain('backgroundColor:var(--seq-1)');",
  "expect(html).toContain('background-color:var(--seq-1)');"
);

fs.writeFileSync('tests/unit/legend-no-data-swatch.test.tsx', code);
