/**
 * Pension Projection Calculator
 * Projects future pension pot value based on contributions and compound growth.
 *
 * @module calculators/pension-projection
 * @user-story US#2 - Pension Projection Calculation
 * @user-story US#5 - Investment Growth Assumption
 * @version 0.4.0
 */

/**
 * Calculate projected pension pot at retirement.
 *
 * @param {number} currentPot - Current pension pot value (£)
 * @param {number} monthlyContribution - Monthly contribution amount (£)
 * @param {number} yearsUntilRetirement - Years until planned retirement
 * @param {number} [annualGrowthRate=0.05] - Annual growth rate as decimal
 * @returns {{ finalPot: number, yearByYear: Array, totalContributed: number, growthAmount: number, annualGrowthRate: number }}
 */

function calculatePensionProjection(currentPot, monthlyContribution, yearsUntilRetirement, annualGrowthRate = 0.05) {
    const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
    const months = yearsUntilRetirement * 12;
    let pot = currentPot;
    const yearByYear = [];

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        for (let month = 1; month <= 12; month++) {
            pot = pot * (1 + monthlyGrowthRate);
            pot += monthlyContribution;
        }
        
        yearByYear.push({
            year: year,
            pot: Math.round(pot * 100) / 100,
            totalContributions: currentPot + (monthlyContribution * 12 * year)
        });
    }

    return {
        finalPot: Math.round(pot * 100) / 100,
        yearByYear: yearByYear,
        totalContributed: currentPot + (monthlyContribution * months),
        growthAmount: Math.round((pot - currentPot - (monthlyContribution * months)) * 100) / 100,
        annualGrowthRate: annualGrowthRate
    };
}
