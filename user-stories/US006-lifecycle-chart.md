# US#6: Lifecycle Chart & D-Stages Milestones

**As a** UK pension saver
**I want to** see my complete financial journey from now through retirement on a single chart with key milestones marked
**So that** I can understand the entire arc of my pension — from accumulation to drawdown — in one visual

## Status: ✅ Implemented (v0.6.0)

---

### Acceptance Criteria

#### Unified Lifecycle Chart
- [x] Single bar chart showing complete age timeline (current age → target age)
- [x] X-axis: Age progression
- [x] Y-axis: Pension pot value (£), formatted in thousands (£0k, £100k, £500k)
- [x] Two distinct phases:
  - **Accumulation Phase** (lighter shade): pot growing from today to retirement
  - **Drawdown Phase** (darker shade): pot declining from retirement to target age
- [x] Single-scenario viewing — one scenario shown at a time
- [x] Weak / Average / Strong toggle buttons to switch scenario
- [x] Shortfall bars (dashed red overlay) when pot depleted

#### Scenario Toggle
- [x] 3 toggle buttons: Weak (red), Average (blue/purple), Strong (green)
- [x] Default: Average selected
- [x] Cached data — all 3 scenarios computed once, re-rendered on toggle
- [x] `_lcChartCache` stores all computed data, `_renderLifecycleScenario()` renders one at a time
- [x] Toggle buttons scoped to lifecycle chart container only

#### D-Stages Milestone Markers
- [x] Vertical dashed lines at key life events on the chart
- [x] Emoji-labelled pills above chart area:
  - 🎯 Retirement (at retirement age)
  - 🏛️ State Pension (at state pension age, if different from retirement)
  - 🏢 DB Pension (at DB pension start age, if enabled and amount > 0)
  - ⏳ Life Expectancy (at plan-to age)
- [x] Pills have white semi-transparent background with coloured border
- [x] Auto-staggered rows when pills would overlap
- [x] Horizontally clamped to stay within chart area
- [x] D-Stages legend strip below chart
- [x] Configurable via `APP_CONFIG.DSTAGES`

#### Interactive Features
- [x] Hover tooltips show exact pot value for that age
- [x] Tooltip displays phase indicator (📈 Accumulation / 🎯 Retirement Starts / 📉 Drawdown)
- [x] Tooltip includes milestone callout when hovering on a milestone age
- [x] Currency formatted with commas
- [x] Responsive chart (scales to screen size)

#### Plan-to-Age Slider
- [x] Range slider (65–110) below chart
- [x] Reset button snaps to life expectancy value
- [x] Changing slider updates `currentLifeExpectancy`, rebuilds chart
- [x] Synced with cash flow chart slider

#### Narrative Cards
- [x] 3 scenario narrative cards below chart (Weak / Average / Strong)
- [x] Per-scenario: pot at retirement, depletion age warning or remaining balance
- [x] Explanatory paragraph about the 3 growth scenarios

#### Fallback
- [x] `createDrawdownOnlyChart()` line chart when growth data unavailable

---

### Files
- `src/charts/lifecycle-chart-builder.js` — Main chart builder, `dStagesPlugin`, cache & render, toggle wiring
- `src/config.js` — `DSTAGES` config (line width, font, colours, 4 default milestones)
- `src/calculator.html` — Chart container, toggle buttons, age slider, D-Stages legend div
- `src/app.js` — Calls `createCombinedLifecycleChart()`, age slider event handlers
- `src/style.css` — `.dstages-legend`, `.dstages-item`, `.dstages-dot` styling

### Related Stories
- US#3: Scenario Analysis (scenario toggle pattern)
- US#5: Retirement Spending (drawdown data source)
- US#7: Cash Flow Chart (companion chart, synced slider)
- US#8: Other Income (age-aware spending offsets in drawdown)
