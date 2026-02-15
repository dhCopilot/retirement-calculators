# US#3: Scenario Analysis & Comparison

**As a** UK pension saver  
**I want to** see my pension projections under 3 different growth scenarios  
**So that** I understand the range of possible outcomes and plan confidently

## Acceptance Criteria

### Scenario Selection
- [ ] Display 3 pre-defined growth rate scenarios:
  - Weak Returns: 2% annual growth
  - Average Returns: 5% annual growth (default)
  - Strong Returns: 8% annual growth
- [ ] Easy button/selector for scenario choice
- [ ] Clear explanation of what each scenario represents
- [ ] Default scenario highlighted (Average 5%)

### Calculations for Each Scenario
- [ ] Calculate pension projection for each scenario
- [ ] Calculate income projection for each scenario
- [ ] Show final pot value for each scenario
- [ ] Show annual and monthly income for each scenario
- [ ] Show total contributions and growth amount

### Comparison Display
- [ ] Display all 3 scenarios side-by-side
- [ ] Show differences between scenarios (£ amount and %)
- [ ] Highlight Average scenario as base case
- [ ] Show comparison vs Average for Weak and Strong scenarios
- [ ] Clear visual distinction between scenarios

### Inflation Handling
- [ ] Scenarios respect global inflation setting
- [ ] If inflation ON: Show real (today's pounds) values
- [ ] If inflation ON: Show nominal (future pounds) values
- [ ] Display impact of inflation on each scenario

## Files to Create/Modify
- `src/index.html` (scenario selector buttons)
- `src/app.js` (scenario calculation logic)
- `src/style.css` (card styling)
- `src/calculators/pension-projection.js` (already exists)

## Definition of Done
- [ ] All 3 scenarios calculate correctly
- [ ] Comparisons accurate vs Average
- [ ] Inflation toggle affects all scenarios
- [ ] Mobile responsive layout
- [ ] Tests passing (80%+ coverage)
- [ ] Code reviewed
