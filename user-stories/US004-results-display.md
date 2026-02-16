# US#4: Results Display & Visualisation

**As a** UK pension saver
**I want to** see my pension calculations in a clear, organised, visual format
**So that** I can quickly understand my retirement outlook

## Status: ✅ Implemented (v0.4.0)

---

### Acceptance Criteria

#### Scenario Range Strip
- [x] Clickable 3-scenario bar (Weak / Average / Strong)
- [x] Each segment shows projected pot and growth rate
- [x] Colour-coded: red / green / gold
- [x] Click switches all result cards to that scenario

#### Result Cards
- [x] 🎯 Projected Pot at Retirement (with real/nominal toggle when inflation enabled)
- [x] 💵 Tax-Free Lump Sum (25% of pot, max £268,275)
- [x] 📊 Annual Income (4% SWR) + monthly breakdown
- [x] 💰 Total Contributions made
- [x] 📈 Investment Growth (amount + percentage of final pot)
- [x] ⏱️ Time Horizon (years until retirement)
- [x] Net growth rate label (gross − fees = net, when fees enabled)

#### Badges
- [x] 📉 Inflation Adjustment badge (when inflation enabled, shows rate)
- [x] 💰 Other Income badge — shows phased income summary (e.g. "£X/yr from age 60, rising to £Y/yr")

#### Milestone Timeline
- [x] Visual timeline: Retirement Age → Longevity Target
- [x] Shows years between milestones
- [x] Retirement date and target date details

#### Longevity Summary Panel
- [x] Retirement Pot value
- [x] Annual Spending amount
- [x] Years Planned (retirement age to target)
- [x] Balance at target age
- [x] Status indicator: Money Lasts ✅ or Depleted ⚠️

#### Narrative Cards
- [x] 3 scenario narrative cards (Weak / Average / Strong) below lifecycle chart
- [x] Per-scenario: pot at retirement, depletion age warning or remaining balance
- [x] Explanatory paragraph about the 3 growth scenarios

#### Retirement Spending Analysis Section
- [x] Spending Mode selector:
  - Mode A (Spending Plan): enter annual spend, see if money lasts
  - Mode B (Maximum Sustainable Spending): discover max safe annual/monthly spend
- [x] Analyze Spending Plan button
- [x] Spending status card (✅ Success / ⚠️ Warning with depletion age)
- [x] Summary grid: Starting Pot, Annual Spending, Retirement Duration, Total Spent, Final Balance, Money Runs Out age

#### Mobile Responsiveness
- [x] Cards stack vertically on mobile
- [x] Charts maintain visibility
- [x] Touch-friendly sizing
- [x] Font sizes readable (min 14px)

---

### Files
- `src/calculator.html` — Result cards, range strip, badges, milestone timeline, longevity summary, spending analysis section
- `src/app.js` — `_resultsCache`, `switchResultsScenario()`, `populateResultCards()`, `calculateLongevityPlan()`
- `src/style.css` — Card layout, range strip, badges, timeline styling
- `src/professional-forms.css` — Form and button styling

### Related Stories
- US#3: Scenario Analysis (result card switching)
- US#5: Retirement Spending (spending analysis section)
- US#6: Lifecycle Chart (visual projection)
- US#11: Edit-from-Results (re-edit workflow)
