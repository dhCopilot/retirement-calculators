# Quick Start Guide - Retirement Calculator v0.3.0

## What's New in v0.3.0

### Major Features Added

1. **Inflation Adjustment** - See your retirement funds in today's pounds
2. **Scenario Analysis** - Compare 3 growth rate scenarios side-by-side
3. **Retirement Spending Analysis** - Plan how long your money will last
4. **Enhanced Results Dashboard** - More detailed insights and comparisons
5. **Mobile Responsive** - Full support for all devices

## Running the Application

### Start the Development Server
```bash
npm start
```
Opens automatically at `http://localhost:8080`

### Run Tests
```bash
# Run all tests
npm test

# Watch for changes
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## How to Use the Calculator

### Step 1: Enter Your Details
- **Date of Birth** - Your current age
- **Retirement Date** - When you plan to retire
- **Current Pension Pot** - How much you've saved
- **Monthly Contribution** - How much you save monthly
- **Investment Growth Rate** - Expected annual return (2-8%)

### Step 2: Configure Optional Settings
- **Inflation Adjustment** - Include inflation effects (recommended)
- **Inflation Rate** - Set your assumed inflation (default 2.5%)
- **Growth Scenario** - Choose weak (2%), average (5%), or strong (8%)

### Step 3: View Results
The calculator shows:
- Projected pension pot at retirement
- Tax-free lump sum available
- Projected annual & monthly income
- Investment growth earned
- Comparison against other scenarios

### Step 4: Analyze Spending (Optional)
Click "Analyze Retirement Spending Plan" to:
- **Mode A:** Enter planned annual spending → See if money lasts
- **Mode B:** Get maximum sustainable annual spending
- View year-by-year projections
- See when money might run out

## Key Features Explained

### Scenario Analysis
Compare 3 growth assumptions simultaneously:
- **Weak (2%)** - Conservative, recession-resistant
- **Average (5%)** - Historical UK average
- **Strong (8%)** - Optimistic growth

The calculator shows how each scenario affects your final pension pot and income.

### Inflation Adjustment
When enabled, shows two values:
- **Real value** - Today's purchasing power (recommended focus)
- **Nominal value** - Actual future pounds you'll receive

Example: £100k in 10 years with 2.5% inflation = ~£78k in today's pounds

### Spending Analysis
Two modes to plan retirement expenses:

**Mode A: Will My Money Last?**
- You enter: Annual spending amount
- Calculator shows: Year-by-year pot, whether it lasts

**Mode B: Maximum Safe Spend**
- Calculator finds: Maximum annual amount you can safely spend
- Ensures: Money lasts exactly to your life expectancy

### Regulations Applied
- Minimum pension access age: 55 years
- Tax-free lump sum: 25% of pot (max £268,275)
- Safe withdrawal rate: 4% per annum
- UK pension rules as of 2025

## Example Scenario

**User Profile:**
- Age 40, plans to retire at 65 (25 years)
- Current pot: £350,000
- Monthly saving: £800
- Expected growth: 5%
- Inflation: 2.5%
- Life expectancy: 90

**Results with inflation included:**
- Projected pot (real): ~£980,000
- Annual income (real): ~£29,400
- Money lasts: ✅ Yes, to age 90+

**Scenario Comparison:**
- Weak (2%): ~£750k pot → ~£22,500/year
- Average (5%): ~£980k pot → ~£29,400/year (base case)
- Strong (8%): ~£1,280k pot → ~£38,400/year

**Spending Analysis:**
- Maximum safe annual spend: ~£39,200
- If spending £35,000/year: Money lasts until age 95+

## Understanding the Results

### Projected Pot
Your estimated pension fund at retirement (after growth and contributions).

### Tax-Free Lump Sum
25% of your pot you can withdraw tax-free at retirement (max £268,275).

### Annual/Monthly Income
Based on 4% safe withdrawal rate from remaining 75% of pot.

### Total Contributions
All money you've put in (initial + monthly contributions).

### Investment Growth
Pure profit from market returns (difference from contributions).

### Time Horizon
Years until your planned retirement date.

## Mobile Tips
- Optimized for all screen sizes
- Touch-friendly buttons and inputs
- Swipe or scroll for scenario comparisons
- Charts auto-scale for your device

## Frequently Asked Questions

**Q: What if my investment returns are negative?**
A: The calculator handles 0% growth. Use Scenario Analysis to test downside cases.

**Q: Should I use real or nominal values?**
A: Real values (today's pounds) are typically better for planning as they show actual purchasing power.

**Q: Is 4% safe withdrawal rate accurate?**
A: Yes, it's the standard UK recommendation for a 25+ year retirement.

**Q: Can I plan for a longer retirement?**
A: Yes! Retirement Spending Analysis supports up to 120-year life expectancy.

**Q: What counts as monthly contribution?**
A: Any regular amount you add to your pension (employer + personal).

## Support & Disclaimers

⚠️ **Important:** This calculator provides estimates only. Please consult a qualified financial advisor for personalized advice regarding your retirement planning.

The calculator uses:
- Current UK pension regulations (2025)
- Compound interest formulas
- Historical averages for defaults
- Your personal inputs for customization

## Technical Information

**Built with:**
- Vanilla JavaScript (no frameworks)
- Chart.js for visualizations
- HTML5 & CSS3
- Responsive design
- Jest for testing

**Browser Compatibility:**
- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅
- Mobile browsers ✅

## Version History

**v0.3.0** (Feb 2026)
- Inflation adjustment
- Scenario analysis
- Spending analysis
- Enhanced mobile support
- Comprehensive tests

**v0.2.0**
- Custom investment growth rates
- Basic pension/income calculations

**v0.1.0**
- Initial launch
- Basic calculator

---

For more details, see the user stories in `/user-stories/` directory.
