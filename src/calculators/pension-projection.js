/**
 * Pension Projection Calculator
 * @user-story US#2 - Pension Projection Calculation
 * @version 0.1.0
 */

const ANNUAL_GROWTH_RATE = 0.05; // 5% per annum
const MONTHLY_GROWTH_RATE = Math.pow(1 + ANNUAL_GROWTH_RATE, 1/12) - 1;

function calculatePensionProjection(currentPot, monthlyContribution, yearsUntilRetirement) {
    const months = yearsUntilRetirement * 12;
    let pot = currentPot;
    const yearByYear = [];

    for (let year = 1; year <= yearsUntilRetirement; year++) {
        for (let month = 1; month <= 12; month++) {
            pot = pot * (1 + MONTHLY_GROWTH_RATE);
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
        growthAmount: Math.round((pot - currentPot - (monthlyContribution * months)) * 100) / 100
    };
}
