/**
 * Inflation Calculator
 * Functions for adjusting values between real (today's) and nominal (future) pounds.
 *
 * @module calculators/inflation-calculator
 * @user-story US#2 - Inflation Handling
 * @version 0.4.0
 */

function adjustForInflation(nominalValue, yearsAhead, annualInflationRate = 0.025) {
    /**
     * Convert future nominal £ to today's £ (real value)
     * Real Value = Nominal Value / (1 + inflation_rate)^years
     */
    return nominalValue / Math.pow(1 + annualInflationRate, yearsAhead);
}

function inflateValue(realValue, yearsAhead, annualInflationRate = 0.025) {
    /**
     * Convert today's £ to future nominal £
     * This is useful for income amounts that need to be inflation-adjusted
     */
    return realValue * Math.pow(1 + annualInflationRate, yearsAhead);
}

function calculateRealAndNominal(yearByYearData, inflationRate = 0.025) {
    /**
     * Takes year-by-year projection data and adds real (today's pounds) values
     * Returns array with both nominal and real values for each year
     */
    return yearByYearData.map((item, index) => {
        const year = index + 1;
        const realPot = adjustForInflation(item.pot, year, inflationRate);
        const realContributions = adjustForInflation(item.totalContributions, year, inflationRate);
        
        return {
            year: year,
            nominalPot: item.pot,
            realPot: Math.round(realPot * 100) / 100,
            nominalContributions: item.totalContributions,
            realContributions: Math.round(realContributions * 100) / 100
        };
    });
}

function getInflationAdjustedIncome(annualIncome, yearsUntilRetirement, inflationRate = 0.025) {
    /**
     * Shows both real (today's pounds) and nominal (future pounds) income
     * Nominal income: what you'll receive in future year 1 of retirement
     * Real income: equivalent in today's purchasing power
     */
    const nominalIncome = inflateValue(annualIncome, yearsUntilRetirement, inflationRate);
    
    return {
        realAnnualIncome: Math.round(annualIncome * 100) / 100,
        nominalAnnualIncome: Math.round(nominalIncome * 100) / 100,
        realMonthlyIncome: Math.round((annualIncome / 12) * 100) / 100,
        nominalMonthlyIncome: Math.round((nominalIncome / 12) * 100) / 100
    };
}
