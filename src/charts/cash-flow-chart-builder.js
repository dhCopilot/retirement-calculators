/**
 * Cash Flow Chart Builder
 * Renders the retirement cash-flow stacked bar chart across 3 scenarios.
 *
 * Depends on: config.js, utils/formatting.js, utils/date-utils.js, utils/drawdown.js
 * @module charts/cash-flow-chart-builder
 * @version 0.4.1
 */

/** @type {Chart|null} */
let cashFlowChartInstance = null;

/**
 * Build and render the cash-flow chart.
 *
 * @param {number} annualSpending - Target annual spending in retirement
 */
function createCashFlowChart(annualSpending) {
    // Ensure container is visible BEFORE chart creation so Canvas has dimensions
    toggleVisibility('cashFlowChartContainer', true);

    const ctx = getElement('cashFlowChart')?.getContext('2d');
    if (!ctx) return;

    if (cashFlowChartInstance) {
        cashFlowChartInstance.destroy();
    }

    const inputs = readFormInputs();
    if (!inputs.retirementDate || !inputs.birthDate) return;

    try {
        const targetAge = (typeof currentLifeExpectancy !== 'undefined') ? currentLifeExpectancy : APP_CONFIG.TARGET_AGE;
        const years = calculateYearsUntilRetirement(inputs.birthDate, inputs.retirementDate);
        const currentAge = calculateCurrentAge(inputs.birthDate);
        const retirementAge = calculateRetirementAge(inputs.birthDate, inputs.retirementDate);
        const yearsInRetirement = targetAge - retirementAge;
        const scenarios = APP_CONFIG.SCENARIO_LIST;

        // ── Build age labels from current age to 100 ─────────────
        const labels = [];
        const preRetLength = retirementAge - currentAge;

        for (let age = currentAge; age < retirementAge; age++) {
            labels.push('' + age);
        }
        for (let year = 0; year <= yearsInRetirement; year++) {
            labels.push('' + (retirementAge + year));
        }

        // ── Calculate funded spending per scenario ───────────────
        const scenarioRates = scenarios.map(s => s.rate);
        const scenarioLabels = scenarios.map(s => s.label);
        const scenarioFunded = [[], [], []];

        scenarioRates.forEach((rate, sIdx) => {
            const projection = calculatePensionProjection(
                inputs.currentPot, inputs.monthlyContribution, years, rate
            );
            let balance = projection.finalPot;

            // Pre-retirement: null
            for (let i = 0; i < preRetLength; i++) {
                scenarioFunded[sIdx].push(null);
            }

            // Drawdown
            for (let year = 0; year <= yearsInRetirement; year++) {
                const growth = balance > 0 ? balance * rate : 0;
                const available = balance + growth;

                if (available >= annualSpending) {
                    scenarioFunded[sIdx].push(annualSpending);
                    balance = available - annualSpending;
                } else if (available > 0) {
                    scenarioFunded[sIdx].push(available);
                    balance = 0;
                } else {
                    scenarioFunded[sIdx].push(0);
                    balance = 0;
                }
            }
        });

        const fullWeak    = scenarioFunded[0];
        const fullAverage = scenarioFunded[1];
        const fullStrong  = scenarioFunded[2];

        // ── Stacking bands ───────────────────────────────────────
        const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(fullWeak, fullAverage, fullStrong);

        // Shortfall: gap between strong (best case) and annual spending
        const shortfallBand = fullStrong.map(v => {
            if (v === null) return null;
            return Math.max(0, annualSpending - v);
        });

        // ── Render ───────────────────────────────────────────────
        const { CHART } = APP_CONFIG;

        cashFlowChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: scenarioLabels[0], data: bandWeak,       backgroundColor: 'rgba(220, 53, 69, 0.7)',  borderColor: '#dc3545', borderWidth: 0, stack: 'cashflow' },
                    { label: scenarioLabels[1], data: bandAvgExtra,   backgroundColor: 'rgba(102, 126, 234, 0.7)',borderColor: '#667eea', borderWidth: 0, stack: 'cashflow' },
                    { label: scenarioLabels[2], data: bandStrongExtra,backgroundColor: 'rgba(40, 167, 69, 0.7)', borderColor: '#28a745', borderWidth: 0, stack: 'cashflow' },
                    { label: 'Shortfall',       data: shortfallBand,  backgroundColor: CHART.SHORTFALL_BG, borderColor: CHART.SHORTFALL_BORDER, borderWidth: 1, borderDash: CHART.SHORTFALL_BORDER_DASH, stack: 'cashflow' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: true, position: 'top', labels: { font: { size: 12 }, padding: 15 } },
                    tooltip: {
                        backgroundColor: CHART.TOOLTIP_BG,
                        padding: CHART.TOOLTIP_PADDING,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        callbacks: {
                            label: function (context) {
                                if (context.parsed.y === null || context.parsed.y <= 0) return null;
                                const idx = context.dataIndex;
                                if (context.datasetIndex === 0) return scenarioLabels[0] + ': £' + Math.round(fullWeak[idx]).toLocaleString(APP_CONFIG.LOCALE);
                                if (context.datasetIndex === 1) return scenarioLabels[1] + ': £' + Math.round(fullAverage[idx]).toLocaleString(APP_CONFIG.LOCALE);
                                if (context.datasetIndex === 2) return scenarioLabels[2] + ': £' + Math.round(fullStrong[idx]).toLocaleString(APP_CONFIG.LOCALE);
                                return 'Shortfall: £' + Math.round(context.parsed.y).toLocaleString(APP_CONFIG.LOCALE);
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
                        title: { display: true, text: 'Annual Spending (£)', font: { weight: 'bold' } },
                        ticks: { callback: v => formatChartCurrency(v) }
                    }
                }
            }
        });

        // Force resize to ensure chart renders at correct dimensions
        setTimeout(function () {
            if (cashFlowChartInstance) cashFlowChartInstance.resize();
        }, 50);

    } catch (err) {
        console.error('Error creating cash flow chart:', err);
    }
}
