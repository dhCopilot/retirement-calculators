/**
 * NestMapOS — Main Application Orchestrator
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

// Initialise life expectancy display on load
updateLifeExpectancy();

// Scenario buttons
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedScenarioRate = parseFloat(this.dataset.rate);
    });
});

// Inflation toggle
getElement('includeInflation')?.addEventListener('change', e => {
    toggleVisibility('inflationRateGroup', e.target.checked);
});

// Primary action buttons
getElement('calculateBtn')?.addEventListener('click', calculateRetirement);
getElement('recalculateBtn')?.addEventListener('click', resetToForm);
getElement('toggleSpendingAnalysisBtn')?.addEventListener('click', () => {
    toggleVisibility('retirementSpending', true);
    getElement('retirementSpending')?.scrollIntoView({ behavior: 'smooth' });
});
getElement('analyzeSpendingBtn')?.addEventListener('click', analyzeRetirementSpending);
getElement('calculateLongevityBtn')?.addEventListener('click', calculateLongevityPlan);

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

    // Sync both sliders + outputs
    const lcSlider = getElement('lifecycleAgeSlider');
    const cfSlider = getElement('cashFlowAgeSlider');
    const lcOutput = getElement('lifecycleAgeValue');
    const cfOutput = getElement('cashFlowAgeValue');
    if (lcSlider) lcSlider.value = age;
    if (cfSlider) cfSlider.value = age;
    if (lcOutput) lcOutput.textContent = age;
    if (cfOutput) cfOutput.textContent = age;

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
    const lcSlider = getElement('lifecycleAgeSlider');
    const cfSlider = getElement('cashFlowAgeSlider');
    const lcOutput = getElement('lifecycleAgeValue');
    const cfOutput = getElement('cashFlowAgeValue');
    if (lcSlider) lcSlider.value = age;
    if (cfSlider) cfSlider.value = age;
    if (lcOutput) lcOutput.textContent = age;
    if (cfOutput) cfOutput.textContent = age;
}

// Lifecycle chart slider
getElement('lifecycleAgeSlider')?.addEventListener('input', function () {
    getElement('lifecycleAgeValue').textContent = this.value;
    getElement('cashFlowAgeSlider').value = this.value;
    getElement('cashFlowAgeValue').textContent = this.value;
});
getElement('lifecycleAgeSlider')?.addEventListener('change', function () {
    onChartAgeSliderChange(this.value, 'lifecycle');
});

// Cash flow chart slider
getElement('cashFlowAgeSlider')?.addEventListener('input', function () {
    getElement('cashFlowAgeValue').textContent = this.value;
    getElement('lifecycleAgeSlider').value = this.value;
    getElement('lifecycleAgeValue').textContent = this.value;
});
getElement('cashFlowAgeSlider')?.addEventListener('change', function () {
    onChartAgeSliderChange(this.value, 'cashFlow');
});

// Reset buttons — snap back to life expectancy value
getElement('lifecycleAgeReset')?.addEventListener('click', function () {
    updateLifeExpectancy();
    syncChartSlidersToLifeExpectancy();
    rebuildChartsAtCurrentAge();
});
getElement('cashFlowAgeReset')?.addEventListener('click', function () {
    updateLifeExpectancy();
    syncChartSlidersToLifeExpectancy();
    rebuildChartsAtCurrentAge();
});

// ══════════════════════════════════════════════════════════════════
//  MAIN CALCULATION FLOW
// ══════════════════════════════════════════════════════════════════

/**
 * Main entry point — runs projection, updates results, triggers charts.
 */
function calculateRetirement() {
    try {
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
        const projection = calculatePensionProjection(currentPot, monthlyContribution, years, investmentGrowth / 100);
        const income = calculateIncomeProjection(projection.finalPot);

        // Inflation-adjusted display
        let displayPot = projection.finalPot;
        let displayIncome = income.annualIncome;
        let displayMonthly = income.monthlyIncome;

        if (includeInflation) {
            const realPot = adjustForInflation(projection.finalPot, years, inflationRate / 100);
            const inflAdj = getInflationAdjustedIncome(income.annualIncome, years, inflationRate / 100);
            displayPot = realPot;
            displayIncome = inflAdj.realAnnualIncome;
            displayMonthly = inflAdj.realMonthlyIncome;

            toggleVisibility('inflationBadge', true);
            toggleVisibility('projectedPotReal', true);
            toggleVisibility('projectedPotNominal', true);
            setText('projectedPotNominal', 'Nominal: ' + formatCurrency(projection.finalPot));
            toggleVisibility('incomeAlternative', true);
            setText('incomeAlternative', 'Nominal: £' + Math.round(inflAdj.nominalAnnualIncome).toLocaleString(APP_CONFIG.LOCALE));
        } else {
            toggleVisibility('inflationBadge', false);
            toggleVisibility('projectedPotReal', false);
            toggleVisibility('projectedPotNominal', false);
            toggleVisibility('incomeAlternative', false);
        }

        // Update result cards
        setText('projectedPot', formatCurrency(displayPot));
        setText('taxFreeLump', formatCurrency(income.taxFreeLumpSum));
        setText('annualIncome', formatCurrency(displayIncome));
        setText('monthlyIncome', formatCurrency(displayMonthly));
        setText('resultsGrowthRate', investmentGrowth.toFixed(1) + '%');
        setText('cardGrowthRate', investmentGrowth.toFixed(1) + '%');
        setText('totalContributions', formatCurrency(projection.totalContributed));
        setText('growthAmount', formatCurrency(projection.growthAmount));
        const growthPct = ((projection.growthAmount / projection.finalPot) * 100).toFixed(1);
        setText('growthPercentage', growthPct + '% of final pot');
        setText('yearsToRetirement', years);

        // 3-scenario comparison cards
        calculateScenarioComparison(currentPot, monthlyContribution, years, inflationRate / 100, includeInflation);

        // Store year-by-year data for all 3 scenarios (used by chart builders)
        const scenarios = APP_CONFIG.SCENARIO_LIST;
        const projections = {};
        scenarios.forEach(s => {
            projections[s.id.toLowerCase()] = calculatePensionProjection(currentPot, monthlyContribution, years, s.rate);
        });
        growthProjectionData.weak = projections.weak.yearByYear;
        growthProjectionData.average = projections.average.yearByYear;
        growthProjectionData.strong = projections.strong.yearByYear;
        growthProjectionData.birthDate = birthDate;
        growthProjectionData.retirementDate = retirementDate;
        growthProjectionData.retirementAge = calculateRetirementAge(birthDate, retirementDate);

        // Show results sections
        toggleVisibility('results', true);
        toggleVisibility('spendingToggle', true);
        toggleVisibility('longevityPlanning', true);

        // Pre-populate spending suggestion (4% SWR of average pot)
        const avgFinalPot = projections.average.finalPot;
        const suggested = Math.round(avgFinalPot * APP_CONFIG.SAFE_WITHDRAWAL_RATE);
        const spendingInput = getElement('retirementAnnualSpending');
        if (spendingInput && !spendingInput.value) {
            spendingInput.value = suggested;
        }
        setText('spendingSuggestion',
            'Suggested: £' + suggested.toLocaleString(APP_CONFIG.LOCALE) + '/year (4% safe withdrawal rate)');

        // Auto-generate charts
        const currentSpending = parseCurrencyInput(spendingInput.value) || suggested;
        toggleVisibility('lifecycleChartContainer', true);
        const initialLongevityData = buildLongevityData(currentSpending);
        createCombinedLifecycleChart(initialLongevityData);
        createCashFlowChart(currentSpending);
        syncChartSlidersToLifeExpectancy();

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
//  SCENARIO COMPARISON
// ══════════════════════════════════════════════════════════════════

function calculateScenarioComparison(pot, monthly, years, inflationRate, includeInflation) {
    const scenarios = [
        { id: 'Weak',    rate: 0.02, elemPot: 'scenarioWeakPot',    elemIncome: 'scenarioWeakIncome',    elemDiff: 'scenarioWeakDiff' },
        { id: 'Average', rate: 0.05, elemPot: 'scenarioAveragePot', elemIncome: 'scenarioAverageIncome', elemDiff: 'scenarioAverageDiff' },
        { id: 'Strong',  rate: 0.08, elemPot: 'scenarioStrongPot',  elemIncome: 'scenarioStrongIncome',  elemDiff: 'scenarioStrongDiff' }
    ];

    // Pre-calculate all so comparisons work regardless of order
    const results = {};
    scenarios.forEach(s => {
        const proj = calculatePensionProjection(pot, monthly, years, s.rate);
        const inc  = calculateIncomeProjection(proj.finalPot);
        let dPot = proj.finalPot, dIncome = inc.annualIncome;
        if (includeInflation) {
            dPot = adjustForInflation(proj.finalPot, years, inflationRate);
            dIncome = getInflationAdjustedIncome(inc.annualIncome, years, inflationRate).realAnnualIncome;
        }
        results[s.id] = { pot: dPot, income: dIncome };
    });

    scenarios.forEach(s => {
        setText(s.elemPot, formatCurrency(results[s.id].pot));
        setText(s.elemIncome, formatCurrency(results[s.id].income));
        if (s.id !== 'Average') {
            const avg = results['Average'];
            const diff = results[s.id].pot - avg.pot;
            const pct = ((diff / avg.pot) * 100).toFixed(1);
            const txt = diff >= 0
                ? `+${formatCurrency(diff)} (+${pct}%)`
                : `${formatCurrency(diff)} (${pct}%)`;
            setText(s.elemDiff, `vs Average: ${txt}`);
        }
    });
    toggleVisibility('scenarioComparison', true);
}

// ══════════════════════════════════════════════════════════════════
//  SPENDING ANALYSIS
// ══════════════════════════════════════════════════════════════════

function analyzeRetirementSpending() {
    try {
        const inputs = readFormInputs();
        const investmentGrowth = selectedScenarioRate / 100;
        const lifeExpectancy = parseFloat(getElement('lifeExpectancy')?.value) || APP_CONFIG.TARGET_AGE;
        const spendingMode = document.querySelector('input[name="spendingMode"]:checked').value;
        const annualSpending = spendingMode === 'mode-a' ? readCurrencyInput('annualSpending') : 0;

        const yearsUntilRetirement = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
        const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
        const projection = calculatePensionProjection(inputs.currentPot, inputs.monthlyContribution, yearsUntilRetirement, investmentGrowth);
        const startingPot = projection.finalPot;

        // Note: spending analysis works in nominal (future) pounds;
        // inflation adjustment is handled within the spending plan calculation.

        let result;
        const inflRate = inputs.includeInflation ? inputs.inflationRate / 100 : 0;
        if (spendingMode === 'mode-a') {
            result = calculateSpendingPlan(startingPot, annualSpending, retirementAge, lifeExpectancy, investmentGrowth, inflRate);
        } else {
            const maxResult = calculateMaximumSustainableSpend(startingPot, retirementAge, lifeExpectancy, investmentGrowth, inflRate);
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
    } else {
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
    const investmentGrowth = selectedScenarioRate / 100;
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
        const growth = balance > 0 ? balance * investmentGrowth : 0;
        const newBalance = balance + growth - annualSpending;

        data.push({ year, age, date: yearDate, balance: Math.max(0, newBalance), spending: annualSpending, growth });
        balance = Math.max(0, newBalance);
        if (balance <= 0) break;
    }
    return data;
}

function calculateLongevityPlan() {
    try {
        const inputs = readFormInputs();
        const annualSpending = readCurrencyInput('retirementAnnualSpending');
        const investmentGrowth = selectedScenarioRate / 100;
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
            const growth = balance > 0 ? balance * investmentGrowth : 0;
            const newBalance = balance + growth - annualSpending;

            longevityData.push({ year, age, date: yearDate, balance: Math.max(0, newBalance), spending: annualSpending, growth });
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
    getElement('longevityPlanning')?.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════════════════
//  NARRATIVE BUILDER
// ══════════════════════════════════════════════════════════════════

function generateLifecycleNarrative(retirementAge, annualSpending, potWeak, potAvg, potStrong, fullWeak, fullAvg, fullStrong, retIdx) {
    const el = getElement('lifecycleNarrative');
    if (!el) return;

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

    const scenarioCard = (icon, color, label, pot, dep, fullData) => {
        let html = `<div class="narrative-card narrative-${label.toLowerCase().split(' ')[0]}">`;
        html += `<div class="narrative-icon">${icon}</div><h4>${label}</h4>`;
        html += `<p>Pot at retirement: <strong>${fmt(pot)}</strong></p>`;
        if (dep) {
            const targetAge = currentLifeExpectancy;
            html += `<p class="narrative-warning">⚠️ Money runs out at <strong>age ${dep}</strong> — ${targetAge - dep} years short of age ${targetAge}</p>`;
        } else {
            const remaining = remainingAtTargetAge(fullData);
            html += `<p class="narrative-ok">✅ Money lasts to age ${currentLifeExpectancy} with ${fmt(annualSpending)}/year spending</p>`;
            html += `<p class="narrative-remaining">💰 Estimated pot remaining at age ${currentLifeExpectancy}: <strong>${fmt(remaining)}</strong></p>`;
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
    html += scenarioCard('🔴', '#dc3545', 'Weak Growth (2%)',    potWeak,   weakDep,   fullWeak);
    html += scenarioCard('🔵', '#667eea', 'Average Growth (5%)', potAvg,    avgDep,    fullAvg);
    html += scenarioCard('🟢', '#28a745', 'Strong Growth (8%)',  potStrong, strongDep, fullStrong);
    html += '</div>';

    el.innerHTML = html;
    el.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════════════════════════

function resetToForm() {
    ['results', 'retirementSpending', 'spendingToggle', 'lifecycleChartContainer', 'cashFlowChartContainer', 'longevityPlanning']
        .forEach(id => toggleVisibility(id, false));
    getElement('calculator-form')?.scrollIntoView({ behavior: 'smooth' });
}
