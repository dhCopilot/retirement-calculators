/**
 * Detractio — Main Application Orchestrator
 * Wires up event handlers and coordinates between calculators, charts, and the DOM.
 *
 * Dependencies (loaded via script tags before this file):
 *   config.js, utils/formatting.js, utils/date-utils.js, utils/drawdown.js,
 *   utils/form-helpers.js, calculators/*, validation/input-validator.js,
 *   charts/lifecycle-chart-builder.js, charts/cash-flow-chart-builder.js,
 *   charts/retirement-projection-chart.js
 *
 * @module app
 * @version 0.4.0
 */

// ===== TEST DEFAULTS (set to true for development only) =====
const TEST_MODE = false;
if (TEST_MODE) {
    window.addEventListener('DOMContentLoaded', () => {
        getElement('birthDate').value = '1972-01-01';
        getElement('birthDate').dispatchEvent(new Event('change'));
        getElement('retirementAgeSelect').value = '60';
        getElement('retirementAgeSelect').dispatchEvent(new Event('change'));
        getElement('currentPot').value = '600,000';
        getElement('monthlyContribution').value = '500';
    });
}

// ── Application State ────────────────────────────────────────────
let selectedScenarioRate = APP_CONFIG.DEFAULT_GROWTH_RATE;

/** Dynamically calculated life expectancy (defaults to TARGET_AGE) */
let currentLifeExpectancy = APP_CONFIG.TARGET_AGE;

/** Shared projection data consumed by lifecycle chart builder */
let growthProjectionData = {
    weak: null, average: null, strong: null,
    birthDate: null, retirementDate: null, retirementAge: null
};

// Backward-compat aliases for functions that moved to utility modules
const unformatNumberInput = unformatNumber;
const formatNumberForDisplay = formatNumberWithCommas;

// ══════════════════════════════════════════════════════════════════
//  EVENT HANDLERS
// ══════════════════════════════════════════════════════════════════

/** Auto-calculate planned retirement date from DOB + selected age */
function autoCalculateRetirementDate() {
    const birthDateInput = getElement('birthDate')?.value;
    const retirementAge = parseInt(getElement('retirementAgeSelect')?.value);
    if (!birthDateInput || isNaN(retirementAge)) return;

    const dob = new Date(birthDateInput);
    const retDate = new Date(dob.getFullYear() + retirementAge, dob.getMonth(), dob.getDate());
    const yyyy = retDate.getFullYear();
    const mm = String(retDate.getMonth() + 1).padStart(2, '0');
    const dd = String(retDate.getDate()).padStart(2, '0');
    getElement('retirementDate').value = `${yyyy}-${mm}-${dd}`;
}

/**
 * Get the currently selected life expectancy mode.
 * @returns {'ons'|'default'|'manual'}
 */
function getLifeExpectancyMode() {
    const selected = document.querySelector('input[name="lifeExpectancyMode"]:checked');
    return selected ? selected.value : 'ons';
}

/**
 * Recalculate and display life expectancy based on current form inputs and selected mode.
 * Updates the global `currentLifeExpectancy` used by all calculations.
 */
function updateLifeExpectancy() {
    const mode = getLifeExpectancyMode();
    const leValue = getElement('lifeExpectancyValue');
    const leSource = getElement('lifeExpectancySource');
    const leResult = getElement('lifeExpectancyResult');
    const manualInput = getElement('manualAgeInput');

    // Show/hide manual age input
    if (manualInput) manualInput.style.display = mode === 'manual' ? 'block' : 'none';

    if (mode === 'default') {
        // Fixed at 100
        currentLifeExpectancy = APP_CONFIG.TARGET_AGE;
        if (leValue) leValue.innerHTML = `Planning to age <strong>${APP_CONFIG.TARGET_AGE}</strong>`;
        if (leSource) leSource.textContent = 'Standard planning horizon';
        if (leResult) leResult.style.display = 'block';
        return;
    }

    if (mode === 'manual') {
        const manualAge = parseInt(getElement('manualTargetAge')?.value) || 90;
        currentLifeExpectancy = Math.max(60, Math.min(120, manualAge));
        if (leValue) leValue.innerHTML = `Planning to age <strong>${currentLifeExpectancy}</strong>`;
        if (leSource) leSource.textContent = 'User-defined target age';
        if (leResult) leResult.style.display = 'block';
        return;
    }

    // ONS mode
    const gender = getElement('genderSelect')?.value;
    const postcode = getElement('postcode')?.value || '';
    const birthDateVal = getElement('birthDate')?.value;

    if (!gender || !birthDateVal) {
        currentLifeExpectancy = APP_CONFIG.TARGET_AGE;
        if (leValue) leValue.innerHTML = 'Select <strong>gender</strong> and <strong>date of birth</strong> for ONS estimate';
        if (leSource) leSource.textContent = `Falling back to default (age ${APP_CONFIG.TARGET_AGE})`;
        if (leResult) leResult.style.display = 'block';
        return;
    }

    const currentAge = Math.floor(calculateExactAge(birthDateVal));
    const result = calculateLifeExpectancy(gender, currentAge, postcode);

    if (result.lifeExpectancy) {
        currentLifeExpectancy = Math.ceil(result.lifeExpectancy);
        const genderLabel = gender === 'male' ? '♂ Male' : '♀ Female';
        if (leValue) leValue.innerHTML = `${genderLabel} — estimated life expectancy: <strong>${result.lifeExpectancy} years</strong>`;
        if (leSource) leSource.textContent = `Source: ${result.source}`;
    } else {
        currentLifeExpectancy = APP_CONFIG.TARGET_AGE;
        if (leValue) leValue.innerHTML = `Using default: <strong>age ${APP_CONFIG.TARGET_AGE}</strong>`;
        if (leSource) leSource.textContent = 'ONS data not available for this selection';
    }
    if (leResult) leResult.style.display = 'block';
}

// Wire up DOB → current age display + auto retirement date + life expectancy
getElement('retirementAgeSelect')?.addEventListener('change', autoCalculateRetirementDate);
getElement('genderSelect')?.addEventListener('change', updateLifeExpectancy);
getElement('postcode')?.addEventListener('blur', updateLifeExpectancy);

// Life expectancy mode radios
document.querySelectorAll('input[name="lifeExpectancyMode"]').forEach(radio => {
    radio.addEventListener('change', updateLifeExpectancy);
});
getElement('manualTargetAge')?.addEventListener('input', updateLifeExpectancy);

getElement('birthDate')?.addEventListener('change', function () {
    const currentAgeEl = getElement('currentAge');
    if (!this.value) {
        if (currentAgeEl) currentAgeEl.textContent = 'Enter your date of birth to calculate';
        return;
    }
    const age = calculateExactAge(this.value);
    if (currentAgeEl) currentAgeEl.textContent = `You are currently ${formatAge(age)}`;
    autoCalculateRetirementDate();
    updateLifeExpectancy();
});

// Ensure retirement date is auto-calculated if both fields are filled on load
window.addEventListener('DOMContentLoaded', () => {
    const birthDate = getElement('birthDate')?.value;
    const retirementAge = getElement('retirementAgeSelect')?.value;
    if (birthDate && retirementAge) {
        autoCalculateRetirementDate();
    }
});

// Also recalculate retirement date on blur (in case user tabs through fields)
getElement('birthDate')?.addEventListener('blur', autoCalculateRetirementDate);
getElement('retirementAgeSelect')?.addEventListener('blur', autoCalculateRetirementDate);

// Initialise life expectancy display on load
updateLifeExpectancy();

// ── Editable Scenario Cards ──────────────────────────────────────

/** Read user-overridden scenario rates from the Step 4 inputs */
function getScenarioRates() {
    return {
        weak:    parseFloat(getElement('scenarioWeakRate')?.value)    || 2,
        average: parseFloat(getElement('scenarioAverageRate')?.value) || 5,
        strong:  parseFloat(getElement('scenarioStrongRate')?.value)  || 8
    };
}

/** Validate weak < average < strong and show/hide error message */
function validateScenarioRates() {
    const r = getScenarioRates();
    const valid = r.weak < r.average && r.average < r.strong;
    const msg = getElement('scenarioValidationMsg');
    if (msg) msg.style.display = valid ? 'none' : 'block';

    // Toggle red border on offending cards
    ['Weak', 'Average', 'Strong'].forEach(id => {
        getElement('scenario' + id + 'Card')?.classList.toggle('validation-error', !valid);
    });

    return valid;
}

/** Build a SCENARIO_LIST-compatible array using current form values */
function getActiveScenarioList() {
    const r = getScenarioRates();
    return [
        { id: 'WEAK',    rate: r.weak / 100,    label: `Weak Growth (${r.weak}%)`,    color: '#dc3545' },
        { id: 'AVERAGE', rate: r.average / 100,  label: `Average Growth (${r.average}%)`, color: '#667eea' },
        { id: 'STRONG',  rate: r.strong / 100,   label: `Strong Growth (${r.strong}%)`,  color: '#28a745' }
    ];
}

// Card click = select primary scenario
document.querySelectorAll('.scenario-card-editable').forEach(card => {
    card.addEventListener('click', function (e) {
        // Don't trigger selection when typing in the input
        if (e.target.classList.contains('scenario-rate-input')) return;

        document.querySelectorAll('.scenario-card-editable').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        // Update the hidden investmentGrowth and selectedScenarioRate
        const input = this.querySelector('.scenario-rate-input');
        if (input) {
            selectedScenarioRate = parseFloat(input.value) || 5;
            getElement('investmentGrowth').value = selectedScenarioRate;
        }
    });
});

// Rate input changes = re-validate + update selected rate if this card is active
document.querySelectorAll('.scenario-rate-input').forEach(input => {
    input.addEventListener('input', function () {
        validateScenarioRates();
        const card = this.closest('.scenario-card-editable');
        if (card?.classList.contains('active')) {
            selectedScenarioRate = parseFloat(this.value) || 5;
            getElement('investmentGrowth').value = selectedScenarioRate;
        }
    });
    // Prevent card click from firing when clicking into input
    input.addEventListener('click', e => e.stopPropagation());
});

// ── Fees Toggle & Calculation ────────────────────────────────────

/** Return total annual fee as a percentage (e.g. 0.40) */
function getTotalFeePercent() {
    if (!getElement('includeFees')?.checked) return 0;
    const platform = parseFloat(getElement('platformFee')?.value) || 0;
    const fund     = parseFloat(getElement('fundFee')?.value)     || 0;
    const adviser  = parseFloat(getElement('adviserFee')?.value)  || 0;
    return Math.round((platform + fund + adviser) * 100) / 100;
}

/** Update the total-fee summary display */
function updateFeeSummary() {
    const total = getTotalFeePercent();
    setText('totalFeeDisplay', total.toFixed(2) + '%');
}

// Show/hide fee section
getElement('includeFees')?.addEventListener('change', e => {
    toggleVisibility('feesSection', e.target.checked);
    updateFeeSummary();
});

// Re-calculate total on any fee input change
document.querySelectorAll('.fee-rate-input').forEach(input => {
    input.addEventListener('input', updateFeeSummary);
});

/**
 * Adjust a gross growth rate (decimal) by subtracting fees.
 * e.g. 5% gross − 0.40% fees = 4.60% net → 0.046
 * Ensures we never go below 0.
 */
function applyFeeToRate(grossRateDecimal) {
    const feeDecimal = getTotalFeePercent() / 100;
    return Math.max(0, grossRateDecimal - feeDecimal);
}

/** Build a SCENARIO_LIST-compatible array with fees already deducted */
function getActiveScenarioListNet() {
    const r = getScenarioRates();
    const fee = getTotalFeePercent();
    return [
        { id: 'WEAK',    rate: Math.max(0, (r.weak - fee) / 100),    label: `Weak Growth (${r.weak}% − ${fee}% fees)`,    color: '#dc3545' },
        { id: 'AVERAGE', rate: Math.max(0, (r.average - fee) / 100), label: `Average Growth (${r.average}% − ${fee}% fees)`, color: '#667eea' },
        { id: 'STRONG',  rate: Math.max(0, (r.strong - fee) / 100),  label: `Strong Growth (${r.strong}% − ${fee}% fees)`,  color: '#28a745' }
    ];
}

// Inflation toggle
getElement('includeInflation')?.addEventListener('change', e => {
    toggleVisibility('inflationRateGroup', e.target.checked);
});

// ── Other Income Toggle & Helpers ────────────────────────────────

/**
 * Return total annual other income (£/yr) at a specific age.
 * State pension and DB pension only count if age >= their start age.
 * Annuity, rental, and other income apply from retirement onward.
 * If no age is given, returns the maximum total (all sources active).
 * @param {number} [age] - The person's age in a given year
 * @returns {number}
 */
function getOtherIncomeAtAge(age) {
    let total = 0;

    // State Pension — always counted (field is always visible)
    const statePensionAmt = parseCurrencyInput(getElement('statePension')?.value) || 0;
    const statePensionAge = parseInt(getElement('statePensionAge')?.value) || 67;
    if (statePensionAmt > 0 && (age === undefined || age >= statePensionAge)) {
        total += statePensionAmt;
    }

    // Remaining sources only if "additional income" checkbox is ticked
    if (!getElement('includeOtherIncome')?.checked) return total;

    // DB Pension — starts at specified age (default 65)
    const dbPensionAmt = parseCurrencyInput(getElement('dbPension')?.value) || 0;
    const dbPensionAge = parseInt(getElement('dbPensionAge')?.value) || 65;
    if (dbPensionAmt > 0 && (age === undefined || age >= dbPensionAge)) {
        total += dbPensionAmt;
    }

    // Annuity, rental, other — apply from retirement onward (no age gate)
    total += parseCurrencyInput(getElement('annuityIncome')?.value) || 0;
    total += parseCurrencyInput(getElement('rentalIncome')?.value) || 0;
    total += parseCurrencyInput(getElement('otherIncomeGeneral')?.value) || 0;

    return total;
}

/** Backward-compat: total other income with all sources active */
function getTotalOtherIncome() {
    return getOtherIncomeAtAge();
}

/**
 * Net annual withdrawal needed from pension pot at a specific age.
 * grossSpending − otherIncomeAtAge, floored at 0.
 * @param {number} grossSpending - Total desired annual spending
 * @param {number} [age] - Person's age (for phased income)
 * @returns {number}
 */
function getNetAnnualWithdrawal(grossSpending, age) {
    return Math.max(0, grossSpending - getOtherIncomeAtAge(age));
}

/** Update the other-income summary display */
function updateOtherIncomeSummary() {
    const total = getTotalOtherIncome();
    setText('totalOtherIncomeDisplay', '£' + Math.round(total).toLocaleString(APP_CONFIG.LOCALE) + '/yr');

    // Show phasing note if state pension or DB pension has a later start age
    const noteEl = getElement('otherIncomeSummaryNote');
    if (noteEl) {
        const statePensionAmt = parseCurrencyInput(getElement('statePension')?.value) || 0;
        const statePensionAge = parseInt(getElement('statePensionAge')?.value) || 67;
        const dbPensionAmt = parseCurrencyInput(getElement('dbPension')?.value) || 0;
        const dbPensionAge = parseInt(getElement('dbPensionAge')?.value) || 65;

        const phases = [];
        if (statePensionAmt > 0) phases.push('State pension from age ' + statePensionAge);
        if (dbPensionAmt > 0) phases.push('DB pension from age ' + dbPensionAge);

        if (phases.length > 0) {
            noteEl.textContent = '— ' + phases.join(', ') + '. Withdrawal from pot adjusts each year.';
        } else {
            noteEl.textContent = '— reduces how much you need to withdraw from your pot';
        }
    }
}

// ── State Pension qualifying-years auto-calc ────────────────────
/**
 * Recalculate state pension amount from the qualifying-years slider.
 * 35 yrs = full pension, 10–34 = proportional, <10 = £0.
 */
function updateStatePensionFromYears() {
    const slider = getElement('spQualifyingYears');
    const display = getElement('spYearsDisplay');
    const hint = getElement('spYearsHint');
    const spField = getElement('statePension');
    if (!slider) return;

    const years = parseInt(slider.value) || 0;
    const full = APP_CONFIG.UK_FULL_STATE_PENSION;
    const maxYrs = APP_CONFIG.UK_SP_QUALIFYING_YEARS;
    const minYrs = APP_CONFIG.UK_SP_MIN_YEARS;

    if (display) display.textContent = years;

    let amount = 0;
    if (years >= maxYrs) {
        amount = full;
        if (hint) hint.textContent = years + ' years = full pension';
    } else if (years >= minYrs) {
        amount = Math.round((years / maxYrs) * full);
        const pct = Math.round((years / maxYrs) * 100);
        if (hint) hint.textContent = pct + '% of full pension (£' + full.toLocaleString(APP_CONFIG.LOCALE) + ')';
    } else if (years > 0) {
        amount = 0;
        if (hint) hint.textContent = 'Need at least ' + minYrs + ' years to qualify';
    } else {
        amount = 0;
        if (hint) hint.textContent = 'No state pension';
    }

    if (spField) {
        spField.value = amount > 0 ? amount.toLocaleString(APP_CONFIG.LOCALE) : '';
    }
    updateOtherIncomeSummary();
}

// Wire up qualifying-years slider
getElement('spQualifyingYears')?.addEventListener('input', updateStatePensionFromYears);

// Also allow manual override of the £ field (don't fight the user)
getElement('statePension')?.addEventListener('input', function() {
    // Sync slider back to nearest qualifying years from the manual amount
    const val = parseCurrencyInput(this.value) || 0;
    const full = APP_CONFIG.UK_FULL_STATE_PENSION;
    const maxYrs = APP_CONFIG.UK_SP_QUALIFYING_YEARS;
    const nearestYears = Math.min(maxYrs, Math.max(0, Math.round((val / full) * maxYrs)));
    const slider = getElement('spQualifyingYears');
    const display = getElement('spYearsDisplay');
    if (slider) slider.value = nearestYears;
    if (display) display.textContent = nearestYears;
    updateOtherIncomeSummary();
});

// Update summary when state pension start-age changes
getElement('statePensionAge')?.addEventListener('input', updateOtherIncomeSummary);

// Set initial state pension value from slider on load
document.addEventListener('DOMContentLoaded', updateStatePensionFromYears);

// Show/hide other income section
getElement('includeOtherIncome')?.addEventListener('change', e => {
    toggleVisibility('otherIncomeSection', e.target.checked);
    updateOtherIncomeSummary();
});

// Re-calculate total on any other-income input change
['dbPension', 'annuityIncome', 'rentalIncome', 'otherIncomeGeneral'].forEach(id => {
    getElement(id)?.addEventListener('input', updateOtherIncomeSummary);
});
// Also update when start-age fields change
['dbPensionAge'].forEach(id => {
    getElement(id)?.addEventListener('input', updateOtherIncomeSummary);
});

// Attach comma-formatting to other-income inputs
attachCurrencyFormatting(['statePension', 'dbPension', 'annuityIncome', 'rentalIncome', 'otherIncomeGeneral']);

// Primary action buttons
getElement('calculateBtn')?.addEventListener('click', calculateRetirement);
getElement('updateResultsBtn')?.addEventListener('click', calculateRetirement);
getElement('recalculateBtn')?.addEventListener('click', resetToForm);

// Quick-edit links from results section
document.querySelectorAll('.edit-step-link').forEach(btn => {
    btn.addEventListener('click', () => {
        editFromResults(parseInt(btn.dataset.editStep));
    });
});

getElement('toggleSpendingAnalysisBtn')?.addEventListener('click', () => {
    toggleVisibility('retirementSpending', true);
    getElement('retirementSpending')?.scrollIntoView({ behavior: 'smooth' });
});
getElement('analyzeSpendingBtn')?.addEventListener('click', analyzeRetirementSpending);

// Spending mode radio toggle
document.querySelectorAll('input[name="spendingMode"]').forEach(radio => {
    radio.addEventListener('change', function () {
        toggleVisibility('modeAInputs', this.value === 'mode-a');
    });
});

// Attach comma-formatting to currency text inputs
attachCurrencyFormatting(['currentPot', 'monthlyContribution', 'retirementAnnualSpending', 'annualSpending']);

// ── Chart Age Slider Wiring ──────────────────────────────────────

/**
 * Sync both chart age sliders and rebuild charts at the new target age.
 * @param {number} newAge - The new target age from the slider
 * @param {string} sourceSlider - 'lifecycle' or 'cashFlow' (which slider triggered)
 */
function onChartAgeSliderChange(newAge, sourceSlider) {
    const age = Math.max(65, Math.min(110, parseInt(newAge) || 100));
    currentLifeExpectancy = age;

    // Sync slider + output
    const slider = getElement('sharedAgeSlider');
    const output = getElement('sharedAgeValue');
    if (slider) slider.value = age;
    if (output) output.textContent = age;

    // Also sync the form radio to match
    const manualRadio = document.querySelector('input[name="lifeExpectancyMode"][value="manual"]');
    if (manualRadio) manualRadio.checked = true;
    const manualInput = getElement('manualTargetAge');
    if (manualInput) manualInput.value = age;
    const manualDiv = getElement('manualAgeInput');
    if (manualDiv) manualDiv.style.display = 'block';
    updateLifeExpectancy();

    // Rebuild charts with new target age
    rebuildChartsAtCurrentAge();
}

/**
 * Rebuild both charts using the current life expectancy and spending values.
 */
function rebuildChartsAtCurrentAge() {
    const spendingInput = getElement('retirementAnnualSpending');
    const spending = parseCurrencyInput(spendingInput?.value) || 0;
    if (spending <= 0) return;

    const longevityData = buildLongevityData(spending);
    if (longevityData.length > 0) {
        createCombinedLifecycleChart(longevityData);
        createCashFlowChart(spending);
    }
}

/**
 * Sync chart sliders to the current life expectancy value.
 */
function syncChartSlidersToLifeExpectancy() {
    const age = currentLifeExpectancy;
    const slider = getElement('sharedAgeSlider');
    const output = getElement('sharedAgeValue');
    if (slider) slider.value = age;
    if (output) output.textContent = age;
}

// Shared age slider
getElement('sharedAgeSlider')?.addEventListener('input', function () {
    getElement('sharedAgeValue').textContent = this.value;
});
getElement('sharedAgeSlider')?.addEventListener('change', function () {
    onChartAgeSliderChange(this.value, 'shared');
});

// Reset button — snap back to life expectancy value
getElement('sharedAgeReset')?.addEventListener('click', function () {
    updateLifeExpectancy();
    syncChartSlidersToLifeExpectancy();
    rebuildChartsAtCurrentAge();
});

// ══════════════════════════════════════════════════════════════════
//  RESULTS SCENARIO CACHE & TOGGLE
// ══════════════════════════════════════════════════════════════════

/** Cache of all 3 scenario results for the results cards */
let _resultsCache = null;
let _resultsSelectedScenario = 'average';

/** Whether results are currently shown in today's money (real) or future money (nominal) */
let _showRealTerms = true;

/**
 * Get the primary pot value to display based on current toggle state.
 */
function _getDisplayPot(r) {
    if (!r.includeInflation) return r.nominalPot;
    return _showRealTerms ? r.realPot : r.nominalPot;
}
function _getDisplayIncome(r) {
    if (!r.includeInflation) return r.nominalIncome;
    return _showRealTerms ? r.realIncome : r.nominalIncome;
}
function _getDisplayMonthly(r) {
    if (!r.includeInflation) return r.nominalMonthly;
    return _showRealTerms ? r.realMonthly : r.nominalMonthly;
}

/** Update the inflation toggle button label */
function _updateInflationToggleBtn() {
    const btn = document.getElementById('inflationToggleBtn');
    if (!btn) return;
    if (_showRealTerms) {
        btn.textContent = "\ud83d\udcb7 Showing: Today's Money";
    } else {
        btn.textContent = '\ud83d\udcb0 Showing: Future Money';
    }
}

/** Toggle between today's money and future money for all displayed values */
function toggleInflationView() {
    _showRealTerms = !_showRealTerms;
    _updateInflationToggleBtn();
    // Refresh the active scenario cards
    switchResultsScenario(_resultsSelectedScenario);
    // Refresh range strip pot values
    _updateRangeStripValues();
    // Refresh narrative cards
    if (typeof generateLifecycleNarrative === 'function') {
        generateLifecycleNarrative();
    }
}

/**
 * Switch the results cards to show a different scenario.
 * @param {string} key - 'weak' | 'average' | 'strong'
 */
function switchResultsScenario(key) {
    if (!_resultsCache || !_resultsCache[key]) return;
    _resultsSelectedScenario = key;
    const r = _resultsCache[key];

    setText('projectedPot', formatCurrency(_getDisplayPot(r)));
    setText('taxFreeLump', formatCurrency(r.taxFreeLump));
    setText('annualIncome', formatCurrency(_getDisplayIncome(r)));
    setText('monthlyIncome', formatCurrency(_getDisplayMonthly(r)));
    setText('growthAmount', formatCurrency(r.growthAmount));
    setText('growthPercentage', r.growthPct + '% of final pot');
    setText('projectedPotGrowthLabel', r.netLabel);

    if (r.includeInflation) {
        const altLabel = _showRealTerms ? 'Nominal' : "Today's";
        const altPot = _showRealTerms ? r.nominalPot : r.realPot;
        const altIncome = _showRealTerms ? r.nominalIncome : r.realIncome;
        toggleVisibility('projectedPotNominal', true);
        setText('projectedPotNominal', altLabel + ': ' + formatCurrency(altPot));
        toggleVisibility('incomeAlternative', true);
        setText('incomeAlternative', altLabel + ': ' + formatCurrency(altIncome));
    }

    // Update range strip active state
    document.querySelectorAll('.range-scenario').forEach(el => {
        el.classList.toggle('active', el.dataset.scenario === key);
    });

    // Update the result card highlight colour
    const potCard = document.querySelector('.results-grid .result-card.highlight');
    if (potCard) {
        potCard.classList.remove('scenario-weak', 'scenario-average', 'scenario-strong');
        potCard.classList.add('scenario-' + key);
    }

    setText('resultsInfo', r.rateDesc);
}

/** Update range strip pot values to match current inflation toggle */
function _updateRangeStripValues() {
    if (!_resultsCache) return;
    ['weak', 'average', 'strong'].forEach(key => {
        const r = _resultsCache[key];
        if (!r) return;
        const el = document.querySelector(`.range-scenario[data-scenario="${key}"] .range-value`);
        if (el) el.textContent = formatCurrency(_getDisplayPot(r));
    });
}

// Wire range-strip clicks
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.range-scenario').forEach(el => {
        el.addEventListener('click', () => {
            switchResultsScenario(el.dataset.scenario);
        });
    });

    // Wire inflation toggle button
    const inflToggle = document.getElementById('inflationToggleBtn');
    if (inflToggle) {
        inflToggle.addEventListener('click', toggleInflationView);
    }
});

// ══════════════════════════════════════════════════════════════════
//  MAIN CALCULATION FLOW
// ══════════════════════════════════════════════════════════════════

/**
 * Main entry point — runs projection, updates results, triggers charts.
 */
function calculateRetirement() {
    try {
        // Validate scenario rates first
        if (!validateScenarioRates()) {
            alert('Growth rates must be in order: Weak < Average < Strong.\nPlease fix your assumptions in Step 4.');
            getElement('scenarioWeakRate')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const birthDate = getElement('birthDate').value;
        const retirementDate = getElement('retirementDate').value;
        const currentPot = readCurrencyInput('currentPot');
        const monthlyContribution = readCurrencyInput('monthlyContribution');
        const investmentGrowth = selectedScenarioRate;
        const includeInflation = getElement('includeInflation').checked;
        const inflationRate = parseFloat(getElement('inflationRate').value) || APP_CONFIG.DEFAULT_INFLATION_RATE;

        const validation = validateInputs(birthDate, retirementDate, currentPot, monthlyContribution, investmentGrowth, inflationRate, includeInflation);
        if (!validation.isValid) {
            alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
            return;
        }

        const years = calculateYearsUntilRetirement(birthDate, retirementDate);
        const feeAmt = getTotalFeePercent();

        // ── Build all 3 scenario results and cache ─────────────
        const scenarioList = getActiveScenarioListNet();
        const projections = {};
        _resultsCache = {};

        scenarioList.forEach(s => {
            const key = s.id.toLowerCase();
            const proj = calculatePensionProjection(currentPot, monthlyContribution, years, s.rate);
            const inc = calculateIncomeProjection(proj.finalPot);
            projections[key] = proj;

            let dPot = proj.finalPot, dIncome = inc.annualIncome, dMonthly = inc.monthlyIncome;
            let nomPot = proj.finalPot, nomIncome = inc.annualIncome, nomMonthly = inc.monthlyIncome;
            let realPot = proj.finalPot, realIncome = inc.annualIncome, realMonthly = inc.monthlyIncome;

            if (includeInflation) {
                realPot = adjustForInflation(proj.finalPot, years, inflationRate / 100);
                const inflAdj = getInflationAdjustedIncome(inc.annualIncome, years, inflationRate / 100);
                realIncome = inflAdj.realAnnualIncome;
                realMonthly = inflAdj.realMonthlyIncome;
                nomIncome = inflAdj.nominalAnnualIncome;
                // Default display = real (today's money)
                dPot = realPot;
                dIncome = realIncome;
                dMonthly = realMonthly;
            }

            const grossRate = s.rate * 100 + feeAmt;  // reconstruct gross from net
            const rateDesc = feeAmt > 0
                ? grossRate.toFixed(1) + '% gross − ' + feeAmt.toFixed(2) + '% fees = ' + (s.rate * 100).toFixed(2) + '% net'
                : (s.rate * 100).toFixed(1) + '% annual growth';

            _resultsCache[key] = {
                displayPot: dPot,
                nominalPot: nomPot,
                realPot: realPot,
                taxFreeLump: inc.taxFreeLumpSum,
                displayIncome: dIncome,
                displayMonthly: dMonthly,
                nominalIncome: nomIncome,
                nominalMonthly: nomMonthly,
                realIncome: realIncome,
                realMonthly: realMonthly,
                growthAmount: proj.growthAmount,
                growthPct: proj.finalPot > 0 ? ((proj.growthAmount / proj.finalPot) * 100).toFixed(1) : '0',
                totalContributed: proj.totalContributed,
                netLabel: rateDesc,
                rateDesc: rateDesc,
                label: s.label,
                includeInflation: includeInflation
            };
        });

        // Inflation toggle — default to real terms
        _showRealTerms = true;
        if (includeInflation) {
            toggleVisibility('inflationBadge', true);
            _updateInflationToggleBtn();
        } else {
            toggleVisibility('inflationBadge', false);
            toggleVisibility('projectedPotReal', false);
            toggleVisibility('projectedPotNominal', false);
            toggleVisibility('incomeAlternative', false);
        }

        // Populate range strip
        ['weak', 'average', 'strong'].forEach(key => {
            const r = _resultsCache[key];
            if (!r) return;
            setText('range' + key.charAt(0).toUpperCase() + key.slice(1) + 'Pot', formatCurrency(_getDisplayPot(r)));
            const sc = scenarioList.find(s => s.id.toLowerCase() === key);
            setText('range' + key.charAt(0).toUpperCase() + key.slice(1) + 'Rate', sc ? (sc.rate * 100 + feeAmt).toFixed(0) + '%' : '');
        });

        // Common fields (don't change with scenario toggle)
        setText('totalContributions', formatCurrency(_resultsCache.average.totalContributed));
        setText('yearsToRetirement', years);

        // Show the average scenario by default
        _resultsSelectedScenario = 'average';
        switchResultsScenario('average');

        // Store year-by-year data for charts
        growthProjectionData.weak = projections.weak.yearByYear;
        growthProjectionData.average = projections.average.yearByYear;
        growthProjectionData.strong = projections.strong.yearByYear;
        growthProjectionData.birthDate = birthDate;
        growthProjectionData.retirementDate = retirementDate;
        growthProjectionData.retirementAge = calculateRetirementAge(birthDate, retirementDate);

        // Show results sections, hide the form
        _isEditingFromResults = false;
        toggleVisibility('calculator-form', false);
        toggleVisibility('results', true);
        toggleVisibility('spendingToggle', true);

        // Pre-populate spending suggestion (4% SWR of average pot)
        const avgFinalPot = projections.average.finalPot;
        const suggested = Math.round(avgFinalPot * APP_CONFIG.SAFE_WITHDRAWAL_RATE);
        const otherIncome = getTotalOtherIncome();
        const spendingInput = getElement('retirementAnnualSpending');
        if (spendingInput && !spendingInput.value) {
            spendingInput.value = suggested;
        }

        let suggestionText = 'Suggested: £' + suggested.toLocaleString(APP_CONFIG.LOCALE) + '/year (4% safe withdrawal rate)';
        if (otherIncome > 0) {
            suggestionText += ' · Other income covers £' + Math.round(otherIncome).toLocaleString(APP_CONFIG.LOCALE) + '/yr';
        }
        setText('spendingSuggestion', suggestionText);

        // Show/hide other income badge in results
        const otherIncomeBadge = getElement('otherIncomeBadge');
        if (otherIncomeBadge) {
            if (otherIncome > 0) {
                otherIncomeBadge.style.display = 'block';
                const retAge = calculateRetirementAge(birthDate, retirementDate);
                const incomeAtRetirement = getOtherIncomeAtAge(retAge);
                const incomeAtFull = otherIncome; // max income (all sources active)
                const fmtNum = n => '£' + Math.round(n).toLocaleString(APP_CONFIG.LOCALE);

                if (incomeAtRetirement < incomeAtFull) {
                    // Phased: some income starts later
                    otherIncomeBadge.innerHTML = '💰 Other income: ' + fmtNum(incomeAtRetirement) +
                        '/yr from age ' + retAge + ', rising to ' + fmtNum(incomeAtFull) +
                        '/yr when all sources kick in — pot withdrawal adjusts automatically per year';
                } else {
                    otherIncomeBadge.textContent = '💰 Other income: ' + fmtNum(otherIncome) +
                        '/yr — only ' + fmtNum(Math.max(0, suggested - otherIncome)) +
                        '/yr needs to come from your pot';
                }
            } else {
                otherIncomeBadge.style.display = 'none';
            }
        }

        // Auto-generate charts
        const currentSpending = parseCurrencyInput(spendingInput.value) || suggested;
        toggleVisibility('chartViewHeader', true);
        toggleVisibility('lifecycleChartContainer', true);
        toggleVisibility('cashFlowChartContainer', false);
        const initialLongevityData = buildLongevityData(currentSpending);
        createCombinedLifecycleChart(initialLongevityData);
        createCashFlowChart(currentSpending);
        syncChartSlidersToLifeExpectancy();

        // Wire chart view selector
        const chartViewSelect = getElement('chartViewSelect');
        if (chartViewSelect) {
            chartViewSelect.value = 'lifecycle';
            chartViewSelect.onchange = function () {
                const isLifecycle = chartViewSelect.value === 'lifecycle';
                toggleVisibility('lifecycleChartContainer', isLifecycle);
                toggleVisibility('cashFlowChartContainer', !isLifecycle);
            };
        }

        // Format the spending input with commas
        if (spendingInput.value) {
            const numVal = parseCurrencyInput(spendingInput.value);
            if (!isNaN(numVal) && numVal >= 0) {
                spendingInput.value = formatNumberWithCommas(Math.round(numVal));
            }
        }

        getElement('results')?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error('Calculation error:', err);
        alert('An error occurred during calculation. Please check your inputs and try again.');
    }
}

// ══════════════════════════════════════════════════════════════════
//  SPENDING ANALYSIS
// ══════════════════════════════════════════════════════════════════

function analyzeRetirementSpending() {
    try {
        const inputs = readFormInputs();
        const investmentGrowth = applyFeeToRate(selectedScenarioRate / 100);
        const lifeExpectancy = parseFloat(getElement('lifeExpectancy')?.value) || APP_CONFIG.TARGET_AGE;
        const spendingMode = document.querySelector('input[name="spendingMode"]:checked').value;
        const annualSpending = spendingMode === 'mode-a' ? readCurrencyInput('annualSpending') : 0;

        const yearsUntilRetirement = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
        const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
        const projection = calculatePensionProjection(inputs.currentPot, inputs.monthlyContribution, yearsUntilRetirement, investmentGrowth);
        const startingPot = projection.finalPot;

        // Build age-aware other-income callback for spending plan
        const otherIncomeCb = (typeof getOtherIncomeAtAge === 'function') ? getOtherIncomeAtAge : undefined;

        let result;
        const inflRate = inputs.includeInflation ? inputs.inflationRate / 100 : 0;
        if (spendingMode === 'mode-a') {
            result = calculateSpendingPlan(startingPot, annualSpending, retirementAge, lifeExpectancy, investmentGrowth, inflRate, otherIncomeCb);
        } else {
            const maxResult = calculateMaximumSustainableSpend(startingPot, retirementAge, lifeExpectancy, investmentGrowth, inflRate, otherIncomeCb);
            result = { mode: 'maximum-spend', maxAnnualSpend: maxResult.maxAnnualSpend, maxMonthlySpend: maxResult.maxMonthlySpend, ...maxResult.projection };
        }

        displaySpendingResults(result, startingPot, yearsUntilRetirement, lifeExpectancy, annualSpending, spendingMode);

    } catch (err) {
        console.error('Spending analysis error:', err);
        alert('An error occurred during spending analysis. Please check your inputs.');
    }
}

function displaySpendingResults(result, pot, yearsUntilRetirement, lifeExpectancy, annualSpending, mode) {
    const inputs = readFormInputs();
    const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
    const statusCard = getElement('spendingStatus');

    if (result.moneyLasts) {
        statusCard.className = 'spending-status-card success';
        statusCard.innerHTML = '✅ Success! Your money will last';
        if (result.finalBalance > 0) {
            statusCard.innerHTML += ` with a final balance of ${formatCurrency(result.finalBalance)}`;
        }
            if (spendingMode === 'mode-a' && annualSpending > 0) {
        statusCard.className = 'spending-status-card warning';
        statusCard.innerHTML = `⚠️ Warning: Your money will run out at age ${result.ageWhenRunsOut}`;
    }

    setText('summaryStartingPot', formatCurrency(pot));
    setText('summaryAnnualSpending', formatCurrency(mode === 'mode-a' ? annualSpending : (result.maxAnnualSpend || 0)));
    setText('summaryRetirementYears', result.yearByYear.length + ' years');
    setText('summaryTotalSpent', formatCurrency(result.totalSpent));
    setText('summaryFinalBalance', formatCurrency(result.finalBalance));

    const runOutContainer = getElement('summaryMoneyRunsOutContainer');
    if (!result.moneyLasts && result.ageWhenRunsOut) {
        runOutContainer.style.display = 'block';
        setText('summaryMoneyRunsOut', `Age ${result.ageWhenRunsOut} (${result.ageWhenRunsOut - retirementAge} years into retirement)`);
    } else {
        runOutContainer.style.display = 'none';
    }

    toggleVisibility('spendingResults', true);
    if (result.yearByYear?.length > 0) createSpendingChart(result.yearByYear);
}

// ══════════════════════════════════════════════════════════════════
//  LONGEVITY PLANNING
// ══════════════════════════════════════════════════════════════════

/**
 * Build longevity drawdown data for the lifecycle chart.
 * @param {number} annualSpending
 * @returns {Array}
 */
function buildLongevityData(annualSpending) {
    const inputs = readFormInputs();
    const investmentGrowth = applyFeeToRate(selectedScenarioRate / 100);
    const targetAge = currentLifeExpectancy;

    if (!inputs.retirementDate || !inputs.birthDate) return [];

    const years = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
    const projection = calculatePensionProjection(inputs.currentPot, inputs.monthlyContribution, years, investmentGrowth);
    const startingPot = projection.finalPot;

    const retObj = new Date(inputs.retirementDate);
    const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
    const yearsInRetirement = targetAge - retirementAge;

    const data = [];
    let balance = startingPot;

    for (let year = 0; year <= yearsInRetirement; year++) {
        const age = retirementAge + year;
        const yearDate = new Date(retObj.getFullYear() + year, retObj.getMonth(), retObj.getDate());
        const netSpending = getNetAnnualWithdrawal(annualSpending, age);
        const growth = balance > 0 ? balance * investmentGrowth : 0;
        const newBalance = balance + growth - netSpending;

        data.push({ year, age, date: yearDate, balance: Math.max(0, newBalance), spending: netSpending, growth });
        balance = Math.max(0, newBalance);
        if (balance <= 0) break;
    }
    return data;
}

function calculateLongevityPlan() {
    try {
        const inputs = readFormInputs();
        const annualSpending = readCurrencyInput('retirementAnnualSpending');
        const investmentGrowth = applyFeeToRate(selectedScenarioRate / 100);
        const targetAge = currentLifeExpectancy;

        if (!inputs.retirementDate) { alert('Please calculate your retirement date first'); return; }
        if (annualSpending <= 0) { alert('Please enter an annual spending amount'); return; }

        const years = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
        const projection = calculatePensionProjection(inputs.currentPot, inputs.monthlyContribution, years, investmentGrowth);
        const startingPot = projection.finalPot;

        const retObj = new Date(inputs.retirementDate);
        const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
        const yearsInRetirement = targetAge - retirementAge;

        const longevityData = [];
        let balance = startingPot;
        for (let year = 0; year <= yearsInRetirement; year++) {
            const age = retirementAge + year;
            const yearDate = new Date(retObj.getFullYear() + year, retObj.getMonth(), retObj.getDate());
            const netSpending = getNetAnnualWithdrawal(annualSpending, age);
            const growth = balance > 0 ? balance * investmentGrowth : 0;
            const newBalance = balance + growth - netSpending;

            longevityData.push({ year, age, date: yearDate, balance: Math.max(0, newBalance), spending: netSpending, growth });
            balance = Math.max(0, newBalance);
            if (balance <= 0) break;
        }

        displayLongevityResults(longevityData, startingPot, annualSpending, retirementAge, targetAge, retObj);
        createCombinedLifecycleChart(longevityData);
        createCashFlowChart(annualSpending);
        syncChartSlidersToLifeExpectancy();
        getElement('growthChart')?.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error('Longevity planning error:', err);
        alert('An error occurred during longevity planning. Please check your inputs.');
    }
}

function displayLongevityResults(longevityData, startingPot, annualSpending, retirementAge, targetAge, retirementDate) {
    setText('longevityStartPot', formatCurrency(startingPot));
    setText('longevityAnnualSpending', formatCurrency(annualSpending));
    setText('longevityYears', (targetAge - retirementAge) + ' years');

    const finalBalance = longevityData[longevityData.length - 1]?.balance || 0;
    setText('longevityFinalBalance', formatCurrency(finalBalance));

    const statusEl = getElement('longevityStatus');
    if (statusEl) {
        statusEl.textContent = finalBalance > 0 ? 'Money Lasts ✅' : 'Money Depleted ⚠️';
        statusEl.parentElement.className = finalBalance > 0
            ? 'summary-item-longevity status-success'
            : 'summary-item-longevity status-danger';
    }

    const milestoneAge = getElement('milestoneRetirementAge');
    if (milestoneAge) milestoneAge.textContent = 'Age ' + retirementAge;

    const milestoneDetail = document.querySelector('.milestone-start .milestone-detail');
    if (milestoneDetail) milestoneDetail.textContent = retirementDate.toLocaleDateString(APP_CONFIG.LOCALE);

    const age100Date = new Date(retirementDate.getFullYear() + (targetAge - retirementAge), retirementDate.getMonth(), retirementDate.getDate());
    const age100Detail = document.querySelector('.milestone-end .milestone-detail');
    if (age100Detail) age100Detail.textContent = age100Date.toLocaleDateString(APP_CONFIG.LOCALE);

    toggleVisibility('milestoneTimeline', true);
    toggleVisibility('longevitySummary', true);
}

// ══════════════════════════════════════════════════════════════════
//  NARRATIVE BUILDER
// ══════════════════════════════════════════════════════════════════

/** Cache for re-generating narrative with inflation toggle */
let _narrativeArgs = null;

function generateLifecycleNarrative(retirementAge, annualSpending, potWeak, potAvg, potStrong, fullWeak, fullAvg, fullStrong, retIdx) {
    // If called with no args, re-use cached args
    if (arguments.length === 0 && _narrativeArgs) {
        retirementAge = _narrativeArgs.retirementAge;
        annualSpending = _narrativeArgs.annualSpending;
        potWeak = _narrativeArgs.potWeak;
        potAvg = _narrativeArgs.potAvg;
        potStrong = _narrativeArgs.potStrong;
        fullWeak = _narrativeArgs.fullWeak;
        fullAvg = _narrativeArgs.fullAvg;
        fullStrong = _narrativeArgs.fullStrong;
        retIdx = _narrativeArgs.retIdx;
    } else if (arguments.length > 0) {
        _narrativeArgs = { retirementAge, annualSpending, potWeak, potAvg, potStrong, fullWeak, fullAvg, fullStrong, retIdx };
    }

    const el = getElement('lifecycleNarrative');
    if (!el) return;

    // Inflation-aware formatting: deflate nominal values when showing today's money
    const includeInflation = _resultsCache?.average?.includeInflation || false;
    const inflationRate = includeInflation ? (parseFloat(getElement('inflationRate')?.value) || 2.5) / 100 : 0;
    const inputs = readFormInputs();
    const yearsToRetirement = inputs.retirementDate ? calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate) : 0;

    function deflate(nominalVal, extraYears) {
        if (!includeInflation || !_showRealTerms || nominalVal <= 0) return nominalVal;
        const totalYears = yearsToRetirement + (extraYears || 0);
        return adjustForInflation(nominalVal, totalYears, inflationRate);
    }

    function depletionAge(data) {
        for (let i = retIdx + 1; i < data.length; i++) {
            if (data[i] !== null && data[i] <= 0) return retirementAge + (i - retIdx);
        }
        return null;
    }

    const fmt = v => '£' + Math.round(v).toLocaleString(APP_CONFIG.LOCALE);
    const weakDep  = depletionAge(fullWeak);
    const avgDep   = depletionAge(fullAvg);
    const strongDep = depletionAge(fullStrong);

    function remainingAtTargetAge(data) {
        const lastVal = data[data.length - 1];
        return (lastVal !== null && lastVal > 0) ? lastVal : 0;
    }

    // Use actual override rates for labels
    const rates = (typeof getScenarioRates === 'function') ? getScenarioRates() : { weak: 2, average: 5, strong: 8 };

    const scenarioCard = (icon, color, label, pot, dep, fullData) => {
        const rawRemaining = remainingAtTargetAge(fullData);
        const yearsInRetirement = currentLifeExpectancy - retirementAge;
        const dPot = deflate(pot, 0);
        const dRemaining = deflate(rawRemaining, yearsInRetirement);
        let html = `<div class="narrative-card narrative-${label.toLowerCase().split(' ')[0]}">`;
        html += `<div class="narrative-icon">${icon}</div><h4>${label}</h4>`;
        html += `<p>Pot at retirement: <strong>${fmt(dPot)}</strong></p>`;
        if (dep) {
            const targetAge = currentLifeExpectancy;
            html += `<p class="narrative-warning">⚠️ Money runs out at <strong>age ${dep}</strong> — ${targetAge - dep} years short of age ${targetAge}</p>`;
            html += `<p class="narrative-remaining">💰 End pot at age ${currentLifeExpectancy}: <strong>${fmt(0)}</strong></p>`;
        } else {
            html += `<p class="narrative-ok">✅ Money lasts to age ${currentLifeExpectancy} with ${fmt(annualSpending)}/year spending</p>`;
            html += `<p class="narrative-remaining">💰 End pot at age ${currentLifeExpectancy}: <strong>${fmt(dRemaining)}</strong></p>`;
        }
        return html + '</div>';
    };

    let html = '<div class="narrative-explanation">';
    html += '<p>The chart above shows three possible outcomes for your pension pot based on different investment growth rates. ';
    html += 'The <strong style="color:#dc3545">red</strong> band represents a cautious, low-growth market; ';
    html += 'the <strong style="color:#667eea">blue</strong> band represents a typical, average-growth scenario; ';
    html += 'and the <strong style="color:#28a745">green</strong> band represents a strong, high-growth market. ';
    html += 'The taller the combined bar, the more your pot could be worth at that age.</p></div>';
    html += '<div class="narrative-grid">';
    html += scenarioCard('🔴', '#dc3545', `Weak Growth (${rates.weak}%)`,    potWeak,   weakDep,   fullWeak);
    html += scenarioCard('🔵', '#667eea', `Average Growth (${rates.average}%)`, potAvg,    avgDep,    fullAvg);
    html += scenarioCard('🟢', '#28a745', `Strong Growth (${rates.strong}%)`,  potStrong, strongDep, fullStrong);
    html += '</div>';

    el.innerHTML = html;
    el.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════════
//  WIZARD – Step-by-step navigation
// ══════════════════════════════════════════════════════════════════

const WIZARD_TOTAL_STEPS = 5;
let _wizardCurrentStep = 1;
let _isEditingFromResults = false;

/**
 * Optional per-step validation before allowing Next.
 * Return an error message string, or null if OK.
 */
function _wizardValidateStep(step) {
    if (step === 1) {
        if (!getElement('birthDate')?.value) return 'Please enter your date of birth.';
        if (!getElement('genderSelect')?.value) return 'Please select your gender.';
        if (!getElement('retirementAgeSelect')?.value) return 'Please select a target retirement age.';
    }
    if (step === 2) {
        const pot = parseCurrencyInput(getElement('currentPot')?.value);
        if (pot === 0 && !getElement('currentPot')?.value) return 'Please enter your current pension pot.';
        const contrib = parseCurrencyInput(getElement('monthlyContribution')?.value);
        if (contrib === 0 && !getElement('monthlyContribution')?.value) return 'Please enter your monthly contribution (enter 0 if none).';
    }
    return null;
}

function wizardGoToStep(step) {
    if (step < 1 || step > WIZARD_TOTAL_STEPS) return;
    _wizardCurrentStep = step;

    // Show/hide step panels
    document.querySelectorAll('.wizard-step').forEach(el => {
        el.style.display = (parseInt(el.dataset.step) === step) ? '' : 'none';
    });

    // Update progress indicators
    document.querySelectorAll('.wizard-step-indicator').forEach(ind => {
        const s = parseInt(ind.dataset.step);
        ind.classList.toggle('active', s === step);
        ind.classList.toggle('completed', _isEditingFromResults ? s !== step : s < step);
    });

    // Update connectors
    const connectors = document.querySelectorAll('.wizard-step-connector');
    connectors.forEach((conn, i) => {
        conn.classList.toggle('completed', _isEditingFromResults ? true : (i + 1) < step);
    });

    // Update counter text
    const counter = getElement('wizardStepCounter');
    if (counter) counter.textContent = 'Step ' + step + ' of ' + WIZARD_TOTAL_STEPS;

    // Navigation button visibility
    const prevBtn = getElement('wizardPrevBtn');
    const nextBtn = getElement('wizardNextBtn');
    const calcBtn = getElement('calculateBtn');
    const updateBtn = getElement('updateResultsBtn');

    if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = step < WIZARD_TOTAL_STEPS ? '' : 'none';

    // Show "Update Results" when editing from results (always visible), otherwise "Calculate" on last step
    if (_isEditingFromResults) {
        if (calcBtn) calcBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = '';
    } else {
        if (calcBtn) calcBtn.style.display = step === WIZARD_TOTAL_STEPS ? '' : 'none';
        if (updateBtn) updateBtn.style.display = 'none';
    }

    // Scroll form into view
    getElement('wizardProgress')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Wire up navigation buttons
getElement('wizardNextBtn')?.addEventListener('click', () => {
    const err = _wizardValidateStep(_wizardCurrentStep);
    if (err) {
        alert(err);
        return;
    }
    wizardGoToStep(_wizardCurrentStep + 1);
});

getElement('wizardPrevBtn')?.addEventListener('click', () => {
    wizardGoToStep(_wizardCurrentStep - 1);
});

// Allow clicking on progress indicators to jump (any step when editing, completed/current otherwise)
document.querySelectorAll('.wizard-step-indicator').forEach(ind => {
    ind.addEventListener('click', () => {
        const target = parseInt(ind.dataset.step);
        if (_isEditingFromResults || target <= _wizardCurrentStep) {
            wizardGoToStep(target);
        }
    });
});

// ══════════════════════════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════════════════════════

function resetToForm() {
    _isEditingFromResults = false;
    ['results', 'retirementSpending', 'spendingToggle', 'chartViewHeader', 'lifecycleChartContainer', 'cashFlowChartContainer']
        .forEach(id => toggleVisibility(id, false));
    toggleVisibility('calculator-form', true);
    wizardGoToStep(1);
    getElement('calculator-form')?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Open the form at a specific step for editing, keeping results visible below.
 */
function editFromResults(step) {
    _isEditingFromResults = true;
    toggleVisibility('calculator-form', true);
    // Mark all steps as accessible in edit mode
    _wizardCurrentStep = WIZARD_TOTAL_STEPS;
    wizardGoToStep(step || 1);
    getElement('wizardProgress')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
