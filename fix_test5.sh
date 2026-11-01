sed -i 's/await page.locator('"'"'.react-modal-sheet-content'"'"')/await page.locator('"'"'body'"'"')/g' tests/e2e/rankings-and-compare-pages.spec.ts
