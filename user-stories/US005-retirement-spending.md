# US#5: Retirement Spending Analysis

**As a** UK pension saver
**I want to** see how long my pension will last and find my maximum sustainable spending
**So that** I can retire with confidence knowing my money will last

## Status: ✅ Implemented (v0.3.0)

---

### Acceptance Criteria

#### Spending Mode Selection
- [x] Two spending modes:
  - **Mode A (Spending Plan)**: User enters annual spend, calculator shows if money lasts
  - **Mode B (Maximum Sustainable Spending)**: Calculator finds maximum annual spend that doesn't deplete pot
- [x] Clear explanation of each mode
- [x] Easy switching between modes
- [x] Default: Mode A

#### Mode A: Spending Plan
- [x] User input: Annual spending amount (£)
- [x] Calculate: Does money last until life expectancy?
- [x] Show: Year-by-year pot balance
- [x] Show: Warning if money runs out before target age
- [x] Show: Remaining balance at target age
- [x] Show: Total spent during retirement
- [x] Show: Age when money runs out (if applicable)
- [x] Status indicator: ✅ Money Lasts or ⚠️ Money Depleted

#### Mode B: Maximum Sustainable Spending
- [x] Binary search algorithm to find max annual spend
- [x] Spending escalates with inflation each year
- [x] Final balance approaches £0 by design
- [x] Show: Total spent during retirement
- [x] Show: Annual and monthly maximum income

#### Drawdown Simulation Engine
- [x] `simulateDrawdown()` — year-by-year pot drawdown with growth
- [x] `simulateAllScenarios()` — runs drawdown for Weak / Average / Strong
- [x] Shortfall detection per year
- [x] Depletion age detection (`findDepletionAge()`)
- [x] Age-aware spending callback (`getSpendingAtAge`) for phased income offsets

#### Longevity Configuration
- [x] Configurable life expectancy / plan-to age
- [x] 3 modes: ONS lookup, default (100), manual entry (60–120)
- [x] Chart age slider (65–110) with reset-to-life-expectancy

---

### Files
- `src/calculators/retirement-income.js` — Mode A & Mode B algorithms
- `src/utils/drawdown.js` — `simulateDrawdown()`, `simulateAllScenarios()`, `findDepletionAge()`
- `src/app.js` — `calculateLongevityPlan()`, `getNetAnnualWithdrawal()`
- `src/calculator.html` — Spending mode selector, analysis button, summary grid
- `tests/retirement-income.test.js`
- `tests/drawdown-shortfall.test.js`

### Related Stories
- US#2: Pension Projection (provides retirement pot)
- US#4: Results Display (spending summary panel)
- US#6: Lifecycle Chart (drawdown visualisation)
- US#8: Other Income (reduces net withdrawal)
