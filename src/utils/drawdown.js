/**
 * Drawdown Simulation Engine
 * Single source of truth for retirement drawdown calculations.
 * Replaces 5 independent copy-pasted loops throughout the codebase.
 *
 * @module utils/drawdown
 * @version 0.4.0
 */

/**
 * Simulate annual drawdown from a pension pot.
 *
 * @param {Object} params
 * @param {number} params.startingPot     - Pot value at retirement
 * @param {number} params.annualSpending  - Desired annual withdrawal (gross, before other income)
 * @param {number} params.growthRate      - Annual growth rate (decimal, e.g. 0.05)
 * @param {number} params.years           - Number of years to simulate
 * @param {number} [params.retirementAge] - Starting age (for labelling)
 * @param {Function} [params.getSpendingAtAge] - Optional callback(age) → net withdrawal from pot
 * @returns {DrawdownResult}
 */
function simulateDrawdown({ startingPot, annualSpending, growthRate, years, retirementAge = 0, getSpendingAtAge }) {
    const results = [];
    let balance = startingPot;

    for (let year = 0; year <= years; year++) {
        const age = retirementAge + year;
        const spending = getSpendingAtAge ? getSpendingAtAge(age) : annualSpending;
        const growth = balance > 0 ? balance * growthRate : 0;
        const available = balance + growth;

        // Year 0 = retirement start point — no spending applied yet
        if (year === 0) {
            results.push({
                year,
                age,
                potBefore: balance,
                potAfter: balance,
                funded: 0,
                shortfall: 0,
                growth: 0
            });
            continue;
        }

        const funded = Math.min(spending, Math.max(0, available));
        const shortfall = Math.max(0, spending - available);
        balance = Math.max(0, available - spending);

        results.push({
            year,
            age,
            potBefore: available,
            potAfter: balance,
            funded,
            shortfall,
            growth
        });
    }

    return {
        results,
        finalBalance: balance,
        moneyLasts: balance > 0,
        depletionAge: findDepletionAge(results, retirementAge)
    };
}

/**
 * Run drawdown for all 3 standard scenarios.
 *
 * @param {Object} params
 * @param {number} params.annualSpending
 * @param {number} params.years
 * @param {number} params.retirementAge
 * @param {Object} params.retirementPots - { weak, average, strong }
 * @param {Function} [params.getSpendingAtAge] - Optional callback(age) → net withdrawal
 * @returns {{ weak: DrawdownResult, average: DrawdownResult, strong: DrawdownResult }}
 */
function simulateAllScenarios({ annualSpending, years, retirementAge, retirementPots, getSpendingAtAge }) {
    const scenarios = (typeof getActiveScenarioListNet === 'function')
        ? getActiveScenarioListNet()
        : (typeof getActiveScenarioList === 'function')
            ? getActiveScenarioList()
            : (typeof APP_CONFIG !== 'undefined')
                ? APP_CONFIG.SCENARIO_LIST
                : [
                    { id: 'WEAK',    rate: 0.02 },
                    { id: 'AVERAGE', rate: 0.05 },
                    { id: 'STRONG',  rate: 0.08 }
                ];

    const out = {};
    scenarios.forEach(s => {
        const key = s.id.toLowerCase();
        out[key] = simulateDrawdown({
            startingPot: retirementPots[key],
            annualSpending,
            growthRate: s.rate,
            years,
            retirementAge,
            getSpendingAtAge
        });
    });
    return out;
}

/**
 * Compute incremental stacking bands from 3 scenario value arrays.
 * Used by both the lifecycle chart and cash-flow chart.
 *
 * @param {number[]} weakValues
 * @param {number[]} avgValues
 * @param {number[]} strongValues
 * @returns {{ bandWeak: number[], bandAvgExtra: number[], bandStrongExtra: number[] }}
 */
function computeStackingBands(weakValues, avgValues, strongValues) {
    const bandWeak = weakValues.map(v => v !== null ? v : null);
    const bandAvgExtra = avgValues.map((v, i) => {
        if (v === null || weakValues[i] === null) return null;
        return Math.max(0, v - weakValues[i]);
    });
    const bandStrongExtra = strongValues.map((v, i) => {
        if (v === null || avgValues[i] === null) return null;
        return Math.max(0, v - avgValues[i]);
    });
    return { bandWeak, bandAvgExtra, bandStrongExtra };
}

/**
 * Find the age at which the pot is fully depleted.
 * @param {Array} results - Drawdown results array
 * @param {number} retirementAge
 * @returns {number|null} Age of depletion, or null if money lasts
 */
function findDepletionAge(results, retirementAge) {
    for (const entry of results) {
        if (entry.year > 0 && entry.potAfter <= 0) {
            return entry.age;
        }
    }
    return null;
}
