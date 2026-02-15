# Architecture & Design

## Core Principles

### 1. Separation of Concerns
- Calculators (logic)
- Validation (checks)
- Charts (visualization)
- App (orchestration)

### 2. Pure Functions
Same input = same output.

### 3. DRY
Define once, use everywhere.

## Data Flow
```
Input → Validation → Calculators → Charts → Display
```

Keep it simple and testable!
