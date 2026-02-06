# US#2: Pension Projection Calculation

**As a** UK pension saver  
**I want to** see projected pension pot value at retirement  
**So that** I can plan my retirement finances

## Acceptance Criteria
- [x] Calculate years until retirement
- [x] Apply UK-standard 5% annual growth rate
- [x] Include regular monthly contributions
- [x] Account for compound growth
- [x] Display final pot value in £
- [x] Show year-by-year breakdown

## Technical Implementation
- Formula: FV = PV(1+r)^n + PMT × [((1+r)^n - 1) / r]
- Growth rate: 5% annually (0.407% monthly)
- Round to nearest penny

## Files
- `src/calculators/pension-projection.js`

## Status
✅ Completed in v0.1.0
