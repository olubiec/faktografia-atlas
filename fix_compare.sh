sed -i 's/if (!a || !units.length) {/if (!a || !units.length) {\n      setProfileA(null);/g' src/view/pages/ComparePage.tsx
sed -i 's/if (!b || !units.length) {/if (!b || !units.length) {\n      setProfileB(null);/g' src/view/pages/ComparePage.tsx
