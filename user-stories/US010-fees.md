# US#10: Platform & Fund Fees

**As a** UK pension saver
**I want to** include platform, fund, and adviser fees in my projections
**So that** I see net-of-fee growth rates and realistic pot values

## Status: ✅ Implemented (v0.3.1)

---

### Acceptance Criteria

#### Fee Inputs (Step 4)
- [x] "Include Platform & Fund Fees" toggle (checkbox)
- [x] When enabled, reveals 3 fee inputs:
  - Platform Fee (%, default 0.25)
  - Fund / OCF Fee (%, default 0.15)
  - Adviser Fee (%, default 0)
- [x] Total Annual Fees summary strip (auto-summed e.g. "0.40%")

#### Fee Calculation
- [x] `getTotalFeePercent()` — sums all fee inputs
- [x] `applyFeeToRate(grossRate)` — subtracts total fee from gross growth rate
- [x] `getActiveScenarioListNet()` — returns scenario list with fees already deducted

#### Results Integration
- [x] Growth rates used in projection are net of fees
- [x] Result cards show net growth rate label (e.g. "5.0% gross − 0.40% fees = 4.60% net")
- [x] All projections, charts, and drawdown simulations use fee-adjusted rates

---

### Files
- `src/calculator.html` — Fee toggle and inputs (Step 4)
- `src/app.js` — `getTotalFeePercent()`, `applyFeeToRate()`, `getActiveScenarioListNet()`
- `src/config.js` — Default fee values

### Related Stories
- US#1: Input Form (Step 4 assumptions section)
- US#2: Pension Projection (uses net growth rates)
- US#3: Scenario Analysis (fee-adjusted scenario list)
