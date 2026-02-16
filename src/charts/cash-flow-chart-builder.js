/**
 * Cash Flow Chart Builder
 * Renders a single-scenario retirement cash-flow chart with stacked bars
 * showing Other Income + Pot Withdrawal + Shortfall, with a spending target line.
 *
 * Toggle between Weak / Average / Strong via selector buttons.
 *
 * Depends on: config.js, utils/formatting.js, utils/date-utils.js, utils/drawdown.js
 * @module charts/cash-flow-chart-builder
 * @version 0.5.0
 */

/** @type {Chart|null} */
let cashFlowChartInstance = null;

/** Cached data from the last call to createCashFlowChart, used on scenario toggle */
let _cfChartCache = null;

/** Currently selected scenario key: 'weak' | 'average' | 'strong' */
let _cfSelectedScenario = 'average';

/**
 * Return a per-source breakdown of other income at a given age.
 * Used by tooltips to show where the income comes from.
 * @param {number} age
 * @returns {{ statePension:number, dbPension:number, annuity:number, rental:number, other:number, total:number }}
 */
function _getOtherIncomeBreakdown(age) {
    const out = { statePension: 0, dbPension: 0, annuity: 0, rental: 0, other: 0, total: 0 };
    if (typeof getElement !== 'function') return out;

    // State Pension — always counted (field always visible, not behind toggle)
    const spAmt = parseCurrencyInput(getElement('statePension')?.value) || 0;
    const spAge = parseInt(getElement('statePensionAge')?.value) || 67;
    if (spAmt > 0 && age >= spAge) out.statePension = spAmt;

    // Remaining sources only if "additional income" checkbox is ticked
    if (getElement('includeOtherIncome')?.checked) {
        const dbAmt = parseCurrencyInput(getElement('dbPension')?.value) || 0;
        const dbAge = parseInt(getElement('dbPensionAge')?.value) || 65;
        if (dbAmt > 0 && age >= dbAge) out.dbPension = dbAmt;

        out.annuity = parseCurrencyInput(getElement('annuityIncome')?.value) || 0;
        out.rental  = parseCurrencyInput(getElement('rentalIncome')?.value) || 0;
        out.other   = parseCurrencyInput(getElement('otherIncomeGeneral')?.value) || 0;
    }

    out.total = out.statePension + out.dbPension + out.annuity + out.rental + out.other;
    return out;
}

/**
 * Build and render (or rebuild) the cash-flow chart for one scenario.
 * Call with annualSpending to recompute data; call with no args to re-render
 * using cached data (e.g. on scenario toggle).
 *
 * @param {number} [annualSpending] - Total desired annual spending
 */
function createCashFlowChart(annualSpending) {
    const ctx = getElement('cashFlowChart')?.getContext('2d');
    if (!ctx) return;

    // If called with spending, recompute all scenario data and cache it
    if (annualSpending !== undefined) {
        _cfChartCache = _buildCashFlowData(annualSpending);
    }
    if (!_cfChartCache) return;

    _renderCashFlowScenario(ctx, _cfChartCache, _cfSelectedScenario);
}

/**
 * Compute drawdown data for all 3 scenarios + other-income arrays.
 * @param {number} annualSpending
 * @returns {Object} cached data object
 */
function _buildCashFlowData(annualSpending) {
    const inputs = readFormInputs();
    if (!inputs.retirementDate || !inputs.birthDate) return null;

    const targetAge = (typeof currentLifeExpectancy !== 'undefined') ? currentLifeExpectancy : APP_CONFIG.TARGET_AGE;
    const years = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
    const currentAge = calculateCurrentAge(inputs.birthDate);
    const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
    const chartEndAge = targetAge;
    const yearsInRetirement = chartEndAge - retirementAge;
    const scenarios = (typeof getActiveScenarioListNet === 'function') ? getActiveScenarioListNet() : APP_CONFIG.SCENARIO_LIST;
    const hasOtherIncome = (typeof getOtherIncomeAtAge === 'function');

    // Labels
    const labels = [];
    const preRetLength = retirementAge - currentAge;
    for (let age = currentAge; age < retirementAge; age++) labels.push('' + age);
    for (let year = 0; year <= yearsInRetirement; year++) labels.push('' + (retirementAge + year));

    // Per-year other income & breakdown (retirement years only)
    const otherIncomeByYear = [];
    const otherBreakdownByYear = [];
    // Per-source band arrays (pre-ret = null, retirement = amount capped to remaining spending)
    const sourceBands = {
        statePension: [], dbPension: [], annuity: [], rental: [], other: []
    };
    for (let year = 0; year <= yearsInRetirement; year++) {
        const age = retirementAge + year;
        const bd = _getOtherIncomeBreakdown(age);
        otherIncomeByYear.push(bd.total);
        otherBreakdownByYear.push(bd);

        // Allocate each source up to the spending cap (prioritise in order)
        let remaining = annualSpending;
        ['statePension', 'dbPension', 'annuity', 'rental', 'other'].forEach(function (src) {
            const amt = Math.min(bd[src] || 0, remaining);
            sourceBands[src].push(amt);
            remaining -= amt;
        });
    }

    // Prepend pre-retirement nulls
    ['statePension', 'dbPension', 'annuity', 'rental', 'other'].forEach(function (src) {
        const preNulls = new Array(preRetLength).fill(null);
        sourceBands[src] = preNulls.concat(sourceBands[src]);
    });

    // Per-scenario drawdown
    const scenarioData = {};
    scenarios.forEach(s => {
        const key = s.id.toLowerCase();
        const projection = calculatePensionProjection(inputs.currentPot, inputs.monthlyContribution, years, s.rate);
        let balance = projection.finalPot;

        const potWithdrawal = [];     // what actually comes out of pot
        const otherIncomeBand = [];   // other income applied
        const shortfall = [];         // unfunded gap
        const remainingPot = [];      // pot balance after withdrawal

        // Pre-retirement: nulls
        for (let i = 0; i < preRetLength; i++) {
            potWithdrawal.push(null);
            otherIncomeBand.push(null);
            shortfall.push(null);
            remainingPot.push(null);
        }

        for (let year = 0; year <= yearsInRetirement; year++) {
            const age = retirementAge + year;

            // After life expectancy: no spending, no withdrawal (person has died)
            if (age > targetAge) {
                otherIncomeBand.push(0);
                potWithdrawal.push(0);
                shortfall.push(null);
                remainingPot.push(0);
                continue;
            }

            const otherInc = otherIncomeByYear[year];
            const netNeeded = Math.max(0, annualSpending - otherInc);
            const growth = balance > 0 ? balance * s.rate : 0;
            const available = balance + growth;

            let funded = 0;
            let gap = 0;
            if (available >= netNeeded) {
                funded = netNeeded;
                balance = available - netNeeded;
            } else if (available > 0) {
                funded = available;
                gap = netNeeded - available;
                balance = 0;
            } else {
                funded = 0;
                gap = netNeeded;
                balance = 0;
            }

            otherIncomeBand.push(Math.min(otherInc, annualSpending));
            potWithdrawal.push(funded);
            shortfall.push(gap > 0 ? gap : null);
            remainingPot.push(balance);
        }

        scenarioData[key] = {
            label: s.label,
            color: s.color,
            rate: s.rate,
            potWithdrawal,
            otherIncomeBand,
            shortfall,
            remainingPot,
            retirementPot: projection.finalPot
        };
    });

    // Build D-Stages milestones for the cash flow chart
    const dStages = (typeof _buildDStages === 'function')
        ? _buildDStages(currentAge, retirementAge, targetAge)
        : [];

    return {
        labels,
        preRetLength,
        retirementAge,
        targetAge,
        yearsInRetirement,
        annualSpending,
        otherIncomeByYear,
        otherBreakdownByYear,
        scenarioData,
        scenarios,
        dStages,
        sourceBands
    };
}

/**
 * Render (or re-render) the chart for a single scenario from cached data.
 */
function _renderCashFlowScenario(ctx, cache, scenarioKey) {
    if (cashFlowChartInstance) cashFlowChartInstance.destroy();

    const sd = cache.scenarioData[scenarioKey];
    if (!sd) return;

    const { labels, preRetLength, annualSpending, otherIncomeByYear, otherBreakdownByYear, retirementAge, dStages, sourceBands } = cache;
    const { CHART } = APP_CONFIG;
    const fmt = n => '£' + Math.round(n).toLocaleString(APP_CONFIG.LOCALE);

    // Spending target line data (null pre-retirement, then annualSpending)
    const targetLine = labels.map((_, i) => i < preRetLength ? null : annualSpending);

    // Determine scenario colour palette
    const palettes = {
        weak:    { bg: 'rgba(220, 53, 69, 0.65)',  border: '#dc3545' },
        average: { bg: 'rgba(102, 126, 234, 0.65)', border: '#667eea' },
        strong:  { bg: 'rgba(40, 167, 69, 0.65)',   border: '#28a745' }
    };
    const pal = palettes[scenarioKey] || palettes.average;

    const datasets = [];

    // Income source colour palette
    const sourceConfig = [
        { key: 'statePension', label: 'State Pension',  bg: 'rgba(42, 157, 143, 0.65)', border: '#2a9d8f' },
        { key: 'dbPension',    label: 'DB Pension',      bg: 'rgba(231, 111, 81, 0.65)', border: '#e76f51' },
        { key: 'annuity',      label: 'Annuity Income',  bg: 'rgba(233, 196, 106, 0.7)', border: '#e9c46a' },
        { key: 'rental',       label: 'Rental Income',   bg: 'rgba(38, 166, 91, 0.55)',  border: '#26a65b' },
        { key: 'other',        label: 'Other Income',    bg: 'rgba(142, 68, 173, 0.5)',  border: '#8e44ad' }
    ];

    // Add a dataset per income source that has any non-zero data
    sourceConfig.forEach(function (src) {
        const band = sourceBands[src.key];
        const hasData = band.some(function (v) { return v !== null && v > 0; });
        if (hasData) {
            datasets.push({
                label: src.label,
                data: band,
                backgroundColor: src.bg,
                borderColor: src.border,
                borderWidth: 0,
                stack: 'cashflow',
                order: 2
            });
        }
    });

    // 2. Pot Withdrawal band (scenario colour)
    datasets.push({
        label: 'Pot Withdrawal',
        data: sd.potWithdrawal,
        backgroundColor: pal.bg,
        borderColor: pal.border,
        borderWidth: 0,
        stack: 'cashflow',
        order: 2
    });

    // 3. Shortfall band (dashed red)
    datasets.push({
        label: 'Shortfall',
        data: sd.shortfall,
        backgroundColor: CHART.SHORTFALL_BG,
        borderColor: CHART.SHORTFALL_BORDER,
        borderWidth: 1,
        borderDash: CHART.SHORTFALL_BORDER_DASH,
        stack: 'cashflow',
        order: 2
    });

    // 4. Target spending line (dashed dark line)
    datasets.push({
        label: 'Target Spending',
        data: targetLine,
        type: 'line',
        borderColor: '#333',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#333',
        fill: false,
        order: 1
    });

    cashFlowChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: dStages && dStages.length > 0
                ? { padding: { top: dStages.length > 1 ? 75 : 40, right: 30 } }
                : undefined,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                dStagesPlugin: dStages && dStages.length > 0 ? { stages: dStages } : false,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { font: { size: 12 }, padding: 15, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    bodySpacing: 6,
                    boxPadding: 4,
                    callbacks: {
                        title: function (items) {
                            if (!items.length) return '';
                            const idx = items[0].dataIndex;
                            if (idx < preRetLength) return 'Age ' + labels[idx] + ' (pre-retirement)';
                            return 'Age ' + labels[idx];
                        },
                        label: function () { return null; }, // suppress default per-dataset labels
                        afterBody: function (items) {
                            if (!items.length) return [];
                            const idx = items[0].dataIndex;
                            if (idx < preRetLength) return ['  Not yet retired'];

                            const yearIdx = idx - preRetLength;
                            const otherInc = otherIncomeByYear[yearIdx] || 0;
                            const bd = otherBreakdownByYear[yearIdx] || {};
                            const potW = sd.potWithdrawal[idx] || 0;
                            const gap = sd.shortfall[idx] || 0;
                            const potBal = sd.remainingPot[idx] || 0;

                            const lines = [];
                            lines.push('📋 Target Spending:  ' + fmt(annualSpending));
                            lines.push('');

                            // Other income breakdown
                            if (otherInc > 0) {
                                lines.push('💰 Other Income:  ' + fmt(otherInc));
                                if (bd.statePension > 0) lines.push('    🏛️ State Pension:  ' + fmt(bd.statePension));
                                if (bd.dbPension > 0)    lines.push('    🏢 DB Pension:  ' + fmt(bd.dbPension));
                                if (bd.annuity > 0)      lines.push('    🔒 Annuity:  ' + fmt(bd.annuity));
                                if (bd.rental > 0)       lines.push('    🏠 Rental:  ' + fmt(bd.rental));
                                if (bd.other > 0)        lines.push('    📋 Other:  ' + fmt(bd.other));
                            } else {
                                lines.push('💰 Other Income:  £0');
                            }

                            lines.push('');
                            lines.push('📤 Pot Withdrawal:  ' + fmt(potW));

                            if (gap > 0) {
                                lines.push('⚠️ Shortfall:  ' + fmt(gap));
                            }

                            lines.push('');
                            lines.push('🏦 Remaining Pot:  ' + fmt(potBal));

                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: { display: true, text: 'Age', font: { weight: 'bold' } },
                    ticks: { maxRotation: CHART.MAX_ROTATION, autoSkip: true, maxTicksLimit: CHART.MAX_TICKS }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: { display: true, text: 'Annual Cash Flow (£)', font: { weight: 'bold' } },
                    ticks: { callback: v => formatChartCurrency(v) }
                }
            }
        }
    });

    // Update hint text
    const hint = getElement('cashFlowChartHint');
    const hasAnyOtherIncome = otherIncomeByYear.some(v => v > 0);
    if (hint) {
        hint.textContent = sd.label + ' — starting pot ' + fmt(sd.retirementPot) +
            (hasAnyOtherIncome ? ' · other income offsets pot withdrawal' : '');
    }

    setTimeout(function () {
        if (cashFlowChartInstance) cashFlowChartInstance.resize();
    }, 50);
}

// Scenario toggle now handled by shared buttons in lifecycle-chart-builder.js
