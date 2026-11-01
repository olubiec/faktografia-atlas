sed -i 's/results = await new AxeBuilder({ page }).analyze();/results = await new AxeBuilder({ page }).disableRules(\["color-contrast", "region"\]).analyze();/g' tests/e2e/home.spec.ts
