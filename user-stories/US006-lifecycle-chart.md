# US#6: Lifecycle Chart & Longevity Planning

**As a** UK pension saver  
**I want to** see my complete financial journey from now through retirement on a single unified chart  
**So that** I can understand the entire arc of my pension - from accumulation to drawdown - in one visual

## Acceptance Criteria

### Unified Lifecycle Chart
- [x] Single line chart showing complete age timeline (current age to 100)
- [x] X-axis: Age progression (e.g., Age 35, 36, 37... to Age 100)
- [x] Y-axis: Pension pot value in GBP
- [x] Chart shows **two distinct phases**:
  - **Accumulation Phase**: From today to retirement (pot growing)
  - **Drawdown Phase**: From retirement to age 100 (pot declining)

### Accumulation Phase Visualization
- [x] Display 3 growth scenarios (Weak 2%, Average 5%, Strong 8%)
- [x] Each scenario shown as separate line
- [x] Weak scenario: Red dashed line
- [x] Average scenario: Blue solid line (primary focus)
- [x] Strong scenario: Green dashed line
- [x] Pot grows continuously until retirement date
- [x] Legend clearly identifies scenarios

### Drawdown Phase Visualization
- [x] Display single retirement drawdown line (Average 5% growth)
- [x] Retirement drawdown: Red/coral line showing pot depletion
- [x] Starts at retirement date
- [x] Shows pot declining over time with annual spending
- [x] Continues to age 100 or until money depletes
- [x] Clear visual distinction from accumulation phase

### Interactive Features
- [x] Hover tooltips show exact values
- [x] Tooltips display age, pot value, and scenario name
- [x] Currency formatted with commas (£)
- [x] Responsive chart (scales to screen size)
- [x] Legend toggleable (click legend to show/hide scenarios)

### Chart Axis & Labels
- [x] X-axis label: "Age Timeline (Accumulation → Retirement Drawdown)"
- [x] Y-axis label: "Pot Value (£)"
- [x] Y-axis formatted in thousands (e.g., "£0k", "£100k", "£500k")
- [x] Major gridlines for easy reading
- [x] Age labels spaced appropriately

### Mobile Responsiveness
- [x] Chart maintains height on mobile (420px container)
- [x] Legend responsive (stacks on small screens)
- [x] Touch-friendly tooltips
- [x] Full width utilization
- [x] Readable on all screen sizes (320px+)

### Milestone Timeline Display
- [x] Visual timeline showing retirement and age 100 milestones
- [x] Retirement milestone:
  - Green circular marker
  - Shows actual age and date
  - Example: "Age 65 - 10 Jan 2036"
- [x] Age 100 milestone:
  - Red circular marker  
  - Shows age 100 and date
  - Example: "Age 100 - 10 Jan 2071"
- [x] Connecting line between milestones (gradient green to red)
- [x] Mobile layout: stacks vertically

### Longevity Planning Integration
- [x] User inputs annual retirement spending (£)
- [x] "Analyze Longevity Plan" button triggers calculation
- [x] System combines growth projection with spending plan
- [x] Chart automatically updates to show unified lifecycle
- [x] Shows visual transition from growth to drawdown

### Summary Display
- [x] Show 5 key metrics in card layout:
  1. Retirement Pot (at retirement date)
  2. Annual Spending (during retirement)
  3. Years Planned (retirement age to 100)
  4. Balance at 100 (remaining or depleted)
  5. Status (Money Lasts ✅ or Money Depleted ⚠️)
- [x] Status color-coded: Green for success, Red for depleted
- [x] Currency formatted with commas
- [x] Cards stack on mobile

### Future Extensibility
- [x] Architecture supports adding multiple custom milestones
- [x] Milestone system designed for future configuration
- [x] Spending adjustments by milestone (future feature)
- [x] Multiple goal milestones (future feature)
- [x] Tax event milestones (future feature)

## Files Created/Modified
- `src/index.html` - Added longevity planning section with milestone timeline and summary
- `src/app.js` - Added `createCombinedLifecycleChart()` and `calculateLongevityPlan()`
- `src/charts/growth-chart.js` - Growth chart visualization component
- `src/professional-forms.css` - Styling for milestones and longevity section

## Implementation Notes

### Chart Data Structure
- Accumulation phase: Years 0 to retirement (from growth projections)
- Drawdown phase: Years 0 to (100 - retirementAge) (from longevity calculations)
- Chart combines both phases with continuous age axis

### Calculation Logic
- Growth phase: Uses investment return rate on accumulating pot
- Drawdown phase: Uses investment return rate on declining pot (with annual withdrawal)
- Money stops generating growth once depleted (balance clamped to ≥0)

### Visual Hierarchy
1. Main chart: Shows accumulation + drawdown on single axis
2. Milestone timeline: Emphasizes key life events
3. Summary cards: Highlights critical outcomes (balance at 100, status)

## Related User Stories
- US#3: Income Projection & Scenario Analysis
- US#4: Results Display & Visualization
- US#5: Retirement Spending Analysis
- US#1: Calculator Input Form with dates and pension details
