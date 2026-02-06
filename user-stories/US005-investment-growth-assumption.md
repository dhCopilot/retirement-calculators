# US#5: Investment Growth Rate Assumption

**As a** UK pension saver  
**I want to** specify my own annual investment growth rate assumption  
**So that** I can model different market scenarios and make more personalized projections

## Acceptance Criteria
- [x] Input field for annual investment growth rate (%)
- [x] Default value of 5% (UK standard assumption)
- [x] Range validation: 0% - 15% per annum
- [x] Display clear explanation of what growth rate means
- [x] Growth rate is used in pension projection calculations
- [x] Results display shows which growth rate was used
- [x] Error messages for out-of-range values

## Technical Implementation
- Number input with % symbol
- Validation: 0 <= rate <= 15
- Pass as decimal (5% = 0.05) to calculator
- Update pension-projection.js to use custom rate
- Include in calculation validation flow

## Files
- `src/index.html`
- `src/app.js`
- `src/validation/input-validator.js`
- `src/calculators/pension-projection.js`
- `src/style.css`

## Status
✅ Completed in v0.2.0
