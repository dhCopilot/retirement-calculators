# US#5: Retirement Planning & Spending Analysis

**As a** UK pension saver  
**I want to** see how long my pension will last and plan my retirement spending  
**So that** I can retire with confidence knowing my money will last

## Acceptance Criteria

### Life Expectancy Configuration
- [ ] Configurable life expectancy input (default 100 years)
- [ ] Range validation: 60-120 years
- [ ] Clear label explaining what this means
- [ ] Affects all retirement calculations

### Spending Mode Selection
- [ ] Two spending mode options (toggle/radio buttons):
  - Mode A (Spending Plan): User enters annual spend, calculator shows if money lasts
  - Mode B (Maximum Spend): Calculator finds maximum sustainable annual spend
- [ ] Clear explanation of each mode
- [ ] Easy switching between modes
- [ ] Default: Mode A (Spending Plan)

### Mode A: Spending Plan
- [ ] User input: Annual spending amount (£)
- [ ] Calculate: Does money last till life expectancy?
- [ ] Show: Year-by-year pot balance
- [ ] Show: Annual spending (adjusted for inflation if enabled)
- [ ] Show: Warning if money runs out before life expectancy
- [ ] Show: Final balance at life expectancy
- [ ] Show: Total spent during retirement
- [ ] Display: Age when money runs out (if applicable)

### Mode B: Maximum Sustainable Spending
- [ ] Calculate: Maximum annual spend that lasts exactly to life expectancy
- [ ] Show: Year-by-year projection
- [ ] Show: Spending increases with inflation each year
- [ ] Show: Final balance approaches £0 (by design)
- [ ] Show: Total spent during retirement

### Visualization & Display
- [ ] Create chart: Pot value declining over retirement
- [ ] Create chart: Annual spending line overlay
- [ ] Show: ✅ Money lasts OR ⚠️ Money runs out at age X
- [ ] Show: Remaining balance at life expectancy
- [ ] Show: Total amount spent in retirement
- [ ] Show: Real vs nominal values (if inflation enabled)
- [ ] Display: Inflation-adjusted spending amounts
- [ ] Mobile responsive layout

## Files to Create
- `src/index.html` (form inputs, results cards)
- `src/app.js` (orchestration)
- `src/calculators/retirement-income.js` (NEW)
- `src/charts/retirement-projection-chart.js` (NEW)
- `src/style.css` (cards, styling)
- `tests/retirement-income.test.js` (NEW)

## Definition of Done
- [ ] Mode A fully implemented
- [ ] Mode B algorithm working
- [ ] Charts displaying correctly
- [ ] Inflation adjustment applied
- [ ] Status indicator (✅/⚠️) showing
- [ ] Year-by-year data accurate
- [ ] Tests passing (80%+ coverage)
- [ ] Mobile responsive
- [ ] Code reviewed
