# US#8: Other Income (Age-Aware)

**As a** UK pension saver
**I want to** include my state pension, DB pension, annuity, rental, and other income in my retirement projections
**So that** my drawdown calculations reflect the full picture of my retirement income

## Status: ✅ Implemented (v0.4.0)

---

### Acceptance Criteria

#### State Pension
- [x] NI qualifying years slider (0–35)
- [x] Proportional calculation: 35 years = full (£11,502/yr), 10–34 = proportional, <10 = £0
- [x] Annual amount (£) input with bidirectional sync to slider
- [x] State pension start age input (default 67)
- [x] Always visible on Step 5 (not behind a toggle)

#### Additional Income Toggle
- [x] "I have additional retirement income" checkbox
- [x] When checked, reveals:
  - DB / Final Salary Pension (£/yr + start age, default 65)
  - Annuity Income (£/yr, from retirement)
  - Rental Income (£/yr, from retirement)
  - Other Income (£/yr, from retirement — e.g. part-time work, dividends)

#### Age-Aware Phasing
- [x] `getOtherIncomeAtAge(age)` — returns total other income at a specific age
- [x] State pension starts at specified state pension age
- [x] DB pension starts at specified DB pension age
- [x] Annuity, rental, other income start from retirement age
- [x] Drawdown simulation subtracts other income from spending before pot withdrawal

#### Total Income Summary
- [x] Summary strip showing total other income
- [x] Phasing notes (e.g. "£X/yr from retirement, rising to £Y/yr from age 67")

#### Integration with Calculations
- [x] `getNetAnnualWithdrawal()` — gross spending minus other income (floored at 0)
- [x] Cash flow chart stacks other income sources visually
- [x] Cash flow tooltip breaks down income by source
- [x] Other Income badge displayed in results when income > £0

---

### Files
- `src/calculator.html` — Step 5 form inputs, NI slider, income fields
- `src/app.js` — `getOtherIncomeAtAge()`, `getNetAnnualWithdrawal()`, slider sync, summary strip
- `src/utils/form-helpers.js` — Currency formatting, income field helpers
- `src/config.js` — `STATE_PENSION_FULL`, `STATE_PENSION_QUALIFYING_YEARS`, `STATE_PENSION_MIN_YEARS`
- `src/charts/cash-flow-chart-builder.js` — Income source breakdown in chart and tooltip

### Related Stories
- US#1: Input Form (Step 5 layout)
- US#5: Retirement Spending (net withdrawal calculation)
- US#7: Cash Flow Chart (income source visualisation)
