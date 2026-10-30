1. **Create geometry logic file**:
   - Use `write_file` to create `src/core/profile/trend-geometry.ts`. Extract the helper functions from `TrendChart.tsx`: `buildSegments`, `getXAxisYears`, and the logic for calculating domains/scales (`getX`, `getY`, based on `minYear`, `maxYear`, `domainMinY`, `domainMaxY`, etc).
   - Use `read_file` to verify creation and content.
2. **Implement geometry tests**:
   - Use `write_file` to implement unit tests in `tests/unit/trend-geometry.test.ts` to test `buildSegments`, `getXAxisYears`, `getX`, `getY`. Verify cases: missing data, single points, year gaps, and negative values.
   - Run `pnpm test tests/unit/trend-geometry.test.ts` to verify they pass.
3. **Create Axis component**:
   - Use `write_file` to create `src/view/profile/TrendAxis.tsx`. It will accept props (`paddingLeft`, `paddingRight`, `containerWidth`, `height`, `minY`, `maxY`, `getY`, `getX`, `xAxisYears`, `unit`) and render SVG grid lines and axis labels (`<line>` and `<text>` elements for `minY` and `maxY`, and `<g>` tags for `xAxisYears`).
   - Use `read_file` to verify creation.
4. **Create Points component**:
   - Use `write_file` to create `src/view/profile/TrendPoints.tsx`. It will accept props (`mainSegments`, `compareSegments`, `lastValidPoint`, `currentActiveYear`, `activeMainItem`, `activeCompareItem`, `getX`, `getY`, `years`, `containerWidth`, `height`, `paddingTop`, `paddingBottom`, `unit`, `setSelectedYear`) and render the paths, circles, highlighting (the `currentActiveYear` crosshair logic), and the invisible interactive `<rect>`s for hovering.
   - Use `read_file` to verify creation.
5. **Create Status component**:
   - Use `write_file` to create `src/view/profile/TrendStatus.tsx`. It will accept props (`liveRegionId`, `label`, `currentActiveYear`, `formattedActiveValue`, `compareLabel`, `hasCompareSeries`) and render the `aria-live` div and the legend if applicable.
   - Use `read_file` to verify creation.
6. **Refactor TrendChart**:
   - Use `write_file` to rewrite `src/view/profile/TrendChart.tsx`, combining all these components and using the logic from `trend-geometry.ts`. The resulting file should be less than 200 lines.
   - Run `wc -l src/view/profile/TrendChart.tsx` to verify the line count.
7. **Pre-commit checks**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
8. **Final submission**:
   - Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build` to verify all checks pass.
   - Call `submit` tool to create the Pull Request with an appropriate title and description.
