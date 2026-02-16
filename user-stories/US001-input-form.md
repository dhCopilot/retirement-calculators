# US#1: Calculator Input Form (5-Step Wizard)

**As a** UK pension saver
**I want to** enter my personal details, pension information, and retirement assumptions via a guided wizard
**So that** the calculator can produce accurate, personalised projections

## Status: ✅ Implemented (v0.4.1)

---

### Acceptance Criteria

#### Step 1 — Timeline
- [x] Date of birth input (HTML5 date picker)
- [x] Gender select (Male / Female) — drives ONS life expectancy lookup
- [x] Target retirement age selector (55 / 60 / 65 / 67 / 68 / 70)
- [x] Postcode input (optional) — refines life expectancy with regional ONS data
- [x] Current age (auto-calculated, read-only)
- [x] Planned retirement date (auto-calculated from DOB + age, overridable)
- [x] Life Expectancy / Plan-to-age with 3 radio modes:
  - ONS Life Expectancy — gender + age-cohort + regional adjustment
  - Default (age 100) — fixed planning horizon
  - Manual — user-entered target age (60–120)

#### Step 2 — Pension
- [x] Current pension pot (£, comma-formatted currency input)
- [x] Monthly contribution (£, comma-formatted currency input)

#### Step 3 — Spending
- [x] Annual retirement spending (£)
- [x] Auto-suggested at 4% SWR of average projected pot after first calculation

#### Step 4 — Assumptions
- [x] Include Inflation toggle (default on)
- [x] Inflation rate input (0%–5%, default 2.5%)
- [x] 3 editable scenario growth rate cards (Weak 2% / Average 5% / Strong 8%)
- [x] Validation: Weak < Average < Strong ordering enforced
- [x] Scenario card click selects primary growth rate
- [x] Include Platform & Fund Fees toggle
- [x] Fee inputs: Platform (%), Fund/OCF (%), Adviser (%)
- [x] Total Annual Fees summary strip (auto-summed)

#### Step 5 — Other Income
- [x] State Pension section (always visible):
  - NI qualifying years slider (0–35) with proportional amount calculation
  - Annual state pension amount (£, bidirectional sync with slider)
  - State pension start age (default 67)
- [x] "I have additional retirement income" toggle reveals:
  - DB / Final Salary Pension (£/yr + start age)
  - Annuity Income (£/yr)
  - Rental Income (£/yr)
  - Other Income (£/yr)
- [x] Total Other Income summary strip with phasing notes

#### Wizard Navigation
- [x] Previous / Next buttons with per-step validation
- [x] Step counter ("Step X of 5")
- [x] Progress bar with 5 clickable step indicators (completed / active state)
- [x] Calculate My Pension button on final step (first run)
- [x] Update Results button (when editing from results, see US#11)

#### Input Validation
- [x] Age validation: 18–75 years old
- [x] Retirement date must be in the future
- [x] UK pension age bounds: 55–75
- [x] Pension pot: £0 – £10,000,000
- [x] Monthly contribution: £0 – £100,000
- [x] Growth rate: 0% – 15%
- [x] Inflation rate: 0% – 5% (when inflation enabled)
- [x] Clear, specific error messages
- [x] Form prevents submission with invalid data

#### Currency Input Formatting
- [x] Comma formatting on blur (e.g. 250000 → 250,000)
- [x] Raw number on focus for editing
- [x] Applied to: pot, contribution, spending, all income fields

---

### Files
- `src/calculator.html` — Form structure (wizard steps, inputs, buttons)
- `src/app.js` — Wizard navigation, step validation, event handlers
- `src/validation/input-validator.js` — Validation rules and error messages
- `src/utils/form-helpers.js` — Currency formatting, other income helpers
- `src/config.js` — Validation bounds, default values
- `src/professional-forms.css` — Form styling
- `src/style.css` — Layout and responsive styles

### Related Stories
- US#8: Other Income (details income inputs)
- US#9: Life Expectancy Lookup (details ONS integration)
- US#10: Fees & Net Returns (details fee inputs)
- US#11: Edit-from-Results (details re-edit workflow)
