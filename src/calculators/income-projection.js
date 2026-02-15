/**
 * Income Projection Calculator
 * Calculates sustainable annual income from a pension pot using
 * the 4% safe withdrawal rate and UK tax-free lump sum rules.
 *
 * @module calculators/income-projection
 * @user-story US#3 - Income Projection
 * @version 0.4.0
 */

const SAFE_WITHDRAWAL_RATE = 0.04; // 4% per annum
const TAX_FREE_LUMP_SUM_RATE = 0.25; // 25%
const MAX_TAX_FREE_LUMP = 268275; // UK limit

function calculateIncomeProjection(pensionPot) {
    const taxFreeLump = Math.min(
        pensionPot * TAX_FREE_LUMP_SUM_RATE,
        MAX_TAX_FREE_LUMP
    );

    const drawdownPot = pensionPot - taxFreeLump;
    const annualIncome = drawdownPot * SAFE_WITHDRAWAL_RATE;
    const monthlyIncome = annualIncome / 12;

    return {
        taxFreeLumpSum: Math.round(taxFreeLump * 100) / 100,
        drawdownPot: Math.round(drawdownPot * 100) / 100,
        annualIncome: Math.round(annualIncome * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100
    };
}
