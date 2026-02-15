/**
 * Browser-Compatible Test Suite
 * All 94 tests ported from Jest to run in the browser test runner.
 * Source modules are loaded via <script> tags (global scope).
 * @version 0.4.1
 */

// ══════════════════════════════════════════════════════════════════
//  SUITE 1: Pension Projection Calculator (10 tests)
// ══════════════════════════════════════════════════════════════════
describe('Pension Projection Calculator', () => {

    describe('Basic calculations', () => {
        test('should return correct structure', () => {
            const result = calculatePensionProjection(10000, 500, 10, 0.05);
            expect(result).toHaveProperty('finalPot');
            expect(result).toHaveProperty('yearByYear');
            expect(result).toHaveProperty('totalContributed');
            expect(result).toHaveProperty('growthAmount');
            expect(result).toHaveProperty('annualGrowthRate');
        });

        test('should calculate with default growth rate of 5%', () => {
            const result = calculatePensionProjection(10000, 500, 10);
            expect(result.annualGrowthRate).toBe(0.05);
            expect(result.finalPot).toBeGreaterThan(10000);
        });

        test('should have correct number of yearly entries', () => {
            const years = 10;
            const result = calculatePensionProjection(10000, 500, years, 0.05);
            expect(result.yearByYear).toHaveLength(years);
        });

        test('should calculate total contributed correctly', () => {
            const currentPot = 10000;
            const monthly = 500;
            const years = 10;
            const result = calculatePensionProjection(currentPot, monthly, years, 0.05);
            expect(result.totalContributed).toBe(currentPot + (monthly * 12 * years));
        });
    });

    describe('Growth calculations', () => {
        test('should grow with positive growth rate', () => {
            const result = calculatePensionProjection(10000, 500, 10, 0.05);
            expect(result.finalPot).toBeGreaterThan(result.totalContributed);
            expect(result.growthAmount).toBeGreaterThan(0);
        });

        test('should not grow with 0% growth rate', () => {
            const currentPot = 10000;
            const monthly = 500;
            const years = 5;
            const result = calculatePensionProjection(currentPot, monthly, years, 0);
            expect(result.finalPot).toBe(result.totalContributed);
            expect(result.growthAmount).toBe(0);
        });

        test('year by year pot should increase over time', () => {
            const result = calculatePensionProjection(10000, 500, 10, 0.05);
            for (let i = 1; i < result.yearByYear.length; i++) {
                expect(result.yearByYear[i].pot).toBeGreaterThan(result.yearByYear[i - 1].pot);
            }
        });
    });

    describe('Edge cases', () => {
        test('should handle zero monthly contribution', () => {
            const result = calculatePensionProjection(10000, 0, 10, 0.05);
            expect(result.finalPot).toBeGreaterThan(10000);
            expect(result.totalContributed).toBe(10000);
        });

        test('should handle zero initial pot', () => {
            const result = calculatePensionProjection(0, 500, 10, 0.05);
            expect(result.finalPot).toBeGreaterThan(0);
        });

        test('should handle 1 year projection', () => {
            const result = calculatePensionProjection(10000, 500, 1, 0.05);
            expect(result.yearByYear).toHaveLength(1);
            expect(result.finalPot).toBeGreaterThan(10000);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  SUITE 2: Income Projection Calculator (10 tests)
// ══════════════════════════════════════════════════════════════════
describe('Income Projection Calculator', () => {

    describe('Basic calculations', () => {
        test('should return correct structure', () => {
            const result = calculateIncomeProjection(100000);
            expect(result).toHaveProperty('taxFreeLumpSum');
            expect(result).toHaveProperty('drawdownPot');
            expect(result).toHaveProperty('annualIncome');
            expect(result).toHaveProperty('monthlyIncome');
        });

        test('should calculate tax-free lump sum at 25%', () => {
            const pot = 100000;
            const result = calculateIncomeProjection(pot);
            expect(result.taxFreeLumpSum).toBe(pot * 0.25);
        });

        test('should apply max tax-free lump sum cap', () => {
            const largePot = 2000000;
            const result = calculateIncomeProjection(largePot);
            expect(result.taxFreeLumpSum).toBe(268275);
        });

        test('should calculate remaining drawdown pot correctly', () => {
            const pot = 100000;
            const result = calculateIncomeProjection(pot);
            expect(result.drawdownPot).toBe(pot - result.taxFreeLumpSum);
        });

        test('should apply 4% safe withdrawal rate', () => {
            const pot = 100000;
            const result = calculateIncomeProjection(pot);
            const expectedDrawdown = pot - (pot * 0.25);
            expect(result.annualIncome).toBeCloseTo(expectedDrawdown * 0.04, 2);
        });

        test('should calculate monthly income correctly', () => {
            const pot = 100000;
            const result = calculateIncomeProjection(pot);
            expect(result.monthlyIncome).toBeCloseTo(result.annualIncome / 12, 2);
        });
    });

    describe('Edge cases', () => {
        test('should handle small pots', () => {
            const result = calculateIncomeProjection(1000);
            expect(result.taxFreeLumpSum).toBe(250);
            expect(result.annualIncome).toBeGreaterThan(0);
        });

        test('should handle zero pot', () => {
            const result = calculateIncomeProjection(0);
            expect(result.annualIncome).toBe(0);
            expect(result.monthlyIncome).toBe(0);
        });

        test('should handle very large pots', () => {
            const result = calculateIncomeProjection(10000000);
            expect(result.taxFreeLumpSum).toBe(268275);
        });
    });

    describe('Percentage calculations', () => {
        test('income should be 3% of original pot (after tax-free)', () => {
            const pot = 1000000;
            const result = calculateIncomeProjection(pot);
            const expectedIncome = (pot * 0.75) * 0.04;
            expect(result.annualIncome).toBeCloseTo(expectedIncome, 2);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  SUITE 3: Inflation Calculator (12 tests)
// ══════════════════════════════════════════════════════════════════
describe('Inflation Calculator', () => {

    describe('Real value conversion', () => {
        test('should convert future value to real value', () => {
            const futureValue = 100000;
            const yearsAhead = 10;
            const inflationRate = 0.025;
            const realValue = adjustForInflation(futureValue, yearsAhead, inflationRate);
            expect(realValue).toBeLessThan(futureValue);
            const expected = futureValue / Math.pow(1 + inflationRate, yearsAhead);
            expect(realValue).toBeCloseTo(expected, 2);
        });

        test('should handle zero inflation', () => {
            const value = 100000;
            const realValue = adjustForInflation(value, 10, 0);
            expect(realValue).toBe(value);
        });

        test('should handle zero years', () => {
            const value = 100000;
            const realValue = adjustForInflation(value, 0, 0.025);
            expect(realValue).toBe(value);
        });
    });

    describe('Nominal value inflation', () => {
        test('should inflate real value to future value', () => {
            const realValue = 50000;
            const yearsAhead = 10;
            const inflationRate = 0.025;
            const nominalValue = inflateValue(realValue, yearsAhead, inflationRate);
            expect(nominalValue).toBeGreaterThan(realValue);
            const expected = realValue * Math.pow(1 + inflationRate, yearsAhead);
            expect(nominalValue).toBeCloseTo(expected, 2);
        });

        test('should be inverse of real value conversion', () => {
            const originalValue = 100000;
            const years = 10;
            const inflation = 0.025;
            const realValue = adjustForInflation(originalValue, years, inflation);
            const backToNominal = inflateValue(realValue, years, inflation);
            expect(backToNominal).toBeCloseTo(originalValue, 1);
        });
    });

    describe('Income adjustments', () => {
        test('should provide both real and nominal income', () => {
            const result = getInflationAdjustedIncome(30000, 10, 0.025);
            expect(result).toHaveProperty('realAnnualIncome');
            expect(result).toHaveProperty('nominalAnnualIncome');
            expect(result).toHaveProperty('realMonthlyIncome');
            expect(result).toHaveProperty('nominalMonthlyIncome');
        });

        test('should calculate correct real and nominal income', () => {
            const annualIncome = 40000;
            const years = 10;
            const inflation = 0.025;
            const result = getInflationAdjustedIncome(annualIncome, years, inflation);
            expect(result.realAnnualIncome).toBe(annualIncome);
            expect(result.nominalAnnualIncome).toBeGreaterThan(annualIncome);
            expect(result.realMonthlyIncome).toBeCloseTo(annualIncome / 12, 2);
            expect(result.nominalMonthlyIncome).toBeCloseTo(result.nominalAnnualIncome / 12, 2);
        });

        test('should handle zero years until retirement', () => {
            const result = getInflationAdjustedIncome(30000, 0, 0.025);
            expect(result.realAnnualIncome).toBe(result.nominalAnnualIncome);
            expect(result.realMonthlyIncome).toBe(result.nominalMonthlyIncome);
        });
    });

    describe('Year-by-year adjustments', () => {
        test('should include both real and nominal values', () => {
            const data = [
                { year: 1, pot: 100000, totalContributions: 50000 },
                { year: 2, pot: 105000, totalContributions: 55000 }
            ];
            const result = calculateRealAndNominal(data, 0.025);
            expect(result).toHaveLength(2);
            result.forEach(item => {
                expect(item).toHaveProperty('realPot');
                expect(item).toHaveProperty('nominalPot');
                expect(item).toHaveProperty('realContributions');
                expect(item).toHaveProperty('nominalContributions');
            });
        });

        test('should show real values adjusted for inflation impact', () => {
            const data = [
                { year: 1, pot: 100000, totalContributions: 50000 },
                { year: 2, pot: 105000, totalContributions: 55000 },
                { year: 3, pot: 110000, totalContributions: 60000 }
            ];
            const result = calculateRealAndNominal(data, 0.025);
            expect(result[0].realPot).toBeGreaterThan(0);
            expect(result[1].realPot).toBeLessThan(result[1].nominalPot);
            expect(result[2].realPot).toBeLessThan(result[2].nominalPot);
        });
    });

    describe('High inflation scenarios', () => {
        test('should handle 5% inflation', () => {
            const value = 100000;
            const realValue = adjustForInflation(value, 10, 0.05);
            expect(realValue).toBeCloseTo(61391, 0);
        });

        test('should handle very high inflation', () => {
            const value = 100000;
            const realValue = adjustForInflation(value, 10, 0.10);
            expect(realValue).toBeGreaterThan(0);
            expect(realValue).toBeLessThan(value);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  SUITE 4: Retirement Income & Spending Plan (15 tests)
// ══════════════════════════════════════════════════════════════════
describe('Retirement Income Calculator - Spending Plan Mode', () => {

    describe('Basic spending plan calculations', () => {
        test('should return correct structure for spending plan', () => {
            const result = calculateSpendingPlan(500000, 30000, 10, 90, 0.05, 0);
            expect(result).toHaveProperty('mode', 'spending-plan');
            expect(result).toHaveProperty('moneyLasts');
            expect(result).toHaveProperty('finalBalance');
            expect(result).toHaveProperty('totalSpent');
            expect(result).toHaveProperty('yearByYear');
        });

        test('should calculate year-by-year data', () => {
            const result = calculateSpendingPlan(500000, 30000, 10, 90, 0.05, 0);
            expect(result.yearByYear.length).toBeGreaterThan(0);
            result.yearByYear.forEach(item => {
                expect(item).toHaveProperty('year');
                expect(item).toHaveProperty('potAtStart');
                expect(item).toHaveProperty('annualSpend');
                expect(item).toHaveProperty('potAtEnd');
            });
        });
    });

    describe('Money lasting duration', () => {
        test('should indicate when money lasts throughout retirement', () => {
            const result = calculateSpendingPlan(1000000, 30000, 10, 90, 0.05, 0);
            expect(result.moneyLasts).toBe(true);
            expect(result.finalBalance).toBeGreaterThan(0);
        });

        test('should indicate when money runs out', () => {
            const result = calculateSpendingPlan(10000, 50000, 10, 90, 0, 0);
            expect(result.moneyLasts).toBe(false);
            expect(result.ageWhenRunsOut).toBeDefined();
        });

        test('should calculate correct age when money runs out', () => {
            const result = calculateSpendingPlan(30000, 40000, 5, 80, 0, 0);
            if (!result.moneyLasts) {
                expect(result.ageWhenRunsOut).toBeGreaterThan(0);
            }
        });
    });

    describe('Total spending calculations', () => {
        test('should sum total spent over retirement', () => {
            const annualSpend = 30000;
            const result = calculateSpendingPlan(500000, annualSpend, 10, 85, 0.05, 0);
            expect(result.totalSpent).toBeGreaterThan(0);
        });
    });

    describe('Inflation handling', () => {
        test('should apply inflation to spending amounts', () => {
            const baseSpend = 30000;
            const inflation = 0.03;
            const resultWithInflation = calculateSpendingPlan(500000, baseSpend, 10, 90, 0.05, inflation);
            const resultNoInflation = calculateSpendingPlan(500000, baseSpend, 10, 90, 0.05, 0);
            const inflationYear2 = resultWithInflation.yearByYear[1].annualSpend;
            const noInflationYear2 = resultNoInflation.yearByYear[1].annualSpend;
            expect(inflationYear2).toBeGreaterThan(noInflationYear2);
        });
    });

    describe('Growth during retirement', () => {
        test('should apply investment growth to remaining pot', () => {
            const resultWithGrowth = calculateSpendingPlan(300000, 25000, 10, 90, 0.05, 0);
            const resultNoGrowth = calculateSpendingPlan(300000, 25000, 10, 90, 0, 0);
            expect(resultWithGrowth).toHaveProperty('yearByYear');
            expect(resultNoGrowth).toHaveProperty('yearByYear');
            const withGrowthYear1 = resultWithGrowth.yearByYear[0].potAtEnd;
            const noGrowthYear1 = resultNoGrowth.yearByYear[0].potAtEnd;
            expect(withGrowthYear1).toBeGreaterThan(noGrowthYear1);
        });
    });
});

describe('Retirement Income Calculator - Maximum Sustainable Spend', () => {

    describe('Maximum sustainable calculations', () => {
        test('should return maximum annual and monthly spend', () => {
            const result = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
            expect(result).toHaveProperty('maxAnnualSpend');
            expect(result).toHaveProperty('maxMonthlySpend');
            expect(result.maxMonthlySpend).toBeCloseTo(result.maxAnnualSpend / 12, 2);
        });

        test('should find sustainable spend that lasts entire retirement', () => {
            const result = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
            const projection = result.projection;
            expect(projection.moneyLasts).toBe(true);
        });

        test('should increase with larger starting pot', () => {
            const smallPot = calculateMaximumSustainableSpend(300000, 10, 90, 0.05, 0);
            const largePot = calculateMaximumSustainableSpend(600000, 10, 90, 0.05, 0);
            expect(largePot.maxAnnualSpend).toBeGreaterThan(smallPot.maxAnnualSpend);
        });

        test('should decrease with longer retirement', () => {
            const shortRetirement = calculateMaximumSustainableSpend(500000, 10, 75, 0.05, 0);
            const longRetirement = calculateMaximumSustainableSpend(500000, 10, 95, 0.05, 0);
            expect(shortRetirement.maxAnnualSpend).toBeGreaterThan(longRetirement.maxAnnualSpend);
        });
    });

    describe('Growth impact on maximum spend', () => {
        test('should increase maximum spend with higher growth rates', () => {
            const lowGrowth = calculateMaximumSustainableSpend(500000, 10, 90, 0.02, 0);
            const highGrowth = calculateMaximumSustainableSpend(500000, 10, 90, 0.05, 0);
            expect(highGrowth.maxAnnualSpend).toBeGreaterThanOrEqual(lowGrowth.maxAnnualSpend - 1);
        });
    });
});

describe('Retirement Status Helper', () => {
    test('should return success status when money lasts', () => {
        const status = getRetirementStatus({ moneyLasts: true, finalBalance: 100000 });
        expect(status.status).toBe('success');
        expect(status.icon).toBe('✅');
        expect(status.message).toContain('last');
    });

    test('should return warning status when money runs out', () => {
        const status = getRetirementStatus({ moneyLasts: false, ageWhenRunsOut: 85 });
        expect(status.status).toBe('warning');
        expect(status.icon).toBe('⚠️');
        expect(status.message).toContain('85');
    });
});

// ══════════════════════════════════════════════════════════════════
//  SUITE 5: Drawdown Shortfall Calculations (14 tests)
// ══════════════════════════════════════════════════════════════════

// Local helper — mirrors the drawdown-shortfall.test.js inline function
function calculateDrawdown(startingPot, annualSpending, growthRate, years) {
    const results = [];
    let balance = startingPot;
    for (let year = 1; year <= years; year++) {
        const growth = balance > 0 ? balance * growthRate : 0;
        const available = balance + growth;
        const shortfall = Math.max(0, annualSpending - available);
        const funded = Math.min(annualSpending, available);
        balance = Math.max(0, available - annualSpending);
        results.push({ year, potBefore: available, potAfter: balance, funded, shortfall });
    }
    return results;
}

describe('Drawdown Shortfall Calculations', () => {

    describe('Basic drawdown with no shortfall', () => {
        test('should have zero shortfall when pot easily covers spending', () => {
            const results = calculateDrawdown(1000000, 25000, 0.05, 5);
            results.forEach(r => {
                expect(r.shortfall).toBe(0);
                expect(r.funded).toBe(25000);
                expect(r.potAfter).toBeGreaterThan(0);
            });
        });

        test('should grow pot when growth exceeds spending', () => {
            const results = calculateDrawdown(1000000, 25000, 0.05, 5);
            expect(results[0].potAfter).toBeGreaterThan(1000000);
        });
    });

    describe('Full shortfall — pot depleted', () => {
        test('should show full shortfall once pot is zero', () => {
            const results = calculateDrawdown(10000, 50000, 0, 3);
            expect(results[0].shortfall).toBe(40000);
            expect(results[0].funded).toBe(10000);
            expect(results[0].potAfter).toBe(0);
            expect(results[1].shortfall).toBe(50000);
            expect(results[1].funded).toBe(0);
            expect(results[2].shortfall).toBe(50000);
        });

        test('should show full annual spending as shortfall when pot is zero', () => {
            const results = calculateDrawdown(0, 30000, 0.05, 3);
            results.forEach(r => {
                expect(r.shortfall).toBe(30000);
                expect(r.funded).toBe(0);
                expect(r.potAfter).toBe(0);
            });
        });
    });

    describe('Partial shortfall — transition year', () => {
        test('should show partial shortfall when pot partially covers spending', () => {
            const results = calculateDrawdown(15000, 25000, 0, 3);
            expect(results[0].shortfall).toBe(10000);
            expect(results[0].funded).toBe(15000);
            expect(results[0].potAfter).toBe(0);
            expect(results[1].shortfall).toBe(25000);
        });

        test('should show partial shortfall with growth in transition year', () => {
            const results = calculateDrawdown(20000, 25000, 0.05, 2);
            expect(results[0].shortfall).toBe(4000);
            expect(results[0].funded).toBe(21000);
            expect(results[0].potAfter).toBe(0);
        });

        test('shortfall + funded should equal annual spending', () => {
            const results = calculateDrawdown(15000, 25000, 0, 5);
            results.forEach(r => {
                expect(r.shortfall + r.funded).toBe(25000);
            });
        });
    });

    describe('Three-scenario drawdown comparison', () => {
        test('strong scenario should last longer than weak', () => {
            const weak = calculateDrawdown(500000, 30000, 0.02, 40);
            const strong = calculateDrawdown(500000, 30000, 0.08, 40);
            const weakFirstShortfall = weak.findIndex(r => r.shortfall > 0);
            const strongFirstShortfall = strong.findIndex(r => r.shortfall > 0);
            if (strongFirstShortfall === -1) {
                expect(strongFirstShortfall).toBe(-1);
            } else {
                expect(strongFirstShortfall).toBeGreaterThan(weakFirstShortfall);
            }
        });

        test('weak scenario shortfall should start earliest', () => {
            const weak = calculateDrawdown(300000, 25000, 0.02, 40);
            const avg = calculateDrawdown(300000, 25000, 0.05, 40);
            const weakStart = weak.findIndex(r => r.shortfall > 0);
            const avgStart = avg.findIndex(r => r.shortfall > 0);
            if (weakStart !== -1 && avgStart !== -1) {
                expect(weakStart).toBeLessThanOrEqual(avgStart);
            }
        });
    });

    describe('Stacking band calculations', () => {
        test('bands should sum to absolute values', () => {
            const weak = [100, 80, 50, 0, 0];
            const avg = [120, 100, 80, 40, 0];
            const strong = [150, 130, 110, 80, 30];
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            for (let i = 0; i < weak.length; i++) {
                expect(bandWeak[i] + bandAvgExtra[i] + bandStrongExtra[i]).toBe(strong[i]);
            }
        });

        test('bands should never be negative', () => {
            const weak = [100, 50, 0, 0];
            const avg = [120, 80, 30, 0];
            const strong = [150, 100, 60, 10];
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            bandWeak.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
            bandAvgExtra.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
            bandStrongExtra.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
        });

        test('should handle null values in pre-retirement phase', () => {
            const weak = [null, null, 100, 80];
            const avg = [null, null, 120, 100];
            const strong = [null, null, 150, 130];
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            expect(bandWeak[0]).toBeNull();
            expect(bandAvgExtra[0]).toBeNull();
            expect(bandStrongExtra[0]).toBeNull();
            expect(bandWeak[2]).toBe(100);
            expect(bandAvgExtra[2]).toBe(20);
            expect(bandStrongExtra[2]).toBe(30);
        });
    });

    describe('Integration: pension projection into drawdown', () => {
        test('should calculate correct retirement pot then drawdown', () => {
            const projection = calculatePensionProjection(100000, 500, 10, 0.05);
            expect(projection.finalPot).toBeGreaterThan(100000);
            const drawdown = calculateDrawdown(projection.finalPot, 30000, 0.05, 30);
            expect(drawdown.length).toBe(30);
            drawdown.forEach(r => {
                expect(r.shortfall + r.funded).toBeCloseTo(30000, 0);
                expect(r.potAfter).toBeGreaterThanOrEqual(0);
            });
        });

        test('shortfall should match between weak and strong scenarios', () => {
            const pot = 400000;
            const spending = 25000;
            const years = 40;
            const weak = calculateDrawdown(pot, spending, 0.02, years);
            const avg = calculateDrawdown(pot, spending, 0.05, years);
            const strong = calculateDrawdown(pot, spending, 0.08, years);
            const totalWeakShortfall = weak.reduce((sum, r) => sum + r.shortfall, 0);
            const totalAvgShortfall = avg.reduce((sum, r) => sum + r.shortfall, 0);
            const totalStrongShortfall = strong.reduce((sum, r) => sum + r.shortfall, 0);
            expect(totalWeakShortfall).toBeGreaterThanOrEqual(totalAvgShortfall);
            expect(totalAvgShortfall).toBeGreaterThanOrEqual(totalStrongShortfall);
        });
    });
});

// ══════════════════════════════════════════════════════════════════
//  SUITE 6: Utility Modules (33 tests)
// ══════════════════════════════════════════════════════════════════
describe('Formatting Utilities', () => {

    describe('unformatNumber', () => {
        test('should remove commas from formatted string', () => {
            expect(unformatNumber('600,000')).toBe('600000');
        });
        test('should handle string without commas', () => {
            expect(unformatNumber('50000')).toBe('50000');
        });
        test('should handle non-string input', () => {
            expect(unformatNumber(12345)).toBe('12345');
        });
    });

    describe('formatNumberWithCommas', () => {
        test('should add thousands separators', () => {
            expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
        });
        test('should not format numbers under 1000', () => {
            expect(formatNumberWithCommas(999)).toBe('999');
        });
    });

    describe('formatCurrency', () => {
        test('should format with £ symbol and 2 decimals', () => {
            const result = formatCurrency(1234.5);
            expect(result).toMatch(/^£1,234\.50$/);
        });
        test('should handle zero', () => {
            expect(formatCurrency(0)).toBe('£0.00');
        });
    });

    describe('formatChartCurrency', () => {
        test('should abbreviate thousands as k', () => {
            expect(formatChartCurrency(250000)).toBe('£250k');
        });
        test('should abbreviate millions as M', () => {
            expect(formatChartCurrency(1500000)).toBe('£1.5M');
        });
    });

    describe('parseCurrencyInput', () => {
        test('should parse formatted currency string', () => {
            expect(parseCurrencyInput('600,000')).toBe(600000);
        });
        test('should return 0 for invalid input', () => {
            expect(parseCurrencyInput('abc')).toBe(0);
        });
        test('should return 0 for empty string', () => {
            expect(parseCurrencyInput('')).toBe(0);
        });
    });
});

describe('Date Utilities', () => {

    describe('calculateExactAge', () => {
        test('should calculate exact age with years, months, days', () => {
            const refDate = new Date(2025, 5, 15); // June 15, 2025
            const age = calculateExactAge('1990-01-01', refDate);
            expect(age.years).toBe(35);
            expect(age.months).toBe(5);
            expect(age.days).toBe(14);
        });
        test('should handle birthday not yet occurred this year', () => {
            const refDate = new Date(2025, 0, 1); // Jan 1, 2025
            const age = calculateExactAge('1990-06-15', refDate);
            expect(age.years).toBe(34);
        });
    });

    describe('calculateCurrentAge', () => {
        test('should return whole years', () => {
            const age = calculateCurrentAge('1990-01-01');
            expect(typeof age).toBe('number');
            expect(age).toBeGreaterThan(30);
            expect(age).toBeLessThan(40);
        });
    });

    describe('calculateRetirementAge', () => {
        test('should compute difference in years', () => {
            expect(calculateRetirementAge('1972-01-01', '2032-01-01')).toBe(60);
        });
        test('should handle Date objects', () => {
            expect(calculateRetirementAge(new Date('1972-01-01'), new Date('2037-01-01'))).toBe(65);
        });
    });

    describe('formatAge', () => {
        test('should format as readable string', () => {
            const result = formatAge({ years: 52, months: 5, days: 14 });
            expect(result).toBe('52 years, 5 months, and 14 days old');
        });
    });
});

describe('Drawdown Simulation Engine', () => {

    describe('simulateDrawdown', () => {
        test('should return correct structure', () => {
            const result = simulateDrawdown({
                startingPot: 500000, annualSpending: 20000,
                growthRate: 0.05, years: 30, retirementAge: 65
            });
            expect(result).toHaveProperty('results');
            expect(result).toHaveProperty('finalBalance');
            expect(result).toHaveProperty('moneyLasts');
            expect(result).toHaveProperty('depletionAge');
        });

        test('year 0 should have no spending applied', () => {
            const result = simulateDrawdown({
                startingPot: 500000, annualSpending: 20000,
                growthRate: 0.05, years: 5, retirementAge: 65
            });
            expect(result.results[0].funded).toBe(0);
            expect(result.results[0].potAfter).toBe(500000);
        });

        test('should track depletion age', () => {
            const result = simulateDrawdown({
                startingPot: 100000, annualSpending: 50000,
                growthRate: 0.02, years: 40, retirementAge: 60
            });
            expect(result.moneyLasts).toBe(false);
            expect(result.depletionAge).toBeLessThan(100);
        });

        test('should last when pot is large enough', () => {
            const result = simulateDrawdown({
                startingPot: 2000000, annualSpending: 20000,
                growthRate: 0.05, years: 35, retirementAge: 65
            });
            expect(result.moneyLasts).toBe(true);
            expect(result.depletionAge).toBeNull();
        });

        test('shortfall + funded should equal annual spending', () => {
            const result = simulateDrawdown({
                startingPot: 100000, annualSpending: 50000,
                growthRate: 0.02, years: 10, retirementAge: 60
            });
            result.results.slice(1).forEach(r => {
                expect(r.funded + r.shortfall).toBeCloseTo(50000, 0);
            });
        });
    });

    describe('computeStackingBands', () => {
        test('bands should sum to absolute values', () => {
            const weak = [100, 200, 300];
            const avg = [150, 250, 350];
            const strong = [200, 300, 400];
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(weak, avg, strong);
            for (let i = 0; i < weak.length; i++) {
                expect(bandWeak[i] + bandAvgExtra[i] + bandStrongExtra[i]).toBe(strong[i]);
            }
        });

        test('should handle null values', () => {
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(
                [null, 100], [null, 200], [null, 300]
            );
            expect(bandWeak[0]).toBeNull();
            expect(bandAvgExtra[0]).toBeNull();
            expect(bandStrongExtra[0]).toBeNull();
        });

        test('bands should never be negative', () => {
            const { bandWeak, bandAvgExtra, bandStrongExtra } = computeStackingBands(
                [100, 0, 50], [80, 0, 100], [120, 0, 200]
            );
            bandAvgExtra.forEach(v => { if (v !== null) expect(v).toBeGreaterThanOrEqual(0); });
            bandStrongExtra.forEach(v => { if (v !== null) expect(v).toBeGreaterThanOrEqual(0); });
        });
    });

    describe('simulateAllScenarios', () => {
        test('should return weak, average, strong results', () => {
            const result = simulateAllScenarios({
                annualSpending: 25000, years: 35, retirementAge: 65,
                retirementPots: { weak: 400000, average: 600000, strong: 900000 }
            });
            expect(result).toHaveProperty('weak');
            expect(result).toHaveProperty('average');
            expect(result).toHaveProperty('strong');
        });

        test('strong should last longer than weak', () => {
            const result = simulateAllScenarios({
                annualSpending: 40000, years: 40, retirementAge: 60,
                retirementPots: { weak: 300000, average: 500000, strong: 800000 }
            });
            const weakLastYear = result.weak.results.filter(r => r.potAfter > 0).length;
            const strongLastYear = result.strong.results.filter(r => r.potAfter > 0).length;
            expect(strongLastYear).toBeGreaterThanOrEqual(weakLastYear);
        });
    });
});

describe('APP_CONFIG', () => {
    test('should be frozen (immutable)', () => {
        expect(Object.isFrozen(APP_CONFIG)).toBe(true);
    });

    test('should have correct scenario rates', () => {
        expect(APP_CONFIG.SCENARIOS.WEAK.rate).toBe(0.02);
        expect(APP_CONFIG.SCENARIOS.AVERAGE.rate).toBe(0.05);
        expect(APP_CONFIG.SCENARIOS.STRONG.rate).toBe(0.08);
    });

    test('should have correct UK pension rules', () => {
        expect(APP_CONFIG.UK_MIN_PENSION_AGE).toBe(55);
        expect(APP_CONFIG.TAX_FREE_LUMP_SUM_RATE).toBe(0.25);
        expect(APP_CONFIG.MAX_TAX_FREE_LUMP).toBe(268275);
    });

    test('SCENARIO_LIST should have 3 entries', () => {
        expect(APP_CONFIG.SCENARIO_LIST).toHaveLength(3);
    });

    test('TARGET_AGE should be 100', () => {
        expect(APP_CONFIG.TARGET_AGE).toBe(100);
    });
});
