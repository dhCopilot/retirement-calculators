# GitHub Copilot Guidelines

## How to Get Good Code

### 1. Write Clear Comments
```javascript
/**
 * Calculate tax
 * @param {number} income
 * @returns {number} Tax
 */
function calculateTax(income) {
  // Copilot generates implementation
}
```

### 2. Provide Examples
```javascript
// formatCurrency(1234.5) → "£1,234.50"
function formatCurrency(amount) { }
```

## What Works
✅ Boilerplate
✅ Specs implementation
✅ Tests
✅ Patterns

## What Struggles
❌ Novel algorithms
❌ Complex logic
❌ Security code

Always review generated code!
