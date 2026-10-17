import fs from 'fs';
import path from 'path';

// Read tokens.json
const tokensPath = path.resolve('config/tokens.json');
const rawTokens = fs.readFileSync(tokensPath, 'utf-8');
const tokens = JSON.parse(rawTokens);

// Helper to convert camelCase to kebab-case
const kebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

let css = `/* DO NOT EDIT. Auto-generated from config/tokens.json */\n`;

// Helper to generate CSS variables
const generateVariables = (colorTheme, dataTheme, motionZero = false) => {
  let vars = [];

  // Colors
  Object.entries(colorTheme).forEach(([key, value]) => {
    vars.push(`  --${kebabCase(key)}: ${value};`);
  });

  // Sequential Data Colors
  dataTheme.sequential.forEach((color, i) => {
    vars.push(`  --seq-${i + 1}: ${color};`);
  });

  // Diverging Data Colors
  dataTheme.diverging.forEach((color, i) => {
    vars.push(`  --div-${i + 1}: ${color};`);
  });

  // No Data and highlight
  vars.push(`  --no-data: ${dataTheme.noData};`);
  vars.push(`  --highlight: var(--${kebabCase(tokens.data.highlight)});`);

  // Fonts
  vars.push(`  --font-sans: ${tokens.font.sans};`);
  vars.push(`  --font-mono: ${tokens.font.mono};`);

  // Radius
  vars.push(`  --radius: ${tokens.radius.default}px;`);

  // Motion
  if (motionZero) {
    vars.push(`  --motion-fast: 0ms;`);
    vars.push(`  --motion-base: 0ms;`);
    vars.push(`  --motion-slow: 0ms;`);
  } else {
    vars.push(`  --motion-fast: ${tokens.motion.fast}ms;`);
    vars.push(`  --motion-base: ${tokens.motion.base}ms;`);
    vars.push(`  --motion-slow: ${tokens.motion.slow}ms;`);
  }
  vars.push(`  --easing: ${tokens.motion.easing};`);

  return vars.join('\n');
};

// :root (Light Theme - default)
css += `
:root {
${generateVariables(tokens.color.light, {
    sequential: tokens.data.sequential.light,
    diverging: tokens.data.diverging.light,
    noData: tokens.data.noData.light
})}
}
`;

// Dark Theme
const darkVars = generateVariables(tokens.color.dark, {
    sequential: tokens.data.sequential.dark,
    diverging: tokens.data.diverging.dark,
    noData: tokens.data.noData.dark
});

css += `
:root[data-theme="dark"] {
${darkVars}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkVars}
  }
}
`;

// Reduced Motion
css += `
@media (prefers-reduced-motion: reduce) {
  :root {
${generateVariables(tokens.color.light, {
    sequential: tokens.data.sequential.light,
    diverging: tokens.data.diverging.light,
    noData: tokens.data.noData.light
}, true)}
  }
  :root[data-theme="dark"] {
${generateVariables(tokens.color.dark, {
    sequential: tokens.data.sequential.dark,
    diverging: tokens.data.diverging.dark,
    noData: tokens.data.noData.dark
}, true)}
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
${generateVariables(tokens.color.dark, {
    sequential: tokens.data.sequential.dark,
    diverging: tokens.data.diverging.dark,
    noData: tokens.data.noData.dark
}, true)}
    }
  }
}
`;

fs.writeFileSync(path.resolve('src/styles/tokens.css'), css);
console.log('src/styles/tokens.css generated.');
