# Technical Specification - Retirement Calculator v0.2

## Architecture

### Frontend
- Pure HTML5, CSS3, JavaScript (no framework)
- Chart.js for data visualization
- Responsive design (mobile-first)

### Calculations

#### Pension Projection
```
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Where:
- FV = Future Value (projected pot)
- PV = Present Value (current pot)
- r = monthly interest rate (0.407%)
- n = number of months
- PMT = monthly contribution
```

#### Income Projection
```
Tax-Free Lump Sum = min(Pot × 0.25, £268,275)
Drawdown Pot = Pot - Tax-Free Lump Sum
Annual Income = Drawdown Pot × 0.04
Monthly Income = Annual Income / 12
```

### Validation Rules
- Age: 18-75 years
- Retirement Age: 55-75 years
- Pension Pot: £0 - £10,000,000
- Monthly Contribution: £0 - £100,000
- Investment Growth Rate: 0% - 15% annually
- Retirement Date: Must be in future

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure
```
src/
├── index.html              # Main page
├── style.css              # All styles
├── app.js                 # Main logic
├── calculators/
│   ├── pension-projection.js
│   └── income-projection.js
├── validation/
│   └── input-validator.js
└── charts/
    └── growth-chart.js
```

## Future Enhancements (v0.2+)
- Multiple scenarios comparison
- Inflation adjustment
- State pension integration
- PDF report export
- Data persistence (localStorage)
