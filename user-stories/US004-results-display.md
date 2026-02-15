# US#4: Results Display & Visualization

**As a** UK pension saver  
**I want to** see my pension calculations in a clear, organized, visual format  
**So that** I can quickly understand my retirement outlook

## Acceptance Criteria

### Results Display
- [ ] Display projected pension pot prominently
- [ ] Show tax-free lump sum (25% of pot, max £268,275)
- [ ] Show annual retirement income
- [ ] Show monthly income equivalent
- [ ] Show total contributions made
- [ ] Show growth amount (separate from contributions)

### Inflation Information
- [ ] Show current inflation setting (ON or OFF)
- [ ] Show inflation rate being used (0-5%)
- [ ] If inflation ON: Display real values (today's pounds)
- [ ] If inflation ON: Display nominal values (future pounds)
- [ ] Badge indicating "Inflation Included" or "Nominal Only"

### Scenario Comparison Results
- [ ] Display 3 scenario cards (Weak, Average, Strong)
- [ ] Each card shows pot, income, and comparison
- [ ] Highlight average as base case
- [ ] Show differences in both £ and %
- [ ] Side-by-side layout on desktop
- [ ] Stack layout on mobile

### Growth Chart Visualization
- [ ] Line chart showing pot growth over time
- [ ] Show "Your Contributions" line separately
- [ ] Show "Total Growth" visually
- [ ] Chart responsive to screen size
- [ ] Legend clearly labeled
- [ ] Currency formatted on Y-axis
- [ ] Interactive tooltips on hover

### Mobile Responsiveness
- [ ] All content readable on small screens
- [ ] Cards stack vertically on mobile
- [ ] Chart maintains visibility
- [ ] Touch-friendly sizing
- [ ] No horizontal scrolling needed
- [ ] Font sizes readable (min 14px)

## Files to Create/Modify
- `src/index.html` (result cards structure)
- `src/style.css` (styling and layout)
- `src/charts/growth-chart.js` (Chart.js configuration)
- `src/app.js` (populate results, event handling)

## Definition of Done
- [ ] Results display functional and styled
- [ ] Charts render correctly
- [ ] Mobile responsive verified
- [ ] Inflation badges display
- [ ] All values formatted correctly
- [ ] Tests passing (80%+ coverage)
- [ ] Code reviewed
