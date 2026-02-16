# US#3: Scenario Analysis & Comparison

**As a** UK pension saver
**I want to** see my pension projections under 3 different growth scenarios
**So that** I understand the range of possible outcomes and plan confidently

## Status: ✅ Implemented (v0.3.0)

---

### Acceptance Criteria

#### Scenario Definitions
- [x] 3 pre-defined growth rate scenarios:
  - Weak Returns: 2% annual growth (red)
  - Average Returns: 5% annual growth (blue/purple)
  - Strong Returns: 8% annual growth (green)
- [x] User can edit rates on Step 4 (Weak < Average < Strong enforced)
- [x] Default scenario highlighted (Average 5%)
- [x] Scenario cards show rate, colour dot, and label

#### Calculations for Each Scenario
- [x] Pension projection calculated for all 3 scenarios
- [x] Income projection calculated for all 3 scenarios
- [x] Drawdown simulation for all 3 scenarios
- [x] Final pot, annual/monthly income per scenario
- [x] Total contributions and growth amount per scenario

#### Scenario Range Strip
- [x] Clickable 3-scenario bar at top of results
- [x] Shows projected pot and growth rate per scenario
- [x] Colour-coded: Weak (red) / Average (green) / Strong (gold)
- [x] Click any scenario to switch result cards

#### Scenario Toggling on Charts
- [x] Lifecycle chart: single-scenario view with Weak / Average / Strong toggle buttons
- [x] Cash flow chart: single-scenario view with Weak / Average / Strong toggle buttons
- [x] Both charts render one scenario at a time, re-render on toggle
- [x] Toggle buttons scoped per chart container (no cross-interference)

#### Inflation Handling
- [x] All scenarios respect global inflation setting
- [x] If inflation ON: values shown in real (today's pounds)
- [x] Inflation badge displayed on results

---

### Files
- `src/app.js` — Scenario list, `growthProjectionData`, `switchResultsScenario()`, `_resultsCache`
- `src/config.js` — `SCENARIOS` and `SCENARIO_LIST` definitions
- `src/calculator.html` — Scenario rate cards (Step 4), range strip, toggle buttons
- `src/charts/lifecycle-chart-builder.js` — `_lcChartCache`, scenario toggle, `_renderLifecycleScenario()`
- `src/charts/cash-flow-chart-builder.js` — `_cfChartCache`, scenario toggle, `_renderCashFlowScenario()`
- `src/professional-forms.css` — Toggle button styling (`.cashflow-scenario-btn`)

### Related Stories
- US#2: Pension Projection (calculation engine)
- US#4: Results Display (render scenario results)
- US#6: Lifecycle Chart (single-scenario toggle)
- US#7: Cash Flow Chart (single-scenario toggle)
