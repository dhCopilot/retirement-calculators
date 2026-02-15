/**
 * Retirement Income Calculator
 * Spending plan analysis and maximum sustainable withdrawal calculations.
 *
 * @module calculators/retirement-income
 * @user-story US#5 - Retirement Planning & Spending Analysis
 * @version 0.4.0
 */

/**
 * Mode A: Spending Plan - User enters annual spend, check if money lasts
 */
function calculateSpendingPlan(startingPot, annualSpend, retirementAge, lifeExpectancy, investmentGrowth, inflationRate) {
    const retirementYears = lifeExpectancy - retirementAge;
    const monthlyGrowthRate = Math.pow(1 + investmentGrowth, 1/12) - 1;
    
    let pot = startingPot;
    const yearByYear = [];
    let moneyRunsOut = false;
    let ageWhenRunsOut = null;
    let totalSpent = 0;

    for (let year = 1; year <= retirementYears && pot > 0; year++) {
        let yearlySpend = annualSpend;
        
        // Adjust spending for inflation if applicable
        if (inflationRate > 0) {
            yearlySpend = annualSpend * Math.pow(1 + inflationRate, year - 1);
        }

        // Calculate growth for the year
        let yearStart = pot;
        for (let month = 1; month <= 12; month++) {
            pot = pot * (1 + monthlyGrowthRate);
        }

        // Apply spending
        pot -= yearlySpend;
        totalSpent += yearlySpend;

        if (pot < 0) {
            moneyRunsOut = true;
            ageWhenRunsOut = retirementAge + year - 1;
            pot = 0; // Can't have negative pot
        }

        yearByYear.push({
            year: year,
            age: retirementAge + year - 1,
            potAtStart: Math.round(yearStart * 100) / 100,
            annualSpend: Math.round(yearlySpend * 100) / 100,
            potAtEnd: Math.round(Math.max(0, pot) * 100) / 100,
            balance: Math.round(Math.max(0, pot) * 100) / 100,
            spending: Math.round(yearlySpend * 100) / 100,
            moneyRunsOut: pot <= 0
        });
    }

    return {
        mode: 'spending-plan',
        moneyLasts: !moneyRunsOut,
        ageWhenRunsOut: ageWhenRunsOut,
        finalBalance: Math.round(Math.max(0, pot) * 100) / 100,
        totalSpent: Math.round(totalSpent * 100) / 100,
        yearByYear: yearByYear
    };
}

/**
 * Mode B: Maximum Sustainable Spending - Calculate what they can safely spend
 */
function calculateMaximumSustainableSpend(startingPot, retirementAge, lifeExpectancy, investmentGrowth, inflationRate) {
    const retirementYears = lifeExpectancy - retirementAge;
    const monthlyGrowthRate = Math.pow(1 + investmentGrowth, 1/12) - 1;
    
    // Binary search for maximum sustainable spend
    let minSpend = 0;
    let maxSpend = startingPot / retirementYears; // Conservative upper estimate
    let bestSpend = 0;
    
    for (let iteration = 0; iteration < 20; iteration++) {
        const testSpend = (minSpend + maxSpend) / 2;
        const result = calculateSpendingPlan(startingPot, testSpend, retirementAge, lifeExpectancy, investmentGrowth, inflationRate);
        
        if (result.moneyLasts && result.finalBalance >= -100) { // Allow small margin
            bestSpend = testSpend;
            minSpend = testSpend;
        } else {
            maxSpend = testSpend;
        }
    }

    // Calculate final projection with optimal spend
    return {
        maxAnnualSpend: Math.round(bestSpend * 100) / 100,
        maxMonthlySpend: Math.round((bestSpend / 12) * 100) / 100,
        projection: calculateSpendingPlan(startingPot, bestSpend, retirementAge, lifeExpectancy, investmentGrowth, inflationRate)
    };
}

/**
 * Get retirement status with visual indicators
 */
function getRetirementStatus(projection) {
    if (projection.moneyLasts) {
        return {
            status: 'success',
            icon: '✅',
            message: 'Your money will last throughout your retirement!',
            details: `With a final balance of £${projection.finalBalance.toLocaleString('en-GB', {minimumFractionDigits: 2})}`
        };
    } else {
        return {
            status: 'warning',
            icon: '⚠️',
            message: `Your money will run out at age ${projection.ageWhenRunsOut}`,
            details: `You need to adjust your spending or increase your pension pot`
        };
    }
}
