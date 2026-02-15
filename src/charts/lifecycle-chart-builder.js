/**
 * Combined Lifecycle Chart Builder
 * Renders the accumulation → drawdown stacked bar chart across 3 scenarios.
 *
 * Depends on: config.js, utils/formatting.js, utils/date-utils.js, utils/drawdown.js
 * @module charts/lifecycle-chart-builder
 * @version 0.4.1
 */

/** @type {Chart|null} */
let lifecycleChartInstance = null;

/**
 * Convert a hex colour string to rgba.
 * @param {string} hex - e.g. '#dc3545'
 * @param {number} alpha - 0–1
 * @returns {string} e.g. 'rgba(220, 53, 69, 0.5)'
 */
function _hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

/**
 * Build and render the combined lifecycle chart.
 *
 * @param {Object} growthData - Global growthProjectionData object
 * @param {Array}  longevityData - Drawdown data array (used for spending amount)
 */
function createCombinedLifecycleChart(longevityData) {
    if (!growthProjectionData.average) {
        console.warn('Growth projection data not available. Creating drawdown-only chart.');
        createDrawdownOnlyChart(longevityData);
        return;
    }

    const ctxElement = getElement('growthChart');
    if (!ctxElement) {
        console.error('Chart canvas element "growthChart" not found');
        return;
    }

    try {
        const currentAge = calculateCurrentAge(growthProjectionData.birthDate);
        const annualSpending = longevityData.length > 0 ? longevityData[0].spending : 0;
        const retirementAge = growthProjectionData.retirementAge;
        const targetAge = APP_CONFIG.TARGET_AGE;
        const yearsInRetirement = targetAge - retirementAge;
        const scenarios = APP_CONFIG.SCENARIO_LIST;

        // ── Phase 1: Accumulation labels & data ───────────────────
        const combinedLabels = [];
        const accWeak = [], accAverage = [], accStrong = [];

        growthProjectionData.average.forEach((yearData, index) => {
            const age = currentAge + yearData.year;
            combinedLabels.push('' + age);
            accWeak.push(growthProjectionData.weak[index]?.pot || null);
            accAverage.push(yearData.pot);
            accStrong.push(growthProjectionData.strong[index]?.pot || null);
        });

        const retirementPots = {
            weak:    growthProjectionData.weak[growthProjectionData.weak.length - 1]?.pot || 0,
            average: growthProjectionData.average[growthProjectionData.average.length - 1]?.pot || 0,
            strong:  growthProjectionData.strong[growthProjectionData.strong.length - 1]?.pot || 0
        };

        // ── Phase 2: Drawdown simulation (single engine) ─────────
        const retirementPointIndex = growthProjectionData.average.length - 1;
        const drawdownResults = simulateAllScenarios({
            annualSpending,
            years: yearsInRetirement,
            retirementAge,
            retirementPots
        });

        // ── Phase 3: Merge accumulation + drawdown ───────────────
        // Start drawdown arrays with nulls for pre-retirement, then retirement-point pot
        const drawWeak = accWeak.map(() => null);
        const drawAvg  = accAverage.map(() => null);
        const drawStr  = accStrong.map(() => null);
        drawWeak[retirementPointIndex] = retirementPots.weak;
        drawAvg[retirementPointIndex]  = retirementPots.average;
        drawStr[retirementPointIndex]  = retirementPots.strong;

        for (let year = 1; year <= yearsInRetirement; year++) {
            combinedLabels.push('' + (retirementAge + year));
            accWeak.push(null);
            accAverage.push(null);
            accStrong.push(null);

            const wRes = drawdownResults.weak.results[year];
            const aRes = drawdownResults.average.results[year];
            const sRes = drawdownResults.strong.results[year];
            drawWeak.push(wRes ? wRes.potAfter : 0);
            drawAvg.push(aRes ? aRes.potAfter : 0);
            drawStr.push(sRes ? sRes.potAfter : 0);
        }

        // Merge: prefer accumulation value, fall back to drawdown
        const fullWeak    = accWeak.map((v, i) => v !== null ? v : drawWeak[i]);
        const fullAverage = accAverage.map((v, i) => v !== null ? v : drawAvg[i]);
        const fullStrong  = accStrong.map((v, i) => v !== null ? v : drawStr[i]);

        // ── Phase 4: Stacking bands ──────────────────────────────
        const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(fullWeak, fullAverage, fullStrong);

        // ── Phase 5: Shortfall data (worst-case = weak) ──────────
        const shortfallData = combinedLabels.map((_, i) => {
            if (i <= retirementPointIndex) return null;
            const drawdownIdx = i - retirementPointIndex;
            const wRes = drawdownResults.weak.results[drawdownIdx];
            if (!wRes || wRes.shortfall <= 0) return null;
            return wRes.shortfall;
        });

        // ── Phase 6: Render Chart ────────────────────────────────
        if (lifecycleChartInstance && lifecycleChartInstance instanceof Chart) {
            lifecycleChartInstance.destroy();
        }

        const ctx = ctxElement.getContext('2d');
        const { CHART } = APP_CONFIG;

        lifecycleChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: combinedLabels,
                datasets: [
                    _buildScenarioDataset('Weak Growth (2%)',    bandWeak,       '#dc3545', retirementPointIndex),
                    _buildScenarioDataset('Average Growth (5%)', bandAvgExtra,   '#667eea', retirementPointIndex),
                    _buildScenarioDataset('Strong Growth (8%)',  bandStrongExtra,'#28a745', retirementPointIndex),
                    {
                        label: 'Shortfall',
                        data: shortfallData,
                        backgroundColor: CHART.SHORTFALL_BG,
                        borderColor: CHART.SHORTFALL_BORDER,
                        borderWidth: 1,
                        borderDash: CHART.SHORTFALL_BORDER_DASH,
                        stack: 'lifecycle'
                    }
                ]
            },
            options: _buildChartOptions(retirementPointIndex, fullWeak, fullAverage, fullStrong, 'Pension Pot Value (£)')
        });

        // Expose on window for backward compat
        window.growthChartInstance = lifecycleChartInstance;

        // Force resize to ensure chart renders at correct dimensions
        setTimeout(function () {
            if (lifecycleChartInstance) lifecycleChartInstance.resize();
        }, 50);

        // Generate narrative cards
        generateLifecycleNarrative(
            retirementAge, annualSpending,
            retirementPots.weak, retirementPots.average, retirementPots.strong,
            fullWeak, fullAverage, fullStrong,
            retirementPointIndex
        );

    } catch (err) {
        console.error('Error creating lifecycle chart:', err);
    }
}

/**
 * Fallback line chart when growth data is unavailable.
 */
function createDrawdownOnlyChart(longevityData) {
    const ctxElement = getElement('growthChart');
    if (!ctxElement) return;

    const labels   = longevityData.map(item => '' + item.age);
    const balances = longevityData.map(item => item.balance);

    if (lifecycleChartInstance && lifecycleChartInstance instanceof Chart) {
        lifecycleChartInstance.destroy();
    }

    const ctx = ctxElement.getContext('2d');
    lifecycleChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Spending Burn-Down (Avg 5%)',
                data: balances,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff6b6b'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                    backgroundColor: APP_CONFIG.CHART.TOOLTIP_BG,
                    padding: APP_CONFIG.CHART.TOOLTIP_PADDING,
                    callbacks: {
                        label: ctx => 'Remaining Pot: £' + ctx.parsed.y.toLocaleString(APP_CONFIG.LOCALE, { maximumFractionDigits: 0 })
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => formatChartCurrency(v) }, title: { display: true, text: 'Pot Value (£)' } },
                x: { title: { display: true, text: 'Age Timeline (Retirement Drawdown)' } }
            }
        }
    });
    window.growthChartInstance = lifecycleChartInstance;
}

// ── Private helpers ──────────────────────────────────────────────

function _buildScenarioDataset(label, data, color, retirementIdx) {
    const bgLight = _hexToRgba(color, 0.5);
    const bgDark  = _hexToRgba(color, 0.7);

    return {
        label,
        data,
        backgroundColor: function (context) {
            return context.dataIndex <= retirementIdx ? bgLight : bgDark;
        },
        borderColor: color,
        borderWidth: 0,
        stack: 'lifecycle'
    };
}

function _buildChartOptions(retirementPointIndex, fullWeak, fullAverage, fullStrong, yLabel) {
    const { CHART } = APP_CONFIG;
    return {
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
                    afterTitle: function (tooltipItems) {
                        const idx = tooltipItems[0].dataIndex;
                        if (idx < retirementPointIndex) return '📈 Accumulation Phase';
                        if (idx === retirementPointIndex) return '🎯 Retirement Starts';
                        return '📉 Drawdown Phase';
                    },
                    label: function (context) {
                        if (context.parsed.y === null) return null;
                        const idx = context.dataIndex;
                        if (context.datasetIndex === 3) {
                            return context.parsed.y > 0
                                ? '⚠️ Shortfall: £' + Math.round(context.parsed.y).toLocaleString(APP_CONFIG.LOCALE) + '/yr unfunded'
                                : null;
                        }
                        const absValues = [fullWeak, fullAverage, fullStrong];
                        const absValue = absValues[context.datasetIndex]?.[idx];
                        if (absValue == null) return null;
                        return context.dataset.label + ': £' +
                            absValue.toLocaleString(APP_CONFIG.LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    }
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { callback: v => formatChartCurrency(v) },
                title: { display: true, text: yLabel, font: { weight: 'bold' } }
            },
            x: {
                stacked: true,
                title: { display: true, text: 'Age', font: { weight: 'bold' } },
                ticks: { maxTicksLimit: CHART.MAX_TICKS, maxRotation: CHART.MAX_ROTATION, autoSkip: true }
            }
        }
    };
}
