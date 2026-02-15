# US#1: Basic Calculator Input Form

**As a** UK pension saver  
**I want to** input my current pension details and retirement plans  
**So that** I can see projections based on my personal circumstances

## Acceptance Criteria

### Core Input Fields
- [ ] Date of birth input (HTML5 date picker)
- [ ] Planned retirement date input
- [ ] Current pension pot amount (£)
- [ ] Monthly contribution amount (£)
- [ ] All fields have clear labels and hints

### Input Validation
- [ ] Age validation: 18-75 years old
- [ ] Retirement date: Must be in future
- [ ] Retirement age: 55-75 years (UK minimum pension age)
- [ ] Pension pot: £0 - £10,000,000
- [ ] Monthly contribution: £0 - £100,000
- [ ] Error messages clear and specific
- [ ] Form prevents submission with invalid data

### Advanced Settings
- [ ] Inflation toggle: Include/Exclude
- [ ] Inflation rate input: 0-5% (default 2.5%)
- [ ] Help text explaining inflation impact

### User Experience
- [ ] Form sections clearly organized
- [ ] Mobile responsive design
- [ ] Helpful hints for each field
- [ ] Calculate button clearly visible
- [ ] Form scrolls to show all fields

## Technical Implementation

### Validation Rules
```
birthDate: Required, past date
retirementDate: Required, future date, after birth date
currentPot: 0 ≤ amount ≤ 10,000,000
monthlyContribution: 0 ≤ amount ≤ 100,000
inflationRate: 0 ≤ rate ≤ 5 (only if includeInflation = true)
```

## Files to Modify/Create
- `src/index.html` (form structure)
- `src/style.css` (styling)
- `src/validation/input-validator.js` (validation logic)
- `src/app.js` (event handlers)

## Definition of Done
- [ ] Code implemented and tested
- [ ] Unit tests passing (80%+ coverage)
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Mobile responsive verified
- [ ] No linting errors
