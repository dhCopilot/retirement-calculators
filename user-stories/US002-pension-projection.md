# US#2: Pension & Income Projection

**As a** UK pension saver  
**I want to** see my projected pension pot at retirement AND what annual income it could provide  
**So that** I can understand both my retirement savings and lifestyle options

## Acceptance Criteria

### Pension Projection Calculation
- [ ] Calculate years until retirement from input dates
- [ ] Apply selected growth rate scenario (2%, 5%, or 8%)
- [ ] Include regular monthly contributions
- [ ] Account for compound growth over time
- [ ] Display final pot value in £
- [ ] Show year-by-year breakdown
- [ ] Display growth amount (separate from contributions)

### Income Projection Calculation
- [ ] Calculate 25% tax-free lump sum (max £268,275 UK limit)
- [ ] Calculate drawdown pot (75% of total)
- [ ] Apply 4% safe withdrawal rate
- [ ] Show annual income amount (gross, before tax)
- [ ] Show monthly income equivalent
- [ ] Display as both starting amount and inflation-adjusted

### Inflation Handling
- [ ] If inflation enabled: Show real (today's pounds) values
- [ ] If inflation enabled: Show nominal (future pounds) values
- [ ] Display both nominal and real growth rates
- [ ] Adjust income for inflation impact

## Technical Implementation

### Formulas
```
Pension Calculation:
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Income Calculation:
Tax-Free Lump Sum = min(Pot × 0.25, £268,275)
Drawdown Pot = Pot - Tax-Free Lump Sum
Annual Income = Drawdown Pot × 0.04
Monthly Income = Annual Income / 12
```

## Files to Create/Modify
- `src/calculators/pension-projection.js` (pension calculation)
- `src/calculators/income-projection.js` (income calculation)
- `src/calculators/inflation-calculator.js` (inflation adjustment)
- `src/app.js` (integration)
- `tests/pension-projection.test.js` (tests)

## Definition of Done
- [ ] Both calculators implemented
- [ ] Unit tests (80%+ coverage)
- [ ] Formulas verified accurate
- [ ] Edge cases handled
- [ ] Code reviewed
- [ ] Inflation adjustment tested
