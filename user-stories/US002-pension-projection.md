# US#2: Pension & Income Projection

**As a** UK pension saver
**I want to** see my projected pension pot at retirement and the annual income it could provide
**So that** I can understand both my retirement savings and lifestyle options

## Status: ✅ Implemented (v0.2.0)

---

### Acceptance Criteria

#### Pension Projection Calculation
- [x] Calculate years until retirement from input dates
- [x] Apply selected growth rate scenario (configurable: default 2% / 5% / 8%)
- [x] Include regular monthly contributions with compound growth
- [x] Display final pot value (£)
- [x] Show year-by-year breakdown (pot value, contributions, growth)
- [x] Growth amount calculated separately from contributions
- [x] Monthly granularity for compounding

#### Income Projection Calculation
- [x] 25% tax-free lump sum (capped at UK limit of £268,275)
- [x] Calculate drawdown pot (pot minus lump sum)
- [x] Apply 4% safe withdrawal rate (SWR)
- [x] Show annual income amount (gross, before tax)
- [x] Show monthly income equivalent

#### Inflation Handling
- [x] If inflation enabled: show real (today's pounds) values
- [x] Nominal → Real conversion (`adjustForInflation`)
- [x] Real → Nominal conversion (`inflateValue`)
- [x] Year-by-year real & nominal projection
- [x] Inflation-adjusted income (real vs nominal annual/monthly)

---

### Technical Implementation

#### Formulas
```
Pension Projection:
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
(monthly compounding applied internally)

Income Projection:
Tax-Free Lump Sum = min(Pot × 0.25, £268,275)
Drawdown Pot = Pot - Tax-Free Lump Sum
Annual Income = Drawdown Pot × 0.04
Monthly Income = Annual Income / 12
```

### Files
- `src/calculators/pension-projection.js` — Compound growth projection engine
- `src/calculators/income-projection.js` — SWR income + lump sum calculation
- `src/calculators/inflation-calculator.js` — Inflation adjustment utilities
- `src/app.js` — Orchestration, populates `growthProjectionData`
- `tests/pension-projection.test.js`
- `tests/income-projection.test.js`
- `tests/inflation-calculator.test.js`

### Related Stories
- US#1: Input Form (provides DOB, retirement age, pot, contributions)
- US#3: Scenario Analysis (runs projection for all 3 scenarios)
- US#10: Fees & Net Returns (adjusts growth rates before projection)
