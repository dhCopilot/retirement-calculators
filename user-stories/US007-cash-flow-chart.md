# US#7: Cash Flow Chart

**As a** UK pension saver
**I want to** see how my annual spending is funded each year of retirement
**So that** I can understand the balance between pot withdrawals, other income, and any shortfall

## Status: ✅ Implemented (v0.4.0)

---

### Acceptance Criteria

#### Stacked Bar Chart
- [x] Stacked bars per retirement year showing:
  - Other Income (green) — state pension, DB pension, annuity, rental, other
  - Pot Withdrawal (scenario colour) — amount drawn from pension pot
  - Shortfall (dashed red) — unfunded spending when pot depleted
- [x] Target Spending dashed reference line overlay (horizontal line at annual spending amount)
- [x] Y-axis: £ amount, formatted in thousands
- [x] X-axis: Age (retirement age → target age)

#### Scenario Toggle
- [x] 3 toggle buttons: Weak (red), Average (blue/purple), Strong (green)
- [x] Default: Average selected
- [x] Cached data (`_cfChartCache`), re-rendered on toggle via `_renderCashFlowScenario()`
- [x] Toggle buttons scoped to cash flow chart container only

#### Rich Tooltips
- [x] Target spending amount
- [x] Other income total + breakdown per source (state pension, DB, annuity, rental, other)
- [x] Pot withdrawal amount
- [x] Shortfall amount (if any)
- [x] Remaining pot balance

#### Scenario Hint Text
- [x] Updates on toggle to show starting pot for selected scenario
- [x] Notes about other income if applicable

#### Plan-to-Age Slider
- [x] Range slider (65–110) below chart
- [x] Reset button snaps to life expectancy
- [x] Synced with lifecycle chart slider
- [x] Changing slider rebuilds both charts

---

### Files
- `src/charts/cash-flow-chart-builder.js` — Chart builder, cache, render, toggle wiring
- `src/calculator.html` — Chart container, toggle buttons, age slider
- `src/app.js` — Calls `createCashFlowChart()`, slider sync handlers
- `src/professional-forms.css` — Toggle button styling

### Related Stories
- US#3: Scenario Analysis (toggle pattern)
- US#6: Lifecycle Chart (companion chart, synced slider)
- US#8: Other Income (income source breakdown)
