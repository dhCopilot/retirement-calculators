# US#9: Life Expectancy Lookup

**As a** UK pension saver
**I want to** use ONS life expectancy data based on my gender, age, and location
**So that** my retirement projections reflect a realistic planning horizon

## Status: ✅ Implemented (v0.3.1)

---

### Acceptance Criteria

#### ONS Data Integration
- [x] National baselines: Male 78.6 years, Female 82.6 years
- [x] Age-adjusted cohort tables (5-year brackets from age 20 to 75+)
- [x] Regional postcode area adjustments (100+ UK postcode prefixes)
- [x] `calculateLifeExpectancy(gender, currentAge, postcode)` returns composite estimate + source string

#### Postcode Parsing
- [x] `extractPostcodeArea()` parses UK postcode to 1–2 letter area prefix
- [x] Handles full and partial postcodes
- [x] Adjustment mapped per postcode area (e.g. SW = +1.8, L = -1.5)

#### 3 Selection Modes
- [x] **ONS Life Expectancy** (radio button) — auto-calculated from gender + age + postcode
- [x] **Default (age 100)** (radio button) — fixed horizon
- [x] **Manual** (radio button) — user-entered target age (60–120)
- [x] Selected value feeds into all retirement projections and charts

#### Chart Age Slider
- [x] Plan-to-age slider (65–110) on both lifecycle and cash flow charts
- [x] Reset button snaps back to life expectancy value
- [x] Slider change updates `currentLifeExpectancy` and rebuilds charts
- [x] If slider is used, form switches to Manual mode automatically

---

### Files
- `src/data/life-expectancy.js` — ONS baselines, cohort tables, postcode adjustments, `calculateLifeExpectancy()`
- `src/calculator.html` — Life expectancy radio buttons (Step 1), age sliders on charts
- `src/app.js` — Life expectancy mode switching, slider event handlers, `currentLifeExpectancy` global

### Related Stories
- US#1: Input Form (Step 1 life expectancy section)
- US#5: Retirement Spending (planning horizon)
- US#6: Lifecycle Chart (⏳ Life Expectancy milestone marker, age slider)
