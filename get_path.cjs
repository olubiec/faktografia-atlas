const fs = require('fs');
const content = fs.readFileSync('public/geo/kalka.svg', 'utf8');
const match = content.match(/<path[^>]*d="([^"]*)"/);
if (match) {
  fs.writeFileSync('kalka-path.txt', match[1]);
}
