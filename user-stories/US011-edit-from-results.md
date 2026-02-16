# US#11: Edit-from-Results

**As a** UK pension saver
**I want to** quickly tweak my inputs without losing my results context
**So that** I can explore "what if" scenarios without starting over

## Status: ✅ Implemented (v0.4.1)

---

### Acceptance Criteria

#### Quick-Edit Bar
- [x] Row of per-step edit links in results header: Timeline / Pension / Spending / Assumptions / Income
- [x] Clicking a link opens the form at that specific wizard step
- [x] All wizard steps accessible during edit mode (can navigate freely)

#### Edit Mode
- [x] `_isEditingFromResults` flag tracks edit state
- [x] "Calculate My Pension" button replaced with "Update Results" button
- [x] Submitting recalculates and returns to results section
- [x] Progress bar step indicators all clickable during edit mode

#### Start Over
- [x] "↩ Start Over" button resets to Step 1
- [x] Hides results section
- [x] Clears edit mode flag

---

### Files
- `src/calculator.html` — Quick-edit bar (`edit-inputs-bar`), Update Results button, Start Over button
- `src/app.js` — `editFromResults()`, `_isEditingFromResults`, wizard step click handlers, button text toggling

### Related Stories
- US#1: Input Form (wizard navigation)
- US#4: Results Display (results section context)
